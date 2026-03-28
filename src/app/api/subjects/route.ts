import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const subjects = await db.subject.findMany({
      where: { isOnline: true },
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ subjects });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
