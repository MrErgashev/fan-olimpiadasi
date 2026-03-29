import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAttemptProgressMeta } from "@/lib/test-attempt-progress";

// N-chi savolni olish (to'g'ri javob YUBORILMAYDI!)
export async function GET(
  req: Request,
  { params }: { params: { id: string; n: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const studentId = session.user.id;
    const testId = params.id;
    const questionNum = parseInt(params.n);

    if (isNaN(questionNum) || questionNum < 1) {
      return NextResponse.json(
        { error: "Noto'g'ri savol raqami" },
        { status: 400 }
      );
    }

    // Attempt tekshirish
    const attempt = await db.testAttempt.findUnique({
      where: { studentId_testId: { studentId, testId } },
      include: { test: true },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Test boshlanmagan" },
        { status: 400 }
      );
    }

    if (attempt.isSubmitted) {
      return NextResponse.json(
        { error: "Test allaqachon topshirilgan" },
        { status: 400 }
      );
    }

    // Vaqt tekshiruvi (server-side)
    const elapsed =
      (Date.now() - attempt.startedAt.getTime()) / 1000 / 60;
    if (elapsed > attempt.test.durationMinutes + 1) {
      // +1 daqiqa toleransiya
      return NextResponse.json(
        { error: "Test vaqti tugagan" },
        { status: 400 }
      );
    }

    // N-chi savolni olish
    const attemptQuestion = await db.attemptQuestion.findFirst({
      where: {
        attemptId: attempt.id,
        displayOrder: questionNum,
      },
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
            questionImageUrl: true,
            questionHasFormula: true,
            optionA: true,
            optionAImageUrl: true,
            optionB: true,
            optionBImageUrl: true,
            optionC: true,
            optionCImageUrl: true,
            optionD: true,
            optionDImageUrl: true,
            // correctAnswer YUBORILMAYDI!
          },
        },
      },
    });

    if (!attemptQuestion) {
      return NextResponse.json(
        { error: "Savol topilmadi" },
        { status: 404 }
      );
    }

    // O'quvchining javobini olish (agar bor bo'lsa)
    const answer = await db.attemptAnswer.findUnique({
      where: {
        attemptId_questionId: {
          attemptId: attempt.id,
          questionId: attemptQuestion.questionId,
        },
      },
      select: {
        selectedAnswer: true,
        shuffledOptions: true,
      },
    });

    // Variantlarni tayyorlash (shuffle bo'lsa, shuffle tartibida)
    const q = attemptQuestion.question;
    let options = {
      A: { text: q.optionA, imageUrl: q.optionAImageUrl },
      B: { text: q.optionB, imageUrl: q.optionBImageUrl },
      C: { text: q.optionC, imageUrl: q.optionCImageUrl },
      D: { text: q.optionD, imageUrl: q.optionDImageUrl },
    };

    // Agar shuffle options bo'lsa va mapping saqlangan bo'lsa
    const shuffleMap = answer?.shuffledOptions as Record<string, string> | null;
    if (shuffleMap) {
      const shuffled: typeof options = {} as typeof options;
      for (const [newKey, origKey] of Object.entries(shuffleMap)) {
        shuffled[newKey as keyof typeof options] =
          options[origKey as keyof typeof options];
      }
      options = shuffled;
    } else if (attempt.test.isShuffleOptions) {
      // Birinchi marta — shuffle qilib mapping saqlash
      const keys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
      const shuffledKeys = [...keys];
      for (let i = shuffledKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledKeys[i], shuffledKeys[j]] = [shuffledKeys[j], shuffledKeys[i]];
      }

      const mapping: Record<string, string> = {};
      const shuffledOptions: typeof options = {} as typeof options;
      shuffledKeys.forEach((origKey, idx) => {
        const newKey = keys[idx];
        mapping[newKey] = origKey;
        shuffledOptions[newKey] = options[origKey];
      });

      options = shuffledOptions;

      // Mappingni saqlash
      await db.attemptAnswer.update({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: attemptQuestion.questionId,
          },
        },
        data: { shuffledOptions: mapping },
      });
    }

    const progressMeta = await getAttemptProgressMeta(
      attempt.id,
      attempt.test.totalQuestions
    );

    return NextResponse.json({
      questionNumber: questionNum,
      totalQuestions: attempt.test.totalQuestions,
      score: attemptQuestion.assignedScore,
      question: {
        id: q.id,
        text: q.questionText,
        imageUrl: q.questionImageUrl,
        hasFormula: q.questionHasFormula,
      },
      options,
      selectedAnswer: answer?.selectedAnswer || null,
      timeRemaining: Math.max(
        0,
        Math.floor(
          attempt.test.durationMinutes * 60 -
            (Date.now() - attempt.startedAt.getTime()) / 1000
          )
      ),
      ...progressMeta,
    });
  } catch (error) {
    console.error("Question fetch error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
