import type { Metadata } from "next";
import { Cairo } from "next/font/google";
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
  metadataBase: new URL("https://redahammadacademy.com"),
  openGraph: {
    title: "أكاديمية رضا حماد التعليمية",
    description: "منصة تعليمية احترافية مع الأستاذ رضا حماد",
    type: "website",
    locale: "ar_EG",
  },
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
      className={`${cairo.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
