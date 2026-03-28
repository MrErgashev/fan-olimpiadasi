import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateScoreDistribution } from "@/lib/scoring";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const tests = await db.test.findMany({
      include: {
        subject: { select: { name: true, emoji: true } },
        _count: { select: { testAttempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tests });
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
    const { subjectId, name, totalQuestions, durationMinutes, totalScore, isRandomOrder, isShuffleOptions, startsAt, endsAt, status } = body;

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
    const dist = calculateScoreDistribution({ totalQuestions, totalScore: score });

    const test = await db.test.create({
      data: {
        subjectId,
        name,
        totalQuestions,
        durationMinutes,
        totalScore: score,
        scorePerQuestion: dist.normalScore,
        extraScoreQuestions: dist.extraCount,
        isRandomOrder: isRandomOrder ?? true,
        isShuffleOptions: isShuffleOptions ?? true,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        status: status || "draft",
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ test }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
