import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const excludeId = searchParams.get("excludeId");

    if (!phone) {
      return NextResponse.json({ error: "Telefon raqam kerak" }, { status: 400 });
    }

    const where: Record<string, unknown> = { phone };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await db.student.findFirst({ where });

    return NextResponse.json({ exists: !!existing });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
