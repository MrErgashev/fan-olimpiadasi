import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const notification = await db.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification || notification.recipientId !== session.user.id) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    await db.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
