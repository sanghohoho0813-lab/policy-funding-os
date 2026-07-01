// ─────────────────────────────────────────────────────────────
// diagnosis.ts — 얇은 컨트롤러 (Thin Controller)
//
// 과거에는 이 파일에 기관 스코어링·사례 매칭·코치 멘트·업셀 판단이
// 전부 하드코딩(if/else/score ~770줄)되어 있었다.
// 이제 판단 로직은 app/lib/engine 의 Knowledge Engine 이 knowledge/*.json 을
// 읽어 수행하고, 이 파일은 입력을 받아 엔진을 호출하는 역할만 한다.
//
// 공개 API(runDiagnosis / classifyIndustry / DEFAULT_INPUT / SAMPLE_INPUT)는
// 그대로 유지되어 기존 UI(DiagnosisSection·ResultCard·coach.ts 등)는 무수정.
// ─────────────────────────────────────────────────────────────

import type { DiagnosisInput, DiagnosisResult } from "@/app/types";
import {
  inferIndustryCategory,
  runKnowledgeDiagnosis,
} from "@/app/lib/engine/knowledgeEngine";

// 업종 분류 — 엔진의 industryCategory 추론을 재노출 (coach.ts 하위호환)
export const classifyIndustry = inferIndustryCategory;

// 진단 실행 — Knowledge Engine 위임
export function runDiagnosis(input: DiagnosisInput): DiagnosisResult {
  return runKnowledgeDiagnosis(input);
}

export const DEFAULT_INPUT: DiagnosisInput = {
  companyName: "",
  industry: "",
  businessType: "개인사업자",
  years: "1~3년",
  revenue: "1~5억",
  employees: "1~4명",
  credit: "보통",
  purpose: "운전자금",
  strengths: [],
  memo: "",
};

export const SAMPLE_INPUT: DiagnosisInput = {
  companyName: "(주)한빛정밀",
  industry: "자동차부품 제조",
  businessType: "법인사업자",
  years: "3~7년",
  revenue: "5~10억",
  employees: "5~9명",
  credit: "보통",
  purpose: "시설자금",
  strengths: ["제조업", "기술력", "특허"],
  memo: "노후 설비 교체 및 신규 라인 증설 자금 필요. 최근 매출 성장세.",
};
