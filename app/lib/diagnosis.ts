import type {
  AgencyRecommendation,
  CoachContent,
  CoachInsight,
  DiagnosisInput,
  DiagnosisResult,
  DiagnosisSummary,
  IndustryCategory,
  SimilarCase,
  Strength,
  UpsellSuggestion,
} from "@/app/types";
import { EMPLOYEE_OPTIONS, REVENUE_OPTIONS, YEARS_OPTIONS } from "@/app/types";
import { APPROVAL_CASES, type ApprovalCase } from "@/app/lib/cases";

// 규칙 기반(프론트엔드 내부) 정책자금 진단 엔진.
// 실제 심사가 아니라 "초보 컨설턴트가 방향을 잡게 해주는" 코치 역할이 목적이다.

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(n)));

const has = (input: DiagnosisInput, s: Strength) => input.strengths.includes(s);

const hasTech = (i: DiagnosisInput) =>
  has(i, "기술력") || has(i, "특허") || has(i, "연구소") || has(i, "벤처");

// 자유 입력 업종 텍스트를 대분류로 분류 (업종별 판단에 사용)
export function classifyIndustry(text: string): IndustryCategory {
  const s = (text || "").toLowerCase();
  if (/제조|공장|가공|생산|부품|식품제조|섬유|화학|금속|전자/.test(s))
    return "제조";
  if (/음식|외식|식당|카페|요식|한식|분식|주점|베이커리|배달|프랜차이즈/.test(s))
    return "음식/외식";
  if (
    /소프트|아이티|\bit\b|앱|플랫폼|개발|소프트웨어|지식|콘텐츠|디자인|바이오|테크|스타트업|게임|ai|데이터/.test(
      s,
    )
  )
    return "IT/지식서비스";
  if (/도소매|도매|소매|쇼핑몰|판매|유통|커머스|상사|마트|무역|온라인/.test(s))
    return "도소매";
  if (/건설|인테리어|시공|토목|전기공사|설비공사|건축/.test(s))
    return "건설/기타";
  if (/미용|서비스|운송|물류|교육|병원|의료|숙박|용역|컨설|청소|세탁/.test(s))
    return "서비스";
  return "건설/기타";
}

interface AgencyScore {
  name: string;
  score: number;
  reasons: string[];
  cautions: string[];
}

function scoreShinbo(i: DiagnosisInput, cat: IndustryCategory): AgencyScore {
  let s = 60;
  const reasons: string[] = [];
  const cautions: string[] = [];

  // 업종별 판단
  if (cat === "도소매" || cat === "서비스") {
    s += 5;
    reasons.push(`${cat} 업종은 신용보증기금 보증을 폭넓게 활용할 수 있어요.`);
  } else if (cat === "제조" || cat === "건설/기타") {
    s += 3;
  }

  if (i.purpose === "운전자금") {
    s += 10;
    reasons.push("운전자금 보증은 신용보증기금의 대표 영역이라 접근성이 좋아요.");
  } else if (i.purpose === "시설자금" || i.purpose === "긴급자금") {
    s += 5;
  }

  if (i.credit === "우수") {
    s += 12;
    reasons.push("대표자 신용이 우수해 보증 한도·금리에서 유리합니다.");
  } else if (i.credit === "보통") {
    s += 6;
  } else if (i.credit === "낮음") {
    s -= 10;
    cautions.push("신용이 낮으면 보증 한도가 제한되거나 거절될 수 있어요.");
  } else {
    s -= 3;
    cautions.push("대표자 신용 상태 확인이 먼저 필요합니다.");
  }

  if (i.revenue === "1~5억" || i.revenue === "5~10억") s += 8;
  else if (i.revenue === "10~30억") s += 5;
  else if (i.revenue === "30억 이상") s += 3;
  else s += 2;

  if (i.years === "3~7년") s += 8;
  else if (i.years === "7년 이상") s += 6;
  else if (i.years === "1~3년") s += 4;
  else {
    s -= 6;
    cautions.push("업력 1년 미만은 매출 실적 부족으로 한도가 낮게 나올 수 있어요.");
  }

  if (has(i, "수출")) s += 5;
  if (has(i, "고용증가")) s += 4;

  if (reasons.length === 0)
    reasons.push("업종·규모에 두루 활용 가능한 범용 보증기관이라 기본 후보로 적합해요.");
  if (cautions.length === 0)
    cautions.push("기존 대출 한도가 많으면 추가 보증이 제한될 수 있으니 확인하세요.");

  return { name: "신용보증기금", score: clamp(s), reasons, cautions };
}

function scoreKibo(i: DiagnosisInput, cat: IndustryCategory): AgencyScore {
  let s = 45;
  const reasons: string[] = [];
  const cautions: string[] = [];

  // 업종별 판단
  if (cat === "제조" || cat === "IT/지식서비스") {
    s += 8;
    reasons.push(`${cat} 업종은 기술평가에서 유리한 대표적인 기보 타깃이에요.`);
  } else if (cat === "음식/외식" || cat === "도소매") {
    s -= 6;
    cautions.push("음식·도소매는 기술평가 근거가 약해 기보 우선순위가 낮아요.");
  }

  if (has(i, "기술력")) {
    s += 15;
    reasons.push("기술력 보유 기업은 기술보증기금의 핵심 타깃이에요.");
  }
  if (has(i, "특허")) {
    s += 15;
    reasons.push("특허가 있으면 기술평가에서 가점을 받아 한도가 올라갑니다.");
  }
  if (has(i, "연구소")) {
    s += 12;
    reasons.push("부설연구소 보유는 기술기업 인정에 강력한 근거예요.");
  }
  if (has(i, "벤처")) s += 10;
  if (has(i, "제조업")) s += 8;

  if (i.purpose === "시설자금") s += 8;
  else if (i.purpose === "창업자금") s += 6;
  else if (i.purpose === "운전자금") s += 5;

  if (i.credit === "우수") s += 8;
  else if (i.credit === "보통") s += 4;
  else if (i.credit === "낮음") {
    s -= 8;
    cautions.push("신용이 낮으면 기술평가가 좋아도 승인 문턱이 높아질 수 있어요.");
  }

  if (i.years === "3~7년") s += 8;
  else if (i.years === "1~3년") s += 6;
  else if (i.years === "7년 이상") s += 5;
  else s += 2;

  if (has(i, "청년대표")) s += 5;

  if (!hasTech(i)) {
    s -= 10;
    cautions.push("기술 강점이 없으면 기술평가 통과가 어려워 우선순위를 낮추세요.");
  }
  cautions.push("기술평가가 필수라 기술·매출 연결을 보여줄 자료 준비가 중요해요.");

  if (reasons.length === 0)
    reasons.push("기술 요소를 보강하면 충분히 노려볼 수 있는 기관이에요.");

  return { name: "기술보증기금", score: clamp(s), reasons, cautions };
}

function scoreKosme(i: DiagnosisInput, cat: IndustryCategory): AgencyScore {
  // 중소벤처기업진흥공단 (정책자금 직접대출)
  let s = 50;
  const reasons: string[] = [];
  const cautions: string[] = [];

  // 업종별 판단
  if (cat === "제조") {
    s += 8;
    reasons.push("제조업은 중진공 직접대출의 최우선 지원 업종이에요.");
  } else if (cat === "IT/지식서비스") {
    s += 6;
  } else if (cat === "음식/외식") {
    s -= 8;
    cautions.push("단순 음식·소매업은 중진공 직접대출 대상에서 밀릴 수 있어요.");
  }
  if (i.businessType === "법인사업자") s += 4;

  if (has(i, "제조업")) {
    s += 12;
    reasons.push("제조업은 중진공 정책자금의 우선 지원 대상이에요.");
  }
  if (has(i, "기술력")) s += 8;
  if (has(i, "벤처")) s += 8;
  if (has(i, "특허")) s += 6;
  if (has(i, "연구소")) s += 6;

  if (i.purpose === "시설자금") {
    s += 10;
    reasons.push("시설투자 자금은 중진공 직접대출로 저리 조달이 유리합니다.");
  } else if (i.purpose === "창업자금") {
    s += 10;
  } else if (i.purpose === "운전자금") s += 5;

  if (has(i, "청년대표")) {
    s += 8;
    reasons.push("청년 대표는 청년전용·창업기업 자금에서 가점이 있어요.");
  }

  if (i.revenue === "10~30억") s += 8;
  else if (i.revenue === "5~10억") s += 6;
  else if (i.revenue === "1~5억") s += 5;

  if (i.years === "3~7년") s += 8;
  else if (i.years === "1~3년") s += 6;
  else if (i.years === "7년 이상") s += 5;
  else s += 3;

  if (has(i, "고용증가")) s += 5;
  if (has(i, "수출")) s += 6;

  if (i.credit === "우수") s += 6;
  else if (i.credit === "보통") s += 3;
  else if (i.credit === "낮음") s -= 8;

  cautions.push("예산 소진이 빨라 신청 시기가 중요하고, 사업계획서 완성도가 관건이에요.");
  if (reasons.length === 0)
    reasons.push("성장성이 보이는 기업이면 직접대출로 좋은 조건을 노릴 수 있어요.");

  return { name: "중소벤처기업진흥공단", score: clamp(s), reasons, cautions };
}

function scoreSemas(i: DiagnosisInput, cat: IndustryCategory): AgencyScore {
  // 소상공인시장진흥공단
  let s = 45;
  const reasons: string[] = [];
  const cautions: string[] = [];

  // 업종별 판단
  if (cat === "음식/외식" || cat === "서비스" || cat === "도소매") {
    s += 8;
    reasons.push(`${cat} 소상공인은 소진공 정책자금 접근성이 좋아요.`);
  } else if (cat === "제조") {
    s -= 3;
  }

  if (i.employees === "0명") s += 12;
  else if (i.employees === "1~4명") s += 10;
  else if (i.employees === "5~9명") s += 3;
  else {
    s -= 10;
    cautions.push("상시근로자 10명 이상이면 소상공인 기준을 벗어날 수 있어요.");
  }

  if (i.revenue === "1억 미만") s += 12;
  else if (i.revenue === "1~5억") s += 8;
  else if (i.revenue === "5~10억") s -= 2;
  else if (i.revenue === "10~30억") s -= 12;
  else s -= 20;

  if (i.purpose === "긴급자금") {
    s += 12;
    reasons.push("소상공인 긴급·경영안정 자금 접근이 빠른 편이에요.");
  } else if (i.purpose === "창업자금" || i.purpose === "운전자금") s += 8;
  else if (i.purpose === "저신용자금") s += 8;

  if (i.businessType === "개인사업자") {
    s += 8;
    reasons.push("개인 소상공인은 소진공 자금과 궁합이 좋습니다.");
  } else s -= 3;

  if (i.credit === "낮음") s += 2;
  else if (i.credit === "보통" || i.credit === "우수") s += 5;

  if (has(i, "청년대표")) s += 5;

  cautions.push("한도가 소액 위주이고 소상공인 기준(업종별 근로자 수) 확인이 필요해요.");
  if (reasons.length === 0)
    reasons.push("소상공인 규모라면 빠르게 접근할 수 있는 기본 창구예요.");

  return { name: "소상공인시장진흥공단", score: clamp(s), reasons, cautions };
}

function scoreRegional(i: DiagnosisInput, cat: IndustryCategory): AgencyScore {
  // 지역신용보증재단
  let s = 42;
  const reasons: string[] = [];
  const cautions: string[] = [];

  // 업종별 판단
  if (cat === "음식/외식" || cat === "서비스" || cat === "도소매") {
    s += 7;
    reasons.push(`${cat} 소상공인은 지역재단 소액 보증과 궁합이 좋아요.`);
  } else if (cat === "제조") {
    s -= 4;
  }

  if (i.employees === "0명") s += 12;
  else if (i.employees === "1~4명") s += 10;
  else if (i.employees === "5~9명") s += 2;
  else {
    s -= 12;
    cautions.push("규모가 커지면 지역재단보다 신보/기보가 더 적합해요.");
  }

  if (i.revenue === "1억 미만") s += 12;
  else if (i.revenue === "1~5억") s += 8;
  else if (i.revenue === "5~10억") s -= 3;
  else if (i.revenue === "10~30억") s -= 14;
  else s -= 20;

  if (i.credit === "낮음") {
    s += 6;
    reasons.push("저신용·소상공인 대상 보증 상품이 있어 신용이 낮아도 접근 여지가 있어요.");
  } else if (i.credit === "보통") s += 5;
  else if (i.credit === "우수") s += 3;
  else s += 2;

  if (i.purpose === "저신용자금") {
    s += 12;
    reasons.push("저신용자금 니즈에는 지역재단이 현실적인 1차 대안이에요.");
  } else if (i.purpose === "긴급자금") s += 10;
  else if (i.purpose === "운전자금") s += 8;

  if (i.businessType === "개인사업자") s += 8;
  else s -= 3;

  cautions.push("지역 재단별 상품·한도 차이가 커서 관할 재단 확인이 필요해요.");
  if (reasons.length === 0)
    reasons.push("소상공인 소액 보증이 필요할 때 접근성이 좋은 창구예요.");

  return { name: "신용보증재단", score: clamp(s), reasons, cautions };
}

function buildAgencies(i: DiagnosisInput): AgencyRecommendation[] {
  const cat = classifyIndustry(i.industry);
  const scored = [
    scoreShinbo(i, cat),
    scoreKibo(i, cat),
    scoreKosme(i, cat),
    scoreSemas(i, cat),
    scoreRegional(i, cat),
  ].sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((a, idx) => ({
    rank: idx + 1,
    name: a.name,
    score: a.score,
    reasons: a.reasons.slice(0, 3),
    cautions: a.cautions.slice(0, 2),
  }));
}

function buildCoach(i: DiagnosisInput, topAgency: string): CoachContent {
  const questions: string[] = [];
  if (i.purpose === "시설자금")
    questions.push("설비·시설 견적서나 계약 예정 내역을 가지고 계신가요?");
  if (has(i, "기술력") || has(i, "특허") || has(i, "연구소"))
    questions.push("보유하신 기술·특허·인증을 증빙할 자료가 있나요?");
  if (has(i, "고용증가"))
    questions.push("최근 1년간 직원 수 변화(입·퇴사) 내역을 알 수 있을까요?");

  const base = [
    "현재 가장 급하게 필요한 자금 용도와 희망 금액은 얼마인가요?",
    "기존에 받은 대출·정책자금 이력이 있나요? (기관·잔액 포함)",
    "세금 체납이나 4대보험 미납 이력이 있으신가요?",
    "대표님 개인 신용점수나 최근 연체 이력을 알고 계신가요?",
    "자금이 언제까지 필요하신가요? (긴급도 확인)",
  ];
  for (const q of base) {
    if (questions.length >= 5) break;
    if (!questions.includes(q)) questions.push(q);
  }

  const purposeKey =
    i.purpose === "운전자금"
      ? "운전자금은 매출과 사업 지속성을 보여주는 게 핵심이라 재무자료 정리가 승인을 좌우해요."
      : i.purpose === "시설자금"
        ? "시설자금은 투자 계획의 구체성과 견적 근거가 승인 한도를 결정합니다."
        : i.purpose === "창업자금"
          ? "창업자금은 사업 아이템의 실현 가능성과 대표 역량을 어떻게 설명하느냐가 관건이에요."
          : i.purpose === "저신용자금"
            ? "저신용 상황일수록 소진공·지역재단부터 단계적으로 접근하는 전략이 필요해요."
            : "긴급자금은 속도가 생명이라, 서류를 미리 갖춰두면 접수 타이밍을 잡을 수 있어요.";

  const keyPoints = [
    `${topAgency}이(가) 대표님 상황에 가장 적합한 1순위 기관이에요. 여기부터 준비하면 승인 가능성이 높습니다.`,
    "정책자금은 '되냐 안 되냐'가 아니라 '어떻게 준비하느냐'의 싸움이에요. 서류를 제대로 갖추면 한도가 달라집니다.",
    purposeKey,
  ];

  const closingLines = [
    `지금 서류만 준비해두시면 제가 ${topAgency} 기준으로 최적 한도까지 설계해드릴게요.`,
    "예산과 시기를 고려하면 이번 주 안에 접수 준비를 시작하는 게 유리합니다. 오늘 서류부터 시작하시죠.",
  ];

  const objectionLines = [
    "부담되시는 점 충분히 이해해요. 우선 무료로 가능성만 진단해드리고, 진행 여부는 결과 보고 결정하셔도 됩니다.",
    i.credit === "낮음"
      ? "신용이 걱정되시죠? 그래서 저신용 대상 상품(소진공·지역재단)부터 접근하는 별도 전략이 있어요."
      : "지금 미루면 다음 예산 배정까지 몇 달을 기다려야 할 수 있어요. 자리 있을 때 선점하는 게 이득입니다.",
  ];

  return {
    questions: questions.slice(0, 5),
    keyPoints,
    closingLines,
    objectionLines,
  };
}

const DOCUMENTS: string[] = [
  "사업자등록증",
  "부가세과세표준증명",
  "재무제표 또는 손익자료",
  "4대보험 가입자명부",
  "국세/지방세 납세증명서",
  "신용정보 확인 관련 자료",
  "임대차계약서 또는 사업장 자료",
  "자금 사용 계획 자료",
];

// 입력값과 승인 사례(cases.ts)의 유사도를 계산해 가장 가까운 순서로 정렬한다.
function caseMatchScore(i: DiagnosisInput, c: ApprovalCase): number {
  let s = 0;
  const max = 100;

  if (classifyIndustry(i.industry) === c.industryCategory) s += 30;
  if (i.purpose === c.purpose) s += 20;
  if (i.businessType === c.businessType) s += 10;

  const yearsGap = Math.abs(
    YEARS_OPTIONS.indexOf(i.years) - YEARS_OPTIONS.indexOf(c.years),
  );
  s += Math.max(0, 10 - yearsGap * 4);

  const revGap = Math.abs(
    REVENUE_OPTIONS.indexOf(i.revenue) - REVENUE_OPTIONS.indexOf(c.revenue),
  );
  s += Math.max(0, 12 - revGap * 4);

  const empGap = Math.abs(
    EMPLOYEE_OPTIONS.indexOf(i.employees) - EMPLOYEE_OPTIONS.indexOf(c.employees),
  );
  s += Math.max(0, 8 - empGap * 3);

  if (i.credit === c.credit) s += 6;

  const overlap = i.strengths.filter(
    (x) => x !== "없음" && c.strengths.includes(x),
  ).length;
  s += Math.min(14, overlap * 5);

  return Math.round((s / max) * 100);
}

function buildMatchedCases(i: DiagnosisInput): SimilarCase[] {
  return [...APPROVAL_CASES]
    .map((c) => ({ c, m: caseMatchScore(i, c) }))
    .sort((a, b) => b.m - a.m)
    .slice(0, 3)
    .map(({ c, m }) => ({
      title: c.title,
      industry: c.industryLabel,
      years: c.years,
      revenue: c.revenue,
      agency: `${c.agency} 추천`,
      approved: c.approved,
      note: c.note,
      lesson: c.lesson,
      matchRate: m,
    }));
}

function buildUpsells(i: DiagnosisInput): UpsellSuggestion[] {
  const list: UpsellSuggestion[] = [];
  const isCorp = i.businessType === "법인사업자";
  const bigRevenue = i.revenue === "10~30억" || i.revenue === "30억 이상";
  const midRevenue =
    i.revenue === "5~10억" || i.revenue === "10~30억" || i.revenue === "30억 이상";

  // 1) 고용지원금
  if (i.employees !== "0명" || has(i, "고용증가")) {
    list.push({
      title: "고용지원금 진단",
      desc: "직원을 고용 중이라면 청년내일채움·고용촉진장려금·두루누리 등 받을 수 있는 인건비 지원이 있는지 함께 점검해보세요.",
    });
  }

  // 2) 기업부설연구소
  if (
    has(i, "연구소") ||
    has(i, "기술력") ||
    has(i, "특허") ||
    classifyIndustry(i.industry) === "IT/지식서비스" ||
    (has(i, "제조업") && isCorp)
  ) {
    list.push({
      title: "기업부설연구소 설립",
      desc: "연구·개발 인력이 있다면 부설연구소(또는 연구개발전담부서) 인정으로 R&D 세액공제와 정책자금 가점을 동시에 확보할 수 있어요.",
    });
  }

  // 3) 벤처기업 확인
  if (has(i, "기술력") || has(i, "특허") || has(i, "벤처") || has(i, "연구소")) {
    list.push({
      title: "벤처기업 확인",
      desc: "기술 요건을 갖췄다면 벤처기업 확인으로 법인세·취득세 감면과 기보·중진공 우대까지 연결됩니다.",
    });
  }

  // 4) 법인세 절세
  if (isCorp && midRevenue) {
    list.push({
      title: "법인세 절세 설계",
      desc: "일정 규모 이상 법인은 가지급금 정리·대표 급여/상여 설계·정책자금 이자비용 처리로 법인세를 줄일 여지가 큽니다.",
    });
  }

  // 5) 세액공제
  if (has(i, "고용증가") || has(i, "연구소") || has(i, "제조업")) {
    list.push({
      title: "세액공제 점검 (통합고용·R&D·투자)",
      desc: "고용 증가·R&D·설비 투자가 있으면 통합고용세액공제, 연구인력개발비 공제, 통합투자세액공제를 놓치지 않게 챙겨드리세요.",
    });
  }

  // 6) 법인전환
  if (!isCorp && midRevenue) {
    list.push({
      title: "법인전환 컨설팅",
      desc: "매출이 커진 개인사업자는 법인전환으로 세율 구조·대외 신뢰도·정책자금 한도 측면에서 유리해질 수 있어요.",
    });
  }

  // 7) 정부지원사업 (R&D 과제)
  if (
    has(i, "기술력") ||
    has(i, "특허") ||
    has(i, "연구소") ||
    has(i, "청년대표") ||
    classifyIndustry(i.industry) === "IT/지식서비스"
  ) {
    list.push({
      title: "정부지원사업(R&D·창업) 연계",
      desc: "기술·아이디어가 있으면 창업패키지, 스마트공장, R&D 과제 등 상환 부담 없는 정부지원사업을 함께 제안해보세요.",
    });
  }

  // 8) 수출바우처
  if (has(i, "수출")) {
    list.push({
      title: "수출바우처 · 무역금융",
      desc: "수출 실적·계획이 있으면 수출바우처와 무역보험·무역금융 연계로 다음 상담 주제를 자연스럽게 만들 수 있어요.",
    });
  }

  if (bigRevenue && isCorp) {
    list.push({
      title: "가업승계 · 자산 컨설팅",
      desc: "규모 있는 법인은 가업승계 준비·대표 자산 설계까지 장기 파트너십으로 발전시킬 수 있어요.",
    });
  }

  if (list.length === 0) {
    list.push({
      title: "정기 정책자금 점검",
      desc: "지금 당장 큰 업셀 포인트는 적지만, 분기별 정책자금 점검 리마인드로 재접촉 관계를 유지하세요.",
    });
  }

  // 중복 제목 제거 후 최대 6개
  const seen = new Set<string>();
  return list
    .filter((u) => (seen.has(u.title) ? false : (seen.add(u.title), true)))
    .slice(0, 6);
}

// 김팀장 실전 코치 인사이트 (전자책 톤의 상담 가이드)
function buildCoachInsight(
  i: DiagnosisInput,
  topAgency: string,
): CoachInsight {
  const cat = classifyIndustry(i.industry);

  const firstChecks: string[] = [
    "국세·지방세 체납, 4대보험 미납부터 확인하세요. 하나라도 걸리면 대부분 기관에서 접수 자체가 막힙니다.",
    "기존 대출·보증 잔액과 한도 소진 여부를 확인하세요. 남은 보증 여력이 실제 한도를 좌우합니다.",
  ];
  if (i.credit === "낮음" || i.credit === "알 수 없음") {
    firstChecks.push(
      "대표님 개인 신용점수·최근 연체 이력을 먼저 조회하세요. 신용이 확인돼야 접근 가능한 상품이 갈립니다.",
    );
  }
  if (i.purpose === "시설자금") {
    firstChecks.push(
      "설비·시설 견적서나 계약(예정) 근거가 있는지 확인하세요. 근거가 있어야 시설자금 한도가 나옵니다.",
    );
  }

  const risks: string[] = [];
  if (i.credit === "낮음")
    risks.push("대표 신용이 낮아 은행·보증기관에서 한도 축소나 거절 가능성이 있습니다.");
  if (i.years === "1년 미만")
    risks.push("업력 1년 미만은 매출 실적 부족으로 한도가 낮게 나올 수 있습니다.");
  if (cat === "음식/외식" || cat === "도소매")
    risks.push(`${cat} 업종은 담보·기술 근거가 약해 보증 한도가 제한적일 수 있습니다.`);
  if (i.strengths.includes("없음") || i.strengths.length === 0)
    risks.push("내세울 강점이 뚜렷하지 않아, 재무·성실납세로 승부를 봐야 합니다.");
  risks.push("정책자금은 예산·시기 영향을 크게 받아, 요건이 좋아도 접수 타이밍을 놓치면 다음 배정까지 밀립니다.");

  const strategies: string[] = [
    `${topAgency}을(를) 1순위로 잡고, 서류부터 완비해 한도를 최대한 끌어올리세요.`,
    "여러 기관을 동시에 벌리지 말고, 1순위에서 준비하며 2순위를 백업으로 두는 '단계 접근'이 안전합니다.",
  ];
  if (hasTech(i))
    strategies.push("기술력·특허·연구소 강점을 기술평가 자료로 정리하면 등급과 한도가 함께 올라갑니다.");
  if (i.credit === "낮음")
    strategies.push("저신용이면 소진공·지역재단 소액부터 접근해 실적을 만든 뒤 단계적으로 확대하세요.");

  const neverPromise: string[] = [
    "'무조건 승인된다'거나 한도 금액을 확정해서 약속하지 마세요. 최종 승인·한도는 기관 심사 결과입니다.",
    "금리를 확정적으로 말하지 마세요. 신용등급·상품·시기에 따라 달라집니다.",
    "승인·실행 시기를 단정하지 마세요. 예산 상황과 서류 준비 속도에 따라 유동적입니다.",
    "체납·연체가 있는데 '문제없이 된다'고 넘기지 마세요. 사실대로 확인하고 정리부터 안내해야 합니다.",
  ];

  return {
    firstChecks: firstChecks.slice(0, 4),
    risks: risks.slice(0, 4),
    strategies: strategies.slice(0, 4),
    neverPromise: neverPromise.slice(0, 4),
  };
}

// 종합진단 요약 (결과 최상단 카드)
function buildSummary(
  i: DiagnosisInput,
  agencies: AgencyRecommendation[],
  overallScore: number,
  insight: CoachInsight,
): DiagnosisSummary {
  const topAgency = agencies[0]?.name ?? "신용보증기금";
  const second = agencies[1]?.name;

  let coreStrategy: string;
  if (hasTech(i)) {
    coreStrategy = `기술 강점을 앞세워 ${topAgency} 중심으로 준비${
      second ? `, ${second} 병행` : ""
    }`;
  } else if (i.credit === "낮음") {
    coreStrategy = `저신용 대응 상품(${topAgency}) 소액부터 단계적으로 접근`;
  } else {
    coreStrategy = `${topAgency} 중심으로 서류부터 완비해 한도 극대화${
      second ? ` (백업: ${second})` : ""
    }`;
  }

  return {
    score: overallScore,
    topAgency,
    coreStrategy,
    biggestRisk: insight.risks[0] ?? "특이 리스크는 낮은 편이나, 접수 시기 관리는 필요합니다.",
  };
}

function buildNextAction(i: DiagnosisInput, topAgency: string): string {
  const parts = [`${topAgency} 기준 서류 요청 메시지 오늘 바로 발송`];
  if (i.credit === "낮음") {
    parts.push("저신용 대응 상품(소진공·지역재단) 병행 검토");
  } else {
    parts.push("1순위 기관 상담 일정 예약");
  }
  return parts.join(" → ");
}

function buildMessages(
  i: DiagnosisInput,
  topAgency: string,
  overallScore: number,
) {
  const company = i.companyName || "대표님 회사";
  const isCorp = i.businessType === "법인사업자";

  const documentMessage =
    `대표님 안녕하세요 😊\n` +
    `${company} ${i.purpose} 건 상담 담당입니다.\n\n` +
    `오늘 말씀 나눈 대로, ${topAgency} 기준으로 검토를 진행하려고 합니다.\n` +
    `아래 서류만 준비해 주시면 제가 한도부터 꼼꼼히 확인해서 정리해드릴게요.\n\n` +
    DOCUMENTS.map((d, idx) => `${idx + 1}. ${d}`).join("\n") +
    `\n\n※ ${
      isCorp ? "재무제표는 최근 결산 기준" : "손익자료는 최근 1년 정도"
    }면 충분합니다.\n` +
    `사진이든 파일이든 편하신 형태로 보내주시면 됩니다.\n` +
    `준비 어려우신 항목은 말씀해 주세요. 제가 방법 안내드리겠습니다. 감사합니다!`;

  const followUpMessage =
    `대표님, ${company} 건으로 연락드립니다 😊\n\n` +
    `지난번 말씀해 주신 ${i.purpose} 관련해서 제가 조건을 한 번 정리해 봤는데요,\n` +
    `${topAgency} 기준으로 접근하면 충분히 준비해 볼 만한 상황으로 보입니다. ` +
    `(내부 가능성 점수 ${overallScore}점 수준)\n\n` +
    `물론 최종 한도·승인은 서류를 봐야 정확해지는 부분이라, ` +
    `한 번 자료 보면서 방향만 잡아드리면 좋을 것 같습니다.\n` +
    `이번 주 중에 10분만 통화 가능하신 시간 있으실까요? 편하신 때 알려주세요!`;

  return { documentMessage, followUpMessage };
}

export function runDiagnosis(input: DiagnosisInput): DiagnosisResult {
  const agencies = buildAgencies(input);
  const topAgency = agencies[0]?.name ?? "신용보증기금";

  const avg =
    agencies.reduce((sum, a) => sum + a.score, 0) / (agencies.length || 1);
  const overallScore = clamp(avg, 42, 96);

  const coach = buildCoach(input, topAgency);
  const coachInsight = buildCoachInsight(input, topAgency);
  const summary = buildSummary(input, agencies, overallScore, coachInsight);
  const upsells = buildUpsells(input);
  const cases = buildMatchedCases(input);
  const nextAction = buildNextAction(input, topAgency);
  const { documentMessage, followUpMessage } = buildMessages(
    input,
    topAgency,
    overallScore,
  );

  return {
    companyName: input.companyName || "고객사",
    overallScore,
    topAgency,
    nextAction,
    summary,
    coachInsight,
    agencies,
    coach,
    documents: DOCUMENTS,
    cases,
    upsells,
    documentMessage,
    followUpMessage,
  };
}

export const DEFAULT_INPUT: DiagnosisInput = {
  companyName: "",
  industry: "",
  businessType: "개인사업자",
  years: "1~3년",
  revenue: "1~5억",
  employees: "1~4명",
  credit: "보통",
  purpose: "운전자금",
  strengths: [],
  memo: "",
};

export const SAMPLE_INPUT: DiagnosisInput = {
  companyName: "(주)한빛정밀",
  industry: "자동차부품 제조",
  businessType: "법인사업자",
  years: "3~7년",
  revenue: "5~10억",
  employees: "5~9명",
  credit: "보통",
  purpose: "시설자금",
  strengths: ["제조업", "기술력", "특허"],
  memo: "노후 설비 교체 및 신규 라인 증설 자금 필요. 최근 매출 성장세.",
};
