import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateScoreDistribution, getQuestionScore } from "@/lib/scoring";
import { headers } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const studentId = session.user.id;
    const testId = params.id;

    // Test mavjudligini tekshirish
    const test = await db.test.findUnique({
      where: { id: testId },
      include: { subject: true },
    });

    if (!test) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    if (test.status !== "active") {
      return NextResponse.json({ error: "Test faol emas" }, { status: 400 });
    }

    // Vaqt tekshiruvi
    const now = new Date();
    if (test.startsAt && now < test.startsAt) {
      return NextResponse.json(
        { error: "Test hali boshlanmagan" },
        { status: 400 }
      );
    }
    if (test.endsAt && now > test.endsAt) {
      return NextResponse.json(
        { error: "Test vaqti tugagan" },
        { status: 400 }
      );
    }

    // Oldin attempt bormi tekshirish
    const existingAttempt = await db.testAttempt.findUnique({
      where: {
        studentId_testId: { studentId, testId },
      },
    });

    if (existingAttempt) {
      if (existingAttempt.isSubmitted) {
        return NextResponse.json(
          { error: "Siz bu testni allaqachon topshirgansiz" },
          { status: 400 }
        );
      }
      // Davom ettirish mumkin
      return NextResponse.json({
        attemptId: existingAttempt.id,
        message: "Mavjud urinish davom ettirilmoqda",
      });
    }

    // IP va User-Agent olish
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // RANDOM savollar tanlash
    const allQuestions = await db.question.findMany({
      where: {
        subjectId: test.subjectId,
        isActive: true,
      },
      select: { id: true },
    });

    if (allQuestions.length < test.totalQuestions) {
      return NextResponse.json(
        { error: "Bazada yetarli savol yo'q" },
        { status: 400 }
      );
    }

    // Fisher-Yates shuffle bilan random tanlash
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, test.totalQuestions);

    // Ball taqsimotini hisoblash
    const scoreDist = calculateScoreDistribution({
      totalQuestions: test.totalQuestions,
      totalScore: test.totalScore,
    });

    // Attempt yaratish + savollarni biriktirish (transaction)
    const attempt = await db.$transaction(async (tx) => {
      const newAttempt = await tx.testAttempt.create({
        data: {
          studentId,
          testId,
          ipAddress: ip,
          userAgent,
        },
      });

      // Har bir savol uchun attempt_questions va attempt_answers yaratish
      const questionData = selected.map((q, index) => ({
        attemptId: newAttempt.id,
        questionId: q.id,
        displayOrder: index + 1,
        assignedScore: getQuestionScore(index, scoreDist),
      }));

      await tx.attemptQuestion.createMany({ data: questionData });

      // Bo'sh javoblar yaratish (keyinchalik to'ldiriladi)
      const answerData = selected.map((q, index) => ({
        attemptId: newAttempt.id,
        questionId: q.id,
        displayOrder: index + 1,
      }));

      await tx.attemptAnswer.createMany({ data: answerData });

      return newAttempt;
    });

    return NextResponse.json({
      attemptId: attempt.id,
      totalQuestions: test.totalQuestions,
      durationMinutes: test.durationMinutes,
      startedAt: attempt.startedAt.toISOString(),
    });
  } catch (error) {
    console.error("Test start error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
