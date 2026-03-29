import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Savollar ro'yxati
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const grouped = searchParams.get("grouped");
    const subjectId = searchParams.get("subjectId");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const rawLimit = parseInt(searchParams.get("limit") || "20");
    const limit = Number.isNaN(rawLimit) ? 20 : Math.min(200, Math.max(1, rawLimit));

    // Fan bo'yicha guruhlangan savol sonlarini qaytarish
    if (grouped === "true") {
      const subjects = await db.subject.findMany({
        where: { isOnline: true },
        select: { id: true, name: true, emoji: true, displayOrder: true },
        orderBy: { displayOrder: "asc" },
      });

      const searchFilter = search
        ? { questionText: { contains: search, mode: "insensitive" as const } }
        : {};

      const counts = await Promise.all(
        subjects.map(async (s) => {
          const count = await db.question.count({
            where: { subjectId: s.id, isActive: true, ...searchFilter },
          });
          return { subjectId: s.id, name: s.name, emoji: s.emoji || "", count };
        })
      );

      const totalQuestions = counts.reduce((sum, c) => sum + c.count, 0);
      return NextResponse.json({ subjectCounts: counts, totalQuestions });
    }

    const where: Record<string, unknown> = { isActive: true };
    if (subjectId) where.subjectId = subjectId;
    if (difficulty) where.difficulty = difficulty;
    if (search) where.questionText = { contains: search, mode: "insensitive" };

    const [questions, total] = await Promise.all([
      db.question.findMany({
        where,
        include: { subject: { select: { name: true, emoji: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.question.count({ where }),
    ]);

    return NextResponse.json({ questions, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

// Savol(lar)ni o'chirish
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const subjectId = searchParams.get("subjectId");

    if (id) {
      await db.question.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true });
    }

    if (subjectId) {
      const result = await db.question.updateMany({
        where: { subjectId, isActive: true },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, count: result.count });
    }

    return NextResponse.json({ error: "id yoki subjectId kerak" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

// Yangi savol yaratish
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const { subjectId, difficulty, questionText, optionA, optionB, optionC, optionD, correctAnswer, explanation, questionImageUrl, questionHasFormula } = body;

    if (!subjectId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    const question = await db.question.create({
      data: {
        subjectId,
        difficulty: difficulty || "medium",
        questionText,
        questionImageUrl: questionImageUrl || null,
        questionHasFormula: questionHasFormula || false,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explanation: explanation || null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
