/**
 * Ball hisoblash logikasi (PRD bo'yicha)
 *
 * Misol: 30 savol, 100 ball
 * ball_per_savol = Math.floor((100/30) * 10) / 10 = 3.3
 * qoldiq = 100 - (3.3 * 30) = 1.0
 * extra_questions = Math.round(1.0 / 0.1) = 10
 * 10 ta savol 3.4 ball, 20 ta savol 3.3 ball
 * 10 * 3.4 + 20 * 3.3 = 34 + 66 = 100
 */

export interface ScoreConfig {
  totalQuestions: number;
  totalScore: number;
}

export type TestScoringMode = "distributed" | "banded_fixed_variant";

export interface ScoreBandInput {
  fromQuestion: number;
  toQuestion: number;
  scorePerQuestion: number;
}

export interface TestQuestionInput {
  questionId: string;
  displayOrder: number;
}

export interface ScoreDistribution {
  normalScore: number;
  extraScore: number;
  extraCount: number;
  normalCount: number;
}

export function calculateScoreDistribution(
  config: ScoreConfig
): ScoreDistribution {
  const { totalQuestions, totalScore } = config;

  const baseScore =
    Math.floor((totalScore / totalQuestions) * 10) / 10;
  const remainder = totalScore - baseScore * totalQuestions;
  // Round remainder to avoid floating point issues
  const extraCount = Math.round(remainder / 0.1);
  const normalCount = totalQuestions - extraCount;

  return {
    normalScore: baseScore,
    extraScore: baseScore + 0.1,
    extraCount,
    normalCount,
  };
}

/**
 * Har bir savol uchun ball qaytaradi.
 * Birinchi `extraCount` ta savol `extraScore`, qolganlari `normalScore`.
 */
export function getQuestionScore(
  questionIndex: number,
  distribution: ScoreDistribution
): number {
  if (questionIndex < distribution.extraCount) {
    return distribution.extraScore;
  }
  return distribution.normalScore;
}

export function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateBandsTotal(bands: ScoreBandInput[]): number {
  return roundScore(
    bands.reduce((total, band) => {
      const questionCount = band.toQuestion - band.fromQuestion + 1;
      return total + questionCount * band.scorePerQuestion;
    }, 0)
  );
}

export function validateScoreBands(
  totalQuestions: number,
  bands: ScoreBandInput[]
): { ok: true; totalScore: number } | { ok: false; error: string } {
  if (!Array.isArray(bands) || bands.length === 0) {
    return { ok: false, error: "Kamida bitta ball diapazoni kerak" };
  }

  const normalized = [...bands]
    .map((band) => ({
      fromQuestion: Number(band.fromQuestion),
      toQuestion: Number(band.toQuestion),
      scorePerQuestion: Number(band.scorePerQuestion),
    }))
    .sort((a, b) => a.fromQuestion - b.fromQuestion);

  let expectedStart = 1;
  for (const band of normalized) {
    if (
      !Number.isInteger(band.fromQuestion) ||
      !Number.isInteger(band.toQuestion) ||
      band.fromQuestion < 1 ||
      band.toQuestion < band.fromQuestion
    ) {
      return { ok: false, error: "Diapazon chegaralari noto'g'ri" };
    }

    if (band.fromQuestion !== expectedStart) {
      return {
        ok: false,
        error: "Diapazonlar uzluksiz bo'lishi kerak",
      };
    }

    if (!Number.isFinite(band.scorePerQuestion) || band.scorePerQuestion <= 0) {
      return { ok: false, error: "Har bir diapazon uchun ball 0 dan katta bo'lishi kerak" };
    }

    expectedStart = band.toQuestion + 1;
  }

  if (expectedStart !== totalQuestions + 1) {
    return {
      ok: false,
      error: "Diapazonlar barcha savollarni to'liq qoplashi kerak",
    };
  }

  const totalScore = calculateBandsTotal(normalized);
  if (Math.abs(totalScore - 100) > 0.05) {
    return {
      ok: false,
      error: `Diapazonlar yig'indisi 100 bo'lishi kerak. Hozir: ${totalScore}`,
    };
  }

  return { ok: true, totalScore };
}

export function buildAssignedScoresFromBands(
  totalQuestions: number,
  bands: ScoreBandInput[]
): number[] {
  const scores = new Array<number>(totalQuestions).fill(0);

  for (const band of bands) {
    for (let question = band.fromQuestion; question <= band.toQuestion; question++) {
      scores[question - 1] = roundScore(band.scorePerQuestion);
    }
  }

  return scores;
}

export function buildDefaultBands(totalQuestions: number): ScoreBandInput[] {
  return [
    {
      fromQuestion: 1,
      toQuestion: totalQuestions,
      scorePerQuestion: 100 / totalQuestions,
    },
  ];
}
