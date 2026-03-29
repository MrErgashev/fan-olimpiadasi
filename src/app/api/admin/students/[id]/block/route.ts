import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { blockStudentSchema } from "@/lib/validators";

function calculateBlockedUntil(duration?: string): Date | null {
  if (!duration || duration === "permanent") return null;
  const now = new Date();
  switch (duration) {
    case "1d": return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    case "3d": return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case "1w": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "1m": return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default: {
      // Try parsing as ISO date
      const date = new Date(duration);
      return isNaN(date.getTime()) ? null : date;
    }
  }
}

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

    const { isBlocked, reason, duration } = parsed.data;
    const blockedUntil = isBlocked ? calculateBlockedUntil(duration) : null;

    const student = await db.student.update({
      where: { id: params.id },
      data: {
        isBlocked,
        blockedAt: isBlocked ? new Date() : null,
        blockedReason: isBlocked ? reason || null : null,
        blockedUntil,
      },
    });

    // Save block history
    await db.blockHistory.create({
      data: {
        studentId: params.id,
        action: isBlocked ? "block" : "unblock",
        reason: reason || null,
        duration: isBlocked ? (duration || "permanent") : null,
        blockedBy: session.user.id,
      },
    });

    return NextResponse.json({ student });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
