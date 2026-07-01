// Roadmap Engine — 고객에게 30/60/90일 진행 로드맵을 자동 생성.
// precheck(90일 관리) + 표준 진행 순서를 프로필/리스크에 맞춰 배치.

import type { Profile } from "./knowledgeEngine";
import type { Roadmap, RoadmapStep, RiskAssessment } from "@/app/types";

function label(days: number): string {
  return days === 0 ? "오늘" : `${days}일`;
}

export function buildRoadmap(
  profile: Profile,
  topAgency: string,
  risk: RiskAssessment,
): Roadmap {
  const steps: { offsetDays: number; task: string }[] = [];

  steps.push({ offsetDays: 0, task: "기본자료 요청 (사업자등록증·부가세·재무제표)" });
  steps.push({ offsetDays: 3, task: "세금·4대보험 완납, 기대출·연체 상태 확인" });

  if (profile.input.credit === "낮음") {
    steps.push({ offsetDays: 5, task: "신용 정리 + 저신용 대응 상품(소진공·지역재단) 병행 검토" });
  }

  steps.push({ offsetDays: 7, task: "대표 상담 — 자금 목적·희망 금액·강점 확정" });
  steps.push({ offsetDays: 15, task: "사업계획·자금사용계획 정리" });
  steps.push({ offsetDays: 30, task: `${topAgency} 서류 완비 및 접수 준비` });
  steps.push({ offsetDays: 45, task: `${topAgency} 기관 접수` });
  steps.push({ offsetDays: 60, task: "심사·실사 대응 준비 (사업장·증빙·대표 스크립트)" });
  steps.push({ offsetDays: 75, task: "심사 진행 관리 + 추가 자료 대응" });
  steps.push({
    offsetDays: 90,
    task:
      risk.score >= 60
        ? "보완 후 재도전 또는 승인 시 약정·실행"
        : "승인 후 약정 및 실행",
  });

  const full: RoadmapStep[] = steps.map((s) => ({
    offsetLabel: label(s.offsetDays),
    offsetDays: s.offsetDays,
    task: s.task,
    phase: s.offsetDays <= 30 ? "30일" : s.offsetDays <= 60 ? "60일" : "90일",
  }));

  return {
    steps: full,
    phases: {
      d30: full.filter((s) => s.phase === "30일").map((s) => s.task),
      d60: full.filter((s) => s.phase === "60일").map((s) => s.task),
      d90: full.filter((s) => s.phase === "90일").map((s) => s.task),
    },
  };
}
