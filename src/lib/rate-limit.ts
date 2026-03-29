// In-memory sliding window rate limiter
// Vercel serverless muhitida cold start da reset bo'ladi — bu miqyos uchun yetarli

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Har 60 soniyada eskirgan yozuvlarni tozalash
const CLEANUP_INTERVAL = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      entry.timestamps = entry.timestamps.filter((t: number) => now - t < windowMs);
      if (entry.timestamps.length === 0) store.delete(key);
    });
  }, CLEANUP_INTERVAL);
  // Node.js da process ni bloklamasligi uchun
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Rate limit tekshirish
 * @param key - Unikal kalit (masalan: IP yoki "ip:route")
 * @param limit - Ruxsat etilgan so'rovlar soni
 * @param windowMs - Vaqt oynasi (ms)
 * @returns { success, remaining } - Ruxsat berilganmi va qolgan so'rovlar soni
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  startCleanup(windowMs);

  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Eskirgan timestamplarni olib tashlash
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { success: true, remaining: limit - entry.timestamps.length };
}

/**
 * Request dan IP olish
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Rate limit javobi (429)
 */
export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: "Juda ko'p so'rov. Biroz kuting." }),
    {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" },
    }
  );
}
