import { db } from "./db";

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getMaxSubjects(): Promise<number> {
  const val = await getSetting("maxSubjectsPerStudent");
  const num = val ? parseInt(val, 10) : 1;
  return isNaN(num) ? 1 : num;
}
