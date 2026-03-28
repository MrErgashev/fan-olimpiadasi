import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMaxSubjects } from "@/lib/settings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const student = await db.student.findUnique({
      where: { id: session.user.id },
      include: {
        region: true,
        subjects: {
          include: { subject: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    return NextResponse.json({
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        schoolName: student.schoolName,
        regionName: student.region?.name || "",
        subjects: student.subjects.map((ss) => ({
          id: ss.subject.id,
          slug: ss.subject.slug,
          name: ss.subject.name,
          emoji: ss.subject.emoji,
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const { subjectIds } = body;

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return NextResponse.json({ error: "Kamida bitta fan tanlang" }, { status: 400 });
    }

    // Fanlarni tekshirish (slug bo'yicha)
    const subjects = await db.subject.findMany({
      where: { slug: { in: subjectIds }, isOnline: true },
    });

    if (subjects.length === 0) {
      return NextResponse.json({ error: "Hech qanday fan topilmadi" }, { status: 400 });
    }

    // maxSubjects cheklovi
    const maxSubjects = await getMaxSubjects();
    if (maxSubjects > 0 && subjects.length > maxSubjects) {
      return NextResponse.json(
        { error: `Maksimal ${maxSubjects} ta fan tanlash mumkin` },
        { status: 400 }
      );
    }

    // Transaction: eski fanlarni o'chirish + yangilarini yaratish
    await db.$transaction([
      db.studentSubject.deleteMany({
        where: { studentId: session.user.id },
      }),
      db.studentSubject.createMany({
        data: subjects.map((s) => ({
          studentId: session.user.id,
          subjectId: s.id,
        })),
      }),
    ]);

    return NextResponse.json({ message: "Fanlar yangilandi" });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
