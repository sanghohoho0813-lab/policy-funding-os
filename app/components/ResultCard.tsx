"use client";

import { useState } from "react";
import type { DiagnosisResult } from "@/app/types";

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white/15 text-white ring-4 ring-white/30">
      <span className="text-3xl font-bold leading-none">{score}</span>
      <span className="mt-1 text-xs text-blue-50">/ 100</span>
    </div>
  );
}

function Card({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <span className="text-xl">{emoji}</span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <button
          type="button"
          onClick={copy}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
            copied
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {copied ? "복사됨 ✓" : "복사"}
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-600">
        {text}
      </pre>
    </div>
  );
}

const rankBadge = ["bg-blue-600", "bg-blue-400", "bg-slate-400"];

export default function ResultCard({ result }: { result: DiagnosisResult }) {
  return (
    <div className="space-y-6">
      {/* 종합진단 요약 (최상단) */}
      <div className="rounded-3xl border-2 border-blue-100 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
            종합진단 요약
          </span>
          <span className="text-sm font-medium text-slate-500">
            {result.companyName}
          </span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-700">가능성 점수</p>
            <p className="mt-1">
              <span className="text-3xl font-bold text-blue-700">
                {result.summary.score}
              </span>
              <span className="text-sm text-blue-400"> / 100</span>
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">추천 기관</p>
            <p className="mt-1 text-lg font-bold text-slate-800">
              {result.summary.topAgency}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">핵심 전략</p>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
              {result.summary.coreStrategy}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs font-semibold text-amber-700">가장 큰 리스크</p>
            <p className="mt-1 text-sm font-medium leading-6 text-amber-900">
              {result.summary.biggestRisk}
            </p>
          </div>
        </div>
      </div>

      {/* 요약 헤더 */}
      <div className="rounded-3xl bg-blue-600 p-6 text-white sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-100">AI 진단 카드</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              {result.companyName}
            </h2>
            <div className="mt-4 space-y-1.5 text-sm text-blue-50">
              <p>
                추천 1순위 기관 ·{" "}
                <span className="font-semibold text-white">
                  {result.topAgency}
                </span>
              </p>
              <p>
                오늘 해야 할 다음 액션 ·{" "}
                <span className="font-semibold text-white">
                  {result.nextAction}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ScoreRing score={result.overallScore} />
            <span className="text-xs font-medium text-blue-50">
              종합 가능성 점수
            </span>
          </div>
        </div>
      </div>

      {/* 김팀장 실전 코치 인사이트 */}
      <Card title="김팀장 실전 코치 인사이트" emoji="🧭">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-sm font-bold text-blue-900">
              ✅ 가장 먼저 확인할 것
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {result.coachInsight.firstChecks.map((t) => (
                <li key={t} className="flex gap-1.5">
                  <span className="text-blue-500">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <p className="text-sm font-bold text-amber-900">⚠️ 리스크</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {result.coachInsight.risks.map((t) => (
                <li key={t} className="flex gap-1.5">
                  <span className="text-amber-500">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50/50 p-4">
            <p className="text-sm font-bold text-green-900">🎯 상담 전략</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {result.coachInsight.strategies.map((t) => (
                <li key={t} className="flex gap-1.5">
                  <span className="text-green-500">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
            <p className="text-sm font-bold text-red-900">
              🚫 절대 약속하면 안 되는 것
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {result.coachInsight.neverPromise.map((t) => (
                <li key={t} className="flex gap-1.5">
                  <span className="text-red-500">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* 추천 기관 TOP 3 */}
      <Card title="추천 기관 TOP 3" emoji="🏦">
        <div className="space-y-4">
          {result.agencies.map((a, idx) => (
            <div
              key={a.name}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                      rankBadge[idx] ?? "bg-slate-400"
                    }`}
                  >
                    {a.rank}
                  </span>
                  <span className="font-bold">{a.name}</span>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  적합도 {a.score}
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">추천 이유</p>
                  <ul className="mt-1 space-y-1 text-sm text-slate-700">
                    {a.reasons.map((r) => (
                      <li key={r} className="flex gap-1.5">
                        <span className="text-blue-500">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">주의할 점</p>
                  <ul className="mt-1 space-y-1 text-sm text-slate-700">
                    {a.cautions.map((c) => (
                      <li key={c} className="flex gap-1.5">
                        <span className="text-amber-500">!</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI 상담 코치 */}
      <Card title="AI 상담 코치" emoji="🎯">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              첫 상담 필수 질문 5
            </p>
            <ol className="mt-2 space-y-1.5 text-sm text-slate-600">
              {result.coach.questions.map((q, i) => (
                <li key={q} className="flex gap-2">
                  <span className="font-semibold text-blue-600">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">핵심 설명 멘트</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                {result.coach.keyPoints.map((k) => (
                  <li key={k} className="flex gap-1.5">
                    <span className="text-blue-500">•</span>
                    {k}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">계약 유도 멘트</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                {result.coach.closingLines.map((c) => (
                  <li key={c} className="flex gap-1.5">
                    <span className="text-green-500">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                망설일 때 대응 멘트
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                {result.coach.objectionLines.map((o) => (
                  <li key={o} className="flex gap-1.5">
                    <span className="text-amber-500">↩</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* 서류 요청 체크리스트 */}
      <Card title="서류 요청 체크리스트" emoji="📄">
        <ul className="grid gap-2 sm:grid-cols-2">
          {result.documents.map((d) => (
            <li
              key={d}
              className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded border border-blue-300 text-[10px] text-blue-500">
                ☐
              </span>
              {d}
            </li>
          ))}
        </ul>
      </Card>

      {/* 유사 사례 (전자책 승인 사례 DB 자동 매칭) */}
      <Card title="유사 사례 (자동 매칭)" emoji="📚">
        <p className="-mt-2 mb-4 text-sm text-slate-500">
          입력하신 고객 정보와 가장 가까운 실제 승인 사례를 찾아드렸어요.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {result.cases.map((c) => (
            <div
              key={c.title}
              className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-800">{c.title}</p>
                {typeof c.matchRate === "number" && (
                  <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
                    {c.matchRate}%
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                <p>{c.industry}</p>
                <p>
                  {c.years} · {c.revenue}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {c.agency}
                </span>
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  {c.approved}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-600">{c.note}</p>
              {c.lesson && (
                <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-700 ring-1 ring-slate-100">
                  💡 {c.lesson}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 업셀링 추천 */}
      <Card title="업셀링 추천" emoji="📈">
        <div className="grid gap-3 sm:grid-cols-2">
          {result.upsells.map((u) => (
            <div
              key={u.title}
              className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
            >
              <p className="text-sm font-bold text-blue-900">{u.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{u.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 다음 연락 메시지 */}
      <Card title="다음 연락 메시지" emoji="💬">
        <div className="space-y-4">
          <CopyBlock label="서류 요청 카톡 메시지" text={result.documentMessage} />
          <CopyBlock label="재상담 유도 메시지" text={result.followUpMessage} />
        </div>
      </Card>
    </div>
  );
}
