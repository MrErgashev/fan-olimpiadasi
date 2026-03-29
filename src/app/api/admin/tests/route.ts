import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateScoreDistribution, type TestScoringMode } from "@/lib/scoring";
import { validateFixedVariantConfig } from "@/lib/test-config";

function isAdminRole(role?: string | null) {
  return ["admin", "superadmin", "moderator"].includes(role || "");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const tests = await db.test.findMany({
      include: {
        subject: { select: { id: true, name: true, emoji: true } },
        _count: { select: { testAttempts: true, testQuestions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const subjectIds = Array.from(new Set(tests.map((t) => t.subjectId)));
    const questionCounts = await Promise.all(
      subjectIds.map(async (subjectId) => ({
        subjectId,
        count: await db.question.count({ where: { subjectId, isActive: true } }),
      }))
    );
    const countMap = Object.fromEntries(questionCounts.map((item) => [item.subjectId, item.count]));

    const filteredTests = tests.filter((test) => {
      if (test.scoringMode === "banded_fixed_variant") {
        return test._count.testQuestions === test.totalQuestions;
      }

      return (countMap[test.subjectId] || 0) >= test.totalQuestions;
    });

    return NextResponse.json({ tests: filteredTests });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const {
      subjectId,
      name,
      totalQuestions,
      durationMinutes,
      totalScore,
      isRandomOrder,
      isShuffleOptions,
      startsAt,
      endsAt,
      accessPin,
      status,
      scoringMode: rawScoringMode,
      testQuestions,
      selectedQuestionIds,
      scoreBands,
    } = body;

    if (!subjectId || !name || !totalQuestions || !durationMinutes) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    const scoringMode = (rawScoringMode || "distributed") as TestScoringMode;

    if (scoringMode === "banded_fixed_variant") {
      const fixedVariant = validateFixedVariantConfig(
        totalQuestions,
        testQuestions ?? selectedQuestionIds,
        scoreBands
      );

      if (!fixedVariant.ok) {
        return NextResponse.json({ error: fixedVariant.error }, { status: 400 });
      }

      const questions = await db.question.findMany({
        where: {
          id: { in: fixedVariant.value.testQuestions.map((item) => item.questionId) },
          subjectId,
          isActive: true,
        },
        select: { id: true },
      });

      if (questions.length !== totalQuestions) {
        return NextResponse.json(
          { error: "Tanlangan savollarning barchasi faol holatda shu fanga tegishli bo'lishi kerak" },
          { status: 400 }
        );
      }

      const test = await db.$transaction(async (tx) => {
        const createdTest = await tx.test.create({
          data: {
            subjectId,
            name,
            totalQuestions,
            durationMinutes,
            totalScore: fixedVariant.value.totalScore,
            scoringMode,
            scorePerQuestion: null,
            extraScoreQuestions: null,
            isRandomOrder: false,
            isShuffleOptions: isShuffleOptions ?? true,
            startsAt: startsAt ? new Date(startsAt) : null,
            endsAt: endsAt ? new Date(endsAt) : null,
            accessPin: accessPin || null,
            status: status || "draft",
            createdBy: session.user.id,
          },
        });

        await tx.testScoreBand.createMany({
          data: fixedVariant.value.scoreBands.map((band, index) => ({
            testId: createdTest.id,
            displayOrder: index + 1,
            fromQuestion: band.fromQuestion,
            toQuestion: band.toQuestion,
            scorePerQuestion: band.scorePerQuestion,
          })),
        });

        await tx.testQuestion.createMany({
          data: fixedVariant.value.testQuestions.map((question, index) => ({
            testId: createdTest.id,
            questionId: question.questionId,
            displayOrder: index + 1,
            assignedScore: fixedVariant.value.assignedScores[index],
          })),
        });

        return createdTest;
      });

      return NextResponse.json({ test }, { status: 201 });
    }

    const questionCount = await db.question.count({
      where: { subjectId, isActive: true },
    });

    if (questionCount < totalQuestions) {
      return NextResponse.json(
        {
          error: `Bazada faqat ${questionCount} ta savol bor, ${totalQuestions} ta kerak`,
        },
        { status: 400 }
      );
    }

    const score = totalScore || 100;
    const dist = calculateScoreDistribution({ totalQuestions, totalScore: score });

    const test = await db.test.create({
      data: {
        subjectId,
        name,
        totalQuestions,
        durationMinutes,
        totalScore: score,
        scoringMode: "distributed",
        scorePerQuestion: dist.normalScore,
        extraScoreQuestions: dist.extraCount,
        isRandomOrder: isRandomOrder ?? true,
        isShuffleOptions: isShuffleOptions ?? true,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        accessPin: accessPin || null,
        status: status || "draft",
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ test }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
