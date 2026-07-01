"use client";

import { useEffect, useRef, useState } from "react";
import type { DiagnosisInput, DiagnosisResult } from "@/app/types";
import { DEFAULT_INPUT, runDiagnosis, SAMPLE_INPUT } from "@/app/lib/diagnosis";
import DiagnosisForm from "./DiagnosisForm";
import ResultCard from "./ResultCard";

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
  const resultRef = useRef<HTMLDivElement>(null);

  // 결과가 생성되면 결과 카드로 부드럽게 스크롤
  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleSubmit = () => {
    setResult(runDiagnosis(input));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <DiagnosisForm value={input} onChange={setInput} onSubmit={handleSubmit} />

      {result && (
        <div ref={resultRef} id="result" className="mt-14 scroll-mt-24">
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
