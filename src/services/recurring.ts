import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category, ExpenseType, Frequency } from "@/constants/expense";

export interface RecurringPayment {
  _id: string;
  name: string;
  amount: number;
  currency?: string;
  category: Category;
  type: ExpenseType;
  frequency: Frequency;
  recurOnDate?: number;
  startDate: string;
  nextDueDate: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringPaymentInput {
  name: string;
  amount: number;
  category: Category;
  type: ExpenseType;
  frequency: Frequency;
  recurOnDate?: number;
  startDate: string;
  notes?: string;
}

/** Form output: create omits recurOnDate when not monthly; edit may send null to clear. */
export type RecurringFormSubmitValues = Omit<
  CreateRecurringPaymentInput,
  "recurOnDate"
> & {
  recurOnDate?: number | null;
};

export type UpdateRecurringPaymentInput = Partial<
  Omit<CreateRecurringPaymentInput, "recurOnDate"> & {
    recurOnDate?: number | null;
  }
> & {
  isActive?: boolean;
  endDate?: string | null;
};

const QUERY_KEY = ["recurring"] as const;

export function useRecurringPayments(activeOnly = true) {
  return useQuery<{ data: RecurringPayment[] }>({
    queryKey: [...QUERY_KEY, { activeOnly }],
    queryFn: () =>
      api
        .get<{ data: RecurringPayment[] }>(
          `/api/recurring?active=${activeOnly}`,
        )
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateRecurringPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecurringPaymentInput) =>
      api
        .post<{ data: RecurringPayment }>("/api/recurring", input)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateRecurringPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: UpdateRecurringPaymentInput & { id: string }) =>
      api
        .patch<{ data: RecurringPayment }>(`/api/recurring/${id}`, input)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteRecurringPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ success: boolean }>(`/api/recurring/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
