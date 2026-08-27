import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { SITE_URL, PLATFORM_URL, BRAND_NAME } from "@/lib/site";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "أكاديمية رضا حماد التعليمية",
  description:
    "أكاديمية رضا حماد التعليمية — منصة تعليمية متخصصة مع الأستاذ رضا حماد. شرح احترافي، متابعة مستمرة، وكورسات تساعدك تتفوّق بثقة.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    title: "أكاديمية رضا حماد التعليمية",
    description: "منصة تعليمية احترافية مع الأستاذ رضا حماد",
    url: SITE_URL,
    siteName: BRAND_NAME,
    type: "website",
    locale: "ar_EG",
  },
};

// Organization structured data — helps Google show a proper knowledge panel /
// sitelinks for the academy. Static content only (no user input).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: BRAND_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [PLATFORM_URL],
  description:
    "منصة تعليمية متخصصة مع الأستاذ رضا حماد — شرح احترافي، متابعة مستمرة، وكورسات في موهبة والقدرات والتحصيلي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
