"use client";

import { useEffect, useRef, useState } from "react";
import type { DiagnosisInput, DiagnosisResult } from "@/app/types";
import { DEFAULT_INPUT, runDiagnosis, SAMPLE_INPUT } from "@/app/lib/diagnosis";
import DiagnosisForm from "./DiagnosisForm";
import ResultCard from "./ResultCard";

export default function DiagnosisSection() {
  const [input, setInput] = useState<DiagnosisInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Hero의 "샘플 고객 체험하기" 버튼이 보내는 이벤트를 수신해 자동 진단
  useEffect(() => {
    const handleSample = () => {
      setInput(SAMPLE_INPUT);
      setResult(runDiagnosis(SAMPLE_INPUT));
    };
    window.addEventListener("pfos:sample", handleSample);
    return () => window.removeEventListener("pfos:sample", handleSample);
  }, []);

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
    <section id="diagnosis" className="w-full bg-slate-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            AI 진단 시작
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            고객 정보를 입력하면 진단 카드가 나옵니다
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            DB를 받은 순간, 몇 가지만 입력하면 추천 기관·상담 멘트·서류·업셀링까지
            한 장으로 정리됩니다.
          </p>
        </div>

        <div className="mt-12">
          <DiagnosisForm
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
          />
        </div>

        {result && (
          <div ref={resultRef} id="result" className="mt-14 scroll-mt-24">
            <ResultCard result={result} />
          </div>
        )}
      </div>
    </section>
  );
}
