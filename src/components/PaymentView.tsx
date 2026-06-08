"use client";

import { useState } from "react";
import { getBankMeta, type PaymentContent } from "@/lib/banks";
import { CheckIcon } from "@/components/icons";

function BankChip({ bankKey, name }: { bankKey: string; name?: string }) {
  const meta = getBankMeta(bankKey);
  const label = bankKey === "other" && name ? name : meta.name;
  const mark = (bankKey === "other" && name ? name : meta.short).trim().charAt(0);
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-black text-white shadow-sm"
        style={{ background: meta.color }}
      >
        {mark}
      </span>
      <span className="font-extrabold text-brand-900">{label}</span>
    </div>
  );
}

function PayBadge({ label, bg }: { label: string; bg: string }) {
  return (
    <span
      className="inline-flex h-7 items-center justify-center rounded-md px-2.5 text-xs font-black tracking-wide text-white shadow-sm"
      style={{ background: bg }}
    >
      {label}
    </span>
  );
}

// Shows the uploaded logo SVG/PNG; falls back to a styled text badge if the
// file isn't present (so you can add /public/pay/*.svg anytime).
function PayLogo({ src, label, bg }: { src: string; label: string; bg: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <PayBadge label={label} bg={bg} />;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={label}
      onError={() => setFailed(true)}
      className="h-7 w-auto max-w-[72px] rounded-md object-contain"
    />
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-10" aria-hidden>
      <rect x="1" y="1" width="46" height="30" rx="4" fill="#fff" stroke="#cbd2ea" />
      <rect x="1" y="6" width="46" height="6" fill="#343a93" />
      <rect x="6" y="20" width="14" height="3" rx="1.5" fill="#8d97d9" />
    </svg>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-50/70 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-bold text-brand-900/55">{label}</p>
        <p dir="ltr" className="truncate text-left font-bold text-brand-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="shrink-0 cursor-pointer rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50"
      >
        {copied ? "تم النسخ ✓" : "نسخ"}
      </button>
    </div>
  );
}

export function PaymentView({ content }: { content: PaymentContent }) {
  return (
    <div className="space-y-8">
      {content.intro && (
        <p className="rounded-card border border-brand-100 bg-white p-5 text-lg leading-8 text-brand-900/75">
          {content.intro}
        </p>
      )}

      {(content.cardEnabled || content.applePayEnabled) && (
        <div>
          <h2 className="mb-4 text-xl font-extrabold text-brand-900">الدفع الإلكتروني</h2>
          <div className="flex flex-wrap gap-3">
            {content.cardEnabled && (
              <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white px-5 py-3.5 shadow-sm">
                <CardIcon />
                <span className="font-extrabold text-brand-900">بطاقة بنكية</span>
                <span className="flex items-center gap-1.5">
                  <PayLogo src="/pay/visa.svg" label="VISA" bg="#1A1F71" />
                  <PayLogo src="/pay/mastercard.png" label="Mastercard" bg="#23272F" />
                  <PayLogo src="/pay/mada.png" label="mada" bg="#159A8B" />
                </span>
              </div>
            )}
            {content.applePayEnabled && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-brand-100 bg-white px-5 py-3.5 shadow-sm">
                <PayLogo src="/pay/apple-pay.svg" label="Apple Pay" bg="#000000" />
                <span className="font-extrabold text-brand-900">متاح</span>
              </div>
            )}
          </div>
        </div>
      )}

      {content.banks.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-extrabold text-brand-900">التحويل البنكي</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.banks.map((b, i) => (
              <div key={i} className="rounded-card border border-brand-100 bg-white p-5 shadow-sm">
                <BankChip bankKey={b.bank} name={b.bankName} />
                <div className="mt-4 space-y-2">
                  {b.accountName && (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-50/70 px-4 py-2.5">
                      <p className="text-xs font-bold text-brand-900/55">اسم الحساب</p>
                      <p className="font-bold text-brand-900">{b.accountName}</p>
                    </div>
                  )}
                  <CopyRow label="رقم الجوال (للتحويل)" value={b.phone ?? ""} />
                  <CopyRow label="رقم الحساب" value={b.accountNumber} />
                  <CopyRow label="الآيبان (IBAN)" value={b.iban} />
                  {b.note && (
                    <p className="flex items-start gap-2 px-1 pt-1 text-sm text-brand-900/65">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                      {b.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!content.cardEnabled && !content.applePayEnabled && content.banks.length === 0 && (
        <div className="rounded-card border border-dashed border-brand-200 bg-white p-12 text-center text-brand-900/55">
          سيتم إضافة طرق الدفع قريبًا.
        </div>
      )}
    </div>
  );
}
