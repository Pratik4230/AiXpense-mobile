import { useSession } from "@/lib/authClient";
import { getCurrency } from "@/constants/currency";
import { resolveUserCurrencyCode } from "@/lib/userCurrency";

export function useCurrency() {
  const { data: session } = useSession();
  const sessionUser = session?.user as { currency?: string } | undefined;
  const code = resolveUserCurrencyCode(sessionUser?.currency);
  const currency = getCurrency(code);

  function format(amount: number, currencyOverride?: string): string {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyOverride ?? code,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function formatCompact(amount: number, currencyOverride?: string): string {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyOverride ?? code,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return {
    code,
    symbol: currency.symbol,
    flag: currency.flag,
    name: currency.name,
    format,
    formatCompact,
  };
}
