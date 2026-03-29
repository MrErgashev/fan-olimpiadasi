import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateScoreDistribution, validateScoreRanges, type ScoreRange } from "@/lib/scoring";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const test = await db.test.findUnique({
      where: { id: params.id },
      include: {
        subject: { select: { id: true, name: true, emoji: true } },
        _count: { select: { testAttempts: true } },
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
    const { name, durationMinutes, totalQuestions, totalScore, startsAt, endsAt, accessPin, scoringMode, scoreRanges, status, isRandomOrder, isShuffleOptions } = body;

    const existing = await db.test.findUnique({
      where: { id: params.id },
      include: { _count: { select: { testAttempts: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    // Agar attempt'lar bo'lsa, faqat vaqt va statusni o'zgartirish mumkin
    const hasAttempts = existing._count.testAttempts > 0;

    const updateData: Record<string, unknown> = {
      name: name || existing.name,
      startsAt: startsAt ? new Date(startsAt) : startsAt === "" ? null : existing.startsAt,
      endsAt: endsAt ? new Date(endsAt) : endsAt === "" ? null : existing.endsAt,
      accessPin: accessPin !== undefined ? (accessPin || null) : existing.accessPin,
      status: status || existing.status,
    };

    if (!hasAttempts) {
      // Hali hech kim boshlamagan — to'liq o'zgartirish mumkin
      if (durationMinutes) updateData.durationMinutes = durationMinutes;
      if (totalQuestions) updateData.totalQuestions = totalQuestions;

      // Baholash tizimi
      if (scoringMode !== undefined) updateData.scoringMode = scoringMode;
      if (scoreRanges !== undefined) updateData.scoreRanges = scoreRanges || null;

      if (scoringMode === "custom" && scoreRanges) {
        const tq = totalQuestions || existing.totalQuestions;
        const ts = totalScore || existing.totalScore;
        const validation = validateScoreRanges(scoreRanges as ScoreRange[], tq, ts);
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        if (totalScore) updateData.totalScore = totalScore;
        updateData.scorePerQuestion = null;
        updateData.extraScoreQuestions = null;
      } else if (totalScore) {
        updateData.totalScore = totalScore;
        const dist = calculateScoreDistribution({
          totalQuestions: totalQuestions || existing.totalQuestions,
          totalScore,
        });
        updateData.scorePerQuestion = dist.normalScore;
        updateData.extraScoreQuestions = dist.extraCount;
      }

      if (isRandomOrder !== undefined) updateData.isRandomOrder = isRandomOrder;
      if (isShuffleOptions !== undefined) updateData.isShuffleOptions = isShuffleOptions;
    } else if (durationMinutes) {
      // Attempt bor bo'lsa ham durationni o'zgartirish mumkin (hali tugatmaganlar uchun)
      updateData.durationMinutes = durationMinutes;
    }

    const test = await db.test.update({
      where: { id: params.id },
      data: updateData,
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
