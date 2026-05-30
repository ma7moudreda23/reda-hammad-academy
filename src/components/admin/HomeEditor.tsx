"use client";

import { useState } from "react";
import type { HomeContent } from "@/lib/content";
import { Field, Area, Card } from "@/components/admin/fields";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { SOCIAL_PLATFORMS } from "@/lib/site";

const ICON_OPTIONS = [
  { value: "academic", label: "أكاديمي" },
  { value: "chart", label: "رسم بياني" },
  { value: "device", label: "جهاز" },
  { value: "chat", label: "محادثة" },
  { value: "play", label: "تشغيل" },
  { value: "check", label: "صح" },
  { value: "star", label: "نجمة" },
];

export function HomeEditor({ initial }: { initial: HomeContent }) {
  const [c, setC] = useState<HomeContent>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function update<K extends keyof HomeContent>(key: K, value: HomeContent[K]) {
    setC((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: c }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMsg({ ok: false, text: d.error ?? "تعذّر الحفظ" });
        return;
      }
      setMsg({ ok: true, text: "تم الحفظ بنجاح ✓" });
    } catch {
      setMsg({ ok: false, text: "حدث خطأ أثناء الحفظ" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-900">محتوى الصفحة الرئيسية</h1>
          <p className="mt-1 text-sm text-brand-900/55">
            عدّل أي جزء واضغط حفظ. التغييرات تظهر فورًا على الموقع.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Brand + Hero */}
        <Card title="القسم الرئيسي (Hero)">
          <Field label="اسم الأكاديمية" value={c.brandName} onChange={(v) => update("brandName", v)} />
          <Field label="شارة علوية" value={c.hero.badge} onChange={(v) => update("hero", { ...c.hero, badge: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="العنوان الرئيسي" value={c.hero.title} onChange={(v) => update("hero", { ...c.hero, title: v })} />
            <Field label="الكلمة المميّزة (ملونة)" value={c.hero.highlight} onChange={(v) => update("hero", { ...c.hero, highlight: v })} />
          </div>
          <Area label="الوصف" value={c.hero.subtitle} onChange={(v) => update("hero", { ...c.hero, subtitle: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="زر أساسي" value={c.hero.primaryCtaText} onChange={(v) => update("hero", { ...c.hero, primaryCtaText: v })} />
            <Field label="زر ثانوي" value={c.hero.secondaryCtaText} onChange={(v) => update("hero", { ...c.hero, secondaryCtaText: v })} />
          </div>
          <MediaUpload label="صورة القسم الرئيسي" value={c.hero.imageUrl} onChange={(v) => update("hero", { ...c.hero, imageUrl: v })} />
        </Card>

        {/* Stats */}
        <Card title="الإحصائيات" desc="الأرقام اللي بتظهر تحت القسم الرئيسي">
          <div className="grid gap-4 sm:grid-cols-2">
            {c.stats.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 rounded-xl border border-brand-100 p-3">
                <Field label="القيمة" value={s.value} onChange={(v) => {
                  const next = [...c.stats]; next[i] = { ...s, value: v }; update("stats", next);
                }} />
                <Field label="الوصف" value={s.label} onChange={(v) => {
                  const next = [...c.stats]; next[i] = { ...s, label: v }; update("stats", next);
                }} />
              </div>
            ))}
          </div>
        </Card>

        {/* Promo video */}
        <Card title="فيديو المنصة (البرومو)" desc="فيديو تعريفي يظهر أعلى الصفحة الرئيسية. ارفع ملف فيديو أو الصق رابط يوتيوب.">
          <Field label="عنوان القسم" value={c.promo.title} onChange={(v) => update("promo", { ...c.promo, title: v })} />
          <Area label="وصف مختصر" rows={2} value={c.promo.subtitle} onChange={(v) => update("promo", { ...c.promo, subtitle: v })} />
          <MediaUpload
            label="ملف الفيديو (أو رابط يوتيوب)"
            accept="video/*"
            value={c.promo.videoUrl}
            onChange={(v) => update("promo", { ...c.promo, videoUrl: v })}
          />
          <label className="flex items-center gap-3 rounded-xl border border-brand-200 px-4 py-3">
            <input
              type="checkbox"
              checked={c.promo.autoplay}
              onChange={(e) => update("promo", { ...c.promo, autoplay: e.target.checked })}
              className="h-5 w-5 cursor-pointer accent-brand-600"
            />
            <span className="font-bold text-brand-900">تشغيل الفيديو تلقائيًا</span>
            <span className="text-xs text-brand-900/45">(هيشتغل بدون صوت تلقائيًا)</span>
          </label>
          <p className="text-xs text-brand-900/45">
            القسم بيظهر بس لما يكون فيه فيديو. لو سبته فاضي مابيظهرش.
          </p>
        </Card>

        {/* Features */}
        <Card title="المميزات">
          <div className="space-y-4">
            {c.features.map((f, i) => (
              <div key={i} className="rounded-xl border border-brand-100 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="العنوان" value={f.title} onChange={(v) => {
                    const next = [...c.features]; next[i] = { ...f, title: v }; update("features", next);
                  }} />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-brand-900">الأيقونة</span>
                    <select
                      value={f.icon}
                      onChange={(e) => {
                        const next = [...c.features]; next[i] = { ...f, icon: e.target.value }; update("features", next);
                      }}
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-brand-900 outline-none focus:border-brand-500"
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-3">
                  <Area label="الوصف" rows={2} value={f.description} onChange={(v) => {
                    const next = [...c.features]; next[i] = { ...f, description: v }; update("features", next);
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Training tracks */}
        <Card title="تخصصات الأستاذ (المسارات التدريبية)" desc="مقياس موهبة، الكمي، منهج موهبة، التحصيلي... إلخ">
          <Field label="عنوان القسم" value={c.trainingTracks.title} onChange={(v) => update("trainingTracks", { ...c.trainingTracks, title: v })} />
          <Area label="وصف القسم" rows={2} value={c.trainingTracks.subtitle} onChange={(v) => update("trainingTracks", { ...c.trainingTracks, subtitle: v })} />

          <div className="space-y-4">
            {c.trainingTracks.groups.map((g, gi) => (
              <div key={gi} className="rounded-xl border border-brand-100 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="اسم التخصص" value={g.category} onChange={(v) => {
                    const groups = [...c.trainingTracks.groups]; groups[gi] = { ...g, category: v };
                    update("trainingTracks", { ...c.trainingTracks, groups });
                  }} />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-brand-900">الأيقونة</span>
                    <select
                      value={g.icon}
                      onChange={(e) => {
                        const groups = [...c.trainingTracks.groups]; groups[gi] = { ...g, icon: e.target.value };
                        update("trainingTracks", { ...c.trainingTracks, groups });
                      }}
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-brand-900 outline-none focus:border-brand-500"
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-brand-900">العناصر</span>
                    <button type="button" onClick={() => {
                      const groups = [...c.trainingTracks.groups]; groups[gi] = { ...g, items: [...g.items, "عنصر جديد"] };
                      update("trainingTracks", { ...c.trainingTracks, groups });
                    }} className="cursor-pointer rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100">
                      + عنصر
                    </button>
                  </div>
                  <div className="space-y-2">
                    {g.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        <input value={item} onChange={(e) => {
                          const groups = [...c.trainingTracks.groups];
                          const items = [...g.items]; items[ii] = e.target.value;
                          groups[gi] = { ...g, items };
                          update("trainingTracks", { ...c.trainingTracks, groups });
                        }} className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-900 outline-none focus:border-brand-500" />
                        <button type="button" onClick={() => {
                          const groups = [...c.trainingTracks.groups];
                          groups[gi] = { ...g, items: g.items.filter((_, x) => x !== ii) };
                          update("trainingTracks", { ...c.trainingTracks, groups });
                        }} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-brand-100 text-red-500 hover:bg-red-50">
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={() => {
                  update("trainingTracks", { ...c.trainingTracks, groups: c.trainingTracks.groups.filter((_, x) => x !== gi) });
                }} className="mt-3 cursor-pointer text-sm font-bold text-red-600 hover:underline">
                  حذف التخصص
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => update("trainingTracks", { ...c.trainingTracks, groups: [...c.trainingTracks.groups, { category: "تخصص جديد", icon: "academic", items: [] }] })}
            className="cursor-pointer rounded-lg bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100">
            + إضافة تخصص
          </button>
        </Card>

        {/* About */}
        <Card title="قسم عن الأكاديمية">
          <Field label="العنوان" value={c.about.title} onChange={(v) => update("about", { ...c.about, title: v })} />
          <Area label="النبذة" rows={5} value={c.about.paragraph} onChange={(v) => update("about", { ...c.about, paragraph: v })} />
          <MediaUpload label="صورة القسم" value={c.about.imageUrl} onChange={(v) => update("about", { ...c.about, imageUrl: v })} />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-brand-900">النقاط المميّزة</span>
              <button type="button" onClick={() => update("about", { ...c.about, points: [...c.about.points, "نقطة جديدة"] })}
                className="cursor-pointer rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100">
                + إضافة نقطة
              </button>
            </div>
            <div className="space-y-2">
              {c.about.points.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={p} onChange={(e) => {
                    const next = [...c.about.points]; next[i] = e.target.value; update("about", { ...c.about, points: next });
                  }} className="flex-1 rounded-xl border border-brand-200 px-4 py-2.5 text-brand-900 outline-none focus:border-brand-500" />
                  <button type="button" onClick={() => update("about", { ...c.about, points: c.about.points.filter((_, x) => x !== i) })}
                    className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-brand-100 text-red-500 hover:bg-red-50">
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Videos */}
        <Card title="الفيديوهات" desc="روابط يوتيوب — تظهر كقسم في الصفحة الرئيسية">
          <div className="space-y-3">
            {c.videos.map((v, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 rounded-xl border border-brand-100 p-3">
                <div className="min-w-40 flex-1">
                  <Field label="عنوان الفيديو" value={v.title} onChange={(val) => {
                    const next = [...c.videos]; next[i] = { ...v, title: val }; update("videos", next);
                  }} />
                </div>
                <div className="min-w-56 flex-1">
                  <Field label="رابط يوتيوب" dir="ltr" value={v.url} onChange={(val) => {
                    const next = [...c.videos]; next[i] = { ...v, url: val }; update("videos", next);
                  }} />
                </div>
                <button type="button" onClick={() => update("videos", c.videos.filter((_, x) => x !== i))}
                  className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-brand-100 text-red-500 hover:bg-red-50">
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => update("videos", [...c.videos, { title: "", url: "" }])}
            className="cursor-pointer rounded-lg bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100">
            + إضافة فيديو
          </button>
        </Card>

        {/* Testimonials */}
        <Card title="آراء الطلاب">
          <div className="space-y-4">
            {c.testimonials.map((t, i) => (
              <div key={i} className="rounded-xl border border-brand-100 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="الاسم" value={t.name} onChange={(v) => {
                    const next = [...c.testimonials]; next[i] = { ...t, name: v }; update("testimonials", next);
                  }} />
                  <Field label="الصفة" value={t.role} onChange={(v) => {
                    const next = [...c.testimonials]; next[i] = { ...t, role: v }; update("testimonials", next);
                  }} />
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <div className="flex-1">
                    <Area label="الرأي" rows={2} value={t.quote} onChange={(v) => {
                      const next = [...c.testimonials]; next[i] = { ...t, quote: v }; update("testimonials", next);
                    }} />
                  </div>
                  <button type="button" onClick={() => update("testimonials", c.testimonials.filter((_, x) => x !== i))}
                    className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-brand-100 text-red-500 hover:bg-red-50">
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => update("testimonials", [...c.testimonials, { name: "", role: "", quote: "" }])}
            className="cursor-pointer rounded-lg bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100">
            + إضافة رأي
          </button>
        </Card>

        {/* Student results */}
        <Card title="درجات طلابنا (نتائج الطلاب)" desc="ارفع صور أو فيديوهات لنتائج الطلاب. يظهر كمعرض في الصفحة الرئيسية.">
          <Field label="عنوان القسم" value={c.studentResults.title} onChange={(v) => update("studentResults", { ...c.studentResults, title: v })} />
          <Area label="وصف مختصر" rows={2} value={c.studentResults.subtitle} onChange={(v) => update("studentResults", { ...c.studentResults, subtitle: v })} />

          <div className="space-y-4">
            {c.studentResults.items.map((item, i) => (
              <div key={i} className="rounded-xl border border-brand-100 p-4">
                <MediaUpload
                  label={`نتيجة ${i + 1} (صورة أو فيديو)`}
                  accept="image/*,video/*"
                  value={item.mediaUrl}
                  onChange={(v) => {
                    const items = [...c.studentResults.items]; items[i] = { ...item, mediaUrl: v };
                    update("studentResults", { ...c.studentResults, items });
                  }}
                />
                <div className="mt-3 flex items-end gap-2">
                  <div className="flex-1">
                    <Field
                      label="تعليق (اختياري)"
                      value={item.caption}
                      onChange={(v) => {
                        const items = [...c.studentResults.items]; items[i] = { ...item, caption: v };
                        update("studentResults", { ...c.studentResults, items });
                      }}
                    />
                  </div>
                  <button type="button" onClick={() => update("studentResults", { ...c.studentResults, items: c.studentResults.items.filter((_, x) => x !== i) })}
                    className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-brand-100 text-red-500 hover:bg-red-50">
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => update("studentResults", { ...c.studentResults, items: [...c.studentResults.items, { mediaUrl: "", caption: "" }] })}
            className="cursor-pointer rounded-lg bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100">
            + إضافة نتيجة
          </button>
        </Card>

        {/* CTA */}
        <Card title="قسم الدعوة للاشتراك (CTA)">
          <Field label="العنوان" value={c.cta.title} onChange={(v) => update("cta", { ...c.cta, title: v })} />
          <Area label="الوصف" rows={2} value={c.cta.subtitle} onChange={(v) => update("cta", { ...c.cta, subtitle: v })} />
          <Field label="نص الزر" value={c.cta.buttonText} onChange={(v) => update("cta", { ...c.cta, buttonText: v })} />
        </Card>

        {/* Social media */}
        <Card title="روابط التواصل الاجتماعي" desc="تظهر كأيقونات أسفل الموقع (الفوتر) وتفتح في تبويب جديد.">
          <div className="space-y-3">
            {(c.social ?? []).map((s, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 rounded-xl border border-brand-100 p-3">
                <label className="block w-40">
                  <span className="mb-1.5 block text-sm font-bold text-brand-900">المنصة</span>
                  <select
                    value={s.platform}
                    onChange={(e) => {
                      const next = [...c.social]; next[i] = { ...s, platform: e.target.value }; update("social", next);
                    }}
                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-brand-900 outline-none focus:border-brand-500"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </label>
                <div className="min-w-56 flex-1">
                  <Field label="الرابط" dir="ltr" value={s.url} onChange={(val) => {
                    const next = [...c.social]; next[i] = { ...s, url: val }; update("social", next);
                  }} />
                </div>
                <button type="button" onClick={() => update("social", c.social.filter((_, x) => x !== i))}
                  className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-brand-100 text-red-500 hover:bg-red-50">
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => update("social", [...(c.social ?? []), { platform: "whatsapp", url: "" }])}
            className="cursor-pointer rounded-lg bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100">
            + إضافة رابط
          </button>
        </Card>

        {/* Contact (WhatsApp) */}
        <Card title="تواصل معنا (واتساب الدعم الفني)" desc="يظهر كقسم في الصفحة الرئيسية بزر واتساب يفتح المحادثة مباشرة.">
          <Field label="عنوان القسم" value={c.contact?.title ?? ""} onChange={(v) => update("contact", { ...c.contact, title: v })} />
          <Area label="وصف مختصر" rows={2} value={c.contact?.subtitle ?? ""} onChange={(v) => update("contact", { ...c.contact, subtitle: v })} />
          <Field label="رقم واتساب الدعم (بصيغة دولية)" dir="ltr" value={c.contact?.whatsapp ?? ""} onChange={(v) => update("contact", { ...c.contact, whatsapp: v })} placeholder="+966540858626" />
          <p className="text-xs text-brand-900/45">
            اكتب الرقم بالصيغة الدولية مع كود الدولة (مثال: +966540858626). الضغط على الزر بيفتح محادثة واتساب على الرقم ده.
          </p>
        </Card>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:pr-80">
          {msg ? (
            <span className={`text-sm font-bold ${msg.ok ? "text-brand-700" : "text-red-600"}`}>
              {msg.text}
            </span>
          ) : (
            <span className="text-sm text-brand-900/50">اضغط حفظ لتطبيق التغييرات</span>
          )}
          <button onClick={save} disabled={saving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 disabled:opacity-60">
            <CheckIcon className="h-5 w-5" />
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
