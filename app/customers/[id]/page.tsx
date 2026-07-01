import Link from "next/link";
import { notFound } from "next/navigation";
import type { CustomerStage } from "@/app/types";
import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import CopyMessage from "@/app/components/CopyMessage";
import {
  getCustomerById,
  MOCK_CUSTOMERS,
  STAGE_BADGE,
} from "@/app/lib/mockCustomers";

// 정적 생성을 위해 알려진 고객 id를 미리 생성 (Supabase 연동 전 Mock 단계).
export function generateStaticParams() {
  return MOCK_CUSTOMERS.map((c) => ({ id: c.id }));
}

const DOC_CHECKLIST = [
  "사업자등록증",
  "부가세과세표준증명",
  "재무제표 또는 손익자료",
  "4대보험 가입자명부",
  "국세/지방세 납세증명서",
  "신용정보 확인 관련 자료",
  "임대차계약서 또는 사업장 자료",
  "자금 사용 계획 자료",
];

// 진행단계별로 수령한 서류 수를 Mock 으로 산출
function receivedDocCount(stage: CustomerStage): number {
  switch (stage) {
    case "신규 DB":
    case "재접촉 예정":
      return 0;
    case "1차 상담 완료":
    case "계약 검토":
      return 1;
    case "서류 요청":
      return 2;
    case "보류":
    case "실패":
      return 3;
    case "서류 대기":
      return 4;
    case "접수 준비":
      return 7;
    default:
      return 8;
  }
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const received = receivedDocCount(customer.stage);

  const followUpMessage =
    `${customer.companyName} 대표님, 안녕하세요 😊\n` +
    `지난 상담 이후 ${customer.recommendedAgency} 기준으로 검토를 이어가고 있습니다.\n` +
    `다음 단계로 "${customer.nextAction}" 부분을 준비하면 좋을 것 같아요.\n` +
    `편하신 시간에 짧게 통화 가능하실까요? 편하신 때 알려주세요!`;

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <NavBar />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl px-6 pt-10 pb-20 sm:pt-14">
          {/* 상단: 뒤로 + 진단 다시하기 */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-blue-700"
            >
              ← 고객관리로
            </Link>
            <Link
              href="/diagnosis"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              진단 다시하기
            </Link>
          </div>

          {/* 회사 기본 정보 */}
          <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {customer.companyName}
                  </h1>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${STAGE_BADGE[customer.stage]}`}
                  >
                    {customer.stage}
                  </span>
                </div>
                <p className="mt-2 text-slate-500">
                  {customer.industry} · {customer.businessType}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500">
                  가능성 점수
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {customer.score}
                  <span className="text-base text-slate-400"> / 100</span>
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile label="추천 기관" value={customer.recommendedAgency} />
              <InfoTile label="다음 액션" value={customer.nextAction} />
              <InfoTile
                label="최근 연락 / 업데이트"
                value={`${customer.lastContactedAt} / ${customer.updatedAt}`}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* 서류 체크리스트 */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">📄 서류 체크리스트</h2>
                <span className="text-sm font-medium text-slate-500">
                  {received} / {DOC_CHECKLIST.length}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {DOC_CHECKLIST.map((doc, idx) => {
                  const done = idx < received;
                  return (
                    <li
                      key={doc}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                          done
                            ? "bg-green-500 text-white"
                            : "border border-slate-300 text-slate-300"
                        }`}
                      >
                        {done ? "✓" : ""}
                      </span>
                      <span
                        className={
                          done ? "text-slate-400 line-through" : "text-slate-700"
                        }
                      >
                        {doc}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 상담 메모 + 업셀링 */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">📝 상담 메모</h2>
                <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {customer.memo}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">📈 업셀링 기회</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {customer.upsellOpportunities.map((u) => (
                    <span
                      key={u}
                      className="rounded-full border border-blue-100 bg-blue-50/60 px-3 py-1.5 text-sm font-medium text-blue-800"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 재접촉 메시지 */}
          <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">💬 재접촉 메시지</h2>
            <div className="mt-4">
              <CopyMessage label="재접촉 유도 메시지" text={followUpMessage} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
