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

/**
 * Moslashuvchan baholash uchun score range interfeysi
 */
export interface ScoreRange {
  from: number;    // Diapazon boshi (1-based displayOrder)
  to: number;      // Diapazon oxiri
  scorePerQuestion: number;
  label?: string;  // "Oson", "O'rta", "Qiyin"
}

/**
 * Custom scoring: displayOrder bo'yicha ball qaytaradi
 */
export function getCustomQuestionScore(
  displayOrder: number,
  scoreRanges: ScoreRange[]
): number {
  const range = scoreRanges.find(
    (r) => displayOrder >= r.from && displayOrder <= r.to
  );
  return range?.scorePerQuestion || 0;
}

/**
 * Score ranges validatsiya — jami ball to'g'ri ekanligini tekshiradi
 */
export function validateScoreRanges(
  scoreRanges: ScoreRange[],
  totalQuestions: number,
  totalScore: number
): { valid: boolean; calculatedTotal: number; error?: string } {
  if (!scoreRanges || scoreRanges.length === 0) {
    return { valid: false, calculatedTotal: 0, error: "Diapazonlar bo'sh" };
  }

  // Diapazonlar orasida bo'shliq yoki overlap yo'qligini tekshirish
  const sorted = [...scoreRanges].sort((a, b) => a.from - b.from);

  if (sorted[0].from !== 1) {
    return { valid: false, calculatedTotal: 0, error: "Birinchi diapazon 1-dan boshlanishi kerak" };
  }

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].from !== sorted[i - 1].to + 1) {
      return { valid: false, calculatedTotal: 0, error: `Diapazonlar orasida bo'shliq bor: ${sorted[i-1].to} va ${sorted[i].from}` };
    }
  }

  if (sorted[sorted.length - 1].to !== totalQuestions) {
    return { valid: false, calculatedTotal: 0, error: `Oxirgi diapazon ${totalQuestions} gacha bo'lishi kerak` };
  }

  // Jami ballni hisoblash
  let calculatedTotal = 0;
  for (const range of sorted) {
    const count = range.to - range.from + 1;
    calculatedTotal += count * range.scorePerQuestion;
  }
  calculatedTotal = Math.round(calculatedTotal * 10) / 10;

  if (Math.abs(calculatedTotal - totalScore) > 0.1) {
    return { valid: false, calculatedTotal, error: `Jami ball ${calculatedTotal}, kerak ${totalScore}` };
  }

  return { valid: true, calculatedTotal };
}
