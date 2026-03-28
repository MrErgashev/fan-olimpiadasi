import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
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

    if (!accessCode || !accessCode.isActive || accessCode.currentUses >= accessCode.maxUses) {
      return NextResponse.json(
        { error: "Noto'g'ri yoki ishlatib bo'lingan access kod" },
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
        regionId: data.regionId,
        districtId: data.districtId,
        schoolName: data.schoolName,
        accessCodeId: accessCode.id,
        subjects: {
          create: data.subjectIds.map((subjectId) => ({
            subjectId,
          })),
        },
      },
    });

    // Access code foydalanish sonini oshirish
    await db.accessCode.update({
      where: { id: accessCode.id },
      data: { currentUses: { increment: 1 } },
    });

    return NextResponse.json(
      { message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", studentId: student.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server xatosi. Qaytadan urinib ko'ring." },
      { status: 500 }
    );
  }
}
