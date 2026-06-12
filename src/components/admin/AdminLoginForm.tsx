"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LoginIcon } from "@/components/icons";
import { BrandLogo } from "@/components/Logo";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Only allow internal paths — block //evil.com, /\evil.com and absolute URLs.
  const rawFrom = params.get("from") || "/admin";
  const from =
    rawFrom.startsWith("/") &&
    !rawFrom.startsWith("//") &&
    !rawFrom.startsWith("/\\")
      ? rawFrom
      : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر تسجيل الدخول");
        return;
      }
      router.replace(from);
      router.refresh();
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-grid px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md rounded-[2rem] border border-brand-100 bg-white p-8 shadow-2xl shadow-brand-900/10 sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="h-16 w-auto" markClassName="h-16 w-16 rounded-2xl text-2xl" />
          <h1 className="mt-5 text-2xl font-black text-brand-900">
            لوحة تحكم الأكاديمية
          </h1>
          <p className="mt-2 text-sm text-brand-900/60">
            سجّل دخولك لإدارة المحتوى والكورسات
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-bold text-brand-900"
            >
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3 text-brand-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
              placeholder="admin@redahammadacademy.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-bold text-brand-900"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3 text-brand-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-brand-600/30 transition-all duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LoginIcon className="h-5 w-5" />
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
