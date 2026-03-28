import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const where: Record<string, unknown> = { isSubmitted: true };
    if (subjectId) where.test = { subjectId };

    const results = await db.testAttempt.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, phone: true, schoolName: true, region: { select: { name: true } } } },
        test: { include: { subject: { select: { name: true, emoji: true } } } },
      },
      orderBy: { totalScore: "desc" },
    });

    return NextResponse.json({
      results: results.map((r, i) => ({
        rank: i + 1,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        phone: r.student.phone,
        school: r.student.schoolName,
        region: r.student.region?.name || "",
        subjectName: r.test.subject.name,
        subjectEmoji: r.test.subject.emoji,
        testName: r.test.name,
        totalScore: r.totalScore,
        correctCount: r.correctCount,
        wrongCount: r.wrongCount,
        unansweredCount: r.unansweredCount,
        finishedAt: r.finishedAt?.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
