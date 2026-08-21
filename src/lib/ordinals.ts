// Client-safe Arabic ordinal helper for auto-generating curriculum items.
import type { CourseItem } from "@/lib/curriculum";

const ONES_M = ["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع"];
const ONES_F = ["", "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة"];
const TEEN_M = ["", "الحادي", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع"];
const TEEN_F = ["", "الحادية", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة"];

export function ordinal(n: number, gender: "m" | "f"): string {
  if (n <= 0) return String(n);
  if (n <= 9) return gender === "f" ? ONES_F[n] : ONES_M[n];
  if (n === 10) return gender === "f" ? "العاشرة" : "العاشر";
  if (n <= 19) {
    const o = n - 10;
    return gender === "f" ? `${TEEN_F[o]} عشرة` : `${TEEN_M[o]} عشر`;
  }
  if (n === 20) return "العشرون";
  if (n === 30) return "الثلاثون";
  if (n === 40) return "الأربعون";
  if (n < 40) {
    const tens = n < 30 ? "العشرون" : "الثلاثون";
    const o = n % 10;
    if (o === 0) return tens;
    return `${gender === "f" ? TEEN_F[o] : TEEN_M[o]} و${tens}`;
  }
  return `رقم ${n}`;
}

export type GenerateKind = "exams" | "lessons" | "videos";

export function generateItems(kind: GenerateKind, count: number): CourseItem[] {
  const n = Math.max(0, Math.min(60, Math.floor(count) || 0));
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
