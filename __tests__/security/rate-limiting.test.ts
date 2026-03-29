/**
 * Rate limiting testlari
 * Rate Limiting Security Tests
 *
 * Ishga tushirish: npx vitest run __tests__/security/rate-limiting.test.ts
 */

import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function fetchAPI(path: string, options?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, options);
}

describe("E. Rate limiting testlari / Rate Limiting Tests", () => {
  // E21: verify-code ga tez-tez so'rov yuborilganda 429 qaytadi
  it("E21: verify-code ga 6+ so'rov/daqiqada yuborilganda rate limit ishlaydi", async () => {
    const promises = [];

    // 7 ta so'rov ketma-ket yuborish (limit: 5/min)
    for (let i = 0; i < 7; i++) {
      promises.push(
        fetchAPI("/api/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "FAKE-CODE-TEST" }),
        })
      );
    }

    const responses = await Promise.all(promises);
    const statuses = responses.map((r) => r.status);

    // Kamida bitta 429 qaytishi kerak
    const has429 = statuses.includes(429);
    expect(has429).toBe(true);
  }, 10000);

  // E22: register ga tez-tez so'rov yuborilganda 429 qaytadi
  it("E22: register ga 4+ so'rov/daqiqada yuborilganda rate limit ishlaydi", async () => {
    const promises = [];

    // 5 ta so'rov ketma-ket yuborish (limit: 3/min)
    for (let i = 0; i < 5; i++) {
      promises.push(
        fetchAPI("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: "Test",
            lastName: "User",
            phone: `+99890000${String(i).padStart(4, "0")}`,
            password: "TestParol123",
            accessCode: "FAKE",
            regionId: "Test",
            schoolName: "Test",
            subjectIds: ["matematika"],
          }),
        })
      );
    }

    const responses = await Promise.all(promises);
    const statuses = responses.map((r) => r.status);

    // Kamida bitta 429 qaytishi kerak
    const has429 = statuses.includes(429);
    expect(has429).toBe(true);
  }, 10000);
});
