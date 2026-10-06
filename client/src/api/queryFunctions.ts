import axios from "axios";
import {
  type AdminSearch,
  type AdminStats,
  type AdminTopCategory,
  type AdminUser,
  type AnalyticsResponse,
  type CompareResponse,
  type HistoryItem,
  type InterviewQuestionsResponse,
  type ResumeAnalysisResult,
  type SearchResponse,
  type SearchTrendPoint,
} from "../types";
import api from "./axios";

export const searchJobFn = async (query: string): Promise<SearchResponse> => {
  const { data } = await api.post<SearchResponse>("search/search", { query });
  return data;
};

export const fetchAnalyticsFn = async (): Promise<AnalyticsResponse> => {
  const { data } = await api.get<AnalyticsResponse>("analysis/trending");
  return data;
};

export const compareJobsFn = async (
  a: string,
  b: string,
): Promise<CompareResponse> => {
  const { data } = await api.get<CompareResponse>(
    `search/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`,
  );
  return data;
};

export const deleteHistoryfn = async (id: string): Promise<void> => {
  console.log(id);
  await api.delete(`/history/delete/${id}`);
};

export const fetchHistoryFn = async (): Promise<HistoryItem[]> => {
  const { data } = await api.get<{
    success: boolean;
    history: HistoryItem[];
  }>("/history/history");
  return data.history;
};

export const analyizResumeFn = async (
  file: File,
): Promise<ResumeAnalysisResult> => {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await api.post<ResumeAnalysisResult>(
    "/resume/analyze",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
};

export const fetchAdminStatsFn = async (): Promise<AdminStats> => {
  const { data } = await api.get<{ success: boolean; stats: AdminStats }>(
    "/admin/stats"
  );
  return data.stats;
};

export const fetchAdminUsersFn = async (): Promise<AdminUser[]> => {
  const { data } = await api.get<{ success: boolean; users: AdminUser[] }>(
    "/admin/users"
  );
  return data.users;
};

export const fetchAdminSearchesFn = async (): Promise<AdminSearch[]> => {
  const { data } = await api.get<{ success: boolean; searches: AdminSearch[] }>(
    "/admin/searches"
  );
  return data.searches;
};

export const fetchAdminTopCategoriesFn = async (): Promise<AdminTopCategory[]> => {
  const { data } = await api.get<{ success: boolean; categories: AdminTopCategory[] }>(
    "/admin/top-categories"
  );
  return data.categories;
};

export const fetchSearchTrendFn = async (): Promise<SearchTrendPoint[]> => {
  const { data } = await api.get<{ success: boolean; series: SearchTrendPoint[] }>(
    "/admin/search-trend"
  );
  return data.series;
};

export const createUserFn = async (payload: {
  name: string; email: string; password: string; role: "user" | "admin";
}) => {
  const { data } = await api.post("/admin/users", payload);
  return data;
};

export const updateUserFn = async (
  id: string,
  payload: { name?: string; email?: string; role?: "user" | "admin" }
) => {
  const { data } = await api.patch(`/admin/users/${id}`, payload);
  return data;
};

export const deleteUserFn = async (id: string) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const generateInterviewQuestionsFn = async (payload: {
  matchedTitle: string;
  skills:       string[];
  summary:      string;
}): Promise<InterviewQuestionsResponse> => {
  const { data } = await api.post<InterviewQuestionsResponse>(
    "/interview/generate",
    payload
  );
  return data;
};