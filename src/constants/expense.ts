export const CATEGORIES = [
  "food",
  "groceries",
  "transport",
  "shopping",
  "entertainment",
  "subscriptions",
  "bills",
  "rent",
  "emi",
  "health",
  "education",
  "personal",
  "travel",
  "salary",
  "bonus",
  "freelance",
  "business",
  "investment",
  "interest",
  "cashback",
  "rental",
  "refund",
  "gift",
  "other",
] as const;

export const EXPENSE_TYPES = ["expense", "income"] as const;

export type Category = (typeof CATEGORIES)[number];
export type ExpenseType = (typeof EXPENSE_TYPES)[number];
