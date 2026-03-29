import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const student = await db.student.findUnique({
      where: { id: params.id },
      select: { id: true, isArchived: true },
    });

    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const isArchiving = !student.isArchived;

    await db.student.update({
      where: { id: params.id },
      data: {
        isArchived: isArchiving,
        archivedAt: isArchiving ? new Date() : null,
      },
    });

    return NextResponse.json({
      message: isArchiving ? "O'quvchi arxivlandi" : "O'quvchi arxivdan chiqarildi",
      isArchived: isArchiving,
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
