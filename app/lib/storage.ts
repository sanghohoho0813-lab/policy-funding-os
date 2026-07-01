import type { Customer, DiagnosisInput, DiagnosisResult } from "@/app/types";

// localStorage 기반 고객 저장소 (Supabase 연동 전 단계).
// SSR 환경에서 window 접근 오류가 없도록 모든 접근을 typeof window 로 가드한다.
// useSyncExternalStore 와 함께 쓰도록 getStoredCustomers() 는 값이 바뀔 때만
// 새 참조를 반환하도록 캐싱한다(무한 렌더 방지).

const KEY = "pfos.customers.v1";
const EVENT = "pfos:customers";
const EMPTY: Customer[] = [];

let cacheRaw: string | null = null;
let cacheVal: Customer[] = EMPTY;

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function writeAll(list: Customer[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // 저장 실패는 조용히 무시 (용량 초과 등)
  }
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// 캐시된 스냅샷 — 원본 문자열이 바뀔 때만 새로 파싱한다.
export function getStoredCustomers(): Customer[] {
  const raw = readRaw();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheVal = JSON.parse(raw) as Customer[];
    } catch {
      cacheVal = EMPTY;
    }
  }
  return cacheVal;
}

// useSyncExternalStore 의 getServerSnapshot (안정적인 빈 배열)
export function getServerCustomers(): Customer[] {
  return EMPTY;
}

export function subscribeCustomers(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function getStoredCustomerById(id: string): Customer | undefined {
  return getStoredCustomers().find((c) => c.id === id);
}

// 신규 저장 또는 동일 id 덮어쓰기(업서트)
export function saveCustomer(customer: Customer): void {
  const list = getStoredCustomers().slice();
  const idx = list.findIndex((c) => c.id === customer.id);
  if (idx >= 0) list[idx] = customer;
  else list.unshift(customer);
  writeAll(list);
}

export function updateCustomer(
  id: string,
  patch: Partial<Customer>,
): Customer | undefined {
  const list = getStoredCustomers().slice();
  const idx = list.findIndex((c) => c.id === id);
  if (idx < 0) return undefined;
  const updated: Customer = { ...list[idx], ...patch, updatedAt: todayStr() };
  list[idx] = updated;
  writeAll(list);
  return updated;
}

export function deleteCustomer(id: string): void {
  const list = getStoredCustomers().filter((c) => c.id !== id);
  writeAll(list);
}

function newCustomerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `c-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `c-${Date.now().toString(36)}`;
}

// 진단 결과(input + result)를 고객 레코드로 변환
export function buildCustomerFromDiagnosis(
  input: DiagnosisInput,
  result: DiagnosisResult,
): Customer {
  const today = todayStr();
  return {
    id: newCustomerId(),
    companyName: input.companyName || result.companyName || "고객사",
    industry: input.industry || "-",
    businessType: input.businessType,
    recommendedAgency: result.topAgency,
    score: result.overallScore,
    stage: "신규 DB",
    nextAction: result.nextAction,
    lastContactedAt: today,
    updatedAt: today,
    upsellOpportunities: result.upsells.map((u) => u.title),
    memo: input.memo,
    diagnosisInput: input,
    diagnosisResult: result,
  };
}
