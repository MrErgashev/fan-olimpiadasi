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
    districtId: z.string().optional(),
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

export const adminCreateStudentSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 harf bo'lishi kerak"),
  lastName: z.string().min(2, "Familiya kamida 2 harf bo'lishi kerak"),
  phone: z
    .string()
    .regex(
      /^\+998\d{9}$/,
      "Telefon raqam +998XXXXXXXXX formatda bo'lishi kerak"
    ),
  password: z.string().min(6, "Parol kamida 6 belgi bo'lishi kerak"),
  schoolName: z.string().min(1, "Maktab nomini kiriting"),
  grade: z.number().min(1).max(11).optional().default(11),
  regionId: z.string().optional(),
  districtId: z.string().optional(),
});

export const adminUpdateStudentSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 harf bo'lishi kerak").optional(),
  lastName: z.string().min(2, "Familiya kamida 2 harf bo'lishi kerak").optional(),
  phone: z
    .string()
    .regex(
      /^\+998\d{9}$/,
      "Telefon raqam +998XXXXXXXXX formatda bo'lishi kerak"
    )
    .optional(),
  schoolName: z.string().min(1, "Maktab nomini kiriting").optional(),
  grade: z.number().min(1).max(11).optional(),
  regionId: z.string().nullable().optional(),
  districtId: z.string().nullable().optional(),
  subjectIds: z.array(z.string()).optional(),
});

export const blockStudentSchema = z.object({
  isBlocked: z.boolean(),
  reason: z.string().optional(),
  duration: z.string().optional(), // "permanent" | "1d" | "3d" | "1w" | "1m" | custom date
  blockedUntil: z.string().optional(), // ISO date string for custom duration
});

export const bulkActionSchema = z.object({
  action: z.enum(["block", "unblock", "delete", "archive", "unarchive"]),
  studentIds: z.array(z.string()).min(1).max(100),
  reason: z.string().optional(),
});

export const testBulkActionSchema = z.object({
  action: z.literal("delete"),
  testIds: z.array(z.string().min(1)).min(1).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminCreateStudentInput = z.infer<typeof adminCreateStudentSchema>;
export type AdminUpdateStudentInput = z.infer<typeof adminUpdateStudentSchema>;
export type BlockStudentInput = z.infer<typeof blockStudentSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
export type TestBulkActionInput = z.infer<typeof testBulkActionSchema>;
