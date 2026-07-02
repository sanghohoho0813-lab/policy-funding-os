"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DiagnosisInput, DiagnosisResult } from "@/app/types";
import { DEFAULT_INPUT, runDiagnosis, SAMPLE_INPUT } from "@/app/lib/diagnosis";
import { buildCustomerFromDiagnosis, saveCustomer } from "@/app/lib/storage";
import QuickDiagnosisForm from "./QuickDiagnosisForm";
import DeepDiagnosisForm from "./DeepDiagnosisForm";
import ResultCard from "./ResultCard";

// 진단 결과를 고객으로 저장하는 카드. result 가 바뀌면 key 로 리셋된다.
function SaveCustomerBar({
  input,
  result,
  quickInput,
  deepInput,
}: {
  input: DiagnosisInput;
  result: DiagnosisResult;
  quickInput: DiagnosisInput | null;
  deepInput: DiagnosisInput | null;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveCustomer(
      buildCustomerFromDiagnosis(input, result, {
        quickInput: quickInput ?? undefined,
        deepInput: deepInput ?? undefined,
      }),
    );
    setSaved(true);
  };

  return (
    <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/50 p-6 text-center">
      {saved ? (
        <div className="flex flex-col items-center gap-3">
          <p className="font-semibold text-blue-900">
            ✅ 고객으로 저장했어요. 대시보드에서 관리할 수 있습니다.
          </p>
          <Link
            href="/dashboard"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            고객 관리 대시보드로 이동
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-slate-600">
            이 진단 결과를 고객으로 저장하면 진행상태·메모를 이어서 관리할 수 있어요.
          </p>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            고객으로 저장하기
          </button>
        </div>
      )}
    </div>
  );
}

// 빠른 진단 → AI 1차 판단 → 필요한 심층 질문만 추가 → 결과 업데이트 (11차 UX)
export default function DiagnosisSection({
  autoSample = false,
}: {
  autoSample?: boolean;
}) {
  const [input, setInput] = useState<DiagnosisInput>(
    autoSample ? SAMPLE_INPUT : DEFAULT_INPUT,
  );
  const [result, setResult] = useState<DiagnosisResult | null>(
    autoSample ? runDiagnosis(SAMPLE_INPUT) : null,
  );
  const [quickInput, setQuickInput] = useState<DiagnosisInput | null>(
    autoSample ? SAMPLE_INPUT : null,
  );
  const [deepInput, setDeepInput] = useState<DiagnosisInput | null>(null);
  const [deepOpen, setDeepOpen] = useState(false);
  const [deepApplied, setDeepApplied] = useState(false);
  const [runId, setRunId] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const deepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result, runId]);

  const handleQuickSubmit = () => {
    setResult(runDiagnosis(input));
    setQuickInput(input);
    setDeepOpen(false);
    setDeepApplied(false);
    setRunId((r) => r + 1);
  };

  const handleDeepSubmit = () => {
    setResult(runDiagnosis(input));
    setDeepInput(input);
    setDeepApplied(true);
    setRunId((r) => r + 1);
  };

  const openDeep = () => {
    setDeepOpen(true);
    window.setTimeout(
      () => deepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      80,
    );
  };

  const topAgencies = result?.agencies.map((a) => a.name) ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <QuickDiagnosisForm
        value={input}
        onChange={setInput}
        onSubmit={handleQuickSubmit}
      />

      {result && (
        <div ref={resultRef} id="result" className="mt-14 scroll-mt-24">
          {deepApplied && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              🔍 심층 진단이 반영된 결과입니다.
            </div>
          )}
          <ResultCard input={input} result={result} />

          {/* 심층 진단으로 정확도 높이기 */}
          <div ref={deepRef} className="mt-6 scroll-mt-24">
            {!deepOpen ? (
              <button
                type="button"
                onClick={openDeep}
                className="w-full rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 px-6 py-5 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
              >
                <span className="text-base font-bold text-blue-700">
                  🔍 심층 진단으로 정확도 높이기
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  빠른 진단 결과에 맞는 질문만 추가로 확인해요 (1~2분)
                </p>
              </button>
            ) : (
              <DeepDiagnosisForm
                value={input}
                onChange={setInput}
                onSubmit={handleDeepSubmit}
                topAgencies={topAgencies}
              />
            )}
          </div>

          <SaveCustomerBar
            key={runId}
            input={input}
            result={result}
            quickInput={quickInput}
            deepInput={deepInput}
          />
        </div>
      )}
    </div>
  );
}
