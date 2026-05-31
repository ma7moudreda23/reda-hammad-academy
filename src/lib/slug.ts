// Arabic → Latin transliteration so course URLs are always ASCII.
// Non-ASCII slugs (e.g. Arabic) break the dynamic route on some hosts (404),
// so every slug is reduced to safe latin characters here.
const AR_MAP: Record<string, string> = {
  ا: "a", أ: "a", إ: "a", آ: "a", ٱ: "a", ء: "", ئ: "y", ؤ: "w",
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh",
  ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh",
  ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", و: "w", ي: "y", ى: "a", ة: "h",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

function transliterate(input: string): string {
  let out = "";
  for (const ch of input) out += AR_MAP[ch] ?? ch;
  return out;
}

export function slugify(input: string): string {
  const base = transliterate(input)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // drop combining diacritics
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "") // ASCII letters/numbers/hyphen only
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `course-${Date.now()}`;
}
