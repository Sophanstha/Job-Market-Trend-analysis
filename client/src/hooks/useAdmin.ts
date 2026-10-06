import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../store/hook";
import {
  createUserFn,
  deleteUserFn,
  fetchAdminSearchesFn,
  fetchAdminStatsFn,
  fetchAdminTopCategoriesFn,
  fetchAdminUsersFn,
  fetchSearchTrendFn,
  updateUserFn,
} from "../api/queryFunctions";
import { querykey } from "../api/queryKey";

export const useAdmin = () => {
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: querykey.adminStats,
    queryFn: fetchAdminStatsFn,
    enabled: isAdmin,
  });

  const usersQuery = useQuery({
    queryKey: querykey.adminUsers,
    queryFn: fetchAdminUsersFn,
    enabled: isAdmin,
  });

  const searchesQuery = useQuery({
    queryKey: querykey.adminSearches,
    queryFn: fetchAdminSearchesFn,
    enabled: isAdmin,
  });

  const trendQuery = useQuery({
    queryKey: querykey.searchTrend,
    queryFn: fetchSearchTrendFn,
    enabled: isAdmin,
  });
  const topCategoriesQuery = useQuery({
    queryKey: querykey.adminTopCategories,
    queryFn: fetchAdminTopCategoriesFn,
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createUserFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: querykey.adminUsers }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateUserFn(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: querykey.adminUsers }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserFn(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: querykey.adminUsers }),
  });

  return {
    isAdmin,
    createUser: (payload: {
      name: string;
      email: string;
      password: string;
      role: "user" | "admin";
    }) => createMutation.mutateAsync(payload),
    updateUser: (
      id: string,
      payload: { name?: string; email?: string; role?: "user" | "admin" },
    ) => updateMutation.mutateAsync({ id, payload }),
    deleteUser: (id: string) => deleteMutation.mutateAsync(id),
    createError: createMutation.error,
    updateError: updateMutation.error,
    actionLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    stats: statsQuery.data ?? null,
    users: usersQuery.data ?? [],
    searches: searchesQuery.data ?? [],
    topCategories: topCategoriesQuery.data ?? [],
    searchTrend: trendQuery.data ?? [],
    loading:
      statsQuery.isLoading ||
      usersQuery.isLoading ||
      searchesQuery.isLoading ||
      topCategoriesQuery.isLoading ||
      trendQuery.isLoading,
    error:
      statsQuery.isError ||
      usersQuery.isError ||
      searchesQuery.isError ||
      topCategoriesQuery.isError ||
      trendQuery.isError,
  };
};
