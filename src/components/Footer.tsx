import Link from "next/link";
import {
  NAV_LINKS,
  POLICY_LINKS,
  CONTACT_LINK,
  BRAND_NAME,
} from "@/lib/site";
import { BrandLogo } from "@/components/Logo";
import { SocialIcon } from "@/components/social-icons";
import { getHomeContent } from "@/lib/content";

export async function Footer() {
  const year = new Date().getFullYear();
  const { social } = await getHomeContent();
  const links = [...NAV_LINKS, CONTACT_LINK, ...POLICY_LINKS];
  const validSocial = (social ?? []).filter((s) => s.url && s.platform);

  return (
    <footer className="mt-24 border-t border-brand-100 bg-brand-900 text-brand-50">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-xl bg-white p-2.5 shadow-sm">
                <BrandLogo className="h-9 w-auto" markClassName="h-9 w-9 text-sm" />
              </span>
              <span className="text-lg font-extrabold">{BRAND_NAME}</span>
            </div>
            <p className="mt-4 max-w-xs leading-7 text-brand-100/80">
              منصة تعليمية احترافية مع الأستاذ رضا حماد. تعلّم بثقة، وحقّق تفوّقك
              بأسلوب حديث وممتع.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">روابط سريعة</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-100/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-white">ابدأ الآن</h3>
            <p className="mb-4 text-brand-100/80">
              ادخل لمنصة التعلّم وابدأ رحلتك مع أفضل الكورسات.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 font-bold text-brand-900 shadow-lg shadow-accent-500/20 transition-all hover:bg-accent-400"
            >
              الدخول للمنصة
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-5 border-t border-white/10 pt-6 text-center text-sm text-brand-100/70">
          {validSocial.length > 0 && (
            <div className="flex items-center justify-center gap-3">
              {validSocial.map((s) => (
                <a
                  key={s.platform + s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-brand-50 transition-colors hover:bg-accent-500 hover:text-brand-900"
                >
                  <SocialIcon platform={s.platform} className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
          <p>© {year} {BRAND_NAME}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
