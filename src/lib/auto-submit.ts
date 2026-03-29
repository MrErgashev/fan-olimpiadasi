import { db } from "@/lib/db";

/**
 * Vaqti tugagan attemptni avtomatik baholash va submit qilish.
 * Bu funksiya question fetch va answer save vaqtida, shuningdek
 * admin cleanup endpointida ishlatiladi.
 */
export async function autoSubmitAttempt(attemptId: string): Promise<{
  submitted: boolean;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}> {
  const attempt = await db.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      attemptAnswers: {
        include: { question: { select: { correctAnswer: true } } },
      },
      attemptQuestions: true,
    },
  });

  if (!attempt || attempt.isSubmitted) {
    return { submitted: false, totalScore: 0, correctCount: 0, wrongCount: 0, unansweredCount: 0 };
  }

  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

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

  totalScore = Math.round(totalScore * 10) / 10;

  await db.testAttempt.update({
    where: { id: attemptId },
    data: {
      isSubmitted: true,
      finishedAt: new Date(),
      totalScore,
      correctCount,
      wrongCount,
      unansweredCount,
    },
  });

  return { submitted: true, totalScore, correctCount, wrongCount, unansweredCount };
}
