import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMaxSubjects, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const maxSubjectsPerStudent = await getMaxSubjects();

    return NextResponse.json({
      settings: { maxSubjectsPerStudent: String(maxSubjectsPerStudent) },
    });
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

    const saved = await setSetting("maxSubjectsPerStudent", String(num));
    if (!saved) {
      return NextResponse.json({ error: "Sozlamani saqlashda xatolik" }, { status: 500 });
    }

    return NextResponse.json({ message: "Sozlama saqlandi", maxSubjectsPerStudent: num });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
