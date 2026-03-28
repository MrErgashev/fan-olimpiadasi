import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectSlug = searchParams.get("subject");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isSubmitted: true };

    if (subjectSlug) {
      const subject = await db.subject.findUnique({ where: { slug: subjectSlug } });
      if (subject) {
        where.test = { subjectId: subject.id };
      }
    }

    const results = await db.testAttempt.findMany({
      where,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            schoolName: true,
            region: { select: { name: true } },
          },
        },
        test: {
          include: { subject: { select: { name: true, slug: true, emoji: true } } },
        },
      },
      orderBy: { totalScore: "desc" },
      take: 100,
    });

    let filtered = results;
    if (search) {
      const s = search.toLowerCase();
      filtered = results.filter(
        (r) =>
          r.student.firstName.toLowerCase().includes(s) ||
          r.student.lastName.toLowerCase().includes(s)
      );
    }

    // Fanlar ro'yxati
    const subjects = await db.subject.findMany({
      where: { isOnline: true },
      orderBy: { displayOrder: "asc" },
      select: { name: true, slug: true, emoji: true },
    });

    return NextResponse.json({
      results: filtered.map((r, i) => ({
        rank: i + 1,
        firstName: r.student.firstName,
        lastName: r.student.lastName,
        school: r.student.schoolName,
        region: r.student.region?.name || "",
        subjectName: r.test.subject.name,
        subjectSlug: r.test.subject.slug,
        subjectEmoji: r.test.subject.emoji,
        totalScore: r.totalScore,
      })),
      subjects,
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
