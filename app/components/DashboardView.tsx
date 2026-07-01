"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Customer, CustomerStage } from "@/app/types";
import { CUSTOMER_STAGES } from "@/app/types";
import { MOCK_CUSTOMERS, STAGE_BADGE } from "@/app/lib/mockCustomers";
import {
  getServerCustomers,
  getStoredCustomers,
  subscribeCustomers,
} from "@/app/lib/storage";

function countStages(list: Customer[], stages: CustomerStage[]) {
  return list.filter((c) => stages.includes(c.stage)).length;
}

export default function DashboardView() {
  // localStorage 고객 (SSR 안전) — 저장 시 자동 갱신
  const stored = useSyncExternalStore(
    subscribeCustomers,
    getStoredCustomers,
    getServerCustomers,
  );

  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"전체" | CustomerStage>("전체");

  // 저장 고객 우선, 동일 id의 Mock 고객은 제외하고 합친다.
  const merged = useMemo<Customer[]>(() => {
    const storedIds = new Set(stored.map((c) => c.id));
    return [...stored, ...MOCK_CUSTOMERS.filter((m) => !storedIds.has(m.id))];
  }, [stored]);

  const summaryCards = useMemo(
    () => [
      { label: "전체 고객", value: merged.length, accent: "text-slate-900" },
      {
        label: "상담 필요",
        value: countStages(merged, ["신규 DB", "재접촉 예정"]),
        accent: "text-blue-600",
      },
      {
        label: "서류 대기",
        value: countStages(merged, ["서류 요청", "서류 대기"]),
        accent: "text-amber-600",
      },
      {
        label: "접수 준비",
        value: countStages(merged, ["접수 준비", "접수 완료", "심사 중"]),
        accent: "text-violet-600",
      },
      {
        label: "승인 완료",
        value: countStages(merged, ["승인"]),
        accent: "text-green-600",
      },
    ],
    [merged],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return merged.filter((c) => {
      const matchStage = stageFilter === "전체" || c.stage === stageFilter;
      const matchQuery =
        q === "" ||
        c.companyName.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q);
      return matchStage && matchQuery;
    });
  }, [merged, query, stageFilter]);

  const storedIds = useMemo(() => new Set(stored.map((c) => c.id)), [stored]);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-12 pb-20 sm:pt-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          고객 관리 대시보드
        </h1>
        <p className="text-slate-600">
          관리 중인 고객의 진행 상태와 다음 액션을 한눈에 확인하세요.
        </p>
      </div>

      {/* 상단 요약 카드 */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.accent}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* 검색 + 필터 + 새 진단 */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">고객 리스트</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="회사명·업종 검색"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-56"
          />
          <select
            value={stageFilter}
            onChange={(e) =>
              setStageFilter(e.target.value as "전체" | CustomerStage)
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
          >
            <option value="전체">전체 단계</option>
            {CUSTOMER_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Link
            href="/diagnosis"
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            + 새 진단하기
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          조건에 맞는 고객이 없습니다.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                      {c.companyName}
                    </p>
                    {storedIds.has(c.id) && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-600">
                        저장됨
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{c.industry}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STAGE_BADGE[c.stage]}`}
                >
                  {c.stage}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-700">
                  {c.recommendedAgency}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                  가능성 {c.score}점
                </span>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-500">다음 액션</p>
                <p className="mt-1 text-sm text-slate-700">{c.nextAction}</p>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                최근 업데이트 {c.updatedAt}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
