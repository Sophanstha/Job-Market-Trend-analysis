import { useMutation } from "@tanstack/react-query";
import { generateInterviewQuestionsFn } from "../api/queryFunctions";

export const useInterviewQuestions = () => {
  const mutation = useMutation({
    mutationFn: generateInterviewQuestionsFn,
  });

  return {
    data:    mutation.data ?? null,
    loading: mutation.isPending,
    error:   mutation.error
               ? (mutation.error as { response?: { data?: { message?: string } } })
                   ?.response?.data?.message ?? "Failed to generate questions"
               : null,
    generate: mutation.mutate,
    reset:    mutation.reset,
  };
};