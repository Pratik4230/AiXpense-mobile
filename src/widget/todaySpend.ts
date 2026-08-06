import { authClient } from "@/lib/authClient";
import { webApiBase } from "@/lib/env";
import { storage } from "@/lib/storage";
import { getCurrency, DEFAULT_CURRENCY } from "@/constants/currency";
import { resolveUserCurrencyCode } from "@/lib/userCurrency";

export const TODAY_SPEND_WIDGET_NAME = "TodaySpend";
export const WIDGET_TODAY_SPEND_KEY = "widget_today_spend";

export type TodaySpendSnapshot = {
  date: string;
  total: number;
  count: number;
  currencyCode: string;
  symbol: string;
  updatedAt: number;
  status: "ok" | "signed_out" | "error";
};

type TxRow = {
  amount?: number;
  type?: string;
  currency?: string;
};

type TxListResponse = {
  data: TxRow[];
  hasMore: boolean;
  nextPage: number | null;
};

export function localDateISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function emptyTodaySpend(
  status: TodaySpendSnapshot["status"] = "signed_out",
): TodaySpendSnapshot {
  const currency = getCurrency(DEFAULT_CURRENCY);
  return {
    date: localDateISO(),
    total: 0,
    count: 0,
    currencyCode: currency.code,
    symbol: currency.symbol,
    updatedAt: Date.now(),
    status,
  };
}

export function readCachedTodaySpend(): TodaySpendSnapshot {
  const raw = storage.getString(WIDGET_TODAY_SPEND_KEY);
  if (!raw) return emptyTodaySpend("signed_out");
  try {
    const parsed = JSON.parse(raw) as TodaySpendSnapshot;
    if (parsed.date !== localDateISO()) {
      return {
        ...emptyTodaySpend(parsed.status === "signed_out" ? "signed_out" : "ok"),
        currencyCode: parsed.currencyCode || DEFAULT_CURRENCY,
        symbol: parsed.symbol || getCurrency(DEFAULT_CURRENCY).symbol,
        status: parsed.status === "signed_out" ? "signed_out" : "ok",
      };
    }
    return parsed;
  } catch {
    return emptyTodaySpend("error");
  }
}

export function writeCachedTodaySpend(snapshot: TodaySpendSnapshot) {
  storage.set(WIDGET_TODAY_SPEND_KEY, JSON.stringify(snapshot));
}

async function fetchTodayExpenses(cookie: string, day: string): Promise<TxRow[]> {
  const rows: TxRow[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 25) {
    const url = new URL(`${webApiBase()}/api/transactions`);
    url.searchParams.set("type", "expense");
    url.searchParams.set("from", day);
    url.searchParams.set("to", day);
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort", "date");
    url.searchParams.set("order", "desc");

    const res = await fetch(url.toString(), {
      headers: { Cookie: cookie },
    });
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }

    const body = (await res.json()) as TxListResponse;
    rows.push(...(body.data ?? []));
    hasMore = Boolean(body.hasMore);
    page = body.nextPage ?? page + 1;
    if (!body.hasMore) break;
  }

  return rows;
}

/**
 * Fetch today's expenses, cache for the widget, and return the snapshot.
 * Safe to call from the app or the widget headless task.
 */
export async function refreshTodaySpendSnapshot(): Promise<TodaySpendSnapshot> {
  const day = localDateISO();
  const cookie = authClient.getCookie();

  if (!cookie) {
    const snapshot = emptyTodaySpend("signed_out");
    writeCachedTodaySpend(snapshot);
    return snapshot;
  }

  try {
    const session = await authClient.getSession();
    const sessionUser = session.data?.user as { currency?: string } | undefined;
    const currencyCode = resolveUserCurrencyCode(sessionUser?.currency);
    const currency = getCurrency(currencyCode);

    const rows = await fetchTodayExpenses(cookie, day);
    const expenses = rows.filter((r) => r.type !== "income");
    const total = expenses.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    const snapshot: TodaySpendSnapshot = {
      date: day,
      total,
      count: expenses.length,
      currencyCode: currency.code,
      symbol: currency.symbol,
      updatedAt: Date.now(),
      status: "ok",
    };
    writeCachedTodaySpend(snapshot);
    return snapshot;
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      const snapshot = emptyTodaySpend("signed_out");
      writeCachedTodaySpend(snapshot);
      return snapshot;
    }
    const cached = readCachedTodaySpend();
    if (cached.status === "ok" && cached.date === day) {
      return cached;
    }
    const snapshot = emptyTodaySpend("error");
    writeCachedTodaySpend(snapshot);
    return snapshot;
  }
}
