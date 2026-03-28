import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { blockStudentSchema } from "@/lib/validators";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = blockStudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validatsiya xatosi" }, { status: 400 });
    }

    const { isBlocked, reason } = parsed.data;

    const student = await db.student.update({
      where: { id: params.id },
      data: {
        isBlocked,
        blockedAt: isBlocked ? new Date() : null,
        blockedReason: isBlocked ? reason || null : null,
      },
    });

    return NextResponse.json({ student });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
