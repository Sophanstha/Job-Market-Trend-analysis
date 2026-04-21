import {
  type AnalyticsResponse,
  type CompareResponse,
  type HistoryItem,
  type SearchResponse,
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
  console.log(id)
  await api.delete(`/history/delete/${id}`);
};

export const fetchHistoryFn = async (): Promise<HistoryItem[]> => {
  const { data } = await api.get<{
    success: boolean;
    history: HistoryItem[];
  }>("/history/history");
  return data.history;
};
