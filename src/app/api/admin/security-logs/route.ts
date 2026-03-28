import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const logs = await db.securityLog.findMany({
      include: {
        student: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Flaglangan o'quvchilarni hisoblash
    const studentFlags = new Map<string, { name: string; counts: Record<string, number> }>();

    for (const log of logs) {
      if (!log.studentId || !log.student) continue;
      if (!studentFlags.has(log.studentId)) {
        studentFlags.set(log.studentId, {
          name: `${log.student.firstName} ${log.student.lastName}`,
          counts: {},
        });
      }
      const entry = studentFlags.get(log.studentId)!;
      entry.counts[log.eventType] = (entry.counts[log.eventType] || 0) + 1;
    }

    // Flag level hisoblash
    const flagged = Array.from(studentFlags.entries())
      .map(([id, data]) => {
        let level: "green" | "yellow" | "red" = "green";
        if (
          (data.counts["DEVTOOLS_OPEN"] || 0) >= 1 ||
          (data.counts["MULTIPLE_DEVICE"] || 0) >= 1 ||
          (data.counts["TAB_SWITCH"] || 0) >= 5 ||
          (data.counts["FULLSCREEN_EXIT"] || 0) >= 2
        ) {
          level = "red";
        } else if ((data.counts["TAB_SWITCH"] || 0) >= 3) {
          level = "yellow";
        }
        return { studentId: id, name: data.name, counts: data.counts, level };
      })
      .filter((f) => f.level !== "green")
      .sort((a, b) => (a.level === "red" ? -1 : 1) - (b.level === "red" ? -1 : 1));

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        studentName: l.student ? `${l.student.firstName} ${l.student.lastName}` : "Noma'lum",
        eventType: l.eventType,
        details: l.details,
        createdAt: l.createdAt.toISOString(),
      })),
      flagged,
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
