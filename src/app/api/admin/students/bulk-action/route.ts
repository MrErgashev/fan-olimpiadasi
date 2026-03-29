import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bulkActionSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bulkActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validatsiya xatosi" }, { status: 400 });
    }

    const { action, studentIds, reason } = parsed.data;

    if (action === "delete") {
      const result = await db.student.deleteMany({
        where: { id: { in: studentIds } },
      });
      return NextResponse.json({ deleted: result.count });
    }

    if (action === "block") {
      const result = await db.student.updateMany({
        where: { id: { in: studentIds } },
        data: {
          isBlocked: true,
          blockedAt: new Date(),
          blockedReason: reason || null,
        },
      });
      return NextResponse.json({ updated: result.count });
    }

    if (action === "unblock") {
      const result = await db.student.updateMany({
        where: { id: { in: studentIds } },
        data: {
          isBlocked: false,
          blockedAt: null,
          blockedReason: null,
          blockedUntil: null,
        },
      });
      return NextResponse.json({ updated: result.count });
    }

    if (action === "archive") {
      const result = await db.student.updateMany({
        where: { id: { in: studentIds } },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      });
      return NextResponse.json({ updated: result.count });
    }

    if (action === "unarchive") {
      const result = await db.student.updateMany({
        where: { id: { in: studentIds } },
        data: {
          isArchived: false,
          archivedAt: null,
        },
      });
      return NextResponse.json({ updated: result.count });
    }

    return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
