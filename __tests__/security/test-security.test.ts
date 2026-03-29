/**
 * Test xavfsizligi testlari
 * Test Security Tests
 *
 * Ishga tushirish: npx vitest run __tests__/security/test-security.test.ts
 */

import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function fetchAPI(path: string, options?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, options);
}

describe("C. Test xavfsizligi / Test Security", () => {
  // C11: To'g'ri javob API response da qaytmaydi
  it("C11: Public results API da correctAnswer maydoni yo'q", async () => {
    const res = await fetchAPI("/api/results/public");

    if (res.status === 200) {
      const body = await res.json();
      const text = JSON.stringify(body);

      // correctAnswer kaliti hech joyda bo'lmasligi kerak
      expect(text).not.toContain('"correctAnswer"');
      expect(text).not.toContain('"correct_answer"');
    }
  });

  // C12: Token yo'q holda test boshlash mumkin emas
  it("C12: Token yo'q holda test boshlash mumkin emas", async () => {
    const res = await fetchAPI("/api/student/test/fake-test-id/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(401);
  });

  // C13: Token yo'q holda savol olish mumkin emas
  it("C13: Token yo'q holda savol olish mumkin emas", async () => {
    const res = await fetchAPI("/api/student/test/fake-test-id/question/1");
    expect(res.status).toBe(401);
  });

  // C14: Token yo'q holda javob yuborish mumkin emas
  it("C14: Token yo'q holda javob yuborish mumkin emas", async () => {
    const res = await fetchAPI("/api/student/test/fake-test-id/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: "fake", answer: "A" }),
    });

    expect(res.status).toBe(401);
  });

  // C15: Token yo'q holda test submit mumkin emas
  it("C15: Token yo'q holda test submit mumkin emas", async () => {
    const res = await fetchAPI("/api/student/test/fake-test-id/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(401);
  });

  // C16: Security event API token yo'q holda ishlamaydi
  it("C16: Security event API token yo'q holda ishlamaydi", async () => {
    const res = await fetchAPI("/api/student/security-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: "fake-attempt",
        events: [{ type: "TAB_SWITCH" }],
      }),
    });

    expect(res.status).toBe(401);
  });
});
