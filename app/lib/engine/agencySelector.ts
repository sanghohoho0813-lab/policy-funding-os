// 기관 선택 — knowledge/funding-agencies.json 의 규칙만 참고해 판단.
// 이전 diagnosis.ts 의 기관별 하드코딩(제조업 +12, 특허 +15 …)을 제거하고,
// "어떤 업종·목적·조건이 유리한가"라는 지식은 JSON 에서 읽는다.
// 엔진에는 일반적인 매칭 가중치만 남긴다.

import type { AgencyRule, KnowledgeBase, Profile } from "./knowledgeEngine";
import type { AgencyRecommendation } from "@/app/types";

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(n)));

// JSON 라벨과 프로필을 느슨하게 매칭 (구두점/영문 차이 흡수)
function norm(s: string): string {
  return s.toLowerCase().replace(/[·・/\s()]/g, "");
}

function industryFavored(rule: AgencyRule, profile: Profile): boolean {
  const cat = norm(profile.industryCategory);
  const ind = norm(profile.input.industry);
  return rule.favorableIndustries.some((f) => {
    const nf = norm(f);
    return (
      nf.includes(cat) ||
      cat.includes(nf) ||
      (ind.length > 0 && (nf.includes(ind) || ind.includes(nf)))
    );
  });
}

function purposeMatched(rule: AgencyRule, profile: Profile): boolean {
  const p = norm(profile.input.purpose);
  return rule.mainPurposes.some((m) => norm(m).includes(p));
}

// suitableFor 문구에서 프로필 강점 키워드가 언급되는지
function strengthAligned(rule: AgencyRule, profile: Profile): number {
  const text = rule.suitableFor.join(" ");
  let hits = 0;
  for (const kw of profile.strengthKeywords) if (text.includes(kw)) hits += 1;
  return Math.min(3, hits);
}

// unfavorableConditions 중 프로필로 판단 가능한 항목만 페널티
function unfavorableHits(rule: AgencyRule, profile: Profile): string[] {
  const hits: string[] = [];
  for (const c of rule.unfavorableConditions) {
    const t = c;
    if (t.includes("저신용") && profile.input.credit === "낮음") hits.push(c);
    else if (
      (t.includes("상시근로자") || t.includes("규모가 커")) &&
      profile.input.employees === "10명 이상"
    )
      hits.push(c);
    else if (t.includes("기술 강점") && !profile.hasTech) hits.push(c);
    else if (
      (t.includes("단순 도소매") || t.includes("단순 소매") || t.includes("음식")) &&
      (profile.industryCategory === "음식/외식" ||
        profile.industryCategory === "도소매") &&
      (rule.key === "kibo" || rule.key === "kosme")
    )
      hits.push(c);
  }
  return hits;
}

interface Scored {
  rule: AgencyRule;
  score: number;
  reasons: string[];
  cautions: string[];
}

function scoreAgency(rule: AgencyRule, profile: Profile): Scored {
  let s = 50;
  const reasons: string[] = [];
  const cautions: string[] = [];

  if (industryFavored(rule, profile)) {
    s += 18;
    reasons.push(`${profile.industryCategory} 업종에 적합한 기관이에요.`);
  }
  if (purposeMatched(rule, profile)) {
    s += 14;
    reasons.push(`${profile.input.purpose} 목적과 맞는 자금이 있습니다.`);
  }
  const sa = strengthAligned(rule, profile);
  if (sa > 0) {
    s += sa * 6;
    reasons.push(
      `보유 강점(${profile.strengthKeywords.join("·")})이 이 기관 평가에 유리해요.`,
    );
  }

  // 일반 신용 보정 (도메인 규칙 아님)
  if (profile.input.credit === "우수") s += 6;
  else if (profile.input.credit === "보통") s += 3;
  else if (profile.input.credit === "낮음") s -= 6;

  // 저신용/영세 계층은 미소금융·지역재단·소진공 가점 (tier 문구 기반)
  if (
    profile.input.credit === "낮음" &&
    /저신용|초저신용|소상공인|영세/.test(rule.tier)
  ) {
    s += 8;
    reasons.push("저신용·소상공인 계층 접근성이 좋은 기관이에요.");
  }

  const unf = unfavorableHits(rule, profile);
  s -= unf.length * 9;
  for (const u of unf.slice(0, 1)) cautions.push(u);

  // JSON 주의사항을 보강
  for (const c of rule.cautions.slice(0, 2)) if (!cautions.includes(c)) cautions.push(c);

  if (reasons.length === 0) reasons.push(rule.consultingScript);

  return {
    rule,
    score: clamp(s),
    reasons: reasons.slice(0, 3),
    cautions: cautions.slice(0, 2),
  };
}

// 핵심 6개 기관만 후보로 스코어링 (funding-agency-rules)
const CORE_KEYS = ["semas", "regional", "kodit", "kibo", "kosme", "misaeng"];

export function selectAgencies(
  profile: Profile,
  kb: KnowledgeBase,
): AgencyRecommendation[] {
  const candidates = kb.agencies.filter((a) => CORE_KEYS.includes(a.key));
  const scored = candidates
    .map((rule) => scoreAgency(rule, profile))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map((x, idx) => ({
    rank: idx + 1,
    name: x.rule.name,
    score: x.score,
    reasons: x.reasons,
    cautions: x.cautions,
  }));
}
