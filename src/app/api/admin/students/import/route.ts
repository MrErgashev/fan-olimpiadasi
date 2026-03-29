import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { generatePassword } from "@/lib/student-utils";

interface ImportRow {
  firstName: string;
  lastName: string;
  phone: string;
  schoolName: string;
  grade?: number;
  regionName?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { students: rows } = (await req.json()) as { students: ImportRow[] };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Ma'lumotlar bo'sh" }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json({ error: "Bir vaqtda 500 tadan ko'p import qilib bo'lmaydi" }, { status: 400 });
    }

    // Collect all phones to check for duplicates
    const phones = rows.map((r) => r.phone);
    const existingStudents = await db.student.findMany({
      where: { phone: { in: phones } },
      select: { phone: true },
    });
    const existingPhones = new Set(existingStudents.map((s) => s.phone));

    // Load regions for name-based matching
    const regions = await db.region.findMany({ select: { id: true, name: true } });
    const regionMap = new Map(regions.map((r) => [r.name.toLowerCase(), r.id]));

    const created: { phone: string; password: string; name: string }[] = [];
    const errors: { row: number; phone: string; reason: string }[] = [];
    const skipped: { row: number; phone: string; reason: string }[] = [];

    // Track phones within current batch to avoid intra-batch duplicates
    const batchPhones = new Set<string>();

    // Prepare valid students
    const toCreate: {
      rowIndex: number;
      data: {
        firstName: string;
        lastName: string;
        phone: string;
        password: string;
        plainPassword: string;
        schoolName: string;
        grade: number;
        regionId?: string;
      };
    }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const phone = row.phone;

      if (!row.firstName || !row.lastName || !phone || !row.schoolName) {
        errors.push({ row: i + 1, phone: phone || "", reason: "Majburiy maydonlar to'ldirilmagan" });
        continue;
      }

      if (!/^\+998\d{9}$/.test(phone)) {
        errors.push({ row: i + 1, phone, reason: "Telefon raqam formati noto'g'ri" });
        continue;
      }

      if (existingPhones.has(phone)) {
        skipped.push({ row: i + 1, phone, reason: "Bu raqam allaqachon ro'yxatdan o'tgan" });
        continue;
      }

      if (batchPhones.has(phone)) {
        skipped.push({ row: i + 1, phone, reason: "Faylda takroriy raqam" });
        continue;
      }

      batchPhones.add(phone);
      const plainPassword = generatePassword();
      const regionId = row.regionName ? regionMap.get(row.regionName.toLowerCase()) : undefined;

      toCreate.push({
        rowIndex: i + 1,
        data: {
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          phone,
          password: "", // will be hashed below
          plainPassword,
          schoolName: row.schoolName.trim(),
          grade: row.grade || 11,
          regionId,
        },
      });
    }

    // Hash passwords and insert in transaction
    for (const item of toCreate) {
      item.data.password = await hash(item.data.plainPassword, 12);
    }

    await db.$transaction(
      toCreate.map((item) => {
        return db.student.create({
          data: {
            firstName: item.data.firstName,
            lastName: item.data.lastName,
            phone: item.data.phone,
            password: item.data.password,
            passwordText: item.data.plainPassword,
            schoolName: item.data.schoolName,
            grade: item.data.grade,
            regionId: item.data.regionId,
          },
        });
      })
    );

    for (const item of toCreate) {
      created.push({
        phone: item.data.phone,
        password: item.data.plainPassword,
        name: `${item.data.firstName} ${item.data.lastName}`,
      });
    }

    return NextResponse.json({
      created: created.length,
      skipped: skipped.length,
      errored: errors.length,
      passwords: created,
      errors,
      skippedRows: skipped,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Server xatosi", details: String(error) }, { status: 500 });
  }
}
