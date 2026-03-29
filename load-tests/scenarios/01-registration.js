// ============================================
// Senariy 1: Ro'yxatdan o'tish yuklamasi
// ============================================
// Ishga tushirish:
//   k6 run scenarios/01-registration.js
//
// Custom sozlamalar bilan:
//   k6 run --env BASE_URL=https://your-domain.com --env ACCESS_CODE=ORIENTAL-2026-XXXX scenarios/01-registration.js

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";
import { BASE_URL, TEST_CONFIG } from "../config.js";
import { generateStudent } from "../helpers/data-generator.js";

// Custom metrikalar
const registrationDuration = new Trend("registration_duration", true);
const registrationFailRate = new Rate("registration_fail_rate");

export const options = {
  stages: [
    { duration: "30s", target: 100 }, // 30s da 100 ga ko'tarish
    { duration: "1m", target: 500 },  // 1m da 500 ga
    { duration: "2m", target: 500 },  // 2m ushlab turish
    { duration: "30s", target: 0 },   // Sekin tushirish
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed: ["rate<0.01"],
    registration_duration: ["p(95)<3000"],
    registration_fail_rate: ["rate<0.05"],
  },
};

export default function () {
  const student = generateStudent();

  // 1-qadam: Access code tekshirish
  const verifyRes = http.post(
    `${BASE_URL}/api/auth/verify-code`,
    JSON.stringify({ code: TEST_CONFIG.ACCESS_CODE }),
    { headers: { "Content-Type": "application/json" } }
  );

  const verifyOk = check(verifyRes, {
    "verify-code: status 200": (r) => r.status === 200,
    "verify-code: valid=true": (r) => {
      try { return JSON.parse(r.body).valid === true; } catch { return false; }
    },
  });

  if (!verifyOk) {
    registrationFailRate.add(1);
    sleep(1);
    return;
  }

  sleep(Math.random() * 2 + 1); // 1-3s o'ylash vaqti

  // 2-qadam: Ro'yxatdan o'tish
  const startTime = Date.now();
  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      ...student,
      accessCode: TEST_CONFIG.ACCESS_CODE,
      regionId: "Toshkent shahri",
      subjectIds: ["matematika"],
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  const duration = Date.now() - startTime;
  registrationDuration.add(duration);

  const regOk = check(registerRes, {
    "register: status 201": (r) => r.status === 201,
    "register: studentId mavjud": (r) => {
      try { return !!JSON.parse(r.body).studentId; } catch { return false; }
    },
  });

  registrationFailRate.add(regOk ? 0 : 1);

  sleep(Math.random() * 2 + 1); // Think time
}
