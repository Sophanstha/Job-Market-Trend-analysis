import { useMutation } from "@tanstack/react-query";
import { analyizResumeFn } from "../api/queryFunctions";

export const useResumeAnalysis = () => {
  const mutation = useMutation({
    mutationFn: (file: File) => analyizResumeFn(file),
  });
  const analysis = (file: File) => {
    mutation.mutate(file);
  };
  const reset = () => {
    mutation.reset();
  };
  return {
    data: mutation.data ?? null,
    error: mutation.error
      ? ((mutation.error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to analyze resume")
      : null,
    loading: mutation.isPending,
    analysis,
    reset,
  };
};
