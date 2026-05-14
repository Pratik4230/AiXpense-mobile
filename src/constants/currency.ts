export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "IN", flag: "🇮🇳" },
  { code: "USD", symbol: "$", name: "US Dollar", country: "US", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", country: "EU", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", country: "GB", flag: "🇬🇧" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "AE", flag: "🇦🇪" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", country: "SG", flag: "🇸🇬" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", country: "CA", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", country: "AU", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "JP", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", country: "CN", flag: "🇨🇳" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", country: "CH", flag: "🇨🇭" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", country: "NZ", flag: "🇳🇿" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", country: "HK", flag: "🇭🇰" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", country: "KR", flag: "🇰🇷" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", country: "MY", flag: "🇲🇾" },
  { code: "THB", symbol: "฿", name: "Thai Baht", country: "TH", flag: "🇹🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", country: "ID", flag: "🇮🇩" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", country: "PH", flag: "🇵🇭" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", country: "VN", flag: "🇻🇳" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", country: "TW", flag: "🇹🇼" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal", country: "SA", flag: "🇸🇦" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", country: "QA", flag: "🇶🇦" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", country: "KW", flag: "🇰🇼" },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", country: "BH", flag: "🇧🇭" },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial", country: "OM", flag: "🇴🇲" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", country: "BD", flag: "🇧🇩" },
  { code: "NPR", symbol: "Rs", name: "Nepalese Rupee", country: "NP", flag: "🇳🇵" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", country: "LK", flag: "🇱🇰" },
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", country: "PK", flag: "🇵🇰" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", country: "MM", flag: "🇲🇲" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", country: "BR", flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", country: "MX", flag: "🇲🇽" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", country: "SE", flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", country: "NO", flag: "🇳🇴" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", country: "DK", flag: "🇩🇰" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", country: "PL", flag: "🇵🇱" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", country: "TR", flag: "🇹🇷" },
  { code: "ZAR", symbol: "R", name: "South African Rand", country: "ZA", flag: "🇿🇦" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", country: "NG", flag: "🇳🇬" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", country: "EG", flag: "🇪🇬" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", country: "KE", flag: "🇰🇪" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", country: "GH", flag: "🇬🇭" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", country: "IL", flag: "🇮🇱" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_COUNTRY = "IN";

export function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
