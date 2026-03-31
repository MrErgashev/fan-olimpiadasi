import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Vaqti tugagan lekin submit bo'lmagan testlarni avtomatik baholash
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    // Barcha submit bo'lmagan attempt'larni olish
    const expiredAttempts = await db.testAttempt.findMany({
      where: { isSubmitted: false },
      include: {
        test: true,
        attemptAnswers: {
          include: { question: { select: { correctAnswer: true } } },
        },
        attemptQuestions: true,
      },
    });

    const now = Date.now();
    let processedCount = 0;

    for (const attempt of expiredAttempts) {
      const elapsed = (now - new Date(attempt.startedAt).getTime()) / 1000 / 60;
      // Vaqti tugaganlarni baholash (+ 5 daqiqa toleransiya)
      if (elapsed <= attempt.test.durationMinutes + 5) continue;

      // Ball hisoblash
      let totalScore = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      const answerUpdates: { id: string; isCorrect: boolean; score: number }[] = [];

      for (const ans of attempt.attemptAnswers) {
        const aq = attempt.attemptQuestions.find(
          (q) => q.questionId === ans.questionId
        );
        const assignedScore = aq?.assignedScore || 0;

        if (!ans.selectedAnswer) {
          unansweredCount++;
          answerUpdates.push({ id: ans.id, isCorrect: false, score: 0 });
          continue;
        }

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

        answerUpdates.push({ id: ans.id, isCorrect, score });
      }

      // Batch transaction: barcha yangilanishlarni bir vaqtda bajarish
      await db.$transaction([
        ...answerUpdates.map((upd) =>
          db.attemptAnswer.update({
            where: { id: upd.id },
            data: { isCorrect: upd.isCorrect, score: upd.score },
          })
        ),
        db.testAttempt.update({
          where: { id: attempt.id },
          data: {
            isSubmitted: true,
            finishedAt: new Date(),
            totalScore: Math.round(totalScore * 10) / 10,
            correctCount,
            wrongCount,
            unansweredCount,
          },
        }),
      ]);

      processedCount++;
    }

    return NextResponse.json({
      message: `${processedCount} ta vaqti tugagan test baholandi`,
      processedCount,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
