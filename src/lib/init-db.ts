import "server-only";
import * as mariadb from "mariadb";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

const PLATFORM =
  process.env.NEXT_PUBLIC_PLATFORM_URL ??
  "https://platform.redahammadacademy.com/";

const CHARSET = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// Default curriculum for the Mawhiba courses (editable/deletable afterwards).
const ORD_F = [
  "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة",
  "الثامنة", "التاسعة", "العاشرة", "الحادية عشرة", "الثانية عشرة", "الثالثة عشرة",
  "الرابعة عشرة", "الخامسة عشرة", "السادسة عشرة", "السابعة عشرة", "الثامنة عشرة",
  "التاسعة عشرة", "العشرون",
];
const ORD_M = [
  "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن",
  "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر",
  "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون",
];

const DEFAULT_SECTIONS = [
  {
    title: "مذكرات الدورة",
    items: [
      { title: "المذكرة الأولى ( الإستدلال اللفظي )", type: "file" as const },
      { title: "المذكرة الثانية ( الإستدلال الكمي )", type: "file" as const },
      { title: "المذكرة الثالثة ( الإستدلال العلمي )", type: "file" as const },
      { title: "المذكرة الرابعة ( المرونة العقلية )", type: "file" as const },
    ],
  },
  {
    title: "قسم التأسيس",
    items: ORD_F.flatMap((o) => [
      { title: `فيديو شرح الحصة ${o}`, type: "video" as const },
      { title: `ملف شرح الحصة ${o}`, type: "file" as const },
    ]),
  },
  {
    title: "قسم الاختبارات",
    items: ORD_M.map((o) => ({ title: `الاختبار ${o}`, type: "exam" as const })),
  },
];
const DEFAULT_CURRICULUM = JSON.stringify(DEFAULT_SECTIONS);

// Previous auto-seeded template (numeric) — used to detect un-customized courses.
const OLD_DEFAULT_CURRICULUM = JSON.stringify([
  {
    title: "قسم التأسيس",
    items: Array.from({ length: 20 }, (_, i) => ({ title: `الحصة ${i + 1}`, type: "video" })),
  },
  {
    title: "قسم الاختبارات",
    items: Array.from({ length: 20 }, (_, i) => ({ title: `اختبار ${i + 1}`, type: "exam" })),
  },
]);

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS \`Admin\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`email\` VARCHAR(191) NOT NULL,
    \`passwordHash\` VARCHAR(191) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (\`id\`),
    UNIQUE INDEX \`Admin_email_key\`(\`email\`)
  ) ${CHARSET}`,
  `CREATE TABLE IF NOT EXISTS \`SiteSetting\` (
    \`key\` VARCHAR(191) NOT NULL,
    \`value\` LONGTEXT NOT NULL,
    \`updatedAt\` DATETIME(3) NOT NULL,
    PRIMARY KEY (\`key\`)
  ) ${CHARSET}`,
  `CREATE TABLE IF NOT EXISTS \`Upload\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`mime\` VARCHAR(191) NOT NULL DEFAULT 'application/octet-stream',
    \`data\` LONGBLOB NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (\`id\`)
  ) ${CHARSET}`,
  `CREATE TABLE IF NOT EXISTS \`Course\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`slug\` VARCHAR(191) NOT NULL,
    \`title\` VARCHAR(191) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`longDescription\` TEXT NOT NULL,
    \`curriculum\` TEXT NOT NULL,
    \`features\` TEXT NOT NULL,
    \`imageUrl\` TEXT NOT NULL,
    \`price\` VARCHAR(191) NOT NULL DEFAULT '',
    \`currency\` VARCHAR(191) NOT NULL DEFAULT 'ريال سعودي',
    \`platformUrl\` TEXT NOT NULL,
    \`badge\` VARCHAR(191) NOT NULL DEFAULT '',
    \`category\` VARCHAR(191) NOT NULL DEFAULT '',
    \`paymentNote\` TEXT NULL,
    \`showBankTransfer\` TINYINT(1) NOT NULL DEFAULT 0,
    \`paymentBanks\` TEXT NULL,
    \`isPublished\` TINYINT(1) NOT NULL DEFAULT 1,
    \`isFeatured\` TINYINT(1) NOT NULL DEFAULT 0,
    \`sortOrder\` INT NOT NULL DEFAULT 0,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE INDEX \`Course_slug_key\`(\`slug\`)
  ) ${CHARSET}`,
  // Add new columns to an already-created Course table (MariaDB supports IF NOT EXISTS).
  "ALTER TABLE `Course` ADD COLUMN IF NOT EXISTS `paymentNote` TEXT NULL",
  "ALTER TABLE `Course` ADD COLUMN IF NOT EXISTS `showBankTransfer` TINYINT(1) NOT NULL DEFAULT 0",
  "ALTER TABLE `Course` ADD COLUMN IF NOT EXISTS `paymentBanks` TEXT NULL",
];

export async function ensureDatabase(): Promise<{ ok: boolean; message: string }> {
  const url = process.env.DATABASE_URL;
  if (!url || !/^mysql/i.test(url)) {
    return { ok: false, message: "DATABASE_URL missing or not mysql" };
  }

  // 1) Create tables via raw SQL (in-process — no external Prisma engine binary).
  try {
    const u = new URL(url);
    const conn = await mariadb.createConnection({
      host: u.hostname,
      port: u.port ? Number(u.port) : 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
      connectTimeout: 8000,
    });
    // Prevent an unhandled 'error' event from crashing the process.
    conn.on("error", (err) => console.error("mariadb connection error", err));
    for (const sql of STATEMENTS) {
      await conn.query(sql);
    }
    await conn.end().catch(() => {});
  } catch (e) {
    console.error("ensureDatabase: schema creation failed", e);
    return { ok: false, message: "schema creation failed: " + String(e) };
  }

  // 2) Seed once (only if there's no admin yet) — via Prisma so dates are correct.
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const email = process.env.ADMIN_EMAIL ?? "admin@redahammadacademy.com";
      const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.admin.create({ data: { email, passwordHash } });

      const courses = [
        {
          slug: "mawhiba-level-1",
          title: "مقياس موهبة — المستوى الأول",
          description:
            "تأسيس وتدريب الطلاب على مقياس موهبة (المستوى الأول) بأسلوب مبسّط.",
          longDescription:
            "دورة المستوى الأول من مقياس موهبة، تؤسّس الطالب وتدرّبه على نمط الأسئلة والمهارات المطلوبة، مع تدريبات وتطبيقات عملية ودعم فني لحل أي مشكلة.",
          sortOrder: 1,
        },
        {
          slug: "mawhiba-level-2",
          title: "مقياس موهبة — المستوى الثاني",
          description:
            "تدريب متقدّم على مقياس موهبة (المستوى الثاني) لرفع مستوى الطالب.",
          longDescription:
            "دورة المستوى الثاني من مقياس موهبة، تنتقل بالطالب لمستوى أعلى من المهارات والتدريبات، مع متابعة مستمرة ودعم فني لحل المشاكل.",
          sortOrder: 2,
        },
        {
          slug: "mawhiba-level-3",
          title: "مقياس موهبة — المستوى الثالث",
          description:
            "إتقان مقياس موهبة (المستوى الثالث) والاستعداد الكامل للاختبار.",
          longDescription:
            "دورة المستوى الثالث من مقياس موهبة، تُتقن مهارات الطالب وتجهّزه بالكامل للاختبار، مع تدريبات مكثّفة ودعم فني لحل أي استفسار.",
          sortOrder: 3,
        },
      ];

      for (const c of courses) {
        await prisma.course.upsert({
          where: { slug: c.slug },
          create: {
            ...c,
            price: "500",
            currency: "ريال سعودي",
            badge: "موهبة",
            category: "مقياس موهبة",
            curriculum: DEFAULT_CURRICULUM,
            platformUrl: PLATFORM,
            isPublished: true,
            isFeatured: true,
          },
          update: {},
        });
      }
      console.log("✓ Database seeded (admin + Mawhiba courses)");
      return { ok: true, message: "tables created + seeded (admin + courses)" };
    }
    return { ok: true, message: "tables ready (already seeded)" };
  } catch (e) {
    console.error("ensureDatabase: seed failed", e);
    return { ok: false, message: "seed failed: " + String(e) };
  }
}

// Re-slugify any course whose slug isn't ASCII-safe (e.g. old Arabic slugs that
// 404 on the dynamic route). Idempotent: safe to run repeatedly.
export async function normalizeCourseSlugs(): Promise<{ fixed: number }> {
  let fixed = 0;
  try {
    const courses = await prisma.course.findMany({
      select: { id: true, slug: true, title: true },
    });
    for (const c of courses) {
      if (/^[a-z0-9-]+$/.test(c.slug)) continue; // already safe
      let next = slugify(c.slug || c.title);
      const clash = await prisma.course.findFirst({
        where: { slug: next, id: { not: c.id } },
        select: { id: true },
      });
      if (clash) next = `${next}-${c.id}`;
      await prisma.course.update({ where: { id: c.id }, data: { slug: next } });
      fixed++;
    }
  } catch (e) {
    console.error("normalizeCourseSlugs failed", e);
  }
  return { fixed };
}

// Apply the default 3-section template to the Mawhiba courses, but ONLY when a
// course is still empty or holds a previous auto-seeded template — never
// overwrites a course you've actually customized. Idempotent.
export async function ensureMawhibaCurriculum(): Promise<{ updated: number }> {
  let updated = 0;
  const slugs = ["mawhiba-level-1", "mawhiba-level-2", "mawhiba-level-3"];
  try {
    for (const slug of slugs) {
      const course = await prisma.course.findUnique({
        where: { slug },
        select: { id: true, curriculum: true },
      });
      if (!course) continue;
      const cur = (course.curriculum || "").trim();
      if (cur === DEFAULT_CURRICULUM) continue; // already the template
      let seedable = cur === "" || cur === "[]" || cur === OLD_DEFAULT_CURRICULUM;
      if (!seedable) {
        try {
          const a = JSON.parse(cur);
          if (Array.isArray(a) && a.length === 0) seedable = true;
        } catch {
          seedable = true; // unparseable → safe to (re)seed
        }
      }
      if (seedable) {
        await prisma.course.update({
          where: { id: course.id },
          data: { curriculum: DEFAULT_CURRICULUM },
        });
        updated++;
      }
    }
  } catch (e) {
    console.error("ensureMawhibaCurriculum failed", e);
  }
  return { updated };
}
