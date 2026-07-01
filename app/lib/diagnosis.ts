import type {
  AgencyRecommendation,
  CoachContent,
  DiagnosisInput,
  DiagnosisResult,
  SimilarCase,
  Strength,
  UpsellSuggestion,
} from "@/app/types";

// 규칙 기반(프론트엔드 내부) 정책자금 진단 엔진.
// 실제 심사가 아니라 "초보 컨설턴트가 방향을 잡게 해주는" 코치 역할이 목적이다.

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(n)));

const has = (input: DiagnosisInput, s: Strength) => input.strengths.includes(s);

interface AgencyScore {
  name: string;
  score: number;
  reasons: string[];
  cautions: string[];
}

function scoreShinbo(i: DiagnosisInput): AgencyScore {
  let s = 60;
  const reasons: string[] = [];
  const cautions: string[] = [];

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

function scoreKibo(i: DiagnosisInput): AgencyScore {
  let s = 45;
  const reasons: string[] = [];
  const cautions: string[] = [];

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

  const hasTech =
    has(i, "기술력") || has(i, "특허") || has(i, "연구소") || has(i, "벤처");
  if (!hasTech) {
    s -= 10;
    cautions.push("기술 강점이 없으면 기술평가 통과가 어려워 우선순위를 낮추세요.");
  }
  cautions.push("기술평가가 필수라 기술·매출 연결을 보여줄 자료 준비가 중요해요.");

  if (reasons.length === 0)
    reasons.push("기술 요소를 보강하면 충분히 노려볼 수 있는 기관이에요.");

  return { name: "기술보증기금", score: clamp(s), reasons, cautions };
}

function scoreKosme(i: DiagnosisInput): AgencyScore {
  // 중소벤처기업진흥공단 (정책자금 직접대출)
  let s = 50;
  const reasons: string[] = [];
  const cautions: string[] = [];

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

function scoreSemas(i: DiagnosisInput): AgencyScore {
  // 소상공인시장진흥공단
  let s = 45;
  const reasons: string[] = [];
  const cautions: string[] = [];

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

function scoreRegional(i: DiagnosisInput): AgencyScore {
  // 지역신용보증재단
  let s = 42;
  const reasons: string[] = [];
  const cautions: string[] = [];

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
  const scored = [
    scoreShinbo(i),
    scoreKibo(i),
    scoreKosme(i),
    scoreSemas(i),
    scoreRegional(i),
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

const CASES: SimilarCase[] = [
  {
    title: "제조업 · 설비투자 사례",
    industry: "금속가공 제조업",
    years: "업력 4년",
    revenue: "매출 8억",
    agency: "기술보증기금 추천",
    approved: "승인 1.5억",
    note: "특허·기술력 근거로 기술평가 가점을 받아 시설자금 확보.",
  },
  {
    title: "도소매업 · 운전자금 사례",
    industry: "생활용품 도소매",
    years: "업력 3년",
    revenue: "매출 5억",
    agency: "신용보증기금 추천",
    approved: "승인 7천만 원",
    note: "안정적 매출과 무연체 이력으로 운전자금 보증 승인.",
  },
  {
    title: "저신용 소상공인 · 긴급자금 사례",
    industry: "외식업(개인)",
    years: "업력 2년",
    revenue: "매출 1억대",
    agency: "소진공·지역재단 추천",
    approved: "승인 3천만 원",
    note: "저신용이지만 소상공인 대상 상품으로 단계적 접근해 성공.",
  },
];

function buildUpsells(i: DiagnosisInput): UpsellSuggestion[] {
  const list: UpsellSuggestion[] = [];

  if (i.employees !== "0명") {
    list.push({
      title: "고용지원금 진단",
      desc: "직원을 고용 중이라면 청년내일채움·고용촉진장려금 등 받을 수 있는 지원금이 있는지 함께 점검해보세요.",
    });
  }
  if (
    has(i, "제조업") ||
    has(i, "기술력") ||
    has(i, "특허") ||
    has(i, "연구소")
  ) {
    list.push({
      title: "기업부설연구소 · 벤처기업 확인",
      desc: "기술 기반 기업이라면 부설연구소 설립·벤처 확인으로 세제 혜택과 정책자금 가점을 동시에 노릴 수 있어요.",
    });
  }
  if (
    (i.revenue === "10~30억" || i.revenue === "30억 이상") &&
    i.businessType === "법인사업자"
  ) {
    list.push({
      title: "법인 절세 컨설팅",
      desc: "매출 규모가 있는 법인은 가지급금·대표 급여 설계 등 절세 컨설팅 연계로 추가 가치를 제공할 수 있어요.",
    });
  }
  if (has(i, "고용증가")) {
    list.push({
      title: "고용 증가 세액공제",
      desc: "고용이 늘었다면 통합고용세액공제 등 놓치기 쉬운 세액공제를 함께 챙겨드리세요.",
    });
  }
  if (has(i, "수출")) {
    list.push({
      title: "수출바우처 · 무역금융",
      desc: "수출 실적·계획이 있으면 수출바우처와 무역금융 연계로 다음 상담 주제를 만들 수 있어요.",
    });
  }

  if (list.length === 0) {
    list.push({
      title: "정기 정책자금 점검",
      desc: "지금 당장 큰 업셀 포인트는 적지만, 분기별 정책자금 점검 리마인드로 재접촉 관계를 유지하세요.",
    });
  }

  return list.slice(0, 4);
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
  const company = i.companyName || "고객사";
  const documentMessage =
    `안녕하세요 대표님, ${company} 정책자금 상담 담당입니다. 😊\n` +
    `진행을 위해 아래 서류를 준비해 주시면 빠르게 검토해드리겠습니다.\n\n` +
    DOCUMENTS.map((d, idx) => `${idx + 1}. ${d}`).join("\n") +
    `\n\n사진이나 파일 어떤 형태로 보내주셔도 괜찮습니다. 감사합니다!`;

  const followUpMessage =
    `대표님, ${company} 건으로 좋은 소식이 있어 연락드립니다. 😊\n` +
    `말씀 주신 ${i.purpose} 관련해 검토해보니 ${topAgency} 기준으로 준비하면 ` +
    `가능성이 충분히 있어 보입니다. (예상 가능성 점수 ${overallScore}점)\n` +
    `편하신 시간에 10분만 통화 가능하실까요? 다음 단계 바로 안내드리겠습니다.`;

  return { documentMessage, followUpMessage };
}

export function runDiagnosis(input: DiagnosisInput): DiagnosisResult {
  const agencies = buildAgencies(input);
  const topAgency = agencies[0]?.name ?? "신용보증기금";

  const avg =
    agencies.reduce((sum, a) => sum + a.score, 0) / (agencies.length || 1);
  const overallScore = clamp(avg, 42, 96);

  const coach = buildCoach(input, topAgency);
  const upsells = buildUpsells(input);
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
    agencies,
    coach,
    documents: DOCUMENTS,
    cases: CASES,
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
