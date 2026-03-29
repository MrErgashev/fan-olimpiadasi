import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limit: 5 so'rov/daqiqa per IP
    const ip = getClientIp(req);
    const { success } = checkRateLimit(`verify-code:${ip}`, 5, 60_000);
    if (!success) return rateLimitResponse();

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Kodni kiriting" },
        { status: 400 }
      );
    }

    const accessCode = await db.accessCode.findUnique({
      where: { code },
    });

    if (!accessCode) {
      return NextResponse.json(
        { error: "Noto'g'ri kod" },
        { status: 404 }
      );
    }

    if (!accessCode.isActive) {
      return NextResponse.json(
        { error: "Bu kod faol emas" },
        { status: 400 }
      );
    }

    if (accessCode.currentUses >= accessCode.maxUses) {
      return NextResponse.json(
        { error: "Bu kod ishlatish limiti tugagan" },
        { status: 400 }
      );
    }

    if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
      return NextResponse.json(
        { error: "Bu kodning amal qilish muddati tugagan" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json(
      { error: "Server xatosi" },
      { status: 500 }
    );
  }
}
