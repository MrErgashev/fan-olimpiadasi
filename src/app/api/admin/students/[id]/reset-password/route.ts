import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { generatePassword } from "@/lib/student-utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const student = await db.student.findUnique({
      where: { id: params.id },
      select: { id: true, firstName: true, lastName: true, phone: true },
    });

    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const newPassword = generatePassword();
    const hashedPassword = await hash(newPassword, 12);

    await db.student.update({
      where: { id: params.id },
      data: { password: hashedPassword, passwordText: newPassword },
    });

    return NextResponse.json({
      message: "Parol yangilandi",
      password: newPassword,
      studentName: `${student.firstName} ${student.lastName}`,
      phone: student.phone,
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
