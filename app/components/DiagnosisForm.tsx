"use client";

import type { DiagnosisInput, Strength } from "@/app/types";
import {
  BUSINESS_TYPES,
  CREDIT_OPTIONS,
  EMPLOYEE_OPTIONS,
  PURPOSE_OPTIONS,
  REVENUE_OPTIONS,
  STRENGTH_OPTIONS,
  YEARS_OPTIONS,
} from "@/app/types";

interface Props {
  value: DiagnosisInput;
  onChange: (value: DiagnosisInput) => void;
  onSubmit: () => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function ButtonGroup<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: readonly T[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function DiagnosisForm({ value, onChange, onSubmit }: Props) {
  const set = <K extends keyof DiagnosisInput>(
    key: K,
    v: DiagnosisInput[K],
  ) => onChange({ ...value, [key]: v });

  const toggleStrength = (s: Strength) => {
    if (s === "없음") {
      onChange({ ...value, strengths: value.strengths.includes("없음") ? [] : ["없음"] });
      return;
    }
    const withoutNone = value.strengths.filter((x) => x !== "없음");
    const next = withoutNone.includes(s)
      ? withoutNone.filter((x) => x !== s)
      : [...withoutNone, s];
    onChange({ ...value, strengths: next });
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="회사명">
          <input
            className={inputClass}
            placeholder="예: (주)한빛정밀"
            value={value.companyName}
            onChange={(e) => set("companyName", e.target.value)}
          />
        </Field>
        <Field label="업종">
          <input
            className={inputClass}
            placeholder="예: 자동차부품 제조"
            value={value.industry}
            onChange={(e) => set("industry", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-6">
        <Field label="사업자 구분">
          <ButtonGroup
            options={BUSINESS_TYPES}
            value={value.businessType}
            onSelect={(v) => set("businessType", v)}
          />
        </Field>
        <Field label="업력">
          <ButtonGroup
            options={YEARS_OPTIONS}
            value={value.years}
            onSelect={(v) => set("years", v)}
          />
        </Field>
        <Field label="연매출">
          <ButtonGroup
            options={REVENUE_OPTIONS}
            value={value.revenue}
            onSelect={(v) => set("revenue", v)}
          />
        </Field>
        <Field label="직원 수">
          <ButtonGroup
            options={EMPLOYEE_OPTIONS}
            value={value.employees}
            onSelect={(v) => set("employees", v)}
          />
        </Field>
        <Field label="대표자 신용 상태">
          <ButtonGroup
            options={CREDIT_OPTIONS}
            value={value.credit}
            onSelect={(v) => set("credit", v)}
          />
        </Field>
        <Field label="자금 목적">
          <ButtonGroup
            options={PURPOSE_OPTIONS}
            value={value.purpose}
            onSelect={(v) => set("purpose", v)}
          />
        </Field>
        <Field label="보유 강점 (복수 선택)">
          <div className="flex flex-wrap gap-2">
            {STRENGTH_OPTIONS.map((s) => {
              const active = value.strengths.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStrength(s)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {active ? "✓ " : ""}
                  {s}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="상담 메모">
          <textarea
            className={`${inputClass} min-h-24 resize-y`}
            placeholder="상담 중 파악한 특이사항, 대표 니즈 등을 적어두세요."
            value={value.memo}
            onChange={(e) => set("memo", e.target.value)}
          />
        </Field>
      </div>

      <button
        type="submit"
        className="mt-8 w-full rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
      >
        AI 진단 결과 보기
      </button>
    </form>
  );
}
