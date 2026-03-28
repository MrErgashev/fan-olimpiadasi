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
