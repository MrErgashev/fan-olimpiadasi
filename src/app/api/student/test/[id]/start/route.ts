import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

function buildStartPayload(
  attempt: { id: string; startedAt: Date },
  test: {
    totalQuestions: number;
    durationMinutes: number;
    subject: { name: string };
  },
  resumed: boolean,
  studentName: string
) {
  return {
    attemptId: attempt.id,
    totalQuestions: test.totalQuestions,
    durationMinutes: test.durationMinutes,
    startedAt: attempt.startedAt.toISOString(),
    studentName,
    subjectName: test.subject.name,
    resumed,
  };
}

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
    const studentName =
      `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() ||
      "O'quvchi";

    // Test mavjudligini tekshirish
    const test = await db.test.findUnique({
      where: { id: testId },
      include: {
        subject: true,
        testQuestions: { orderBy: { displayOrder: "asc" } },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    if (test.status !== "active") {
      return NextResponse.json({ error: "Test faol emas" }, { status: 400 });
    }

    // Vaqt tekshiruvi
    const now = new Date();
    if (test.startsAt && now < test.startsAt) {
      return NextResponse.json(
        { error: "Test hali boshlanmagan" },
        { status: 400 }
      );
    }
    if (test.endsAt && now > test.endsAt) {
      return NextResponse.json(
        { error: "Test vaqti tugagan. Oxirgi boshlash vaqti o'tib ketgan." },
        { status: 400 }
      );
    }

    // Oldin attempt bormi tekshirish
    const existingAttempt = await db.testAttempt.findUnique({
      where: {
        studentId_testId: { studentId, testId },
      },
    });

    if (existingAttempt) {
      if (existingAttempt.isSubmitted) {
        return NextResponse.json(
          { error: "Siz bu testni allaqachon topshirgansiz" },
          { status: 400 }
        );
      }

      const elapsedMinutes =
        (now.getTime() - existingAttempt.startedAt.getTime()) / 1000 / 60;
      if (elapsedMinutes > test.durationMinutes + 1) {
        return NextResponse.json(
          { error: "Test vaqti tugagan" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        buildStartPayload(existingAttempt, test, true, studentName)
      );
    }

    // PIN tekshiruvi faqat birinchi boshlash uchun talab qilinadi
    if (test.accessPin) {
      const body = await req.json().catch(() => ({}));
      const pin = body?.pin;
      if (!pin || pin !== test.accessPin) {
        return NextResponse.json(
          { error: "Kirish kodi noto'g'ri" },
          { status: 403 }
        );
      }
    }

    // IP va User-Agent olish
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const selected =
      test.scoringMode === "banded_fixed_variant"
        ? test.testQuestions.map((item) => ({
            id: item.questionId,
            assignedScore: item.assignedScore,
          }))
        : null;

    if (test.scoringMode === "banded_fixed_variant") {
      if (test.testQuestions.length !== test.totalQuestions) {
        return NextResponse.json(
          { error: "Bu test konfiguratsiyasi to'liq emas" },
          { status: 400 }
        );
      }
    }

    let randomizedQuestions:
      | { id: string; assignedScore: number }[]
      | null = selected;

    if (!randomizedQuestions) {
      const allQuestions = await db.question.findMany({
        where: {
          subjectId: test.subjectId,
          isActive: true,
        },
        select: { id: true },
      });

      if (allQuestions.length < test.totalQuestions) {
        return NextResponse.json(
          { error: "Bazada yetarli savol yo'q" },
          { status: 400 }
        );
      }

      const shuffled = [...allQuestions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Har bir savolga teng ball berish: totalScore / totalQuestions
      // Yakuniy ball submit paytida (correctCount / totalQuestions) * totalScore formulasida hisoblanadi
      const scorePerQuestion = test.totalScore / test.totalQuestions;

      randomizedQuestions = shuffled.slice(0, test.totalQuestions).map((question) => ({
        id: question.id,
        assignedScore: scorePerQuestion,
      }));
    }

    // Attempt yaratish + savollarni biriktirish (transaction)
    const attempt = await db.$transaction(async (tx) => {
      const newAttempt = await tx.testAttempt.create({
        data: {
          studentId,
          testId,
          ipAddress: ip,
          userAgent,
        },
      });

      // Har bir savol uchun attempt_questions va attempt_answers yaratish
      const questionData = randomizedQuestions.map((q, index) => ({
        attemptId: newAttempt.id,
        questionId: q.id,
        displayOrder: index + 1,
        assignedScore: q.assignedScore,
      }));

      await tx.attemptQuestion.createMany({ data: questionData });

      // Bo'sh javoblar yaratish (keyinchalik to'ldiriladi)
      const answerData = randomizedQuestions.map((q, index) => ({
        attemptId: newAttempt.id,
        questionId: q.id,
        displayOrder: index + 1,
      }));

      await tx.attemptAnswer.createMany({ data: answerData });

      return newAttempt;
    });

    return NextResponse.json(buildStartPayload(attempt, test, false, studentName));
  } catch (error) {
    console.error("Test start error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
