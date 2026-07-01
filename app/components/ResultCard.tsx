"use client";

import { useState } from "react";
import type { DiagnosisInput, DiagnosisResult } from "@/app/types";
import {
  aiReasoning,
  buildCoachChat,
  oneLineConclusion,
  progressStars,
  todayTasks,
} from "@/app/lib/coach";
import ChatBubble from "./ChatBubble";

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

function SectionLabel({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
        {step}
      </span>
      <h2 className="text-base font-bold text-slate-700">{title}</h2>
    </div>
  );
}

function Stars({ score }: { score: number }) {
  const n = progressStars(score);
  return (
    <span className="text-xl tracking-tight" aria-label={`${n}점 만점 별점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "text-amber-400" : "text-slate-200"}>
          ★
        </span>
      ))}
    </span>
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
            copied ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
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

export default function ResultCard({
  input,
  result,
}: {
  input: DiagnosisInput;
  result: DiagnosisResult;
}) {
  const conclusion = oneLineConclusion(result);
  const tasks = todayTasks(input, result);
  const reasoning = aiReasoning(input, result);
  const chat = buildCoachChat(result);

  return (
    <div className="space-y-6">
      {/* ── ① 지금 당장 해야 하는 것 ───────────────────────── */}
      {/* AI 코치의 한 줄 결론 */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
          <span className="text-lg">🤖</span> AI 코치의 한 줄 결론
        </div>
        <p className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">
          “{conclusion}”
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1.5">
            <Stars score={result.overallScore} />
          </span>
          <span className="text-lg font-bold">
            진행 추천도 {result.overallScore}점
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            1순위 · {result.topAgency}
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 p-5">
          <p className="text-sm font-semibold text-blue-50">✅ 오늘 해야 할 일</p>
          <ol className="mt-3 space-y-2">
            {tasks.map((t, i) => (
              <li key={t} className="flex gap-2.5 text-sm sm:text-base">
                <span className="font-bold text-blue-200">{i + 1}</span>
                <span className="font-medium">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── ② 왜 이렇게 판단했는지 ───────────────────────── */}
      <SectionLabel step="②" title="왜 이렇게 판단했을까요" />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-blue-700">핵심 전략</p>
          <p className="mt-1.5 text-sm font-medium leading-6 text-slate-800">
            {result.summary.coreStrategy}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
          <p className="text-xs font-semibold text-amber-700">가장 큰 리스크</p>
          <p className="mt-1.5 text-sm font-medium leading-6 text-amber-900">
            {result.summary.biggestRisk}
          </p>
        </div>
      </div>

      {/* AI 판단 근거 */}
      <Card title="AI 판단 근거" emoji="🧠">
        <p className="text-sm text-slate-500">이 신호들을 종합해 판단했어요.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {reasoning.signals.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              <span className="text-green-500">✓</span>
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-slate-300">↓</span>
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">
            {reasoning.conclusion}
          </span>
        </div>
      </Card>

      {/* 김팀장 실전 코치 인사이트 */}
      <Card title="김팀장 실전 코치 인사이트" emoji="🧭">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-sm font-bold text-blue-900">✅ 가장 먼저 확인할 것</p>
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
            <p className="text-sm font-bold text-red-900">🚫 절대 약속하면 안 되는 것</p>
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

      {/* ── ③ 세부 내용 ───────────────────────── */}
      <SectionLabel step="③" title="세부 내용" />

      {/* 추천 기관 TOP 3 (GOOD / BAD) */}
      <Card title="추천 기관 TOP 3" emoji="🏦">
        <div className="space-y-4">
          {result.agencies.map((a, idx) => (
            <div key={a.name} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                      rankBadge[idx] ?? "bg-slate-400"
                    }`}
                  >
                    {a.rank}
                  </span>
                  <span className="font-bold">{a.name}</span>
                  {a.exceptionalReview && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                      예외 검토
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  적합도 {a.score}
                </span>
              </div>
              {a.exceptionalReview && a.exceptionalNote && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                  {a.exceptionalNote}
                </p>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-green-100 bg-green-50/50 p-3">
                  <p className="text-xs font-bold text-green-700">👍 좋은 이유</p>
                  <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
                    {a.reasons.map((r) => (
                      <li key={r} className="flex gap-1.5">
                        <span className="text-green-500">+</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                  <p className="text-xs font-bold text-amber-700">⚠ 주의</p>
                  <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
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

        {/* 후순위/제외 기관 사유 */}
        {result.deprioritized && result.deprioritized.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500">
              🚫 이번 추천에서 후순위로 밀린 기관과 그 이유
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              {result.deprioritized.map((d) => (
                <li key={d.name} className="flex gap-1.5">
                  <span className="shrink-0 font-semibold text-slate-500">
                    {d.name}
                  </span>
                  <span className="text-slate-400">—</span>
                  <span>{d.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* AI 상담 코치 (채팅형) */}
      <Card title="AI 상담 코치" emoji="🎯">
        <p className="text-sm text-slate-500">
          실제 상담처럼, 상황별로 이렇게 말해보세요.
        </p>
        <div className="mt-4 space-y-2.5">
          {chat.map((item, i) => (
            <ChatBubble key={i} item={item} />
          ))}
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

      {/* 유사 사례 */}
      <Card title="유사 사례 (자동 매칭)" emoji="📚">
        <p className="-mt-2 mb-4 text-sm text-slate-500">
          입력하신 고객 정보와 가장 가까운 실제 승인 사례예요.
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
            <div key={u.title} className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
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
