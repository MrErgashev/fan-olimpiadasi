import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const [
      totalStudents,
      totalQuestions,
      totalTests,
      totalAttempts,
      submittedAttempts,
      subjectStats,
    ] = await Promise.all([
      db.student.count({ where: { isArchived: false } }),
      db.question.count({ where: { isActive: true } }),
      db.test.count(),
      db.testAttempt.count(),
      db.testAttempt.count({ where: { isSubmitted: true } }),
      db.subject.findMany({
        where: { isOnline: true },
        select: {
          id: true,
          name: true,
          emoji: true,
          tests: {
            where: { status: "active" },
            select: { id: true, subjectId: true, totalQuestions: true },
          },
          studentSubjects: {
            where: { student: { isArchived: false } },
            select: { id: true },
          },
        },
      }),
    ]);

    // Har bir fan uchun faqat aktiv savollar sonini hisoblash
    const subjectQuestionCounts = await Promise.all(
      subjectStats.map(async (s) => ({
        subjectId: s.id,
        count: await db.question.count({ where: { subjectId: s.id, isActive: true } }),
      }))
    );
    const questionCountMap = Object.fromEntries(
      subjectQuestionCounts.map((q) => [q.subjectId, q.count])
    );

    // Faqat yetarli savollari bor faol testlarni sanash
    const allActiveTests = subjectStats.flatMap((s) => s.tests);
    const activeTests = allActiveTests.filter(
      (t) => (questionCountMap[t.subjectId] || 0) >= t.totalQuestions
    ).length;

    return NextResponse.json({
      totalStudents,
      totalQuestions,
      totalTests,
      activeTests,
      totalAttempts,
      submittedAttempts,
      subjectStats: subjectStats.map((s) => {
        // Fan uchun faqat yetarli savollari bor testlarni sanash
        const validTests = s.tests.filter(
          (t) => (questionCountMap[t.subjectId] || 0) >= t.totalQuestions
        ).length;
        return {
          name: s.name,
          emoji: s.emoji,
          questions: questionCountMap[s.id] || 0,
          tests: validTests,
          students: s.studentSubjects.length,
        };
      }),
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
