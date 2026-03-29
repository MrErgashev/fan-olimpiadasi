import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const testId = searchParams.get("testId");
    const search = searchParams.get("search");

    const where: Prisma.TestAttemptWhereInput = { isSubmitted: true };

    if (testId) {
      where.testId = testId;
    } else if (subjectId) {
      where.test = { subjectId };
    }

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      };
    }

    const results = await db.testAttempt.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            schoolName: true,
            region: { select: { name: true } },
          },
        },
        test: { include: { subject: { select: { name: true, emoji: true } } } },
      },
      orderBy: { totalScore: "desc" },
      take: 200,
    });

    return NextResponse.json({
      results: results.map((r, i) => ({
        rank: i + 1,
        studentId: r.student.id,
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
