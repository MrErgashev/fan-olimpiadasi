import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { adminCreateStudentSchema } from "@/lib/validators";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin", "moderator"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const regionId = searchParams.get("regionId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const grade = searchParams.get("grade");
    const sort = searchParams.get("sort"); // "name" | "date" | "tests"

    const where: Record<string, unknown> = {};
    if (regionId) where.regionId = regionId;
    if (grade) where.grade = parseInt(grade);
    if (status === "active") { where.isBlocked = false; where.isArchived = false; }
    if (status === "blocked") where.isBlocked = true;
    if (status === "archived") where.isArchived = true;
    if (!status || status === "all") where.isArchived = false;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "name") orderBy = { firstName: "asc" };
    if (sort === "date") orderBy = { createdAt: "desc" };

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          region: { select: { name: true } },
          subjects: { include: { subject: { select: { name: true, emoji: true } } } },
          _count: { select: { testAttempts: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.student.count({ where }),
    ]);

    return NextResponse.json({ students, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = adminCreateStudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
    }

    const subjectIds: string[] = body.subjectIds || [];
    const returnPassword: boolean = body.returnPassword || false;
    const { phone, password, ...rest } = parsed.data;

    const existing = await db.student.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const student = await db.student.create({
      data: {
        ...rest,
        phone,
        password: hashedPassword,
        ...(subjectIds.length > 0 && {
          subjects: {
            create: subjectIds.map((subjectId: string) => ({ subjectId })),
          },
        }),
      },
    });

    return NextResponse.json({ student, password: returnPassword ? password : undefined }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
