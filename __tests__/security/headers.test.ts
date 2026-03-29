/**
 * Xavfsizlik headerlari testlari
 * Security Headers Tests
 *
 * Ishga tushirish: npx vitest run __tests__/security/headers.test.ts
 */

import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("F. Xavfsizlik headerlari / Security Headers Tests", () => {
  it("F1: X-Frame-Options header mavjud (clickjacking himoyasi)", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const header = res.headers.get("x-frame-options");
    expect(header).toBe("DENY");
  });

  it("F2: X-Content-Type-Options header mavjud", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const header = res.headers.get("x-content-type-options");
    expect(header).toBe("nosniff");
  });

  it("F3: Referrer-Policy header mavjud", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const header = res.headers.get("referrer-policy");
    expect(header).toBe("strict-origin-when-cross-origin");
  });

  it("F4: Strict-Transport-Security header mavjud", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const header = res.headers.get("strict-transport-security");
    expect(header).toContain("max-age=");
  });

  it("F5: Permissions-Policy header mavjud", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const header = res.headers.get("permissions-policy");
    expect(header).toContain("camera=()");
  });
});
