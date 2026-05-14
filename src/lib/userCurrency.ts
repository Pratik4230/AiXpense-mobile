import { DEFAULT_CURRENCY, getCurrency } from "@/constants/currency";

/**
 * Normalizes `user.currency` from the database or session (set at signup / profile).
 * Falls back to DEFAULT_CURRENCY only when the value is missing, not a string, or blank.
 */
export function resolveUserCurrencyCode(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_CURRENCY;
  const trimmed = raw.trim();
  return getCurrency(trimmed || DEFAULT_CURRENCY).code;
}
