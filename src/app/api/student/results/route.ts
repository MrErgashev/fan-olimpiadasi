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

    const attempts = await db.testAttempt.findMany({
      where: {
        studentId: session.user.id,
        isSubmitted: true,
      },
      include: {
        test: {
          include: {
            subject: { select: { name: true, emoji: true } },
          },
        },
      },
      orderBy: { finishedAt: "desc" },
    });

    const results = attempts.map((a) => ({
      attemptId: a.id,
      testName: a.test.name,
      subjectName: a.test.subject.name,
      subjectEmoji: a.test.subject.emoji || "📝",
      totalScore: a.totalScore,
      correctCount: a.correctCount,
      wrongCount: a.wrongCount,
      unansweredCount: a.unansweredCount,
      totalQuestions: a.test.totalQuestions,
      finishedAt: a.finishedAt?.toISOString() || "",
      showResultToStudent: a.test.showResultToStudent,
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
