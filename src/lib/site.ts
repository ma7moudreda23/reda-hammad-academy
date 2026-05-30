export const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ??
  "https://platform.redahammadacademy.com/";

export const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses", label: "الكورسات" },
  { href: "/students", label: "إنجازات طلابنا" },
];

export const POLICY_LINKS = [
  { href: "/privacy", label: "سياسة الخصوصية" },
  { href: "/refund", label: "الدفع والاسترجاع" },
];

export const CONTACT_LINK = { href: "/#contact", label: "تواصل معنا" };

export const BRAND_NAME = "أكاديمية رضا حماد التعليمية";

export const COURSE_CATEGORIES = [
  "مقياس موهبة",
  "منهج موهبة",
  "قدرات",
  "تحصيلي",
];

export const SOCIAL_PLATFORMS = [
  { value: "whatsapp", label: "واتساب" },
  { value: "youtube", label: "يوتيوب" },
  { value: "instagram", label: "انستجرام" },
  { value: "tiktok", label: "تيك توك" },
  { value: "snapchat", label: "سناب شات" },
  { value: "twitter", label: "إكس (تويتر)" },
  { value: "telegram", label: "تيليجرام" },
  { value: "facebook", label: "فيسبوك" },
];
