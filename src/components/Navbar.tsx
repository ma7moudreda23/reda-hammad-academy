"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, POLICY_LINKS, CONTACT_LINK, PLATFORM_URL, BRAND_NAME } from "@/lib/site";
import { MenuIcon, CloseIcon, LoginIcon, ChevronIcon } from "@/components/icons";
import { BrandLogo } from "@/components/Logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all duration-300 sm:px-6 ${
          scrolled
            ? "border-brand-100 bg-white/85 shadow-lg shadow-brand-900/5 backdrop-blur-md"
            : "border-transparent bg-white/40 backdrop-blur-sm"
        }`}
      >
        <Link href="/" aria-label={BRAND_NAME} className="flex items-center">
          <BrandLogo className="h-11 w-auto sm:h-12" markClassName="h-10 w-10 text-sm" />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-900/70 transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Policies dropdown */}
          <li className="group relative">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-brand-900/70 transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700"
            >
              السياسات
              <ChevronIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="min-w-48 rounded-xl border border-brand-100 bg-white p-1.5 shadow-xl shadow-brand-900/10">
                {POLICY_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand-900/70 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </li>

          <li>
            <Link
              href={CONTACT_LINK.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-900/70 transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {CONTACT_LINK.label}
            </Link>
          </li>
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-600/30 transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/40"
          >
            <LoginIcon className="h-4 w-4" />
            الدخول للمنصة
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-brand-100 bg-white/70 text-brand-700 transition-colors hover:bg-brand-50 md:hidden"
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-brand-100 bg-white/95 p-2 shadow-xl backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 font-semibold text-brand-900/80 transition-colors hover:bg-brand-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              <li className="mt-1 border-t border-brand-100 pt-1">
                <p className="px-4 pb-1 pt-2 text-xs font-bold text-brand-900/40">
                  السياسات
                </p>
                {POLICY_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 font-semibold text-brand-900/80 transition-colors hover:bg-brand-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </li>

              <li className="mt-1 border-t border-brand-100 pt-1">
                <Link
                  href={CONTACT_LINK.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 font-semibold text-brand-900/80 transition-colors hover:bg-brand-50"
                >
                  {CONTACT_LINK.label}
                </Link>
              </li>
            </ul>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white"
            >
              <LoginIcon className="h-4 w-4" />
              الدخول للمنصة
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export { PLATFORM_URL };
