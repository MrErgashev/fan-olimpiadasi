import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const question = await db.question.findUnique({
      where: { id: params.id },
      include: { subject: { select: { id: true, name: true } } },
    });

    if (!question) {
      return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ question });
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
      subjectId,
      difficulty,
      questionText,
      questionImageUrl,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
    } = body;

    if (!subjectId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 });
    }

    // Mavjud savolni tekshirish
    const existing = await db.question.findUnique({
      where: { id: params.id },
      include: {
        attemptAnswers: { where: { isCorrect: { not: null } }, take: 1 },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });
    }

    // Agar savol testda ishlatilgan bo'lsa, to'g'ri javobni o'zgartirish mumkin emas
    if (existing.attemptAnswers.length > 0 && correctAnswer !== existing.correctAnswer) {
      return NextResponse.json(
        { error: "Bu savol testda ishlatilgan. To'g'ri javobni o'zgartirish mumkin emas." },
        { status: 400 }
      );
    }

    const updated = await db.question.update({
      where: { id: params.id },
      data: {
        subjectId,
        difficulty,
        questionText,
        questionImageUrl: questionImageUrl || null,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explanation: explanation || null,
      },
      include: { subject: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ question: updated });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
