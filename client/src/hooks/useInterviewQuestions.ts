import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generateInterviewQuestionsFn,
  evaluateInterviewAnswerFn,
  fetchInterviewRolesFn,
} from "../api/queryFunctions";

export const useInterviewQuestions = () => {
  const mutation = useMutation({
    mutationFn: generateInterviewQuestionsFn,
  });

  return {
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error
      ? (mutation.error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to generate questions"
      : null,
    generate: mutation.mutate,
    generateAsync: mutation.mutateAsync,
    reset: mutation.reset,
  };
};

export const useInterviewEvaluation = () => {
  const mutation = useMutation({
    mutationFn: evaluateInterviewAnswerFn,
  });

  return {
    data: mutation.data?.evaluation ?? null,
    loading: mutation.isPending,
    error: mutation.error
      ? (mutation.error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to evaluate answer"
      : null,
    evaluate: mutation.mutate,
    evaluateAsync: mutation.mutateAsync,
    reset: mutation.reset,
  };
};

export const useInterviewRoles = () => {
  return useQuery({
    queryKey: ["interviewRoles"],
    queryFn: fetchInterviewRolesFn,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};