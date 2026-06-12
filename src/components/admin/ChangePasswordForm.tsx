"use client";

import { useState } from "react";
import { Card } from "@/components/admin/fields";
import { CheckIcon } from "@/components/icons";

export function ChangePasswordForm({ email }: { email: string }) {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setMsg(null);
    if (newPassword.length < 8) {
      setMsg({ ok: false, text: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" });
      return;
    }
    if (newPassword !== confirm) {
      setMsg({ ok: false, text: "كلمتا المرور غير متطابقتين" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "تعذّر التغيير" });
        return;
      }
      setMsg({ ok: true, text: "تم تغيير كلمة المرور بنجاح ✓" });
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch {
      setMsg({ ok: false, text: "حدث خطأ، حاول مرة أخرى" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-900">الحساب وكلمة المرور</h1>
        <p className="mt-1 text-sm text-brand-900/55">
          الحساب: <span dir="ltr" className="font-bold">{email}</span>
        </p>
      </div>

      <Card title="تغيير كلمة المرور" desc="استخدم كلمة مرور قوية (8 أحرف على الأقل).">
        <PasswordField label="كلمة المرور الحالية" value={currentPassword} onChange={setCurrent} autoComplete="current-password" />
        <PasswordField label="كلمة المرور الجديدة" value={newPassword} onChange={setNew} autoComplete="new-password" />
        <PasswordField label="تأكيد كلمة المرور الجديدة" value={confirm} onChange={setConfirm} autoComplete="new-password" />

        {msg && (
          <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {msg.text}
          </p>
        )}

        <button onClick={save} disabled={saving}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 disabled:opacity-60">
          <CheckIcon className="h-5 w-5" />
          {saving ? "جاري الحفظ..." : "تغيير كلمة المرور"}
        </button>
      </Card>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-brand-900">{label}</span>
      <input
        type="password"
        dir="ltr"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-left text-brand-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
    </label>
  );
}
