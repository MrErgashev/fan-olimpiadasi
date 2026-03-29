import { db } from "@/lib/db";

interface AttemptAnswerProgressRow {
  displayOrder: number;
  selectedAnswer: string | null;
}

export interface AttemptProgressMeta {
  answeredCount: number;
  answeredQuestionNumbers: number[];
  remainingCount: number;
  canManualSubmit: boolean;
}

export function buildAttemptProgressMeta(
  answers: AttemptAnswerProgressRow[],
  totalQuestions: number
): AttemptProgressMeta {
  const answeredQuestionNumbers = answers
    .filter((answer) => !!answer.selectedAnswer)
    .map((answer) => answer.displayOrder)
    .sort((a, b) => a - b);

  const answeredCount = answeredQuestionNumbers.length;
  const remainingCount = Math.max(0, totalQuestions - answeredCount);

  return {
    answeredCount,
    answeredQuestionNumbers,
    remainingCount,
    canManualSubmit: totalQuestions > 0 && remainingCount === 0,
  };
}

export async function getAttemptProgressMeta(
  attemptId: string,
  totalQuestions: number
) {
  const answers = await db.attemptAnswer.findMany({
    where: { attemptId },
    select: {
      displayOrder: true,
      selectedAnswer: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  return buildAttemptProgressMeta(answers, totalQuestions);
}
