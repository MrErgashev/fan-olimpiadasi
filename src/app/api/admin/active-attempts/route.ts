import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    // Hozir test ishlayotgan o'quvchilar (submit bo'lmagan va vaqti tugamagan)
    const activeAttempts = await db.testAttempt.findMany({
      where: {
        isSubmitted: false,
      },
      include: {
        student: { select: { firstName: true, lastName: true, phone: true } },
        test: { select: { name: true, durationMinutes: true, subject: { select: { name: true, emoji: true } } } },
      },
      orderBy: { startedAt: "desc" },
    });

    const now = Date.now();

    // Faqat hali vaqti tugamaganlarni filtrlash
    const active = activeAttempts
      .filter((a) => {
        const elapsed = (now - new Date(a.startedAt).getTime()) / 1000 / 60;
        return elapsed <= a.test.durationMinutes + 2; // 2 daqiqa toleransiya
      })
      .map((a) => {
        const elapsed = (now - new Date(a.startedAt).getTime()) / 1000 / 60;
        const remaining = Math.max(0, a.test.durationMinutes - elapsed);
        return {
          studentName: `${a.student.firstName} ${a.student.lastName}`,
          phone: a.student.phone,
          testName: a.test.name,
          subjectName: a.test.subject.name,
          subjectEmoji: a.test.subject.emoji,
          startedAt: a.startedAt.toISOString(),
          remainingMinutes: Math.round(remaining),
          durationMinutes: a.test.durationMinutes,
        };
      });

    return NextResponse.json({ activeAttempts: active });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
