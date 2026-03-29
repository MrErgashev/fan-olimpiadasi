/**
 * Autentifikatsiya xavfsizlik testlari
 * Authentication Security Tests
 *
 * Ishga tushirish: npx vitest run __tests__/security/auth.test.ts
 */

import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function fetchAPI(path: string, options?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, options);
}

describe("A. Autentifikatsiya testlari / Authentication Tests", () => {
  // A1: Noto'g'ri parol bilan login → 401
  it("A1: Noto'g'ri parol bilan login qilganda xato qaytadi", async () => {
    const csrfRes = await fetchAPI("/api/auth/csrf");
    const { csrfToken } = await csrfRes.json();

    const res = await fetchAPI("/api/auth/callback/student-login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        phone: "+998900000000",
        password: "notogriparol123",
        csrfToken,
        json: "true",
      }),
      redirect: "manual",
    });

    // NextAuth noto'g'ri login da error redirect qaytaradi
    expect(res.status).not.toBe(200);
  });

  // A2: Token yo'q holda student API ga so'rov → 401
  it("A2: Token yo'q holda student API ga so'rov yuborilganda 401 qaytadi", async () => {
    const res = await fetchAPI("/api/student/profile");
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  // A3: Token yo'q holda admin API ga so'rov → 401
  it("A3: Token yo'q holda admin API ga so'rov yuborilganda 401 qaytadi", async () => {
    const res = await fetchAPI("/api/admin/students");
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  // A4: Token yo'q holda admin results API → 401
  it("A4: Token yo'q holda admin results API ga so'rov yuborilganda 401 qaytadi", async () => {
    const res = await fetchAPI("/api/admin/results");
    expect(res.status).toBe(401);
  });

  // A5: Noto'g'ri access code bilan register → xato
  it("A5: Noto'g'ri access code bilan register qilganda xato qaytadi", async () => {
    const res = await fetchAPI("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        phone: "+998999999999",
        password: "TestParol123",
        accessCode: "NOTOGRI-KOD-1234",
        regionId: "Toshkent",
        schoolName: "Test maktab",
        subjectIds: ["matematika"],
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("access kod");
  });

  // A6: Admin API lari moderator uchun faqat o'qish
  it("A6: Admin security-logs API token yo'q holda 401 qaytadi", async () => {
    const res = await fetchAPI("/api/admin/security-logs");
    expect(res.status).toBe(401);
  });
});
