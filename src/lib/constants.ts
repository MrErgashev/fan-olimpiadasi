export const SUBJECTS = [
  { name: "Matematika", slug: "matematika", icon: "Calculator", emoji: "🔢", isOnline: true },
  { name: "Informatika", slug: "informatika", icon: "Monitor", emoji: "💻", isOnline: true },
  { name: "Tarix", slug: "tarix", icon: "BookOpen", emoji: "📜", isOnline: true },
  { name: "Ingliz tili", slug: "ingliz-tili", icon: "Globe", emoji: "🇬🇧", isOnline: true },
  { name: "Biologiya", slug: "biologiya", icon: "Dna", emoji: "🧬", isOnline: true },
  { name: "Ona tili va adabiyoti", slug: "ona-tili", icon: "BookText", emoji: "📚", isOnline: false },
  { name: "Jismoniy tarbiya", slug: "jismoniy-tarbiya", icon: "Dumbbell", emoji: "🏃", isOnline: false },
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
    day: "Shanba",
    time: "10:00",
    subjects: ["Matematika", "Informatika", "Tarix", "Ona tili va adabiyoti"],
  },
  {
    date: "31-mart",
    day: "Yakshanba",
    time: "10:00",
    subjects: ["Ingliz tili", "Biologiya", "Jismoniy tarbiya"],
  },
] as const;

export const OLYMPIAD_DATE = new Date("2026-03-30T10:00:00+05:00");

export const CONTACT_INFO = {
  address: "Toshkent shahri, Noraztepa ko'chasi, 52-uy",
  telegram: ["@Dilya0103", "@Jonibekjonutkirovich"],
  university: "Oriental Universiteti",
  year: 2026,
} as const;
