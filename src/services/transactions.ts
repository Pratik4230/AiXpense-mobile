import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Transaction {
  _id: string;
  item: string;
  amount: number;
  category: string;
  type: "expense" | "income";
  date: string;
}

export interface TransactionsPage {
  data: Transaction[];
  total: number;
  page: number;
  hasMore: boolean;
  nextPage: number | null;
}

export interface TransactionFilters {
  type: string;
  categories: string[];
  sort: string;
  order: "asc" | "desc";
}

export function useTransactions(filters: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.categories.length > 0)
    params.set("category", filters.categories.join(","));
  params.set("sort", filters.sort);
  params.set("order", filters.order);

  return useInfiniteQuery<TransactionsPage>({
    queryKey: ["transactions", filters],
    queryFn: ({ pageParam }) => {
      params.set("page", String(pageParam));
      return api
        .get<TransactionsPage>(`/api/transactions?${params.toString()}`)
        .then((r) => r.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 2,
  });
}
