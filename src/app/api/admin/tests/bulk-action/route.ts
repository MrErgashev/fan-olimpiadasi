import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { testBulkActionSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = testBulkActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validatsiya xatosi" }, { status: 400 });
    }

    const { testIds } = parsed.data;

    const tests = await db.test.findMany({
      where: { id: { in: testIds } },
      select: {
        id: true,
        _count: {
          select: {
            testAttempts: true,
          },
        },
      },
    });

    if (tests.length === 0) {
      return NextResponse.json({ error: "Testlar topilmadi" }, { status: 404 });
    }

    const deletedAttempts = tests.reduce((sum, test) => sum + test._count.testAttempts, 0);

    const result = await db.$transaction(async (tx) => {
      return tx.test.deleteMany({
        where: { id: { in: tests.map((test) => test.id) } },
      });
    });

    return NextResponse.json({
      deletedTests: result.count,
      deletedAttempts,
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
