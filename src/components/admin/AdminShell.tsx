"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  AcademicIcon,
  ChartIcon,
  DeviceIcon,
  LoginIcon,
  MenuIcon,
  CloseIcon,
  CardIcon,
} from "@/components/icons";
import { LogoMark } from "@/components/Logo";

const LINKS = [
  { href: "/admin", label: "الرئيسية", icon: ChartIcon, exact: true },
  { href: "/admin/home", label: "محتوى الصفحة الرئيسية", icon: DeviceIcon },
  { href: "/admin/courses", label: "الكورسات", icon: AcademicIcon },
  { href: "/admin/payment", label: "الحسابات البنكية", icon: CardIcon },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const Icon = l.icon;
        const active = isActive(l.href, l.exact);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
              active
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "text-brand-900/70 hover:bg-brand-50"
            }`}
          >
            <Icon className="h-5 w-5" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-brand-50/40">
      {/* Topbar (mobile) */}
      <header className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold text-brand-800">
          <LogoMark className="h-8 w-8 rounded-lg text-xs" />
          لوحة التحكم
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-brand-100 text-brand-700"
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 p-4 lg:p-6">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } fixed inset-x-0 top-14 z-40 mx-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-xl lg:static lg:mx-0 lg:block lg:w-72 lg:shrink-0 lg:self-start lg:sticky lg:top-6 lg:flex lg:min-h-[calc(100vh-3rem)] lg:flex-col lg:shadow-sm`}
        >
          <div className="mb-5 hidden items-center gap-2.5 px-2 font-extrabold text-brand-800 lg:flex">
            <LogoMark className="h-9 w-9 text-sm" />
            لوحة التحكم
          </div>
          {nav}
          <div className="mt-5 border-t border-brand-100 pt-4 lg:mt-auto">
            <p className="truncate px-2 text-xs text-brand-900/50" dir="ltr">
              {email}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-900/70 transition-colors hover:bg-brand-50"
              >
                <DeviceIcon className="h-4 w-4" />
                عرض الموقع
              </Link>
              <button
                onClick={logout}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <LoginIcon className="h-4 w-4 rotate-180" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
