import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { getMaxSubjects } from "@/lib/settings";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit: 3 so'rov/daqiqa per IP
    const ip = getClientIp(req);
    const { success } = checkRateLimit(`register:${ip}`, 3, 60_000);
    if (!success) return rateLimitResponse();

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues?.[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Telefon raqam tekshiruvi
    const existingStudent = await db.student.findUnique({
      where: { phone: data.phone },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" },
        { status: 409 }
      );
    }

    // Access code tekshiruvi
    const accessCode = await db.accessCode.findUnique({
      where: { code: data.accessCode },
    });

    if (!accessCode || !accessCode.isActive) {
      return NextResponse.json(
        { error: "Noto'g'ri yoki ishlatib bo'lingan access kod" },
        { status: 400 }
      );
    }

    if (accessCode.currentUses >= accessCode.maxUses) {
      return NextResponse.json(
        { error: "Noto'g'ri yoki ishlatib bo'lingan access kod" },
        { status: 400 }
      );
    }

    if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
      return NextResponse.json(
        { error: "Bu kodning amal qilish muddati tugagan" },
        { status: 400 }
      );
    }

    // Viloyatni nom bo'yicha topish (forma nom yuboradi, ID emas)
    const region = await db.region.findFirst({
      where: { name: data.regionId },
    });

    // Fanlarni slug bo'yicha topish (forma slug yuboradi, ID emas)
    const subjects = await db.subject.findMany({
      where: { slug: { in: data.subjectIds } },
    });

    if (subjects.length === 0) {
      return NextResponse.json(
        { error: "Kamida bitta fan tanlang" },
        { status: 400 }
      );
    }

    // Maksimal fan soni cheklovi
    const maxSubjects = await getMaxSubjects();
    if (maxSubjects > 0 && subjects.length > maxSubjects) {
      return NextResponse.json(
        { error: `Maksimal ${maxSubjects} ta fan tanlash mumkin` },
        { status: 400 }
      );
    }

    // Parolni hashlash
    const hashedPassword = await hash(data.password, 12);

    // O'quvchi yaratish
    const student = await db.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: hashedPassword,
        regionId: region?.id || null,
        schoolName: data.schoolName,
        accessCodeId: accessCode.id,
        subjects: {
          create: subjects.map((s) => ({
            subjectId: s.id,
          })),
        },
      },
    });

    // Access code foydalanish sonini atomik oshirish (race condition himoyasi)
    const updated = await db.accessCode.updateMany({
      where: {
        id: accessCode.id,
        currentUses: { lt: accessCode.maxUses },
      },
      data: { currentUses: { increment: 1 } },
    });

    if (updated.count === 0) {
      // Race condition: boshqa so'rov allaqachon limitga yetgan
      await db.student.delete({ where: { id: student.id } });
      return NextResponse.json(
        { error: "Access kod limiti tugagan. Qaytadan urinib ko'ring." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", studentId: student.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Server xatosi. Qaytadan urinib ko'ring." },
      { status: 500 }
    );
  }
}
