"use client";

import { useState } from "react";
import { Field, Card } from "@/components/admin/fields";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { SAUDI_BANKS, bankLogo, type PaymentContent, type BankAccount } from "@/lib/banks";

export function PaymentEditor({ initial }: { initial: PaymentContent }) {
  const [c, setC] = useState<PaymentContent>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function setBanks(banks: BankAccount[]) {
    setC((p) => ({ ...p, banks }));
  }
  function updateBank(i: number, patch: Partial<BankAccount>) {
    setBanks(c.banks.map((b, x) => (x === i ? { ...b, ...patch } : b)));
  }
  function addBank() {
    setBanks([
      ...c.banks,
      { bank: "rajhi", accountName: "", accountNumber: "", iban: "", note: "" },
    ]);
  }
  function removeBank(i: number) {
    setBanks(c.banks.filter((_, x) => x !== i));
  }
  function moveBank(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= c.banks.length) return;
    const next = [...c.banks];
    [next[i], next[j]] = [next[j], next[i]];
    setBanks(next);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/payment", {
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
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-900">الحسابات البنكية</h1>
        <p className="mt-1 text-sm text-brand-900/55">
          أضِف حسابات التحويل البنكي هنا مرة واحدة. لا تظهر للطلاب في صفحة عامة — بل تختار في كل كورس أي الحسابات تظهر داخل صفحته.
        </p>
      </div>

      <div className="space-y-5">
        <Card title="الحسابات البنكية" desc="أضِف حسابات التحويل البنكي. اختر البنك واكتب البيانات.">
          <div className="space-y-4">
            {c.banks.map((b, i) => (
              <div key={i} className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex shrink-0 flex-col">
                    <button type="button" onClick={() => moveBank(i, -1)} disabled={i === 0}
                      className="flex h-[18px] w-7 items-center justify-center rounded-t-md border border-brand-200 text-xs leading-none text-brand-600 hover:bg-brand-50 disabled:opacity-30">▲</button>
                    <button type="button" onClick={() => moveBank(i, 1)} disabled={i === c.banks.length - 1}
                      className="flex h-[18px] w-7 items-center justify-center rounded-b-md border border-t-0 border-brand-200 text-xs leading-none text-brand-600 hover:bg-brand-50 disabled:opacity-30">▼</button>
                  </div>
                  {bankLogo(b) && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={bankLogo(b)} alt="" className="h-8 w-12 shrink-0 rounded bg-white object-contain p-0.5" />
                  )}
                  <select
                    value={b.bank}
                    onChange={(e) => updateBank(i, { bank: e.target.value })}
                    className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 font-bold text-brand-900 outline-none focus:border-brand-500"
                  >
                    {SAUDI_BANKS.map((bk) => (
                      <option key={bk.key} value={bk.key}>{bk.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeBank(i)}
                    className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {b.bank === "other" && (
                    <>
                      <Field label="اسم البنك" value={b.bankName ?? ""} onChange={(v) => updateBank(i, { bankName: v })} placeholder="اكتب اسم البنك" />
                      <MediaUpload
                        label="شعار البنك (ارفع صورة SVG / PNG)"
                        accept="image/svg+xml,image/png,image/*"
                        value={b.logoUrl ?? ""}
                        onChange={(v) => updateBank(i, { logoUrl: v })}
                      />
                    </>
                  )}
                  <Field label="اسم صاحب الحساب" value={b.accountName} onChange={(v) => updateBank(i, { accountName: v })} />
                  <Field
                    label="رقم الجوال (للتحويل — STC Pay أو تحويل بنكي)"
                    dir="ltr"
                    value={b.phone ?? ""}
                    onChange={(v) => updateBank(i, { phone: v })}
                    placeholder="05XXXXXXXX"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="رقم الحساب" dir="ltr" value={b.accountNumber} onChange={(v) => updateBank(i, { accountNumber: v })} />
                    <Field label="الآيبان (IBAN)" dir="ltr" value={b.iban} onChange={(v) => updateBank(i, { iban: v })} placeholder="SA00 0000 0000 0000 0000 0000" />
                  </div>
                  <Field label="ملاحظة (اختياري)" value={b.note ?? ""} onChange={(v) => updateBank(i, { note: v })} placeholder="مثال: أرسل الإيصال على واتساب بعد التحويل" />
                </div>
              </div>
            ))}
            {c.banks.length === 0 && (
              <p className="rounded-lg bg-white px-3 py-3 text-center text-sm text-brand-900/45">
                لا توجد حسابات بنكية — اضغط «+ إضافة حساب».
              </p>
            )}
          </div>
          <button type="button" onClick={addBank}
            className="cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">
            + إضافة حساب
          </button>
        </Card>

        {msg && (
          <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {msg.text}
          </p>
        )}
      </div>

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button onClick={save} disabled={saving}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 disabled:opacity-60">
          <CheckIcon className="h-5 w-5" />
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}
