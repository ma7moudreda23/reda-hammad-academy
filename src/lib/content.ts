import { prisma, dbQuery } from "@/lib/db";

export type Feature = { title: string; description: string; icon: string };
export type Stat = { value: string; label: string };
export type VideoItem = { title: string; url: string };
export type Testimonial = { name: string; role: string; quote: string };
export type TrackGroup = { category: string; icon: string; items: string[] };

export type HomeContent = {
  brandName: string;
  hero: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    imageUrl: string;
  };
  about: {
    title: string;
    paragraph: string;
    imageUrl: string;
    points: string[];
  };
  features: Feature[];
  stats: Stat[];
  promo: {
    title: string;
    subtitle: string;
    videoUrl: string;
    autoplay: boolean;
  };
  trainingTracks: {
    title: string;
    subtitle: string;
    groups: TrackGroup[];
  };
  videos: VideoItem[];
  studentResults: {
    title: string;
    subtitle: string;
    items: { mediaUrl: string; caption: string }[];
  };
  testimonials: Testimonial[];
  cta: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  social: { platform: string; url: string }[];
  contact: {
    title: string;
    subtitle: string;
    whatsapp: string;
  };
};

export const HOME_CONTENT_KEY = "home";

export const DEFAULT_HOME: HomeContent = {
  brandName: "أكاديمية رضا حماد التعليمية",
  hero: {
    badge: "منصة تعليمية متخصصة",
    title: "تعلّم مع الأستاذ",
    highlight: "رضا حماد",
    subtitle:
      "منصة تعليمية احترافية تساعدك تفهم بعمق وتتفوّق بثقة. شرح مبسّط، متابعة مستمرة، ونتائج حقيقية.",
    primaryCtaText: "ابدأ التعلّم الآن",
    secondaryCtaText: "تصفّح الكورسات",
    imageUrl: "/reda.jpg",
  },
  about: {
    title: "عن الأكاديمية",
    paragraph:
      "أكاديمية رضا حماد التعليمية منصة تعليمية تهدف لتقديم تعليم عالي الجودة بأسلوب حديث وممتع. بنركّز على الفهم العميق مش الحفظ، وبنوفّر محتوى منظّم ومتابعة مستمرة لكل طالب عشان يوصل لأفضل نتيجة.",
    imageUrl: "",
    points: [
      "شرح مبسّط ومنظّم لكل درس",
      "متابعة وتقييم مستمر للطلاب",
      "محتوى محدّث ومناسب لكل المستويات",
      "وصول كامل من أي مكان وفي أي وقت",
    ],
  },
  features: [
    {
      title: "شرح احترافي",
      description: "دروس مصوّرة بجودة عالية وأسلوب واضح يوصّل المعلومة بسهولة.",
      icon: "academic",
    },
    {
      title: "متابعة مستمرة",
      description: "اختبارات وتقييمات دورية تتابع تقدّمك خطوة بخطوة.",
      icon: "chart",
    },
    {
      title: "وصول مرن",
      description: "ذاكر في أي وقت ومن أي جهاز، الدروس متاحة لك دائمًا.",
      icon: "device",
    },
    {
      title: "دعم وتفاعل",
      description: "إجابات على أسئلتك ومجتمع تعليمي يساندك في رحلتك.",
      icon: "chat",
    },
  ],
  stats: [
    { value: "+1900", label: "طالب وطالبة" },
    { value: "+420", label: "ساعة محتوى" },
    { value: "+12", label: "كورس متخصص" },
    { value: "98%", label: "نسبة رضا الطلاب" },
  ],
  promo: {
    title: "تعرّف على منصتنا",
    subtitle: "شاهد جولة سريعة داخل أكاديمية رضا حماد التعليمية.",
    videoUrl: "",
    autoplay: false,
  },
  trainingTracks: {
    title: "دورات أكاديمية رضا حماد التعليمية",
    subtitle: "برامج ومسارات تدريبية متكاملة في موهبة والقدرات والتحصيلي.",
    groups: [
      {
        category: "منهج موهبة",
        icon: "academic",
        items: [
          "منهج موهبة صف أول متوسط",
          "منهج موهبة صف ثاني متوسط",
          "منهج موهبة صف ثالث متوسط",
          "منهج موهبة صف أول ثانوي",
        ],
      },
      {
        category: "مقياس موهبة",
        icon: "star",
        items: ["المستوى الأول", "المستوى الثاني", "المستوى الثالث"],
      },
      {
        category: "قسم الكمي",
        icon: "chart",
        items: ["تأسيس القدرات كمي", "دورة المحوسب كمي"],
      },
      {
        category: "التحصيلي",
        icon: "check",
        items: ["تأسيس وتدريب الطلاب رياضيات"],
      },
    ],
  },
  videos: [],
  studentResults: {
    title: "درجات طلابنا",
    subtitle: "فخورون بنتائج طلابنا وتفوّقهم — شوف بعض إنجازاتهم.",
    items: [],
  },
  testimonials: [
    {
      name: "محمد أحمد",
      role: "طالب ثانوي",
      quote:
        "أسلوب الأستاذ رضا في الشرح فرق معي كثير، صرت أفهم بسهولة وأحب المذاكرة.",
    },
    {
      name: "سارة محمود",
      role: "طالبة",
      quote:
        "المنصة مرتّبة جدًا والمتابعة المستمرة خلّتني ملتزمة، ودرجاتي تحسّنت بشكل واضح.",
    },
    {
      name: "أحمد علي",
      role: "ولي أمر",
      quote:
        "ولدي تغيّر للأفضل بعد ما اشترك، المحتوى ممتاز والمتابعة صادقة. أنصح فيها بقوة.",
    },
  ],
  cta: {
    title: "جاهز تبدأ رحلتك التعليمية؟",
    subtitle: "انضم لآلاف الطلاب اللي اختاروا أكاديمية رضا حماد التعليمية وحقّقوا تفوّقهم.",
    buttonText: "اشترك الآن",
  },
  social: [],
  contact: {
    title: "تواصل معنا",
    subtitle: "عندك أي سؤال أو مشكلة؟ فريق الدعم الفني جاهز لمساعدتك على واتساب.",
    whatsapp: "+966540858626",
  },
};

function deepMerge<T>(base: T, override: unknown): T {
  if (
    typeof base !== "object" ||
    base === null ||
    Array.isArray(base) ||
    typeof override !== "object" ||
    override === null ||
    Array.isArray(override)
  ) {
    return (override === undefined || override === null ? base : override) as T;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    const o = (override as Record<string, unknown>)[key];
    if (o === undefined) continue;
    result[key] = deepMerge((base as Record<string, unknown>)[key], o);
  }
  return result as T;
}

export async function getHomeContent(): Promise<HomeContent> {
  // DB not ready / unreachable / slow → fall back to defaults fast (never hang).
  const row = await dbQuery(
    () => prisma.siteSetting.findUnique({ where: { key: HOME_CONTENT_KEY } }),
    null,
  );
  if (!row?.value) return DEFAULT_HOME;
  try {
    return deepMerge(DEFAULT_HOME, JSON.parse(row.value));
  } catch {
    return DEFAULT_HOME;
  }
}

export async function saveHomeContent(content: HomeContent): Promise<void> {
  const value = JSON.stringify(content);
  await prisma.siteSetting.upsert({
    where: { key: HOME_CONTENT_KEY },
    create: { key: HOME_CONTENT_KEY, value },
    update: { value },
  });
}
