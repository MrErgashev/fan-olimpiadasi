import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const regionId = searchParams.get("regionId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (regionId) where.regionId = regionId;
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

    const students = await db.student.findMany({
      where,
      include: {
        region: { select: { name: true } },
        district: { select: { name: true } },
        subjects: { include: { subject: { select: { name: true } } } },
        _count: { select: { testAttempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = students.map((s) => ({
      ism: s.firstName,
      familiya: s.lastName,
      telefon: s.phone,
      maktab: s.schoolName,
      sinf: s.grade,
      viloyat: s.region?.name || "",
      tuman: s.district?.name || "",
      fanlar: s.subjects.map((sub) => sub.subject.name).join(", "),
      holat: s.isArchived ? "Arxivlangan" : s.isBlocked ? "Bloklangan" : "Faol",
      testlar_soni: s._count.testAttempts,
      royxatdan_otgan: s.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({ students: data, total: data.length });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
