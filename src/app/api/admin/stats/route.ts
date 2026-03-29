import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

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
      subjects,
      activeTestsList,
    ] = await Promise.all([
      db.student.count({ where: { isArchived: false } }),
      db.question.count({ where: { isActive: true } }),
      db.test.count(),
      db.testAttempt.count(),
      db.testAttempt.count({ where: { isSubmitted: true } }),
      db.subject.findMany({
        where: { isOnline: true },
        select: { id: true, name: true, emoji: true },
      }),
      db.test.findMany({
        where: { status: "active" },
        select: { id: true, subjectId: true, totalQuestions: true },
      }),
    ]);

    // Arxivlanmagan o'quvchilar ID larini olish
    const activeStudentIds = await db.student.findMany({
      where: { isArchived: false },
      select: { id: true },
    });
    const activeStudentIdSet = new Set(activeStudentIds.map((s) => s.id));

    // Har bir fan uchun aktiv savollar soni va o'quvchilar sonini hisoblash
    const subjectCounts = await Promise.all(
      subjects.map(async (s) => {
        const [questionCount, allStudentSubjects] = await Promise.all([
          db.question.count({ where: { subjectId: s.id, isActive: true } }),
          db.studentSubject.findMany({
            where: { subjectId: s.id },
            select: { studentId: true },
          }),
        ]);
        const studentCount = allStudentSubjects.filter(
          (ss) => activeStudentIdSet.has(ss.studentId)
        ).length;
        return { subjectId: s.id, questionCount, studentCount };
      })
    );
    const questionCountMap = Object.fromEntries(
      subjectCounts.map((c) => [c.subjectId, c.questionCount])
    );
    const studentCountMap = Object.fromEntries(
      subjectCounts.map((c) => [c.subjectId, c.studentCount])
    );

    // Faqat yetarli savollari bor faol testlarni sanash
    const activeTests = activeTestsList.filter(
      (t) => (questionCountMap[t.subjectId] || 0) >= t.totalQuestions
    ).length;

    // Fan bo'yicha faol testlar soni
    const subjectActiveTests: Record<string, number> = {};
    for (const t of activeTestsList) {
      if ((questionCountMap[t.subjectId] || 0) >= t.totalQuestions) {
        subjectActiveTests[t.subjectId] = (subjectActiveTests[t.subjectId] || 0) + 1;
      }
    }

    return NextResponse.json({
      totalStudents,
      totalQuestions,
      totalTests,
      activeTests,
      totalAttempts,
      submittedAttempts,
      subjectStats: subjects.map((s) => ({
        name: s.name,
        emoji: s.emoji,
        questions: questionCountMap[s.id] || 0,
        tests: subjectActiveTests[s.id] || 0,
        students: studentCountMap[s.id] || 0,
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("Stack:", error.stack);
    }
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
