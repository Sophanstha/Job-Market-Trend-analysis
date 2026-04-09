import type { Request } from "express";
import { Document, Types } from "mongoose";

export interface IUser extends Document{
_id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  searchHistory: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IJobData extends Document{
    _id : Types.ObjectId,
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

