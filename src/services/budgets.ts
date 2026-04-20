import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Budget } from "@/types/budget";
import type { Category } from "@/constants/expense";

const KEY = ["budgets"] as const;

export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: KEY,
    queryFn: () => api.get<Budget[]>("/api/budgets").then((r) => r.data),
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { category: Category; amount: number }) =>
      api.post<Budget>("/api/budgets", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.patch<Budget>(`/api/budgets/${id}`, { amount }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ ok: true }>(`/api/budgets/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
