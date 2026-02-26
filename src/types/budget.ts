import type { Category } from "@/constants/expense";

export interface Budget {
  _id: string;
  category: Category;
  amount: number;
  spent: number;
}
