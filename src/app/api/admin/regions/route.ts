import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const regions = await db.region.findMany({
      include: { districts: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ regions });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
