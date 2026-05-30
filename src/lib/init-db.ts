import "server-only";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const PLATFORM =
  process.env.NEXT_PUBLIC_PLATFORM_URL ??
  "https://platform.redahammadacademy.com/";

// Exact schema matching Prisma (so the Prisma client reads/writes correctly).
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "Admin" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE TABLE IF NOT EXISTS "SiteSetting" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "value" TEXT NOT NULL DEFAULT '',
  "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Course" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "longDescription" TEXT NOT NULL DEFAULT '',
  "curriculum" TEXT NOT NULL DEFAULT '[]',
  "features" TEXT NOT NULL DEFAULT '[]',
  "imageUrl" TEXT NOT NULL DEFAULT '',
  "price" TEXT NOT NULL DEFAULT '',
  "currency" TEXT NOT NULL DEFAULT 'ريال سعودي',
  "platformUrl" TEXT NOT NULL DEFAULT '',
  "badge" TEXT NOT NULL DEFAULT '',
  "category" TEXT NOT NULL DEFAULT '',
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Course_slug_key" ON "Course"("slug");
`;

let ran = false;

export async function ensureDatabase() {
  if (ran) return;
  ran = true;

  // 1) Create tables (in-process, no external binary — works on managed hosting).
  const file = (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, "");
  try {
    const db = new Database(file);
    db.exec(SCHEMA_SQL);
    db.close();
  } catch (e) {
    console.error("ensureDatabase: schema creation failed", e);
    return;
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
    }
  } catch (e) {
    console.error("ensureDatabase: seed failed", e);
  }
}
