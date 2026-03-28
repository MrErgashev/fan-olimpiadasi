import { NextResponse } from "next/server";
import { getMaxSubjects } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const maxSubjects = await getMaxSubjects();
    return NextResponse.json({ maxSubjects });
  } catch {
    return NextResponse.json({ maxSubjects: 1 });
  }
}
