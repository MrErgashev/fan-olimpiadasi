import {
  buildAssignedScoresFromBands,
  type ScoreBandInput,
  type TestQuestionInput,
  validateScoreBands,
} from "@/lib/scoring";

export interface ParsedFixedVariantConfig {
  scoreBands: ScoreBandInput[];
  testQuestions: TestQuestionInput[];
  assignedScores: number[];
  totalScore: number;
}

function normalizeQuestionId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseTestQuestionsInput(input: unknown): TestQuestionInput[] {
  if (Array.isArray(input)) {
    return input
      .map((item, index) => {
        if (typeof item === "string") {
          return { questionId: item, displayOrder: index + 1 };
        }

        if (
          item &&
          typeof item === "object" &&
          "questionId" in item &&
          normalizeQuestionId((item as { questionId?: unknown }).questionId)
        ) {
          const questionId = normalizeQuestionId(
            (item as { questionId?: unknown }).questionId
          )!;
          const rawOrder = Number((item as { displayOrder?: unknown }).displayOrder);

          return {
            questionId,
            displayOrder: Number.isInteger(rawOrder) && rawOrder > 0 ? rawOrder : index + 1,
          };
        }

        return null;
      })
      .filter((item): item is TestQuestionInput => !!item)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((item, index) => ({
        questionId: item.questionId,
        displayOrder: index + 1,
      }));
  }

  return [];
}

export function parseScoreBandsInput(input: unknown): ScoreBandInput[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      return {
        fromQuestion: Number((item as { fromQuestion?: unknown }).fromQuestion),
        toQuestion: Number((item as { toQuestion?: unknown }).toQuestion),
        scorePerQuestion: Number(
          (item as { scorePerQuestion?: unknown }).scorePerQuestion
        ),
      };
    })
    .filter((item): item is ScoreBandInput => !!item);
}

export function validateFixedVariantConfig(
  totalQuestions: number,
  rawTestQuestions: unknown,
  rawScoreBands: unknown
): { ok: true; value: ParsedFixedVariantConfig } | { ok: false; error: string } {
  const testQuestions = parseTestQuestionsInput(rawTestQuestions);
  const scoreBands = parseScoreBandsInput(rawScoreBands);

  if (testQuestions.length !== totalQuestions) {
    return {
      ok: false,
      error: `Tanlangan savollar soni ${totalQuestions} ta bo'lishi kerak`,
    };
  }

  const uniqueQuestionIds = new Set(testQuestions.map((item) => item.questionId));
  if (uniqueQuestionIds.size !== testQuestions.length) {
    return { ok: false, error: "Bir xil savol bir necha marta tanlangan" };
  }

  const bandValidation = validateScoreBands(totalQuestions, scoreBands);
  if (!bandValidation.ok) {
    return bandValidation;
  }

  return {
    ok: true,
    value: {
      scoreBands,
      testQuestions,
      assignedScores: buildAssignedScoresFromBands(totalQuestions, scoreBands),
      totalScore: bandValidation.totalScore,
    },
  };
}
