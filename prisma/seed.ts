import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Fanlar
  const subjects = [
    { name: "Matematika", slug: "matematika", icon: "Calculator", emoji: "🔢", isOnline: true, displayOrder: 1 },
    { name: "Informatika", slug: "informatika", icon: "Monitor", emoji: "💻", isOnline: true, displayOrder: 2 },
    { name: "Tarix", slug: "tarix", icon: "BookOpen", emoji: "📜", isOnline: true, displayOrder: 3 },
    { name: "Ingliz tili", slug: "ingliz-tili", icon: "Globe", emoji: "🇬🇧", isOnline: true, displayOrder: 4 },
    { name: "Biologiya", slug: "biologiya", icon: "Dna", emoji: "🧬", isOnline: true, displayOrder: 5 },
    { name: "Ona tili va adabiyoti", slug: "ona-tili", icon: "BookText", emoji: "📚", isOnline: true, displayOrder: 6 },
    { name: "Jismoniy tarbiya", slug: "jismoniy-tarbiya", icon: "Dumbbell", emoji: "🏃", isOnline: false, displayOrder: 7 },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: {},
      create: subject,
    });
  }
  console.log("✓ Fanlar yaratildi");

  // 2. Viloyatlar
  const regions = [
    { name: "Toshkent shahri", slug: "toshkent-shahri" },
    { name: "Toshkent viloyati", slug: "toshkent-viloyati" },
    { name: "Andijon viloyati", slug: "andijon" },
    { name: "Buxoro viloyati", slug: "buxoro" },
    { name: "Farg'ona viloyati", slug: "fargona" },
    { name: "Jizzax viloyati", slug: "jizzax" },
    { name: "Xorazm viloyati", slug: "xorazm" },
    { name: "Namangan viloyati", slug: "namangan" },
    { name: "Navoiy viloyati", slug: "navoiy" },
    { name: "Qashqadaryo viloyati", slug: "qashqadaryo" },
    { name: "Samarqand viloyati", slug: "samarqand" },
    { name: "Sirdaryo viloyati", slug: "sirdaryo" },
    { name: "Surxondaryo viloyati", slug: "surxondaryo" },
    { name: "Qoraqalpog'iston Respublikasi", slug: "qoraqalpogiston" },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      update: {},
      create: region,
    });
  }
  console.log("✓ Viloyatlar yaratildi");

  // 3. Default admin
  const adminPassword = await hash("admin123", 12);
  await prisma.admin.upsert({
    where: { email: "admin@oriental.uz" },
    update: {},
    create: {
      email: "admin@oriental.uz",
      password: adminPassword,
      fullName: "Admin",
      role: "superadmin",
    },
  });
  console.log("✓ Admin yaratildi (admin@oriental.uz / admin123)");

  // 4. Default access code
  await prisma.accessCode.upsert({
    where: { code: "ORIENTAL-2026-TEST" },
    update: {},
    create: {
      code: "ORIENTAL-2026-TEST",
      maxUses: 100,
      isActive: true,
    },
  });
  console.log("✓ Test access kodi yaratildi (ORIENTAL-2026-TEST)");

  // 5. Default sozlamalar
  await prisma.siteSetting.upsert({
    where: { key: "maxSubjectsPerStudent" },
    update: {},
    create: { key: "maxSubjectsPerStudent", value: "1" },
  });
  console.log("✓ Default sozlamalar yaratildi (maxSubjectsPerStudent=1)");

  console.log("\n✅ Seeding tugadi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
