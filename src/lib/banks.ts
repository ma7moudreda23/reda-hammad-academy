// Client-safe payment types + Saudi bank list (no server imports).
// Colors are approximate brand tints used for simple styled chips — these are
// NOT official bank logos.

export type BankAccount = {
  bank: string; // a key from SAUDI_BANKS, or "other"
  bankName?: string; // custom name when bank === "other"
  logoUrl?: string; // custom uploaded logo when bank === "other"
  accountName: string;
  accountNumber: string;
  iban: string;
  phone?: string; // mobile number (for transfer)
  note?: string;
};

export type PaymentContent = {
  intro: string;
  cardEnabled: boolean;
  applePayEnabled: boolean;
  banks: BankAccount[];
};

export const PAYMENT_KEY = "payment";

export type BankMeta = { key: string; name: string; short: string; color: string; logo?: string };

// Only banks/wallets that have an uploaded logo (in /public/banks) + "other".
export const SAUDI_BANKS: BankMeta[] = [
  { key: "rajhi", name: "مصرف الراجحي", short: "الراجحي", color: "#005EB8", logo: "/banks/rajhi.png" },
  { key: "alinma", name: "مصرف الإنماء", short: "الإنماء", color: "#6E2C8B", logo: "/banks/alinma.png" },
  { key: "albilad", name: "بنك البلاد", short: "البلاد", color: "#0B7A4B", logo: "/banks/albilad.png" },
  { key: "saudifransi", name: "البنك السعودي الفرنسي", short: "الفرنسي", color: "#0A5A3C", logo: "/banks/saudifransi.png" },
  { key: "alawwal", name: "البنك الأول", short: "الأول", color: "#1B3A6B", logo: "/banks/alawwal.png" },
  { key: "stcpay", name: "STC Bank", short: "STC Bank", color: "#4F008C", logo: "/banks/stcpay.png" },
  { key: "urpay", name: "URPay", short: "URPay", color: "#3A2D7D", logo: "/banks/urpay.png" },
  { key: "barq", name: "برق (Barq)", short: "برق", color: "#6C2BD9", logo: "/banks/barq.png" },
  { key: "d360", name: "بنك D360", short: "D360", color: "#00B8A9", logo: "/banks/d360.png" },
  { key: "mobilypay", name: "Mobily Pay", short: "Mobily Pay", color: "#7B2D8E", logo: "/banks/mobilypay.png" },
  { key: "alinmapay", name: "Alinma Pay", short: "Alinma Pay", color: "#8E44AD", logo: "/banks/alinmapay.png" },
  { key: "other", name: "بنك آخر", short: "بنك", color: "#343A93" },
];

export const DEFAULT_PAYMENT: PaymentContent = {
  intro:
    "تقدر تدفع باستخدام البطاقة البنكية أو Apple Pay، أو عن طريق التحويل البنكي على أحد الحسابات التالية. بعد التحويل تواصل معنا على واتساب لتأكيد اشتراكك.",
  cardEnabled: true,
  applePayEnabled: true,
  banks: [],
};

export function getBankMeta(key: string): BankMeta {
  return SAUDI_BANKS.find((b) => b.key === key) ?? SAUDI_BANKS[SAUDI_BANKS.length - 1];
}

// Logo URL for a saved account: the built-in bank logo, or the custom uploaded
// one for "بنك آخر".
export function bankLogo(b: BankAccount): string {
  if (b.bank === "other") return b.logoUrl ?? "";
  return getBankMeta(b.bank).logo ?? "";
}

export function bankLabel(b: BankAccount): string {
  if (b.bank === "other") return b.bankName?.trim() || "بنك آخر";
  return getBankMeta(b.bank).name;
}

// Stable-ish key to reference a saved bank account from a course.
export function bankKey(b: BankAccount, index: number): string {
  return (b.iban && b.iban.trim()) || (b.accountNumber && b.accountNumber.trim()) || `bank-${index}`;
}

// A course stores either "all" or a JSON array of bank keys.
export function parseSelectedBanks(value: string | null | undefined): "all" | string[] {
  if (!value || value === "all") return "all";
  try {
    const a = JSON.parse(value);
    return Array.isArray(a) ? a.map(String) : "all";
  } catch {
    return "all";
  }
}

export function filterBanks(banks: BankAccount[], value: string | null | undefined): BankAccount[] {
  const sel = parseSelectedBanks(value);
  if (sel === "all") return banks;
  return banks.filter((b, i) => sel.includes(bankKey(b, i)));
}
