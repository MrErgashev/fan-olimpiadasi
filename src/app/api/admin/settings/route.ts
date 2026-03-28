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

    const settings = await db.siteSetting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }

    return NextResponse.json({ settings: result });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const { maxSubjectsPerStudent } = body;

    if (maxSubjectsPerStudent === undefined || maxSubjectsPerStudent === null) {
      return NextResponse.json({ error: "maxSubjectsPerStudent majburiy" }, { status: 400 });
    }

    const num = parseInt(String(maxSubjectsPerStudent), 10);
    if (isNaN(num) || num < 0) {
      return NextResponse.json({ error: "Noto'g'ri qiymat" }, { status: 400 });
    }

    await db.siteSetting.upsert({
      where: { key: "maxSubjectsPerStudent" },
      update: { value: String(num) },
      create: { key: "maxSubjectsPerStudent", value: String(num) },
    });

    return NextResponse.json({ message: "Sozlama saqlandi", maxSubjectsPerStudent: num });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
