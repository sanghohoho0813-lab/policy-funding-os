"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DiagnosisInput, DiagnosisResult } from "@/app/types";
import { DEFAULT_INPUT, runDiagnosis, SAMPLE_INPUT } from "@/app/lib/diagnosis";
import { buildCustomerFromDiagnosis, saveCustomer } from "@/app/lib/storage";
import DiagnosisForm from "./DiagnosisForm";
import ResultCard from "./ResultCard";

// 진단 결과를 고객으로 저장하는 카드. result 가 바뀌면 key 로 리셋된다.
function SaveCustomerBar({
  input,
  result,
}: {
  input: DiagnosisInput;
  result: DiagnosisResult;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveCustomer(buildCustomerFromDiagnosis(input, result));
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

// 진단 입력 폼 + 결과 카드. /diagnosis 페이지에서 사용.
// autoSample=true (예: /diagnosis?sample=1) 이면 샘플 데이터로 자동 진단한다.
export default function DiagnosisSection({
  autoSample = false,
}: {
  autoSample?: boolean;
}) {
  // 샘플 고객 체험(/diagnosis?sample=1) 진입 시 샘플 데이터로 초기화 + 자동 진단
  const [input, setInput] = useState<DiagnosisInput>(
    autoSample ? SAMPLE_INPUT : DEFAULT_INPUT,
  );
  const [result, setResult] = useState<DiagnosisResult | null>(
    autoSample ? runDiagnosis(SAMPLE_INPUT) : null,
  );
  const [runId, setRunId] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // 결과가 생성되면 결과 카드로 부드럽게 스크롤
  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleSubmit = () => {
    setResult(runDiagnosis(input));
    setRunId((r) => r + 1);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <DiagnosisForm value={input} onChange={setInput} onSubmit={handleSubmit} />

      {result && (
        <div ref={resultRef} id="result" className="mt-14 scroll-mt-24">
          <ResultCard input={input} result={result} />
          <SaveCustomerBar key={runId} input={input} result={result} />
        </div>
      )}
    </div>
  );
}
