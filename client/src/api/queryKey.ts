export const querykey = {
  analytics: ["analytics"] as const,
  history: ["history"] as const,
  search: (query: string) => ["search", query] as const,
  compare: (a: string, b: string) => ["compare", a, b] as const,
  adminStats: ["admin", "stats"] as const,
  adminUsers: ["admin", "users"] as const,
  adminSearches: ["admin", "searches"] as const,
  searchTrend: ["admin", "search-trend"] as const,
  adminTopCategories: ["admin", "top-categories"] as const,
};
