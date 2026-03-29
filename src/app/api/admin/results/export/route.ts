import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const testId = searchParams.get("testId");
    const search = searchParams.get("search");

    const where: Prisma.TestAttemptWhereInput = { isSubmitted: true };

    if (testId) {
      where.testId = testId;
    } else if (subjectId) {
      where.test = { subjectId };
    }

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      };
    }

    const results = await db.testAttempt.findMany({
      where,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            schoolName: true,
            region: { select: { name: true } },
          },
        },
        test: { include: { subject: { select: { name: true } } } },
      },
      orderBy: { totalScore: "desc" },
      take: 500,
    });

    const data = results.map((r, i) => ({
      "O'rin": i + 1,
      "Ism": r.student.firstName,
      "Familiya": r.student.lastName,
      "Telefon": r.student.phone,
      "Fan": r.test.subject.name,
      "Test": r.test.name,
      "Viloyat": r.student.region?.name || "",
      "Maktab": r.student.schoolName,
      "Ball": Number(r.totalScore.toFixed(1)),
      "To'g'ri": r.correctCount,
      "Noto'g'ri": r.wrongCount,
      "Javobsiz": r.unansweredCount,
      "Sana": r.finishedAt?.toISOString().split("T")[0] || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [
      { wch: 6 },  // O'rin
      { wch: 15 }, // Ism
      { wch: 15 }, // Familiya
      { wch: 15 }, // Telefon
      { wch: 15 }, // Fan
      { wch: 20 }, // Test
      { wch: 15 }, // Viloyat
      { wch: 25 }, // Maktab
      { wch: 8 },  // Ball
      { wch: 8 },  // To'g'ri
      { wch: 8 },  // Noto'g'ri
      { wch: 8 },  // Javobsiz
      { wch: 12 }, // Sana
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Natijalar");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="natijalar_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
