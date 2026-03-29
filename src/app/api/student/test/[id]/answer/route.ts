import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { autoSubmitAttempt } from "@/lib/auto-submit";

// Javob saqlash (realtime)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const studentId = session.user.id;
    const testId = params.id;
    const { questionId, answer } = await req.json();

    if (!questionId || !["A", "B", "C", "D"].includes(answer)) {
      return NextResponse.json(
        { error: "Noto'g'ri ma'lumot" },
        { status: 400 }
      );
    }

    // Attempt tekshirish
    const attempt = await db.testAttempt.findUnique({
      where: { studentId_testId: { studentId, testId } },
      include: { test: true },
    });

    if (!attempt || attempt.isSubmitted) {
      return NextResponse.json(
        { error: "Test topshirilgan yoki topilmadi" },
        { status: 400 }
      );
    }

    // Vaqt tekshiruvi
    const elapsed =
      (Date.now() - attempt.startedAt.getTime()) / 1000 / 60;
    if (elapsed > attempt.test.durationMinutes + 1) {
      // Vaqti tugagan — avtomatik baholash
      await autoSubmitAttempt(attempt.id);
      return NextResponse.json(
        { error: "Test vaqti tugagan. Natijangiz avtomatik saqlandi.", autoSubmitted: true },
        { status: 400 }
      );
    }

    // Javobni saqlash
    await db.attemptAnswer.update({
      where: {
        attemptId_questionId: {
          attemptId: attempt.id,
          questionId,
        },
      },
      data: {
        selectedAnswer: answer,
        answeredAt: new Date(),
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Answer save error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
