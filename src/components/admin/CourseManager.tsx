"use client";

import { useState } from "react";
import { Field, Area } from "@/components/admin/fields";
import { MediaUpload } from "@/components/admin/MediaUpload";
import {
  AcademicIcon,
  CloseIcon,
  CheckIcon,
  PlayIcon,
  FileIcon,
  ExamIcon,
} from "@/components/icons";
import {
  parseCurriculum,
  parseStringList,
  type CourseSection,
  type CourseItemType,
} from "@/lib/curriculum";
import { COURSE_CATEGORIES } from "@/lib/site";
import {
  bankKey,
  getBankMeta,
  parseSelectedBanks,
  type BankAccount,
} from "@/lib/banks";

export type AdminCourse = {
  id: number;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  curriculum: string;
  features: string;
  imageUrl: string;
  price: string;
  currency: string;
  badge: string;
  category: string;
  paymentNote: string;
  showBankTransfer: boolean;
  paymentBanks: string;
  platformUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

const CURRENCIES = ["ريال سعودي", "جنيه مصري", "دولار", "درهم إماراتي"];

type Draft = Omit<AdminCourse, "id" | "slug" | "curriculum" | "features"> & {
  id?: number;
  slug?: string;
  curriculum: CourseSection[];
  features: string[];
};

const ITEM_TYPES: { value: CourseItemType; label: string }[] = [
  { value: "video", label: "فيديو" },
  { value: "file", label: "ملف" },
  { value: "exam", label: "اختبار" },
];

const TYPE_ICON = { video: PlayIcon, file: FileIcon, exam: ExamIcon };

function emptyDraft(platformUrl: string, sortOrder: number): Draft {
  return {
    title: "",
    description: "",
    longDescription: "",
    curriculum: [],
    features: [],
    imageUrl: "",
    price: "",
    currency: "ريال سعودي",
    badge: "",
    category: "",
    paymentNote: "",
    showBankTransfer: false,
    paymentBanks: "all",
    platformUrl,
    isPublished: true,
    isFeatured: false,
    sortOrder,
  };
}

export function CourseManager({
  initial,
  defaultPlatformUrl,
  banks = [],
}: {
  initial: AdminCourse[];
  defaultPlatformUrl: string;
  banks?: BankAccount[];
}) {
  const [courses, setCourses] = useState<AdminCourse[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Default categories + any custom ones already saved on existing courses.
  const categorySuggestions = Array.from(
    new Set([
      ...COURSE_CATEGORIES,
      ...courses.map((c) => c.category).filter((c) => c.trim()),
    ]),
  );

  // Group the courses by category so the list is easy to review.
  const groupedCourses = (() => {
    const map = new Map<string, AdminCourse[]>();
    for (const c of courses) {
      const key = c.category?.trim() || "بدون فئة";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries()).map(([category, list]) => ({ category, list }));
  })();

  function openNew() {
    setError("");
    setDraft(emptyDraft(defaultPlatformUrl, courses.length + 1));
  }
  function openEdit(c: AdminCourse) {
    setError("");
    setDraft({
      ...c,
      curriculum: parseCurriculum(c.curriculum),
      features: parseStringList(c.features),
    });
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  /* ---- curriculum helpers ---- */
  function addSection() {
    if (!draft) return;
    set("curriculum", [...draft.curriculum, { title: "قسم جديد", items: [] }]);
  }
  function updateSection(i: number, patch: Partial<CourseSection>) {
    if (!draft) return;
    const next = draft.curriculum.map((s, x) => (x === i ? { ...s, ...patch } : s));
    set("curriculum", next);
  }
  function removeSection(i: number) {
    if (!draft) return;
    set("curriculum", draft.curriculum.filter((_, x) => x !== i));
  }
  function addItem(si: number) {
    if (!draft) return;
    const next = draft.curriculum.map((s, x) =>
      x === si ? { ...s, items: [...s.items, { title: "", type: "video" as CourseItemType }] } : s,
    );
    set("curriculum", next);
  }
  function updateItem(si: number, ii: number, patch: Partial<{ title: string; type: CourseItemType; url: string }>) {
    if (!draft) return;
    const next = draft.curriculum.map((s, x) =>
      x === si
        ? { ...s, items: s.items.map((it, y) => (y === ii ? { ...it, ...patch } : it)) }
        : s,
    );
    set("curriculum", next);
  }
  function removeItem(si: number, ii: number) {
    if (!draft) return;
    const next = draft.curriculum.map((s, x) =>
      x === si ? { ...s, items: s.items.filter((_, y) => y !== ii) } : s,
    );
    set("curriculum", next);
  }
  function moveSection(i: number, dir: -1 | 1) {
    if (!draft) return;
    const j = i + dir;
    if (j < 0 || j >= draft.curriculum.length) return;
    const next = [...draft.curriculum];
    [next[i], next[j]] = [next[j], next[i]];
    set("curriculum", next);
  }
  function moveItem(si: number, ii: number, dir: -1 | 1) {
    if (!draft) return;
    const items = draft.curriculum[si].items;
    const j = ii + dir;
    if (j < 0 || j >= items.length) return;
    const nextItems = [...items];
    [nextItems[ii], nextItems[j]] = [nextItems[j], nextItems[ii]];
    set(
      "curriculum",
      draft.curriculum.map((s, x) => (x === si ? { ...s, items: nextItems } : s)),
    );
  }

  /* ---- per-course bank selection ---- */
  const allBankKeys = banks.map((b, i) => bankKey(b, i));
  function isBankSelected(key: string): boolean {
    const sel = parseSelectedBanks(draft?.paymentBanks ?? "all");
    return sel === "all" || sel.includes(key);
  }
  function toggleBank(key: string, checked: boolean) {
    if (!draft) return;
    const sel = parseSelectedBanks(draft.paymentBanks);
    let arr = sel === "all" ? [...allBankKeys] : [...sel];
    if (checked) {
      if (!arr.includes(key)) arr.push(key);
    } else {
      arr = arr.filter((k) => k !== key);
    }
    set("paymentBanks", arr.length === allBankKeys.length ? "all" : JSON.stringify(arr));
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError("العنوان مطلوب");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const isEdit = typeof draft.id === "number";
      const res = await fetch(
        isEdit ? `/api/courses/${draft.id}` : "/api/courses",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر الحفظ");
        return;
      }
      const saved: AdminCourse = data.course;
      setCourses((prev) =>
        isEdit ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved],
      );
      setDraft(null);
    } catch {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: AdminCourse) {
    if (!confirm(`حذف الكورس «${c.title}»؟`)) return;
    const res = await fetch(`/api/courses/${c.id}`, { method: "DELETE" });
    if (res.ok) setCourses((prev) => prev.filter((x) => x.id !== c.id));
  }

  return (
    <div>
      {!draft && (
        <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">إدارة الكورسات</h1>
          <p className="mt-1 text-sm text-brand-900/55">
            أضف وعدّل الكورسات ومنهج كل كورس بالتفصيل.
          </p>
        </div>
        <button
          onClick={openNew}
          className="cursor-pointer rounded-xl bg-brand-600 px-5 py-3 font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700"
        >
          + إضافة كورس
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-card border border-dashed border-brand-200 bg-white p-12 text-center">
          <AcademicIcon className="mx-auto h-12 w-12 text-brand-300" />
          <p className="mt-3 font-bold text-brand-900">لا توجد كورسات بعد</p>
          <p className="mt-1 text-sm text-brand-900/55">ابدأ بإضافة أول كورس.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedCourses.map(({ category, list }) => (
            <div key={category}>
              <div className="mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
                <h2 className="text-lg font-black text-brand-900">{category}</h2>
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                  {list.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((c) => {
                  const sectionCount = parseCurriculum(c.curriculum).length;
                  return (
                    <div key={c.id} className="overflow-hidden rounded-card border border-brand-100 bg-white">
                      <div className="relative aspect-video bg-brand-50">
                        {c.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={c.imageUrl} alt={c.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-brand-300">
                            <AcademicIcon className="h-10 w-10" />
                          </div>
                        )}
                        {!c.isPublished && (
                          <span className="absolute right-2 top-2 rounded-full bg-brand-900/70 px-2.5 py-1 text-xs font-bold text-white">
                            مخفي
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-extrabold text-brand-900">{c.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-brand-900/55">{c.description}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-brand-900/50">
                          {c.price && <span className="text-brand-700">{c.price} {c.currency}</span>}
                          {sectionCount > 0 && <span>{sectionCount} أقسام</span>}
                          {c.isFeatured && <span className="text-accent-600">★ مميّز</span>}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button onClick={() => openEdit(c)}
                            className="flex-1 cursor-pointer rounded-lg border border-brand-200 px-3 py-2 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50">
                            تعديل
                          </button>
                          <button onClick={() => remove(c)}
                            className="cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50">
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

        </>
      )}

      {draft && (
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setDraft(null)} title="رجوع للقائمة"
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-brand-200 text-brand-600 hover:bg-brand-50">
                <CloseIcon className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-black text-brand-900">
                {typeof draft.id === "number" ? "تعديل كورس" : "كورس جديد"}
              </h1>
            </div>
            <button onClick={save} disabled={saving}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-60">
              <CheckIcon className="h-5 w-5" />
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
          <div className="mx-auto max-w-3xl rounded-card border border-brand-100 bg-white p-5 sm:p-8">
              <div className="space-y-4">
                <Field label="عنوان الكورس" value={draft.title} onChange={(v) => set("title", v)} />
                <label className="block">
                  <Field
                    label="رابط الكورس (بالإنجليزي)"
                    dir="ltr"
                    value={draft.slug ?? ""}
                    onChange={(v) => set("slug", v)}
                    placeholder="مثال: nesmo-math-1"
                  />
                  <span className="mt-1 block text-xs text-brand-900/45">
                    استخدم حروف إنجليزية وأرقام وشرطات فقط. اتركه فاضي ليتولّد تلقائيًا من العنوان. (الروابط العربية لا تعمل)
                  </span>
                </label>
                <Area label="نبذة مختصرة" rows={2} value={draft.description} onChange={(v) => set("description", v)} />
                <Area label="تفاصيل كاملة" rows={4} value={draft.longDescription} onChange={(v) => set("longDescription", v)} />
                <MediaUpload label="صورة الكورس" value={draft.imageUrl} onChange={(v) => set("imageUrl", v)} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="السعر" value={draft.price} onChange={(v) => set("price", v)} placeholder="مثال: 500" />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-brand-900">العملة</span>
                    <select
                      value={draft.currency}
                      onChange={(e) => set("currency", e.target.value)}
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-brand-900 outline-none focus:border-brand-500"
                    >
                      {CURRENCIES.map((cur) => (
                        <option key={cur} value={cur}>{cur}</option>
                      ))}
                    </select>
                  </label>
                  <Field label="شارة (اختياري)" value={draft.badge} onChange={(v) => set("badge", v)} placeholder="مثال: موهبة" />
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-brand-900">الفئة (للفلترة في صفحة الكورسات)</span>
                  <input
                    list="course-category-options"
                    value={draft.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="اكتب فئة أو اختر من القائمة (مثال: مسابقات موهبة)"
                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-brand-900 outline-none focus:border-brand-500"
                  />
                  <datalist id="course-category-options">
                    {categorySuggestions.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  <span className="mt-1 block text-xs text-brand-900/45">
                    اكتب أي فئة جديدة وهتتحفظ تلقائيًا وتظهر كفلتر في صفحة الكورسات. اتركها فاضية لو «بدون فئة».
                  </span>
                </label>
                <Field label="رابط المنصة (عند الضغط على اشترك)" dir="ltr" value={draft.platformUrl} onChange={(v) => set("platformUrl", v)} />
                <Field label="الترتيب" value={String(draft.sortOrder)} onChange={(v) => set("sortOrder", Number(v) || 0)} />

                {/* Payment options for this course */}
                <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                  <h3 className="font-extrabold text-brand-900">طرق الدفع لهذا الكورس</h3>
                  <p className="mb-3 text-xs text-brand-900/55">
                    يظهر للطالب في صفحة الكورس بجانب زر «اشترك على المنصة».
                  </p>
                  <Area
                    label="نص طرق الدفع (اختياري)"
                    rows={2}
                    value={draft.paymentNote}
                    onChange={(v) => set("paymentNote", v)}
                    placeholder="مثال: تقدر تدفع بالبطاقة على المنصة، أو تحويل بنكي وترسل الإيصال على واتساب."
                  />
                  <label className="mt-3 flex items-center gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3">
                    <input type="checkbox" checked={draft.showBankTransfer}
                      onChange={(e) => set("showBankTransfer", e.target.checked)}
                      className="h-5 w-5 cursor-pointer accent-brand-600" />
                    <span className="text-sm font-bold text-brand-900">
                      إظهار خيار التحويل البنكي في صفحة الكورس
                    </span>
                  </label>

                  {draft.showBankTransfer && (
                    <div className="mt-3 rounded-xl border border-brand-100 bg-white p-3">
                      {banks.length === 0 ? (
                        <p className="text-sm text-brand-900/55">
                          لا توجد حسابات بنكية بعد. أضِفها من صفحة «طرق الدفع» في القائمة.
                        </p>
                      ) : (
                        <>
                          <p className="mb-2 text-sm font-bold text-brand-900">الحسابات التي تظهر في هذا الكورس:</p>
                          <label className="flex items-center gap-2 rounded-lg bg-brand-50/60 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={parseSelectedBanks(draft.paymentBanks) === "all"}
                              onChange={(e) => set("paymentBanks", e.target.checked ? "all" : "[]")}
                              className="h-4 w-4 cursor-pointer accent-brand-600"
                            />
                            <span className="text-sm font-bold text-brand-900">كل الحسابات</span>
                          </label>
                          <div className="mt-1 space-y-1">
                            {banks.map((b, i) => {
                              const key = bankKey(b, i);
                              const meta = getBankMeta(b.bank);
                              const label = b.bank === "other" && b.bankName ? b.bankName : meta.name;
                              return (
                                <label key={key} className="flex items-center gap-2 px-3 py-1.5">
                                  <input
                                    type="checkbox"
                                    checked={isBankSelected(key)}
                                    onChange={(e) => toggleBank(key, e.target.checked)}
                                    className="h-4 w-4 cursor-pointer accent-brand-600"
                                  />
                                  <span className="inline-block h-3 w-3 rounded-sm" style={{ background: meta.color }} />
                                  <span className="text-sm text-brand-900/80">
                                    {label}{b.accountName ? ` — ${b.accountName}` : ""}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-brand-200 px-4 py-3">
                    <input type="checkbox" checked={draft.isPublished}
                      onChange={(e) => set("isPublished", e.target.checked)}
                      className="h-5 w-5 cursor-pointer accent-brand-600" />
                    <span className="font-bold text-brand-900">منشور (يظهر للزوار)</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-brand-200 px-4 py-3">
                    <input type="checkbox" checked={draft.isFeatured}
                      onChange={(e) => set("isFeatured", e.target.checked)}
                      className="h-5 w-5 cursor-pointer accent-accent-500" />
                    <span className="font-bold text-brand-900">مميّز (يظهر في «كورسات مميزة»)</span>
                  </label>
                </div>

                {/* Features / "اشتراكك يشمل" editor */}
                <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-brand-900">اشتراكك يشمل</h3>
                      <p className="text-xs text-brand-900/55">
                        مزايا تظهر في صفحة الكورس (مثل: دعم فني، وصول كامل...).
                      </p>
                    </div>
                    <button type="button" onClick={() => set("features", [...draft.features, ""])}
                      className="shrink-0 cursor-pointer rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">
                      + ميزة
                    </button>
                  </div>
                  <div className="space-y-2">
                    {draft.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2">
                        <input
                          value={f}
                          onChange={(e) => {
                            const next = [...draft.features]; next[fi] = e.target.value; set("features", next);
                          }}
                          placeholder="مثال: دعم فني لحل المشاكل والاستفسارات"
                          className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 outline-none focus:border-brand-500"
                        />
                        <button type="button" onClick={() => set("features", draft.features.filter((_, x) => x !== fi))}
                          className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-brand-100 text-red-500 hover:bg-red-50">
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {draft.features.length === 0 && (
                      <p className="rounded-lg bg-white px-3 py-3 text-center text-sm text-brand-900/45">
                        لا توجد مزايا — اضغط «+ ميزة» للإضافة.
                      </p>
                    )}
                  </div>
                </div>

                {/* Curriculum editor */}
                <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-brand-900">منهج الكورس</h3>
                      <p className="text-xs text-brand-900/55">
                        قسّم الكورس لأقسام، وكل قسم فيه عناصر (فيديو / ملف / اختبار).
                      </p>
                    </div>
                    <button type="button" onClick={addSection}
                      className="shrink-0 cursor-pointer rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">
                      + قسم
                    </button>
                  </div>

                  <div className="space-y-3">
                    {draft.curriculum.map((section, si) => (
                      <div key={si} className="rounded-xl border border-brand-100 bg-white p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex shrink-0 flex-col">
                            <button type="button" onClick={() => moveSection(si, -1)} disabled={si === 0}
                              title="تحريك لأعلى"
                              className="flex h-[18px] w-7 items-center justify-center rounded-t-md border border-brand-200 text-xs leading-none text-brand-600 hover:bg-brand-50 disabled:opacity-30">
                              ▲
                            </button>
                            <button type="button" onClick={() => moveSection(si, 1)} disabled={si === draft.curriculum.length - 1}
                              title="تحريك لأسفل"
                              className="flex h-[18px] w-7 items-center justify-center rounded-b-md border border-t-0 border-brand-200 text-xs leading-none text-brand-600 hover:bg-brand-50 disabled:opacity-30">
                              ▼
                            </button>
                          </div>
                          <input
                            value={section.title}
                            onChange={(e) => updateSection(si, { title: e.target.value })}
                            placeholder="اسم القسم"
                            className="flex-1 rounded-lg border border-brand-200 px-3 py-2 font-bold text-brand-900 outline-none focus:border-brand-500"
                          />
                          <button type="button" onClick={() => removeSection(si)}
                            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                            <CloseIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2 space-y-2 pr-2">
                          {section.items.map((item, ii) => {
                            const Icon = TYPE_ICON[item.type] ?? PlayIcon;
                            return (
                              <div key={ii} className="rounded-lg border border-brand-100 bg-brand-50/40 p-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex shrink-0 flex-col">
                                    <button type="button" onClick={() => moveItem(si, ii, -1)} disabled={ii === 0}
                                      title="تحريك لأعلى"
                                      className="flex h-3.5 w-6 items-center justify-center rounded-t border border-brand-200 text-[10px] leading-none text-brand-600 hover:bg-brand-50 disabled:opacity-30">
                                      ▲
                                    </button>
                                    <button type="button" onClick={() => moveItem(si, ii, 1)} disabled={ii === section.items.length - 1}
                                      title="تحريك لأسفل"
                                      className="flex h-3.5 w-6 items-center justify-center rounded-b border border-t-0 border-brand-200 text-[10px] leading-none text-brand-600 hover:bg-brand-50 disabled:opacity-30">
                                      ▼
                                    </button>
                                  </div>
                                  <Icon className="h-4 w-4 shrink-0 text-brand-400" />
                                  <input
                                    value={item.title}
                                    onChange={(e) => updateItem(si, ii, { title: e.target.value })}
                                    placeholder="اسم العنصر (مثال: الفيديو الأول - المتجهات)"
                                    className="flex-1 rounded-lg border border-brand-200 px-3 py-1.5 text-sm text-brand-900 outline-none focus:border-brand-500"
                                  />
                                  <select
                                    value={item.type}
                                    onChange={(e) => updateItem(si, ii, { type: e.target.value as CourseItemType })}
                                    className="shrink-0 rounded-lg border border-brand-200 px-2 py-1.5 text-sm text-brand-900 outline-none focus:border-brand-500"
                                  >
                                    {ITEM_TYPES.map((t) => (
                                      <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                  </select>
                                  <button type="button" onClick={() => removeItem(si, ii)}
                                    className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-red-500 hover:bg-red-50">
                                    <CloseIcon className="h-4 w-4" />
                                  </button>
                                </div>
                                {item.type !== "exam" && (
                                  <div className="mt-2 pr-6">
                                    <MediaUpload
                                      value={item.url ?? ""}
                                      onChange={(url) => updateItem(si, ii, { url })}
                                      accept={item.type === "video" ? "video/*" : "application/pdf,image/*"}
                                      label={
                                        item.type === "video"
                                          ? "معاينة الفيديو — ارفع فيديو أو الصق رابط (YouTube / Vimeo / MP4)"
                                          : "معاينة الملف — ارفع PDF أو صورة أو الصق رابط"
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <button type="button" onClick={() => addItem(si)}
                            className="cursor-pointer rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100">
                            + عنصر
                          </button>
                        </div>
                      </div>
                    ))}
                    {draft.curriculum.length === 0 && (
                      <p className="rounded-lg bg-white px-3 py-3 text-center text-sm text-brand-900/45">
                        لا يوجد منهج بعد — اضغط «+ قسم» للبدء.
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setDraft(null)}
                  className="cursor-pointer rounded-xl border border-brand-200 px-5 py-3 font-bold text-brand-700 hover:bg-brand-50">
                  إلغاء
                </button>
                <button onClick={save} disabled={saving}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 disabled:opacity-60">
                  <CheckIcon className="h-5 w-5" />
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
