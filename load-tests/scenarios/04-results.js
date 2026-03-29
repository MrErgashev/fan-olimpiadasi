// ============================================
// Senariy 4: Natijalar sahifasi yuklamasi
// ============================================
// Ishga tushirish:
//   k6 run scenarios/04-results.js
//
// 1000 ta user natijalar sahifasini ochadi

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { BASE_URL } from "../config.js";

const resultsDuration = new Trend("results_page_duration", true);

export const options = {
  stages: [
    { duration: "30s", target: 200 },
    { duration: "1m", target: 1000 },
    { duration: "2m", target: 1000 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    results_page_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  // Umumiy natijalar sahifasi (public API)
  const startTime = Date.now();
  const res = http.get(`${BASE_URL}/api/results/public`);
  resultsDuration.add(Date.now() - startTime);

  check(res, {
    "results: status 200": (r) => r.status === 200,
    "results: ma'lumot bor": (r) => {
      try { return Array.isArray(JSON.parse(r.body).results); } catch { return false; }
    },
  });

  sleep(Math.random() * 2 + 1);

  // Fan bo'yicha filter
  const subjects = ["matematika", "fizika", "kimyo", "biologiya"];
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];

  const filterStart = Date.now();
  const filterRes = http.get(
    `${BASE_URL}/api/results/public?subject=${randomSubject}`
  );
  resultsDuration.add(Date.now() - filterStart);

  check(filterRes, {
    "filter: status 200": (r) => r.status === 200,
  });

  sleep(Math.random() * 3 + 2);

  // Qidiruv
  const searchStart = Date.now();
  const searchRes = http.get(
    `${BASE_URL}/api/results/public?search=Karimov`
  );
  resultsDuration.add(Date.now() - searchStart);

  check(searchRes, {
    "search: status 200": (r) => r.status === 200,
  });

  sleep(Math.random() * 2 + 1);
}
