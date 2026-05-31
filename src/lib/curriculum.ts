// Client-safe curriculum types & parsing (no server-only imports).

export type CourseItemType = "video" | "file" | "exam";
export type CourseItem = { title: string; type: CourseItemType; url?: string };
export type CourseSection = { title: string; items: CourseItem[] };

export function parseStringList(json: string): string[] {
  try {
    const data = JSON.parse(json || "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function parseCurriculum(json: string): CourseSection[] {
  try {
    const data = JSON.parse(json || "[]");
    if (!Array.isArray(data)) return [];
    return data
      .filter((s) => s && typeof s.title === "string")
      .map((s) => ({
        title: s.title,
        items: Array.isArray(s.items)
          ? s.items
              .filter(
                (it: unknown) =>
                  it && typeof (it as CourseItem).title === "string",
              )
              .map((it: CourseItem) => ({
                title: it.title,
                type: (["video", "file", "exam"] as const).includes(it.type)
                  ? it.type
                  : "video",
                ...(typeof it.url === "string" && it.url.trim()
                  ? { url: it.url.trim() }
                  : {}),
              }))
          : [],
      }));
  } catch {
    return [];
  }
}
