export type Booklet = {
  levelName: string;
  folder: string;
  pageCount: number;
};

// Sample pages live in public/booklets. Each course shows its own level only.
const BOOKLETS: Record<string, Booklet> = {
  "kaust-tamheedi": { levelName: "المستوى التمهيدي", folder: "kaust/tamheedi", pageCount: 12 },
  "kaust-level-1": { levelName: "المستوى الأول", folder: "kaust/level-1", pageCount: 12 },
  "kaust-level-2": { levelName: "المستوى الثاني", folder: "kaust/level-2", pageCount: 12 },
};

export function getBooklet(courseSlug: string): Booklet | null {
  return BOOKLETS[courseSlug] ?? null;
}
