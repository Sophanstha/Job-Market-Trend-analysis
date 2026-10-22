import { useMutation } from "@tanstack/react-query";
import { generateCareerRoadmapFn } from "../api/queryFunctions";

export const useRoadmap = () => {
  const mutation = useMutation({
    mutationFn: generateCareerRoadmapFn,
  });

  return {
    roadmap: mutation.data?.roadmap ?? null,
    loading: mutation.isPending,
    error: mutation.error
      ? (mutation.error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to generate roadmap"
      : null,
    generate: mutation.mutate,
    generateAsync: mutation.mutateAsync,
    reset: mutation.reset,
  };
};
