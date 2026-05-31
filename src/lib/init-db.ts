import "server-only";
import * as mariadb from "mariadb";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const PLATFORM =
  process.env.NEXT_PUBLIC_PLATFORM_URL ??
  "https://platform.redahammadacademy.com/";

const CHARSET = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

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
    \`isPublished\` TINYINT(1) NOT NULL DEFAULT 1,
    \`isFeatured\` TINYINT(1) NOT NULL DEFAULT 0,
    \`sortOrder\` INT NOT NULL DEFAULT 0,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE INDEX \`Course_slug_key\`(\`slug\`)
  ) ${CHARSET}`,
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
