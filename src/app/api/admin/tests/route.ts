import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateScoreDistribution, validateScoreRanges, type ScoreRange } from "@/lib/scoring";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const tests = await db.test.findMany({
      include: {
        subject: { select: { id: true, name: true, emoji: true } },
        _count: { select: { testAttempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Har bir test uchun bazadagi aktiv savollar sonini hisoblash
    const subjectIds = Array.from(new Set(tests.map((t) => t.subjectId)));
    const questionCounts = await Promise.all(
      subjectIds.map(async (sid) => ({
        subjectId: sid,
        count: await db.question.count({ where: { subjectId: sid, isActive: true } }),
      }))
    );
    const countMap = Object.fromEntries(questionCounts.map((q) => [q.subjectId, q.count]));

    // Savollar yetarli bo'lmagan testlarni chiqarib tashlash
    const filteredTests = tests.filter((t) => (countMap[t.subjectId] || 0) >= t.totalQuestions);

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
    const { subjectId, name, totalQuestions, durationMinutes, totalScore, isRandomOrder, isShuffleOptions, startsAt, endsAt, accessPin, scoringMode, scoreRanges, status } = body;

    if (!subjectId || !name || !totalQuestions || !durationMinutes) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    // Bazada yetarli savol bormi?
    const questionCount = await db.question.count({
      where: { subjectId, isActive: true },
    });

    if (questionCount < totalQuestions) {
      return NextResponse.json({
        error: `Bazada faqat ${questionCount} ta savol bor, ${totalQuestions} ta kerak`,
      }, { status: 400 });
    }

    const score = totalScore || 100;

    // Baholash tizimi
    let finalScoringMode = "equal";
    let finalScoreRanges = null;
    let scorePerQuestion = null;
    let extraScoreQuestions = null;

    if (scoringMode === "custom" && scoreRanges) {
      // Moslashuvchan baholash validatsiyasi
      const validation = validateScoreRanges(scoreRanges as ScoreRange[], totalQuestions, score);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      finalScoringMode = "custom";
      finalScoreRanges = scoreRanges;
    } else {
      // Teng taqsimlash
      const dist = calculateScoreDistribution({ totalQuestions, totalScore: score });
      scorePerQuestion = dist.normalScore;
      extraScoreQuestions = dist.extraCount;
    }

    const test = await db.test.create({
      data: {
        subjectId,
        name,
        totalQuestions,
        durationMinutes,
        totalScore: score,
        scorePerQuestion,
        extraScoreQuestions,
        scoringMode: finalScoringMode,
        scoreRanges: finalScoreRanges,
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
