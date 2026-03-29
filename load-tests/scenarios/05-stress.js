// ============================================
// Senariy 5: Stress test (Peak Load)
// ============================================
// Ishga tushirish:
//   k6 run scenarios/05-stress.js
//
// Bosqichma-bosqich: 100 -> 500 -> 1000 -> 2000 user
// Qaysi nuqtada tizim "sinadi" — shu nuqtani topish

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";
import { BASE_URL } from "../config.js";

const stressDuration = new Trend("stress_req_duration", true);
const stressFailRate = new Rate("stress_fail_rate");

export const options = {
  stages: [
    // Bosqich 1: 100 user (2 daqiqa)
    { duration: "30s", target: 100 },
    { duration: "2m", target: 100 },

    // Bosqich 2: 500 user (2 daqiqa)
    { duration: "30s", target: 500 },
    { duration: "2m", target: 500 },

    // Bosqich 3: 1000 user (2 daqiqa)
    { duration: "30s", target: 1000 },
    { duration: "2m", target: 1000 },

    // Bosqich 4: 2000 user (2 daqiqa) — stress!
    { duration: "1m", target: 2000 },
    { duration: "2m", target: 2000 },

    // Tushirish
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    // Stress testda yumshoqroq maqsadlar
    http_req_duration: ["p(95)<5000"],
    stress_fail_rate: ["rate<0.1"], // 10% gacha xato kutiladi
  },
};

export default function () {
  // Aralash so'rovlar — real foydalanish simulyatsiyasi

  const scenarios = [
    // 40% — Natijalar sahifasi (eng ko'p so'rov)
    () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}/api/results/public`);
      stressDuration.add(Date.now() - start);
      const ok = check(res, { "public results OK": (r) => r.status === 200 });
      stressFailRate.add(ok ? 0 : 1);
    },

    // 20% — Access code tekshirish
    () => {
      const start = Date.now();
      const res = http.post(
        `${BASE_URL}/api/auth/verify-code`,
        JSON.stringify({ code: "ORIENTAL-2026-TEST" }),
        { headers: { "Content-Type": "application/json" } }
      );
      stressDuration.add(Date.now() - start);
      const ok = check(res, {
        "verify-code OK": (r) => r.status === 200 || r.status === 404 || r.status === 429,
      });
      stressFailRate.add(ok ? 0 : 1);
    },

    // 20% — Bosh sahifa
    () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}/`);
      stressDuration.add(Date.now() - start);
      const ok = check(res, { "homepage OK": (r) => r.status === 200 });
      stressFailRate.add(ok ? 0 : 1);
    },

    // 20% — Login sahifasi
    () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}/login`);
      stressDuration.add(Date.now() - start);
      const ok = check(res, { "login page OK": (r) => r.status === 200 });
      stressFailRate.add(ok ? 0 : 1);
    },
  ];

  // Random senariy tanlash (og'irlik bilan)
  const weights = [0.4, 0.2, 0.2, 0.2];
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      scenarios[i]();
      break;
    }
  }

  // Realistik kutish vaqti
  sleep(Math.random() * 3 + 1);
}
