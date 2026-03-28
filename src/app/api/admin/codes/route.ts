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

    const codes = await db.accessCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { students: true } } },
    });

    return NextResponse.json({ codes });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

// Kod generatsiya
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { count = 1, maxUses = 1, expiresAt } = await req.json();
    const generated: string[] = [];

    for (let i = 0; i < Math.min(count, 100); i++) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let suffix = "";
      for (let j = 0; j < 4; j++) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
      }
      const code = `ORIENTAL-2026-${suffix}`;

      try {
        await db.accessCode.create({
          data: {
            code,
            maxUses,
            isActive: true,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdBy: session.user.id,
          },
        });
        generated.push(code);
      } catch {
        // Duplicate — qayta generatsiya (skip)
      }
    }

    return NextResponse.json({ codes: generated, count: generated.length }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
