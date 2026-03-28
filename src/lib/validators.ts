import { z } from "zod";

export const accessCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Kodni kiriting")
    .regex(/^ORIENTAL-\d{4}-[A-Z0-9]{4}$/, "Noto'g'ri kod formati"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Ism kamida 2 harf bo'lishi kerak"),
    lastName: z.string().min(2, "Familiya kamida 2 harf bo'lishi kerak"),
    phone: z
      .string()
      .regex(
        /^\+998\d{9}$/,
        "Telefon raqam +998XXXXXXXXX formatda bo'lishi kerak"
      ),
    regionId: z.string().min(1, "Viloyatni tanlang"),
    districtId: z.string().min(1, "Tuman/shaharni tanlang"),
    schoolName: z.string().min(1, "Maktab nomini kiriting"),
    subjectIds: z
      .array(z.string())
      .min(1, "Kamida bitta fan tanlang"),
    password: z.string().min(6, "Parol kamida 6 belgi bo'lishi kerak"),
    confirmPassword: z.string(),
    accessCode: z.string(),
    consent: z.literal(true, {
      message: "Shaxsiy ma'lumotlarni qayta ishlashga rozilik bering",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmaydi",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  phone: z
    .string()
    .regex(
      /^\+998\d{9}$/,
      "Telefon raqam +998XXXXXXXXX formatda bo'lishi kerak"
    ),
  password: z.string().min(1, "Parolni kiriting"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
