import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
        subjects: { include: { subject: { select: { name: true, emoji: true } } } },
        _count: { select: { testAttempts: true } },
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
