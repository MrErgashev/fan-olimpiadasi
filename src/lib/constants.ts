export const NOTO_EMOJI_CDN = "https://fonts.gstatic.com/s/e/notoemoji/latest";

export const SUBJECTS = [
  { name: "Matematika", slug: "matematika", icon: "Calculator", emoji: "🔢", image: `${NOTO_EMOJI_CDN}/1f9ee/512.png`, isOnline: true },
  { name: "Informatika", slug: "informatika", icon: "Monitor", emoji: "💻", image: `${NOTO_EMOJI_CDN}/1f4bb/512.png`, isOnline: true },
  { name: "Tarix", slug: "tarix", icon: "BookOpen", emoji: "📜", image: `${NOTO_EMOJI_CDN}/1f4dc/512.png`, isOnline: true },
  { name: "Ingliz tili", slug: "ingliz-tili", icon: "Globe", emoji: "🇬🇧", image: `${NOTO_EMOJI_CDN}/1f310/512.png`, isOnline: true },
  { name: "Biologiya", slug: "biologiya", icon: "Dna", emoji: "🧬", image: `${NOTO_EMOJI_CDN}/1f9ec/512.png`, isOnline: true },
  { name: "Ona tili va adabiyoti", slug: "ona-tili", icon: "BookText", emoji: "📚", image: `${NOTO_EMOJI_CDN}/1f4da/512.png`, isOnline: false },
  { name: "Jismoniy tarbiya", slug: "jismoniy-tarbiya", icon: "Dumbbell", emoji: "🏃", image: `${NOTO_EMOJI_CDN}/1f3c3/512.png`, isOnline: false },
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

// Asia/Tashkent (UTC+5) — O'zbekiston DST ishlatmaydi
export const OLYMPIAD_DATE = new Date("2026-03-30T10:00:00+05:00");

export const CONTACT_INFO = {
  address: "Toshkent shahri, Noraztepa ko'chasi, 52-uy",
  telegram: ["@Dilya0103", "@Jonibekjonutkirovich"],
  university: "Oriental Universiteti",
  year: 2026,
} as const;
