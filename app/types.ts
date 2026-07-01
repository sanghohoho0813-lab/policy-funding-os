// 정책자금 AI 진단에 사용되는 도메인 타입 정의

export type BusinessType = "개인사업자" | "법인사업자";
export type YearsInBusiness = "1년 미만" | "1~3년" | "3~7년" | "7년 이상";
export type Revenue =
  | "1억 미만"
  | "1~5억"
  | "5~10억"
  | "10~30억"
  | "30억 이상";
export type Employees = "0명" | "1~4명" | "5~9명" | "10명 이상";
export type Credit = "우수" | "보통" | "낮음" | "알 수 없음";
export type FundPurpose =
  | "운전자금"
  | "시설자금"
  | "창업자금"
  | "저신용자금"
  | "긴급자금";
export type Strength =
  | "제조업"
  | "기술력"
  | "특허"
  | "연구소"
  | "벤처"
  | "청년대표"
  | "고용증가"
  | "수출"
  | "없음";

export interface DiagnosisInput {
  companyName: string;
  industry: string;
  businessType: BusinessType;
  years: YearsInBusiness;
  revenue: Revenue;
  employees: Employees;
  credit: Credit;
  purpose: FundPurpose;
  strengths: Strength[];
  memo: string;
}

export interface AgencyRecommendation {
  rank: number;
  name: string;
  score: number;
  reasons: string[];
  cautions: string[];
}

export interface CoachContent {
  questions: string[];
  keyPoints: string[];
  closingLines: string[];
  objectionLines: string[];
}

export interface SimilarCase {
  title: string;
  industry: string;
  years: string;
  revenue: string;
  agency: string;
  approved: string;
  note: string;
  lesson?: string;
  matchRate?: number;
}

// 업종 대분류 (사례 매칭·기관 판단에 사용)
export type IndustryCategory =
  | "제조"
  | "도소매"
  | "음식/외식"
  | "서비스"
  | "IT/지식서비스"
  | "건설/기타";

// 김팀장 실전 코치 인사이트
export interface CoachInsight {
  firstChecks: string[];
  risks: string[];
  strategies: string[];
  neverPromise: string[];
}

// 결과 최상단 종합진단 요약
export interface DiagnosisSummary {
  score: number;
  topAgency: string;
  coreStrategy: string;
  biggestRisk: string;
}

export interface UpsellSuggestion {
  title: string;
  desc: string;
}

export interface DiagnosisResult {
  companyName: string;
  overallScore: number;
  topAgency: string;
  nextAction: string;
  summary: DiagnosisSummary;
  coachInsight: CoachInsight;
  agencies: AgencyRecommendation[];
  coach: CoachContent;
  documents: string[];
  cases: SimilarCase[];
  upsells: UpsellSuggestion[];
  documentMessage: string;
  followUpMessage: string;
}

// 고객(CRM) 진행 단계 및 고객 레코드 — Mock 대시보드/상세에서 사용.
// 다음 단계에서 Supabase 연동 시 그대로 테이블 컬럼으로 매핑할 수 있도록 잡아둔다.
export type CustomerStage =
  | "신규 DB"
  | "1차 상담 완료"
  | "계약 검토"
  | "서류 요청"
  | "서류 대기"
  | "접수 준비"
  | "접수 완료"
  | "심사 중"
  | "승인"
  | "보류"
  | "실패"
  | "재접촉 예정";

export interface Customer {
  id: string;
  companyName: string;
  industry: string;
  businessType: BusinessType;
  recommendedAgency: string;
  score: number;
  stage: CustomerStage;
  nextAction: string;
  lastContactedAt: string;
  updatedAt: string;
  upsellOpportunities: string[];
  memo: string;
}

// 폼 select/chip 렌더링에 재사용하는 옵션 목록
export const BUSINESS_TYPES: BusinessType[] = ["개인사업자", "법인사업자"];
export const YEARS_OPTIONS: YearsInBusiness[] = [
  "1년 미만",
  "1~3년",
  "3~7년",
  "7년 이상",
];
export const REVENUE_OPTIONS: Revenue[] = [
  "1억 미만",
  "1~5억",
  "5~10억",
  "10~30억",
  "30억 이상",
];
export const EMPLOYEE_OPTIONS: Employees[] = [
  "0명",
  "1~4명",
  "5~9명",
  "10명 이상",
];
export const CREDIT_OPTIONS: Credit[] = ["우수", "보통", "낮음", "알 수 없음"];
export const PURPOSE_OPTIONS: FundPurpose[] = [
  "운전자금",
  "시설자금",
  "창업자금",
  "저신용자금",
  "긴급자금",
];
export const STRENGTH_OPTIONS: Strength[] = [
  "제조업",
  "기술력",
  "특허",
  "연구소",
  "벤처",
  "청년대표",
  "고용증가",
  "수출",
  "없음",
];
