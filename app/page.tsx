import type { ReactNode } from "react";
import Link from "next/link";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

const problems = [
  {
    title: "DB는 들어오는데 계약률이 낮다",
    desc: "리드는 쌓이지만 실제 계약으로 이어지는 전환이 아쉽습니다.",
  },
  {
    title: "고객관리가 흩어진다",
    desc: "엑셀, 메신저, 메모장에 분산된 정보로 놓치는 고객이 생깁니다.",
  },
  {
    title: "어떤 기관이 유리한지 판단이 어렵다",
    desc: "고객 상황별 최적 기관·상품 매칭에 매번 시간이 걸립니다.",
  },
  {
    title: "사후 업셀링이 어렵다",
    desc: "계약 이후 재접촉·추가 제안 타이밍을 놓치기 쉽습니다.",
  },
];

const solutions = [
  "AI 기관 추천",
  "상담 질문 자동 생성",
  "계약 유도 멘트",
  "유사 사례 추천",
  "서류 요청 체크리스트",
  "CRM 진행관리",
  "재접촉 알림",
  "업셀링 추천",
];

const features: { icon: string; title: string; desc: string }[] = [
  {
    icon: "🏦",
    title: "AI 기관 추천",
    desc: "고객 정보 기반으로 가장 유리한 정책자금 기관과 상품을 즉시 추천합니다.",
  },
  {
    icon: "🎯",
    title: "AI 상담 코치",
    desc: "상황별 핵심 질문과 응대 멘트를 자동 생성해 전문가처럼 상담하세요.",
  },
  {
    icon: "🤝",
    title: "계약 클로징 가이드",
    desc: "망설이는 고객을 위한 계약 유도 멘트와 유사 성공 사례를 제안합니다.",
  },
  {
    icon: "📄",
    title: "서류 관리",
    desc: "기관·상품별 필요 서류 체크리스트로 누락 없이 준비를 요청합니다.",
  },
  {
    icon: "📇",
    title: "고객 CRM",
    desc: "상담부터 계약, 진행 상태까지 한 화면에서 흐름을 관리합니다.",
  },
  {
    icon: "📈",
    title: "업셀링 추천",
    desc: "재접촉 시점 알림과 추가 제안으로 고객 생애가치를 높입니다.",
  },
];

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`w-full px-6 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="flex-1 bg-white text-slate-900">
      <NavBar />

      {/* ① Hero */}
      <Section className="pt-16 text-center sm:pt-24">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            정책자금 컨설턴트를 위한 AI OS
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            정책자금 컨설턴트의
            <br />
            <span className="text-blue-600">AI 실전 코치</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            혼자서도 전문가처럼 상담하고,
            <br className="hidden sm:block" />
            더 많은 계약과 더 높은 고객 만족도를 만들어주는 AI OS
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/diagnosis"
              className="w-full rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto"
            >
              AI 진단 시작하기
            </Link>
            <Link
              href="/diagnosis?sample=1"
              className="w-full rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
            >
              샘플 고객 체험하기
            </Link>
          </div>
        </div>
      </Section>

      {/* ② 문제점 */}
      <Section className="bg-slate-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            이런 고민, 있으셨나요?
          </h2>
          <p className="mt-4 text-slate-600">
            정책자금 컨설턴트라면 누구나 겪는 현실적인 문제들
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-slate-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ③ 해결책 */}
      <Section>
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-blue-600">Policy Funding OS</span>가 해결합니다
          </h2>
          <p className="mt-4 text-slate-600">
            DB가 들어온 순간부터 상담, 계약, 서류, 진행관리, 업셀링까지 하나의 흐름으로
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {solutions.map((s) => (
            <div
              key={s}
              className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-sm font-medium text-blue-900"
            >
              <span className="text-blue-600">✓</span>
              {s}
            </div>
          ))}
        </div>
      </Section>

      {/* ④ 기능 카드 */}
      <Section id="features" className="bg-slate-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            핵심 기능
          </h2>
          <p className="mt-4 text-slate-600">
            상담부터 업셀링까지, 컨설팅 전 과정을 하나의 OS에서
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                {f.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ⑤ CTA */}
      <Section id="cta">
        <div className="rounded-3xl bg-blue-600 px-6 py-16 text-center text-white sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            혼자서도 전문가처럼.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            지금 Policy Funding OS로 더 많은 계약과 더 높은 고객 만족도를 경험하세요.
          </p>
          <div className="mt-8">
            <Link
              href="/diagnosis"
              className="inline-block rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
            >
              무료 체험 시작
            </Link>
          </div>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
