import { db } from "./db";

export async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await db.siteSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    // site_settings jadvali hali yaratilmagan bo'lishi mumkin
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return true;
  } catch {
    // Jadval yo'q — raw SQL bilan yaratishga urinamiz
    try {
      await db.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT NOW())`
      );
      await db.$executeRawUnsafe(
        `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        key,
        value
      );
      return true;
    } catch {
      return false;
    }
  }
}

export async function getMaxSubjects(): Promise<number> {
  const val = await getSetting("maxSubjectsPerStudent");
  const num = val ? parseInt(val, 10) : 1;
  return isNaN(num) ? 1 : num;
}
