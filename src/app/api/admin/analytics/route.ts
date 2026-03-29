import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    // 1. Ball taqsimoti (0-20, 21-40, 41-60, 61-80, 81-100)
    const attempts = await db.testAttempt.findMany({
      where: { isSubmitted: true },
      select: { totalScore: true, finishedAt: true },
    });

    const scoreDistribution = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];

    for (const a of attempts) {
      const s = a.totalScore;
      if (s <= 20) scoreDistribution[0].count++;
      else if (s <= 40) scoreDistribution[1].count++;
      else if (s <= 60) scoreDistribution[2].count++;
      else if (s <= 80) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    }

    // 2. Fanlar bo'yicha o'rtacha ball
    const subjectAvg = await db.testAttempt.groupBy({
      by: ["testId"],
      where: { isSubmitted: true },
      _avg: { totalScore: true },
      _count: { id: true },
    });

    const tests = await db.test.findMany({
      select: { id: true, subject: { select: { name: true, emoji: true } } },
    });

    const testMap = new Map(tests.map((t) => [t.id, t.subject]));
    const subjectScores: Record<string, { total: number; count: number; emoji: string }> = {};

    for (const sa of subjectAvg) {
      const subject = testMap.get(sa.testId);
      if (!subject) continue;
      if (!subjectScores[subject.name]) {
        subjectScores[subject.name] = { total: 0, count: 0, emoji: subject.emoji || "" };
      }
      subjectScores[subject.name].total += (sa._avg.totalScore || 0) * sa._count.id;
      subjectScores[subject.name].count += sa._count.id;
    }

    const subjectStats = Object.entries(subjectScores).map(([name, data]) => ({
      subject: `${data.emoji} ${name}`,
      avgScore: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
      attempts: data.count,
    }));

    // 3. Oylik test urinishlari (oxirgi 6 oy)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyMap: Record<string, number> = {};
    for (const a of attempts) {
      if (!a.finishedAt || a.finishedAt < sixMonthsAgo) continue;
      const key = `${a.finishedAt.getFullYear()}-${String(a.finishedAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    }

    // Oxirgi 6 oy uchun to'ldirish
    const monthlyAttempts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthNames = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
      monthlyAttempts.push({
        month: monthNames[d.getMonth()],
        count: monthlyMap[key] || 0,
      });
    }

    // 4. Top 10 o'quvchi
    const topStudentsRaw = await db.testAttempt.groupBy({
      by: ["studentId"],
      where: { isSubmitted: true },
      _avg: { totalScore: true },
      _count: { id: true },
      orderBy: { _avg: { totalScore: "desc" } },
      take: 10,
    });

    const studentIds = topStudentsRaw.map((s) => s.studentId);
    const students = await db.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const studentMap = new Map(students.map((s) => [s.id, `${s.firstName} ${s.lastName}`]));

    const topStudents = topStudentsRaw.map((s) => ({
      name: studentMap.get(s.studentId) || "Noma'lum",
      avgScore: Math.round((s._avg.totalScore || 0) * 10) / 10,
      tests: s._count.id,
    }));

    return NextResponse.json({
      scoreDistribution,
      subjectStats,
      monthlyAttempts,
      topStudents,
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
