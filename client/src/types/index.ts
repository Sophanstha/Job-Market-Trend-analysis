export interface IJobData {
  _id: string;
  category: string;
  title: string;
  demandScore: number;
  growthRate: number;
  averageSalary: number;
  jobOpenings: number;
  trend: "rising" | "declining" | "stable";
  topSkills: string[];
  topRoles: string[];
  industries: string[];
  education: string;
  remoteAvailability: number;
  entryLevelSalary: number;
  seniorLevelSalary: number;
  summary: string;
  keywords: string[];
  historicalDemand: number[];
  years: number[];
}

export interface DemandBreakDown {
  growthScore: number;
  openingsScore: number;
  salaryScore: number;
  remoteScore: number;
}
export interface DemandResult {
  score: number;
  breakdown: DemandBreakDown;
  label: string;
  interpretation: string;
}
export interface ForecastPoint {
  year: number;
  score: number;
  confidence: "high" | "medium" | "low";
}

export interface PresentMarket {
  data: ForecastPoint[];
  currentScore: number;
  currentYear: number;
  totalGrowth: number;
  label: string;
}

export interface FutureMarket {
  data: ForecastPoint[];
  score2030: number;
  peakYear: number;
  peakScore: number;
  cagr: number;
  trend2030: "surging" | "growing" | "plateauing" | "declining";
  insight: string;
}

export interface ForecastResult {
  present: PresentMarket;
  future: FutureMarket;
}

export interface SearchResult {
  job: IJobData;
  relevanceScore: number;
  demand: DemandResult;
  forecast: ForecastResult;
}
export interface Recommendation {
  title: string;
  category: string;
  demandScore: number;
  similarityScore: number;
  reason: string;
}

export interface OtherMatch {
  title: string;
  category: string;
  score: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  result: SearchResult;
  otherMatches: OtherMatch[];
  recommendations: Recommendation[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HistoryItem {
  _id: string;
  userId: string;
  query: string;
  resultsCount: number;
  topResult: string;
  createdAt: string;
}

export interface TrendingItem {
  title: string;
  searchCount: number;
}

export interface TopDemandJob {
  title: string;
  category: string;
  demandScore: number;
  trend: string;
}
export interface AnalyticsResponse {
  success: boolean;
  period: string;
  totalSearches: number;
  trendingSearches: TrendingItem[];
  topDemandJobs: TopDemandJob[];
}
export interface CompareCategory {
  title: string;
  category: string;
  demand: DemandResult;
  averageSalary: number;
  entryLevelSalary: number;
  seniorLevelSalary: number;
  growthRate: number;
  trend: "rising" | "declining" | "stable";
  topSkills: string[];
  remoteAvailability: number;
  jobOpenings: number;
}

export interface CompareResponse {
  success: boolean;
  searchInfo: {
    queryA: string;
    queryB: string;
    matchedByA: string;
    matchedByB: string;
    sameCategory: boolean;
    note: string | null;
  };
  comparison: {
    categoryA: CompareCategory;
    categoryB: CompareCategory;
    winner: {
      overall: string;
      salary: string;
      growth: string;
      demand: string;
      remote: string;
    };
    differences: {
      salaryDiff: number;
      growthDiff: number;
      demandDiff: number;
      remoteDiff: number;
    };
  };
}

export interface SkillGap {
  skill: string;
  importance: "high" | "medium" | "low";
}
export interface ResumeRecommendation {
  category: string;
  demandScore: number;
  title: string;
  similarityScore: number;
  reason: string;
}
export interface ResumeAnalysisResult {
  success: boolean;
  extractedSkills: string[];
  matchedCategory: {
    title: string;
    category: string;
    demandScore: number;
    matchScore: number;
    trend: string;
    averageSalary: number;
    growthRate: number;
    remoteAvailability: number;
    interpretation: string;
  };
  skillGaps: SkillGap[];
  recommendations: ResumeRecommendation[];
  summary: string;
  resumeScore: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSearches: number;
  totalCategories: number;
  newUsersThisWeek: number;
  searchesThisWeek: number;
  registeredSearches: number;
  anonymousSearches: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  searchCount: number;
}

export interface AdminSearch {
  _id: string;
  query: string;
  topResult: string;
  resultsCount: number;
  createdAt: string;
  user: {
    name: string;
    email: string | null;
  };
}

export interface AdminTopCategory {
  title: string;
  searchCount: number;
}


export interface SearchTrendPoint {
  date:  string;
  count: number;
}

export interface InterviewQuestion {
  question: string;
  hint:     string;
}

export interface InterviewQuestionSet {
  technical:    InterviewQuestion[];
  behavioral:   InterviewQuestion[];
  roleSpecific: InterviewQuestion[];
}

export interface GenerateQuestionsPayload {
  matchedTitle: string;
  skills?: string[];
  summary?: string;
  seniority?: string;
  customFocus?: string;
  apiKey?: string;
}

export interface InterviewQuestionsResponse {
  success:      boolean;
  matchedTitle: string;
  skills?:      string[];
  seniority?:   string;
  questions:    InterviewQuestionSet;
}

export interface AnswerEvaluation {
  overallScore: number;
  status: "exceptional" | "strong" | "adequate" | "needs_work";
  scores: {
    technicalAccuracy: number;
    clarityAndCommunication: number;
    completeness: number;
  };
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  idealAnswer: string;
  followUpQuestion: string;
}

export interface EvaluateAnswerPayload {
  jobTitle: string;
  category: "technical" | "behavioral" | "roleSpecific";
  question: string;
  hint: string;
  userAnswer: string;
  skills?: string[];
  seniority?: string;
  apiKey?: string;
}

export interface EvaluateAnswerResponse {
  success: boolean;
  evaluation: AnswerEvaluation;
}

export interface InterviewRole {
  category: string;
  title: string;
  topSkills: string[];
  topRoles: string[];
  averageSalary: number;
}

export interface RoadmapResource {
  title: string;
  type: "documentation" | "course" | "book" | "github";
  url?: string;
  free: boolean;
}

export interface RoadmapProject {
  title: string;
  description: string;
  keySkills: string[];
  deliverable: string;
}

export interface RoadmapChecklistItem {
  id: string;
  text: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  objective: string;
  topics: string[];
  projects: RoadmapProject[];
  resources: RoadmapResource[];
  milestones: RoadmapChecklistItem[];
}

export interface CareerRoadmap {
  roleTitle: string;
  seniority: string;
  durationWeeks: number;
  estimatedSalaryUplift: string;
  summary: string;
  prerequisites: string[];
  phases: RoadmapPhase[];
  certifications: string[];
  recommendedPortfolioProjects: string[];
}

export interface GenerateRoadmapPayload {
  targetRole: string;
  currentSkills?: string[];
  skillGaps?: string[];
  seniority?: string;
  timeCommitment?: string;
  customFocus?: string;
  apiKey?: string;
}

export interface GenerateRoadmapResponse {
  success: boolean;
  roadmap: CareerRoadmap;
}
