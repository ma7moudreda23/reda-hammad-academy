// Client-safe Arabic ordinal helper for auto-generating curriculum items.
import type { CourseItem } from "@/lib/curriculum";

const ONES_M = ["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع"];
const ONES_F = ["", "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة"];
// Combining forms used with "عشر"/"عشرة", with "و<العشرون>", and with "بعد المئة".
const COMB_M = ["", "الحادي", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع"];
const COMB_F = ["", "الحادية", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة"];
const TENS: Record<number, string> = {
  20: "العشرون", 30: "الثلاثون", 40: "الأربعون", 50: "الخمسون",
  60: "الستون", 70: "السبعون", 80: "الثمانون", 90: "التسعون",
};

function belowHundred(n: number, g: "m" | "f"): string {
  if (n <= 9) return g === "f" ? ONES_F[n] : ONES_M[n];
  if (n === 10) return g === "f" ? "العاشرة" : "العاشر";
  if (n <= 19) {
    const o = n - 10;
    return g === "f" ? `${COMB_F[o]} عشرة` : `${COMB_M[o]} عشر`;
  }
  const t = Math.floor(n / 10) * 10;
  const o = n % 10;
  if (o === 0) return TENS[t];
  return `${g === "f" ? COMB_F[o] : COMB_M[o]} و${TENS[t]}`;
}

export function ordinal(n: number, gender: "m" | "f"): string {
  if (n <= 0) return String(n);
  if (n <= 99) return belowHundred(n, gender);
  if (n === 100) return "المئة";
  if (n <= 199) return `${belowHundred(n - 100, gender)} بعد المئة`;
  if (n === 200) return "المئتان";
  return `رقم ${n}`;
}

export type GenerateKind = "exams" | "lessons" | "videos";

export function generateItems(kind: GenerateKind, count: number): CourseItem[] {
  const n = Math.max(0, Math.min(200, Math.floor(count) || 0));
  if (kind === "exams") {
    return Array.from({ length: n }, (_, i) => ({
      title: `الاختبار ${ordinal(i + 1, "m")}`,
      type: "exam" as const,
    }));
  }
  if (kind === "lessons") {
    return Array.from({ length: n }, (_, i) => [
      { title: `فيديو شرح الحصة ${ordinal(i + 1, "f")}`, type: "video" as const },
      { title: `ملف شرح الحصة ${ordinal(i + 1, "f")}`, type: "file" as const },
    ]).flat();
  }
  return Array.from({ length: n }, (_, i) => ({
    title: `الحصة ${ordinal(i + 1, "f")}`,
    type: "video" as const,
  }));
}
