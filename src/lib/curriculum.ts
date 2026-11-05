// Client-safe curriculum types & parsing (no server-only imports).

export type CourseItemType = "video" | "file" | "exam";
export type CourseItem = { title: string; type: CourseItemType; url?: string; note?: string };
export type CourseSection = { title: string; items: CourseItem[] };
export type CourseVideo = { title: string; url: string };

export function parseStringList(json: string): string[] {
  try {
    const data = JSON.parse(json || "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function parseCourseVideos(json: string | null): CourseVideo[] {
  try {
    const data = JSON.parse(json || "[]");
    if (!Array.isArray(data)) return [];
    return data
      .filter((v) => v && (typeof v.title === "string" || typeof v.url === "string"))
      .map((v) => ({
        title: typeof v.title === "string" ? v.title : "",
        url: typeof v.url === "string" ? v.url : "",
      }));
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
                ...(typeof it.note === "string" && it.note.trim()
                  ? { note: it.note.trim() }
                  : {}),
              }))
          : [],
      }));
  } catch {
    return [];
  }
}
