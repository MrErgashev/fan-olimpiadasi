import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateScoreDistribution, type TestScoringMode } from "@/lib/scoring";
import { validateFixedVariantConfig } from "@/lib/test-config";

function isReadableRole(role?: string | null) {
  return ["admin", "superadmin", "moderator"].includes(role || "");
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isReadableRole(session.user.role)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const test = await db.test.findUnique({
      where: { id: params.id },
      include: {
        subject: { select: { id: true, name: true, emoji: true } },
        _count: { select: { testAttempts: true } },
        scoreBands: { orderBy: { displayOrder: "asc" } },
        testQuestions: {
          orderBy: { displayOrder: "asc" },
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      durationMinutes,
      totalQuestions,
      totalScore,
      startsAt,
      endsAt,
      accessPin,
      status,
      isRandomOrder,
      isShuffleOptions,
      scoringMode: rawScoringMode,
      testQuestions,
      selectedQuestionIds,
      scoreBands,
    } = body;

    const existing = await db.test.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { testAttempts: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    const hasAttempts = existing._count.testAttempts > 0;
    const nextTotalQuestions = totalQuestions || existing.totalQuestions;
    const nextScoringMode = (rawScoringMode || existing.scoringMode) as TestScoringMode;

    if (hasAttempts && totalQuestions && totalQuestions !== existing.totalQuestions) {
      return NextResponse.json(
        { error: "Urinishlar mavjud testda savollar sonini o'zgartirib bo'lmaydi" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      name: name || existing.name,
      startsAt: startsAt ? new Date(startsAt) : startsAt === "" ? null : existing.startsAt,
      endsAt: endsAt ? new Date(endsAt) : endsAt === "" ? null : existing.endsAt,
      accessPin: accessPin !== undefined ? accessPin || null : existing.accessPin,
      status: status || existing.status,
      scoringMode: nextScoringMode,
    };

    if (durationMinutes) {
      updateData.durationMinutes = durationMinutes;
    }

    if (!hasAttempts && totalQuestions) {
      updateData.totalQuestions = totalQuestions;
    }

    if (isShuffleOptions !== undefined) {
      updateData.isShuffleOptions = isShuffleOptions;
    }

    if (nextScoringMode === "banded_fixed_variant") {
      const fixedVariant = validateFixedVariantConfig(
        nextTotalQuestions,
        testQuestions ?? selectedQuestionIds,
        scoreBands
      );

      if (!fixedVariant.ok) {
        return NextResponse.json({ error: fixedVariant.error }, { status: 400 });
      }

      const questions = await db.question.findMany({
        where: {
          id: { in: fixedVariant.value.testQuestions.map((item) => item.questionId) },
          subjectId: existing.subjectId,
          isActive: true,
        },
        select: { id: true },
      });

      if (questions.length !== nextTotalQuestions) {
        return NextResponse.json(
          { error: "Tanlangan savollarning barchasi faol holatda shu fanga tegishli bo'lishi kerak" },
          { status: 400 }
        );
      }

      updateData.totalScore = fixedVariant.value.totalScore;
      updateData.scorePerQuestion = null;
      updateData.extraScoreQuestions = null;
      updateData.isRandomOrder = false;

      const test = await db.$transaction(async (tx) => {
        await tx.test.update({
          where: { id: params.id },
          data: updateData,
        });

        await tx.testScoreBand.deleteMany({ where: { testId: params.id } });
        await tx.testQuestion.deleteMany({ where: { testId: params.id } });

        await tx.testScoreBand.createMany({
          data: fixedVariant.value.scoreBands.map((band, index) => ({
            testId: params.id,
            displayOrder: index + 1,
            fromQuestion: band.fromQuestion,
            toQuestion: band.toQuestion,
            scorePerQuestion: band.scorePerQuestion,
          })),
        });

        await tx.testQuestion.createMany({
          data: fixedVariant.value.testQuestions.map((question, index) => ({
            testId: params.id,
            questionId: question.questionId,
            displayOrder: index + 1,
            assignedScore: fixedVariant.value.assignedScores[index],
          })),
        });

        return tx.test.findUnique({
          where: { id: params.id },
        });
      });

      return NextResponse.json({ test });
    }

    const subjectQuestionCount = await db.question.count({
      where: { subjectId: existing.subjectId, isActive: true },
    });

    if (subjectQuestionCount < nextTotalQuestions) {
      return NextResponse.json(
        {
          error: `Bazada faqat ${subjectQuestionCount} ta savol bor, ${nextTotalQuestions} ta kerak`,
        },
        { status: 400 }
      );
    }

    const nextTotalScore = totalScore || existing.totalScore || 100;
    const distribution = calculateScoreDistribution({
      totalQuestions: nextTotalQuestions,
      totalScore: nextTotalScore,
    });

    updateData.totalScore = nextTotalScore;
    updateData.scorePerQuestion = distribution.normalScore;
    updateData.extraScoreQuestions = distribution.extraCount;
    updateData.isRandomOrder = isRandomOrder ?? existing.isRandomOrder;

    const test = await db.$transaction(async (tx) => {
      await tx.testScoreBand.deleteMany({ where: { testId: params.id } });
      await tx.testQuestion.deleteMany({ where: { testId: params.id } });

      return tx.test.update({
        where: { id: params.id },
        data: updateData,
      });
    });

    return NextResponse.json({ test });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const test = await db.test.findUnique({
      where: { id: params.id },
      include: { _count: { select: { testAttempts: true } } },
    });

    if (!test) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    if (test._count.testAttempts > 0) {
      return NextResponse.json(
        { error: `Bu testda ${test._count.testAttempts} ta urinish bor. O'chirib bo'lmaydi.` },
        { status: 400 }
      );
    }

    await db.test.delete({ where: { id: params.id } });

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
