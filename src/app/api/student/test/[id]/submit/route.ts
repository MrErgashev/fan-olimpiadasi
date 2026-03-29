import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildAttemptProgressMeta } from "@/lib/test-attempt-progress";

type SubmissionMode = "manual" | "auto_timeout";

// Testni yakunlash — server-side ball hisoblash
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
    const body = await req.json().catch(() => ({}));
    const submissionMode: SubmissionMode =
      body?.submissionMode === "auto_timeout" ? "auto_timeout" : "manual";

    const attempt = await db.testAttempt.findUnique({
      where: { studentId_testId: { studentId, testId } },
      include: {
        test: true,
        attemptAnswers: {
          include: {
            question: { select: { correctAnswer: true } },
          },
        },
        attemptQuestions: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Urinish topilmadi" },
        { status: 404 }
      );
    }

    if (attempt.isSubmitted) {
      return NextResponse.json(
        { error: "Test allaqachon topshirilgan" },
        { status: 400 }
      );
    }

    const progressMeta = buildAttemptProgressMeta(
      attempt.attemptAnswers,
      attempt.test.totalQuestions
    );

    if (submissionMode === "manual" && !progressMeta.canManualSubmit) {
      return NextResponse.json(
        {
          error:
            "Barcha savollarga javob berganingizdan keyin testni yakunlashingiz mumkin",
          ...progressMeta,
        },
        { status: 400 }
      );
    }

    // Ball hisoblash
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    // Har bir javobni tekshirish
    for (const ans of attempt.attemptAnswers) {
      const aq = attempt.attemptQuestions.find(
        (q) => q.questionId === ans.questionId
      );
      const assignedScore = aq?.assignedScore || 0;

      if (!ans.selectedAnswer) {
        unansweredCount++;
        await db.attemptAnswer.update({
          where: { id: ans.id },
          data: { isCorrect: false, score: 0 },
        });
        continue;
      }

      // Shuffle mapping ni hisobga olish
      let actualAnswer = ans.selectedAnswer;
      const shuffleMap = ans.shuffledOptions as Record<string, string> | null;
      if (shuffleMap && shuffleMap[ans.selectedAnswer]) {
        actualAnswer = shuffleMap[ans.selectedAnswer];
      }

      const isCorrect = actualAnswer === ans.question.correctAnswer;
      const score = isCorrect ? assignedScore : 0;

      if (isCorrect) {
        correctCount++;
        totalScore += score;
      } else {
        wrongCount++;
      }

      await db.attemptAnswer.update({
        where: { id: ans.id },
        data: { isCorrect, score },
      });
    }

    // Attempt ni yangilash
    await db.testAttempt.update({
      where: { id: attempt.id },
      data: {
        isSubmitted: true,
        finishedAt: new Date(),
        totalScore: Math.round(totalScore * 10) / 10,
        correctCount,
        wrongCount,
        unansweredCount,
      },
    });

    return NextResponse.json({
      submitted: true,
      totalScore: Math.round(totalScore * 10) / 10,
      correctCount,
      wrongCount,
      unansweredCount,
      totalQuestions: attempt.test.totalQuestions,
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
