import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../store/hook";
import { querykey } from "../api/queryKey";
import { compareJobsFn } from "../api/queryFunctions";

export const useCompare = () => {
  const { queryA, queryB } = useAppSelector((s) => s.compare);

  const query = useQuery({
    queryKey:  querykey.compare(queryA, queryB),
    queryFn:   () => compareJobsFn(queryA, queryB),
    enabled:   !!queryA && !!queryB,
    staleTime: 2 * 60 * 1000,
  });

  return {
    data:    query.data  ?? null,
    loading: query.isLoading,
    error:   query.error?.message ?? null,
  };
};