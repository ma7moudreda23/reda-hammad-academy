import type { ReactNode } from "react";
import { Reveal } from "@/components/motion";

export function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="pt-28 sm:pt-32">
      <section className="relative overflow-hidden bg-grid py-14">
        <div className="pointer-events-none absolute -left-20 -top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <h1 className="text-3xl font-black text-brand-900 sm:text-4xl">{title}</h1>
            {subtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-900/65">
                {subtitle}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="space-y-8 leading-8 text-brand-900/80">{children}</div>
      </section>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-extrabold text-brand-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
