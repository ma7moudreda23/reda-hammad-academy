"use client";

import { useState } from "react";
import { Field, Area } from "@/components/admin/fields";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { PromoCodeCheck } from "@/components/admin/PromoCodeCheck";
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
  parseCourseVideos,
  type CourseSection,
  type CourseItemType,
  type CourseVideo,
} from "@/lib/curriculum";
import { COURSE_CATEGORIES } from "@/lib/site";
import { generateItems, type GenerateKind } from "@/lib/ordinals";
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
  videos: string;
  imageUrl: string;
  price: string;
  oldPrice: string;
  priceNote: string;
  promoCode: string;
  currency: string;
  badge: string;
  category: string;
  startAt: string;
  registrationOpen: boolean;
  showRegistrationGuide: boolean;
  registrationGuidePosition: string;
  showSchedule: boolean;
  scheduleTitle: string;
  scheduleUrl: string;
  schedulePosition: string;
  detailsImageUrl: string;
  paymentNote: string;
  showElectronicPayment: boolean;
  showBankTransfer: boolean;
  paymentBanks: string;
  platformUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

const CURRENCIES = ["ريال سعودي", "جنيه مصري", "دولار", "درهم إماراتي"];

type Draft = Omit<AdminCourse, "id" | "slug" | "curriculum" | "features" | "videos"> & {
  id?: number;
  slug?: string;
  curriculum: CourseSection[];
  features: string[];
  videos: CourseVideo[];
};

// The course form, in the order an admin fills it in.
const FORM_STEPS = [
  { key: "basics", title: "البيانات الأساسية", desc: "اسم الكورس وصورته وما يظهر تحتها." },
  { key: "pricing", title: "السعر والاشتراك", desc: "السعر والرابط اللي يفتحه زر «اشترك الآن»." },
  { key: "features", title: "اشتراكك يشمل", desc: "مزايا تظهر تحت زر الاشتراك (مثل: دعم فني، وصول كامل...)." },
  { key: "videos", title: "الفيديوهات", desc: "تظهر مباشرة تحت بيانات الكورس وزر الاشتراك. سمّي كل فيديو بالاسم اللي تحبه، وارفع ملف MP4 (حتى 30 ميجا) أو الصق رابط يوتيوب." },
  { key: "details", title: "تفاصيل الكورس", desc: "الشرح الكامل، وصورة إضافية لو حبيت." },
  { key: "curriculum", title: "منهج الكورس", desc: "قسّم الكورس لأقسام، وكل قسم فيه عناصر (فيديو / ملف / اختبار)." },
  { key: "payment", title: "طرق الدفع", desc: "يظهر للطالب في صفحة الكورس بجانب زر «اشترك على المنصة»." },
  { key: "extras", title: "أقسام إضافية", desc: "طريقة التسجيل وجدول الدورة، ومكان كل واحد في الصفحة." },
  { key: "publish", title: "النشر والإعدادات", desc: "هل يظهر للزوار، وترتيبه في القائمة، ورابطه." },
] as const;

function FormSection({
  step,
  action,
  children,
}: {
  step: (typeof FORM_STEPS)[number]["key"];
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const index = FORM_STEPS.findIndex((s) => s.key === step);
  const { title, desc } = FORM_STEPS[index];
  return (
    <section id={`course-${step}`} className="scroll-mt-32 rounded-card border border-brand-100 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-brand-100 pb-3">
        <div className="flex items-start gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">
            {index + 1}
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-brand-900">{title}</h2>
            <p className="text-xs text-brand-900/55">{desc}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

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
    videos: [],
    imageUrl: "",
    price: "",
    oldPrice: "",
    priceNote: "",
    promoCode: "",
    currency: "ريال سعودي",
    badge: "",
    category: "",
    startAt: "",
    registrationOpen: false,
    showRegistrationGuide: false,
    registrationGuidePosition: "afterPayment",
    showSchedule: false,
    scheduleTitle: "جدول الدورة",
    scheduleUrl: "",
    schedulePosition: "afterPayment",
    detailsImageUrl: "",
    paymentNote: "",
    showElectronicPayment: true,
    showBankTransfer: false,
    paymentBanks: "all",
    platformUrl,
    isPublished: true,
    isFeatured: false,
    sortOrder,
  };
}

function SectionGenerator({
  onGenerate,
}: {
  onGenerate: (kind: GenerateKind, count: number) => void;
}) {
  const [count, setCount] = useState(20);
  const [kind, setKind] = useState<GenerateKind>("exams");
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-brand-100 bg-white px-2 py-1">
      <span className="text-xs font-bold text-brand-900/50">توليد سريع:</span>
      <select value={kind} onChange={(e) => setKind(e.target.value as GenerateKind)}
        className="rounded-md border border-brand-200 px-1.5 py-1 text-xs text-brand-900 outline-none">
        <option value="exams">اختبارات</option>
        <option value="lessons">حصص (فيديو + ملف)</option>
        <option value="videos">حصص (فيديو)</option>
      </select>
      <span className="text-xs text-brand-900/50">من 1 إلى</span>
      <input type="number" min={1} max={200} value={count}
        onChange={(e) => setCount(Number(e.target.value) || 0)}
        className="w-16 rounded-md border border-brand-200 px-2 py-1 text-xs text-brand-900 outline-none" />
      <button type="button" onClick={() => onGenerate(kind, count)}
        className="cursor-pointer rounded-md bg-accent-500 px-2.5 py-1 text-xs font-bold text-brand-900 hover:bg-accent-600">
        توليد
      </button>
    </div>
  );
}

function BelowImagePicker({
  startAt,
  registrationOpen,
  onChange,
}: {
  startAt: string;
  registrationOpen: boolean;
  onChange: (next: { startAt?: string; registrationOpen?: boolean }) => void;
}) {
  // Kept apart from startAt so the date field stays open until a date is picked.
  const [countdownOn, setCountdownOn] = useState(Boolean(startAt));

  const opts = [
    {
      label: "بدون",
      active: !countdownOn && !registrationOpen,
      onClick: () => {
        setCountdownOn(false);
        onChange({ startAt: "", registrationOpen: false });
      },
    },
    {
      label: "عدّاد تنازلي لموعد",
      active: countdownOn,
      onClick: () => {
        if (countdownOn) onChange({ startAt: "" });
        setCountdownOn(!countdownOn);
      },
    },
    {
      label: "تم فتح باب التسجيل",
      active: registrationOpen,
      onClick: () => onChange({ registrationOpen: !registrationOpen }),
    },
  ];

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <span className="mb-2 block text-sm font-bold text-brand-900">
        ما يظهر تحت صورة الدورة
      </span>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={o.active}
            onClick={o.onClick}
            className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
              o.active
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-200 bg-white text-brand-900/70 hover:bg-brand-50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <span className="mt-1.5 block text-xs text-brand-900/45">
        تقدر تختار العدّاد و«تم فتح باب التسجيل» مع بعض.
      </span>
      {countdownOn && (
        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-bold text-brand-900/70">
            اختَر تاريخ ووقت بداية الدورة
          </span>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => onChange({ startAt: e.target.value })}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-brand-900 outline-none focus:border-brand-500"
          />
          <span className="mt-1 block text-xs text-brand-900/45">
            العدّاد هيعدّ تنازليًا لحد الموعد، وبعد ما يبدأ هيظهر «بدأت الدورة».
          </span>
        </label>
      )}
      {registrationOpen && (
        <p className="mt-3 text-xs text-brand-900/55">
          هيظهر تحت صورة الدورة: <span className="font-bold text-brand-800">«تم فتح باب التسجيل في الدورة»</span>
        </p>
      )}
    </div>
  );
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
  const [copiedFrom, setCopiedFrom] = useState<string | null>(null);

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
    setCopiedFrom(null);
    setDraft(emptyDraft(defaultPlatformUrl, courses.length + 1));
  }
  function toDraft(c: AdminCourse): Draft {
    return {
      ...c,
      curriculum: parseCurriculum(c.curriculum),
      features: parseStringList(c.features),
      videos: parseCourseVideos(c.videos),
    };
  }
  function openEdit(c: AdminCourse) {
    setError("");
    setCopiedFrom(null);
    setDraft(toDraft(c));
  }
  // Nothing is created until the admin saves; the copy stays hidden until published.
  function openCopy(c: AdminCourse) {
    setError("");
    setCopiedFrom(c.title);
    setDraft({
      ...toDraft(c),
      id: undefined,
      slug: "",
      title: `${c.title} (نسخة)`,
      promoCode: "",
      isPublished: false,
    });
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  /* ---- video helpers ---- */
  function updateVideo(i: number, patch: Partial<CourseVideo>) {
    if (!draft) return;
    set("videos", draft.videos.map((v, x) => (x === i ? { ...v, ...patch } : v)));
  }
  function moveVideo(i: number, dir: -1 | 1) {
    if (!draft) return;
    const j = i + dir;
    if (j < 0 || j >= draft.videos.length) return;
    const next = [...draft.videos];
    [next[i], next[j]] = [next[j], next[i]];
    set("videos", next);
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
  function generateSection(si: number, kind: GenerateKind, count: number) {
    if (!draft) return;
    const section = draft.curriculum[si];
    if (
      section.items.length > 0 &&
      !confirm("سيتم استبدال العناصر الحالية في هذا القسم بالعناصر المولّدة. متابعة؟")
    )
      return;
    const items = generateItems(kind, count);
    set(
      "curriculum",
      draft.curriculum.map((s, x) => (x === si ? { ...s, items } : s)),
    );
  }
  function updateItem(si: number, ii: number, patch: Partial<{ title: string; type: CourseItemType; url: string; note: string }>) {
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
          body: JSON.stringify({
            ...draft,
            videos: draft.videos.filter((v) => v.title.trim() || v.url.trim()),
          }),
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
                          <button onClick={() => openCopy(c)} title="إنشاء كورس جديد بنفس البيانات"
                            className="cursor-pointer rounded-lg border border-brand-200 px-3 py-2 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50">
                            نسخ
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
                {typeof draft.id === "number" ? "تعديل كورس" : copiedFrom ? "نسخ كورس" : "كورس جديد"}
              </h1>
            </div>
            <button onClick={save} disabled={saving}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-60">
              <CheckIcon className="h-5 w-5" />
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
          <div className="mx-auto max-w-3xl space-y-5">
            <nav className="sticky top-16 z-20 flex gap-1.5 overflow-x-auto rounded-xl border border-brand-100 bg-white/95 p-2 shadow-sm backdrop-blur [scrollbar-width:none] lg:top-4 lg:flex-wrap">
              {FORM_STEPS.map((s, i) => (
                <a key={s.key} href={`#course-${s.key}`}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-900/70 transition-colors hover:bg-brand-50 hover:text-brand-800">
                  {i + 1}. {s.title}
                </a>
              ))}
            </nav>

            {copiedFrom && (
              <p className="rounded-xl border border-accent-300 bg-accent-500/15 px-4 py-3 text-sm font-bold text-brand-800">
                دي نسخة من «{copiedFrom}». عدّل اللي تحبه واضغط حفظ، وهتتحفظ ككورس جديد مخفي عن الزوار لحد ما تفعّل «منشور» في آخر الصفحة.
              </p>
            )}

            <FormSection step="basics">
                <Field label="عنوان الكورس (مطلوب)" value={draft.title} onChange={(v) => set("title", v)} />
                <Area label="نبذة مختصرة" rows={2} value={draft.description} onChange={(v) => set("description", v)} />
                <MediaUpload label="صورة الكورس (الغلاف)" value={draft.imageUrl} onChange={(v) => set("imageUrl", v)} />
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
                <Field label="شارة (اختياري)" value={draft.badge} onChange={(v) => set("badge", v)} placeholder="مثال: موهبة" />
                <BelowImagePicker
                  key={draft.id ?? "new"}
                  startAt={draft.startAt}
                  registrationOpen={draft.registrationOpen}
                  onChange={(next) => setDraft((d) => (d ? { ...d, ...next } : d))}
                />
            </FormSection>

            <FormSection step="pricing">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="السعر (الحالي)" value={draft.price} onChange={(v) => set("price", v)} placeholder="مثال: 250" />
                  <Field label="السعر القديم (يظهر مشطوب — اختياري)" value={draft.oldPrice} onChange={(v) => set("oldPrice", v)} placeholder="مثال: 400" />
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
                </div>
                <Field label="تعليق تحت السعر (اختياري)" value={draft.priceNote} onChange={(v) => set("priceNote", v)} placeholder="مثال: لأول 100 مشترك" />
                <label className="block">
                  <Field label="كود الخصم من Stripe (اختياري)" dir="ltr" value={draft.promoCode} onChange={(v) => set("promoCode", v)} placeholder="مثال: KAUST-T" />
                  <span className="mt-1 block text-xs text-brand-900/45">
                    اكتب الكود زي ما هو في Stripe، ولازم يكون محدد له أو لكوبونه عدد مرات استخدام. الموقع هيعرض الكود وعدد الباقي، ولما يخلص هيظهر السعر القديم كسعر حالي. اتركه فاضي لو مفيش عداد.
                  </span>
                  <PromoCodeCheck code={draft.promoCode} />
                </label>
                <Field label="رابط المنصة (عند الضغط على اشترك)" dir="ltr" value={draft.platformUrl} onChange={(v) => set("platformUrl", v)} />
            </FormSection>

            <FormSection step="features" action={
                <>
                    <button type="button" onClick={() => set("features", [...draft.features, ""])}
                      className="shrink-0 cursor-pointer rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">
                      + ميزة
                    </button>
                </>
              }>
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
            </FormSection>

            <FormSection step="videos" action={
                <>
                  <button type="button" onClick={() => set("videos", [...draft.videos, { title: "", url: "" }])}
                    className="shrink-0 cursor-pointer rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">
                    + فيديو
                  </button>
                </>
              }>
                <div className="space-y-3">
                  {draft.videos.map((video, vi) => (
                    <div key={vi} className="rounded-xl border border-brand-100 bg-brand-50/40 p-3">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex shrink-0 flex-col">
                          <button type="button" onClick={() => moveVideo(vi, -1)} disabled={vi === 0}
                            title="تحريك لأعلى"
                            className="flex h-[18px] w-7 items-center justify-center rounded-t-md border border-brand-200 text-xs leading-none text-brand-600 hover:bg-brand-50 disabled:opacity-30">
                            ▲
                          </button>
                          <button type="button" onClick={() => moveVideo(vi, 1)} disabled={vi === draft.videos.length - 1}
                            title="تحريك لأسفل"
                            className="flex h-[18px] w-7 items-center justify-center rounded-b-md border border-t-0 border-brand-200 text-xs leading-none text-brand-600 hover:bg-brand-50 disabled:opacity-30">
                            ▼
                          </button>
                        </div>
                        <input
                          value={video.title}
                          onChange={(e) => updateVideo(vi, { title: e.target.value })}
                          placeholder="اسم الفيديو (مثال: فكرة الدورة في دقيقتين)"
                          className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 font-bold text-brand-900 outline-none focus:border-brand-500"
                        />
                        <button type="button" onClick={() => set("videos", draft.videos.filter((_, x) => x !== vi))}
                          className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <MediaUpload label="" accept="video/mp4,video/webm" value={video.url}
                        onChange={(url) => updateVideo(vi, { url })} />
                    </div>
                  ))}
                  {draft.videos.length === 0 && (
                    <p className="rounded-lg bg-brand-50/40 px-3 py-3 text-center text-sm text-brand-900/45">
                      لا توجد فيديوهات — اضغط «+ فيديو» للإضافة.
                    </p>
                  )}
                </div>
            </FormSection>

            <FormSection step="details">
                <Area label="تفاصيل كاملة" rows={4} value={draft.longDescription} onChange={(v) => set("longDescription", v)} />
                <MediaUpload label="صورة إضافية داخل «تفاصيل الكورس» (اختياري)" value={draft.detailsImageUrl} onChange={(v) => set("detailsImageUrl", v)} />
            </FormSection>

            <FormSection step="curriculum" action={
                <>
                    <button type="button" onClick={addSection}
                      className="shrink-0 cursor-pointer rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">
                      + قسم
                    </button>
                </>
              }>
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
                                <input
                                  value={item.note ?? ""}
                                  onChange={(e) => updateItem(si, ii, { note: e.target.value })}
                                  placeholder="تعليق تحت العنصر (اختياري)"
                                  className="mt-2 w-full rounded-lg border border-brand-200 bg-white px-3 py-1.5 pr-6 text-xs text-brand-900/80 outline-none placeholder:text-brand-900/35 focus:border-brand-500"
                                />
                              </div>
                            );
                          })}
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" onClick={() => addItem(si)}
                              className="cursor-pointer rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100">
                              + عنصر
                            </button>
                            <SectionGenerator onGenerate={(kind, count) => generateSection(si, kind, count)} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {draft.curriculum.length === 0 && (
                      <p className="rounded-lg bg-white px-3 py-3 text-center text-sm text-brand-900/45">
                        لا يوجد منهج بعد — اضغط «+ قسم» للبدء.
                      </p>
                    )}
                  </div>
            </FormSection>

            <FormSection step="payment">
                  <Area
                    label="نص طرق الدفع (اختياري)"
                    rows={2}
                    value={draft.paymentNote}
                    onChange={(v) => set("paymentNote", v)}
                    placeholder="مثال: تقدر تدفع بالبطاقة على المنصة، أو تحويل بنكي وترسل الإيصال على واتساب."
                  />
                  <label className="mt-3 flex items-center gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3">
                    <input type="checkbox" checked={draft.showElectronicPayment}
                      onChange={(e) => set("showElectronicPayment", e.target.checked)}
                      className="h-5 w-5 cursor-pointer accent-brand-600" />
                    <span className="text-sm font-bold text-brand-900">
                      إظهار الدفع الإلكتروني (بطاقة بنكية + Apple Pay)
                    </span>
                  </label>
                  <label className="mt-2 flex items-center gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3">
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
            </FormSection>

            <FormSection step="extras">
                <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={draft.showRegistrationGuide}
                      onChange={(e) => set("showRegistrationGuide", e.target.checked)}
                      className="h-5 w-5 cursor-pointer accent-brand-600"
                    />
                    <span className="font-bold text-brand-900">إظهار قسم «طريقة التسجيل» في صفحة هذه الدورة</span>
                  </label>
                  {draft.showRegistrationGuide && (
                    <div className="mt-3">
                      <span className="mb-1.5 block text-sm font-bold text-brand-900">مكان القسم في صفحة الدورة</span>
                      <div className="flex flex-wrap gap-2">
                        {([
                          { key: "top", label: "في الأعلى (بعد بيانات الدورة)" },
                          { key: "afterPayment", label: "بعد طرق الدفع" },
                          { key: "afterDetails", label: "بعد تفاصيل الكورس" },
                          { key: "bottom", label: "في الأسفل (بعد المحتوى)" },
                        ] as const).map((o) => (
                          <button key={o.key} type="button"
                            onClick={() => set("registrationGuidePosition", o.key)}
                            className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                              draft.registrationGuidePosition === o.key
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-brand-200 bg-white text-brand-900/70 hover:bg-brand-50"
                            }`}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-brand-900/45">
                        محتوى القسم نفسه بتظبطه من «محتوى الرئيسية ← طريقة التسجيل في الدورة».
                      </p>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={draft.showSchedule}
                      onChange={(e) => set("showSchedule", e.target.checked)}
                      className="h-5 w-5 cursor-pointer accent-brand-600"
                    />
                    <span className="font-bold text-brand-900">إظهار قسم «جدول الدورة» (صورة أو PDF)</span>
                  </label>
                  {draft.showSchedule && (
                    <div className="mt-3 space-y-3">
                      <Field label="عنوان القسم" value={draft.scheduleTitle}
                        onChange={(v) => set("scheduleTitle", v)} placeholder="مثال: جدول الدورة" />
                      <MediaUpload label="ملف الجدول (صورة أو PDF)" accept="image/*,application/pdf"
                        value={draft.scheduleUrl} onChange={(v) => set("scheduleUrl", v)} />
                      <div>
                        <span className="mb-1.5 block text-sm font-bold text-brand-900">مكان القسم في صفحة الدورة</span>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { key: "top", label: "في الأعلى (بعد بيانات الدورة)" },
                            { key: "afterPayment", label: "بعد طرق الدفع" },
                            { key: "afterDetails", label: "بعد تفاصيل الكورس" },
                            { key: "bottom", label: "في الأسفل (بعد المحتوى)" },
                          ] as const).map((o) => (
                            <button key={o.key} type="button"
                              onClick={() => set("schedulePosition", o.key)}
                              className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                                draft.schedulePosition === o.key
                                  ? "border-brand-600 bg-brand-600 text-white"
                                  : "border-brand-200 bg-white text-brand-900/70 hover:bg-brand-50"
                              }`}>
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </FormSection>

            <FormSection step="publish">
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
                <Field label="الترتيب" value={String(draft.sortOrder)} onChange={(v) => set("sortOrder", Number(v) || 0)} />
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
            </FormSection>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
                )}

            <div className="sticky bottom-4 z-20 flex justify-end gap-3 rounded-xl border border-brand-100 bg-white/95 p-2 shadow-lg backdrop-blur">
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
