import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../store/hook";
import { fetchAdminSearchesFn, fetchAdminStatsFn, fetchAdminTopCategoriesFn, fetchAdminUsersFn } from "../api/queryFunctions";
import { querykey } from "../api/queryKey";


export const useAdmin = () => {
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === "admin";

  const statsQuery = useQuery({
    queryKey: querykey.adminStats,
    queryFn:  fetchAdminStatsFn,
    enabled:  isAdmin,
  });

  const usersQuery = useQuery({
    queryKey: querykey.adminUsers,
    queryFn:  fetchAdminUsersFn,
    enabled:  isAdmin,
  });

  const searchesQuery = useQuery({
    queryKey: querykey.adminSearches,
    queryFn:  fetchAdminSearchesFn,
    enabled:  isAdmin,
  });

  const topCategoriesQuery = useQuery({
    queryKey: querykey.adminTopCategories,
    queryFn:  fetchAdminTopCategoriesFn,
    enabled:  isAdmin,
  });

  return {
    isAdmin,
    stats:         statsQuery.data ?? null,
    users:         usersQuery.data ?? [],
    searches:      searchesQuery.data ?? [],
    topCategories: topCategoriesQuery.data ?? [],
    loading:
      statsQuery.isLoading ||
      usersQuery.isLoading ||
      searchesQuery.isLoading ||
      topCategoriesQuery.isLoading,
    error:
      statsQuery.isError ||
      usersQuery.isError ||
      searchesQuery.isError ||
      topCategoriesQuery.isError,
  };
};