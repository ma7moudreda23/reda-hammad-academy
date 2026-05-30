"use client";

import { useRef, useState } from "react";
import { DeviceIcon, CloseIcon } from "@/components/icons";

export function MediaUpload({
  value,
  onChange,
  label = "صورة",
  accept = "image/*",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر الرفع");
        return;
      }
      onChange(data.url);
    } catch {
      setError("حدث خطأ أثناء الرفع");
    } finally {
      setUploading(false);
    }
  }

  const isVideo = value && /\.(mp4|webm)$/i.test(value);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-brand-900">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-20 w-28 overflow-hidden rounded-xl border border-brand-100 bg-brand-50">
            {isVideo ? (
              <video src={value} className="h-full w-full object-cover" muted />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={value} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-black/60 text-white"
              aria-label="إزالة"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid h-20 w-28 place-items-center rounded-xl border border-dashed border-brand-200 bg-brand-50/50 text-brand-300">
            <DeviceIcon className="h-7 w-7" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="cursor-pointer rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
          >
            {uploading ? "جاري الرفع..." : value ? "تغيير" : "رفع ملف"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <input
            type="text"
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="أو الصق رابط مباشر"
            className="w-56 rounded-lg border border-brand-200 px-3 py-1.5 text-xs text-brand-900 outline-none focus:border-brand-500"
          />
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
