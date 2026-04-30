import type { Request } from "express";
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  searchHistory: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IJobData extends Document {
  _id: Types.ObjectId;
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

export interface ISearchHistory extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | null;
  query: string;
  resultsCount: number;
  topResult: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface SearchResult {
  job: IJobData;
  relevanceScore: number;
  demandScore: number;
  recommendations: IJobData[];
}

export interface TFIDFScore {
  category: string;
  score: number;
}

export interface ResumeSkill {
  name: string;
  category: string;
  confidence: number;
}
export interface SkillGap {
  skill: string;
  importance: "high" | "medium" | "low";
}
export interface ResumeAnalysisResult {
  success: boolean;
  extractedSkills: string[];
  matchCategory: {
    title: string;
    category: string;
    matchScore: number;
    demandScore: number;
    trend: string;
    averageSalary: number;
    growthRate: number;
    remoteAvailability: number;
    interpretation: string;
  };
  skillGaps: SkillGap[];
  summery: string;
  resumeScore: number;
  recomandation: {
    title: string;
    category: string;
    demandScore: number;
    similarityScore: number;
    reason: string;
  }[];
}


