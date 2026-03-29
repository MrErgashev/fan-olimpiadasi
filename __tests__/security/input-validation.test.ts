/**
 * Input validation xavfsizlik testlari
 * Input Validation Security Tests
 *
 * Ishga tushirish: npx vitest run __tests__/security/input-validation.test.ts
 */

import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function fetchAPI(path: string, options?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, options);
}

describe("D. Input validation testlari / Input Validation Tests", () => {
  // D17: XSS payload bilan register → sanitize/reject
  it("D17: XSS payload bilan register qilganda xavfsiz javob qaytadi", async () => {
    const xssPayload = '<script>alert("xss")</script>';

    const res = await fetchAPI("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: xssPayload,
        lastName: "Test",
        phone: "+998901111111",
        password: "TestParol123",
        accessCode: "FAKE-CODE",
        regionId: "Toshkent",
        schoolName: "Test",
        subjectIds: ["matematika"],
      }),
    });

    // 400 qaytishi kerak (access code noto'g'ri) — lekin agar 201 qaytsa,
    // javobda XSS bo'lmasligi kerak
    if (res.status === 201) {
      const body = await res.json();
      const text = JSON.stringify(body);
      expect(text).not.toContain("<script>");
    }
  });

  // D18: SQL injection payload bilan search → xavfsiz
  it("D18: SQL injection payload bilan public results search xavfsiz", async () => {
    const sqlPayload = "'; DROP TABLE students; --";
    const res = await fetchAPI(
      `/api/results/public?search=${encodeURIComponent(sqlPayload)}`
    );

    // 200 qaytishi kerak (Prisma SQL injection dan himoyalangan)
    expect(res.status).toBe(200);
  });

  // D19: Noto'g'ri javob formati yuborilganda xato qaytadi
  it("D19: Noto'g'ri javob formati (A/B/C/D emas) yuborilganda xato qaytadi", async () => {
    const res = await fetchAPI("/api/student/test/fake-id/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: "fake", answer: "E" }),
    });

    // 401 (token yo'q) yoki 400 (noto'g'ri format) qaytishi kerak
    expect([400, 401]).toContain(res.status);
  });

  // D20: Bo'sh body bilan register → xato
  it("D20: Bo'sh body bilan register qilganda xato qaytadi", async () => {
    const res = await fetchAPI("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  // D21: Juda uzun matn bilan search → xavfsiz
  it("D21: Juda uzun matn bilan search qilganda xavfsiz", async () => {
    const longString = "A".repeat(10000);
    const res = await fetchAPI(
      `/api/results/public?search=${encodeURIComponent(longString)}`
    );

    // Crash qilmasligi kerak
    expect([200, 400, 414]).toContain(res.status);
  });
});
