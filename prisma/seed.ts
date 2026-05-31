import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

const PLATFORM =
  process.env.NEXT_PUBLIC_PLATFORM_URL ??
  "https://platform.redahammadacademy.com/";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@redahammadacademy.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });
  console.log(`✓ Admin ready: ${email}`);

  const courses = [
    {
      slug: "mawhiba-level-1",
      title: "مقياس موهبة — المستوى الأول",
      description: "تأسيس وتدريب الطلاب على مقياس موهبة (المستوى الأول) بأسلوب مبسّط.",
      longDescription:
        "دورة المستوى الأول من مقياس موهبة، تؤسّس الطالب وتدرّبه على نمط الأسئلة والمهارات المطلوبة، مع تدريبات وتطبيقات عملية ودعم فني لحل أي مشكلة.",
      price: "500",
      currency: "ريال سعودي",
      badge: "موهبة",
      sortOrder: 1,
    },
    {
      slug: "mawhiba-level-2",
      title: "مقياس موهبة — المستوى الثاني",
      description: "تدريب متقدّم على مقياس موهبة (المستوى الثاني) لرفع مستوى الطالب.",
      longDescription:
        "دورة المستوى الثاني من مقياس موهبة، تنتقل بالطالب لمستوى أعلى من المهارات والتدريبات، مع متابعة مستمرة ودعم فني لحل المشاكل.",
      price: "500",
      currency: "ريال سعودي",
      badge: "موهبة",
      sortOrder: 2,
    },
    {
      slug: "mawhiba-level-3",
      title: "مقياس موهبة — المستوى الثالث",
      description: "إتقان مقياس موهبة (المستوى الثالث) والاستعداد الكامل للاختبار.",
      longDescription:
        "دورة المستوى الثالث من مقياس موهبة، تُتقن مهارات الطالب وتجهّزه بالكامل للاختبار، مع تدريبات مكثّفة ودعم فني لحل أي استفسار.",
      price: "500",
      currency: "ريال سعودي",
      badge: "موهبة",
      sortOrder: 3,
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      create: { ...c, category: "مقياس موهبة", platformUrl: PLATFORM, isPublished: true, isFeatured: true },
      update: {},
    });
  }
  console.log(`✓ Seeded ${courses.length} Mawhiba courses`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
