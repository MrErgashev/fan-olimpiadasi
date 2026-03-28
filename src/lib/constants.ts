export const FLUENT_3D = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

export const SUBJECTS = [
  { name: "Matematika", slug: "matematika", icon: "Calculator", emoji: "🔢", image: `${FLUENT_3D}/Abacus/3D/abacus_3d.png`, mode: "online+offline" as const },
  { name: "Informatika", slug: "informatika", icon: "Monitor", emoji: "💻", image: `${FLUENT_3D}/Laptop/3D/laptop_3d.png`, mode: "online+offline" as const },
  { name: "Tarix", slug: "tarix", icon: "BookOpen", emoji: "📜", image: `${FLUENT_3D}/Scroll/3D/scroll_3d.png`, mode: "online+offline" as const },
  { name: "Ingliz tili", slug: "ingliz-tili", icon: "Globe", emoji: "🇬🇧", image: `${FLUENT_3D}/Globe%20with%20meridians/3D/globe_with_meridians_3d.png`, mode: "online+offline" as const },
  { name: "Biologiya", slug: "biologiya", icon: "Dna", emoji: "🧬", image: `${FLUENT_3D}/Dna/3D/dna_3d.png`, mode: "online+offline" as const },
  { name: "Ona tili va adabiyoti", slug: "ona-tili", icon: "BookText", emoji: "📚", image: `${FLUENT_3D}/Books/3D/books_3d.png`, mode: "online+offline" as const },
  { name: "Jismoniy tarbiya", slug: "jismoniy-tarbiya", icon: "Dumbbell", emoji: "🏃", image: `${FLUENT_3D}/Person%20running/Default/3D/person_running_3d_default.png`, mode: "offline" as const },
] as const;

export const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon viloyati",
  "Buxoro viloyati",
  "Farg'ona viloyati",
  "Jizzax viloyati",
  "Xorazm viloyati",
  "Namangan viloyati",
  "Navoiy viloyati",
  "Qashqadaryo viloyati",
  "Samarqand viloyati",
  "Sirdaryo viloyati",
  "Surxondaryo viloyati",
  "Qoraqalpog'iston Respublikasi",
] as const;

export const PRIZES = [
  { place: 1, title: "1-o'rin", prize: "Oriental Universitetida 1 yillik ta'lim granti", icon: "Trophy" },
  { place: 2, title: "2-o'rin", prize: "Zamonaviy noutbuk", icon: "Laptop" },
  { place: 3, title: "3-o'rin", prize: "Smartfon", icon: "Smartphone" },
] as const;

export const SCHEDULE = [
  {
    date: "30-mart",
    day: "Dushanba",
    time: "10:00",
    subjects: ["Matematika", "Informatika", "Tarix", "Ona tili va adabiyoti"],
  },
  {
    date: "31-mart",
    day: "Seshanba",
    time: "10:00",
    subjects: ["Ingliz tili", "Biologiya", "Jismoniy tarbiya"],
  },
] as const;

// Asia/Tashkent (UTC+5) — O'zbekiston DST ishlatmaydi
export const OLYMPIAD_DATE = new Date("2026-03-30T10:00:00+05:00");

export const CONTACT_INFO = {
  address: "Toshkent shahri, Noraztepa ko'chasi, 52-uy",
  telegram: ["@Dilya0103", "@Jonibekjonutkirovich"],
  university: "Oriental Universiteti",
  year: 2026,
} as const;
