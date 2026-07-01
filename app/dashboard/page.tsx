import type { Metadata } from "next";
import Link from "next/link";
import type { CustomerStage } from "@/app/types";
import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import { MOCK_CUSTOMERS, STAGE_BADGE } from "@/app/lib/mockCustomers";

export const metadata: Metadata = {
  title: "고객 관리 — Policy Funding OS",
  description: "관리 중인 정책자금 고객을 한눈에 확인하세요.",
};

function countStages(stages: CustomerStage[]) {
  return MOCK_CUSTOMERS.filter((c) => stages.includes(c.stage)).length;
}

const summaryCards = [
  { label: "전체 고객", value: MOCK_CUSTOMERS.length, accent: "text-slate-900" },
  {
    label: "상담 필요",
    value: countStages(["신규 DB", "재접촉 예정"]),
    accent: "text-blue-600",
  },
  {
    label: "서류 대기",
    value: countStages(["서류 요청", "서류 대기"]),
    accent: "text-amber-600",
  },
  {
    label: "접수 준비",
    value: countStages(["접수 준비", "접수 완료", "심사 중"]),
    accent: "text-violet-600",
  },
  {
    label: "승인 완료",
    value: countStages(["승인"]),
    accent: "text-green-600",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <NavBar />

      <main className="flex-1">
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

          {/* 고객 리스트 */}
          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-lg font-bold">고객 리스트</h2>
            <Link
              href="/diagnosis"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              + 새 진단
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {MOCK_CUSTOMERS.map((c) => (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                      {c.companyName}
                    </p>
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
                  <p className="text-xs font-semibold text-slate-500">
                    다음 액션
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{c.nextAction}</p>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  최근 업데이트 {c.updatedAt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
