import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, target, studentId, subjectId } = body;

    if (!title || !message || !target) {
      return NextResponse.json({ error: "Title, message va target kerak" }, { status: 400 });
    }

    let studentIds: string[] = [];

    if (target === "all") {
      // Barcha faol o'quvchilarga
      const students = await db.student.findMany({
        where: { isBlocked: false, isArchived: false },
        select: { id: true },
      });
      studentIds = students.map((s) => s.id);
    } else if (target === "student" && studentId) {
      // Bitta o'quvchiga
      studentIds = [studentId];
    } else if (target === "subject" && subjectId) {
      // Fan bo'yicha guruhga
      const studentSubjects = await db.studentSubject.findMany({
        where: { subjectId },
        select: { studentId: true },
      });
      studentIds = studentSubjects.map((ss) => ss.studentId);
    } else {
      return NextResponse.json({ error: "Noto'g'ri target" }, { status: 400 });
    }

    if (studentIds.length === 0) {
      return NextResponse.json({ error: "Hech qanday o'quvchi topilmadi" }, { status: 400 });
    }

    // Batch yaratish
    const notifications = studentIds.map((id) => ({
      recipientId: id,
      recipientType: "student",
      title,
      message,
    }));

    // 500 tadan batch qilish
    let created = 0;
    for (let i = 0; i < notifications.length; i += 500) {
      const batch = notifications.slice(i, i + 500);
      const result = await db.notification.createMany({ data: batch });
      created += result.count;
    }

    return NextResponse.json({
      success: true,
      message: `${created} ta o'quvchiga bildirishnoma yuborildi`,
      count: created,
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
