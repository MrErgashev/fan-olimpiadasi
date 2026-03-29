import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

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

    const data = students.map((s, i) => ({
      "№": i + 1,
      "Ism": s.firstName,
      "Familiya": s.lastName,
      "Telefon": s.phone,
      "Maktab": s.schoolName,
      "Sinf": s.grade,
      "Viloyat": s.region?.name || "",
      "Tuman": s.district?.name || "",
      "Fanlar": s.subjects.map((sub) => sub.subject.name).join(", "),
      "Holat": s.isArchived ? "Arxivlangan" : s.isBlocked ? "Bloklangan" : "Faol",
      "Testlar soni": s._count.testAttempts,
      "Ro'yxatdan o'tgan": s.createdAt.toISOString().split("T")[0],
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Ustun kengliklarini sozlash
    ws["!cols"] = [
      { wch: 5 },  // №
      { wch: 15 }, // Ism
      { wch: 15 }, // Familiya
      { wch: 15 }, // Telefon
      { wch: 25 }, // Maktab
      { wch: 6 },  // Sinf
      { wch: 15 }, // Viloyat
      { wch: 15 }, // Tuman
      { wch: 25 }, // Fanlar
      { wch: 12 }, // Holat
      { wch: 12 }, // Testlar soni
      { wch: 15 }, // Sana
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "O'quvchilar");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="oqvchilar_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
