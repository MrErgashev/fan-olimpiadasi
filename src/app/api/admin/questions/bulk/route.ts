import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const bulkQuestionSchema = z.object({
  subjectId: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1),
        optionA: z.string().min(1),
        optionB: z.string().min(1),
        optionC: z.string().min(1),
        optionD: z.string().min(1),
        correctAnswer: z.enum(["A", "B", "C", "D"]),
      })
    )
    .min(1)
    .max(1000),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !["admin", "superadmin"].includes(session.user.role || "")
    ) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bulkQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ma'lumotlar noto'g'ri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { subjectId, difficulty, questions } = parsed.data;

    // Verify subject exists
    const subject = await db.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ error: "Fan topilmadi" }, { status: 400 });
    }

    // Batch insert in chunks of 50 inside a transaction
    const BATCH_SIZE = 50;
    const chunks: (typeof questions)[] = [];
    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      chunks.push(questions.slice(i, i + BATCH_SIZE));
    }

    let totalCreated = 0;

    await db.$transaction(async (tx) => {
      for (const batch of chunks) {
        const result = await tx.question.createMany({
          data: batch.map((q) => ({
            subjectId,
            difficulty,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            createdBy: session.user.id,
          })),
        });
        totalCreated += result.count;
      }
    });

    return NextResponse.json(
      { success: true, count: totalCreated },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
