import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUpdateStudentSchema } from "@/lib/validators";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const student = await db.student.findUnique({
      where: { id: params.id },
      include: { _count: { select: { testAttempts: true } } },
    });

    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    await db.student.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "O'quvchi o'chirildi" });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const student = await db.student.findUnique({
      where: { id: params.id },
      include: {
        region: { select: { name: true } },
        district: { select: { name: true } },
        subjects: { include: { subject: { select: { id: true, name: true, emoji: true, slug: true } } } },
        testAttempts: {
          include: { test: { select: { name: true, subject: { select: { name: true, emoji: true } } } } },
          orderBy: { startedAt: "desc" },
        },
        blockHistory: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        securityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { testAttempts: true, subjects: true, securityLogs: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = adminUpdateStudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
    }

    const { subjectIds, ...data } = parsed.data;

    // Check phone uniqueness if changing
    if (data.phone) {
      const existing = await db.student.findFirst({
        where: { phone: data.phone, id: { not: params.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" }, { status: 409 });
      }
    }

    const student = await db.student.update({
      where: { id: params.id },
      data,
    });

    // Update subjects if provided
    if (subjectIds !== undefined) {
      await db.studentSubject.deleteMany({ where: { studentId: params.id } });
      if (subjectIds.length > 0) {
        await db.studentSubject.createMany({
          data: subjectIds.map((subjectId) => ({
            studentId: params.id,
            subjectId,
          })),
        });
      }
    }

    return NextResponse.json({ student });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
