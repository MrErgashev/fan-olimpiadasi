import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma, SecurityEvent } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { attemptId, events } = await req.json();

    if (!attemptId || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Noto'g'ri ma'lumot" },
        { status: 400 }
      );
    }

    const validEvents: SecurityEvent[] = [
      "TAB_SWITCH", "FULLSCREEN_EXIT", "COPY_ATTEMPT", "DEVTOOLS_OPEN",
      "RIGHT_CLICK", "KEYBOARD_SHORTCUT", "WINDOW_BLUR", "MULTIPLE_DEVICE", "SUSPICIOUS_SPEED",
    ];

    const data: Prisma.SecurityLogCreateManyInput[] = events
      .filter((e: { type: string }) => validEvents.includes(e.type as SecurityEvent))
      .map((e: { type: string; details?: object }) => ({
        attemptId,
        studentId: session.user.id,
        eventType: e.type as SecurityEvent,
        details: e.details ? (e.details as Prisma.InputJsonValue) : Prisma.JsonNull,
      }));

    if (data.length > 0) {
      await db.securityLog.createMany({ data });
    }

    return NextResponse.json({ logged: true });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
