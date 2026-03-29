import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const attempt = await db.testAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        test: {
          include: { subject: { select: { name: true, emoji: true } } },
        },
        attemptAnswers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
                explanation: true,
                questionImageUrl: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Natija topilmadi" }, { status: 404 });
    }

    // Faqat o'z natijasini ko'ra oladi
    if (attempt.studentId !== session.user.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    if (!attempt.isSubmitted) {
      return NextResponse.json({ error: "Test hali yakunlanmagan" }, { status: 400 });
    }

    const answers = attempt.attemptAnswers.map((a, i) => ({
      order: i + 1,
      questionText: a.question.questionText,
      questionImageUrl: a.question.questionImageUrl,
      optionA: a.question.optionA,
      optionB: a.question.optionB,
      optionC: a.question.optionC,
      optionD: a.question.optionD,
      correctAnswer: a.question.correctAnswer,
      selectedAnswer: a.selectedAnswer,
      isCorrect: a.isCorrect,
      score: a.score,
      explanation: a.question.explanation,
    }));

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        testName: attempt.test.name,
        subjectName: attempt.test.subject.name,
        subjectEmoji: attempt.test.subject.emoji || "",
        totalScore: attempt.totalScore,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        unansweredCount: attempt.unansweredCount,
        startedAt: attempt.startedAt.toISOString(),
        finishedAt: attempt.finishedAt?.toISOString(),
        answers,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
