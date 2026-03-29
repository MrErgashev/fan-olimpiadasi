import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const studentId = session.user.id;

    // O'quvchi tanlagan fanlarni olish
    const studentSubjects = await db.studentSubject.findMany({
      where: { studentId },
      select: { subjectId: true },
    });
    const subjectIds = studentSubjects.map((s) => s.subjectId);

    // Shu fanlar bo'yicha testlarni olish
    const tests = await db.test.findMany({
      where: {
        subjectId: { in: subjectIds },
        status: { not: "draft" },
      },
      include: {
        subject: { select: { name: true, emoji: true } },
        testAttempts: {
          where: { studentId },
          select: {
            isSubmitted: true,
            totalScore: true,
            startedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    const result = tests.map((test) => {
      const attempt = test.testAttempts[0];
      let status: "waiting" | "active" | "in_progress" | "completed" | "closed" = "waiting";

      if (attempt?.isSubmitted) {
        status = "completed";
      } else if (test.status === "closed") {
        status = "closed";
      } else if (test.status === "active") {
        if (attempt && !attempt.isSubmitted) {
          // O'quvchi testni boshlagan lekin hali tugatmagan
          const elapsed = (now.getTime() - new Date(attempt.startedAt).getTime()) / 1000 / 60;
          if (elapsed <= test.durationMinutes + 1) {
            status = "in_progress";
          } else {
            status = "closed"; // Vaqti tugagan, lekin submit bo'lmagan
          }
        } else if (test.startsAt && new Date(test.startsAt) > now) {
          status = "waiting";
        } else if (test.endsAt && new Date(test.endsAt) < now) {
          status = "closed";
        } else {
          status = "active";
        }
      }

      return {
        id: test.id,
        name: test.name,
        subjectName: test.subject.name,
        subjectEmoji: test.subject.emoji || "📝",
        totalQuestions: test.totalQuestions,
        durationMinutes: test.durationMinutes,
        status,
        score: attempt?.isSubmitted ? attempt.totalScore : undefined,
        startsAt: test.startsAt?.toISOString(),
        endsAt: test.endsAt?.toISOString(),
        requiresPin: !!test.accessPin,
      };
    });

    return NextResponse.json({ tests: result });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
