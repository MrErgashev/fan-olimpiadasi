// ============================================
// Senariy 2: Test boshlash yuklamasi (ENG MUHIM)
// ============================================
// Ishga tushirish:
//   k6 run scenarios/02-test-start.js
//
// Custom sozlamalar bilan:
//   k6 run --env BASE_URL=https://your-domain.com --env TEST_ID=xxx scenarios/02-test-start.js
//
// MUHIM: Bu testni ishga tushirishdan oldin test o'quvchilarni yarating!

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";
import { BASE_URL, TEST_CONFIG } from "../config.js";
import { loginStudent } from "../helpers/auth.js";

// Custom metrikalar
const testStartDuration = new Trend("test_start_duration", true);
const questionFetchDuration = new Trend("question_fetch_duration", true);
const testStartFailRate = new Rate("test_start_fail_rate");

export const options = {
  stages: [
    { duration: "30s", target: 50 },  // Sekin boshlash
    { duration: "1m", target: 200 },  // 200 ta user
    { duration: "2m", target: 200 },  // Ushlab turish
    { duration: "30s", target: 0 },   // Tushirish
  ],
  thresholds: {
    test_start_duration: ["p(95)<3000"],
    question_fetch_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  // 1-qadam: Login
  const loginRes = loginStudent(
    TEST_CONFIG.STUDENT_PHONE,
    TEST_CONFIG.STUDENT_PASSWORD
  );

  const loginOk = check(loginRes, {
    "login: muvaffaqiyatli": (r) => r.status === 200 || r.status === 302,
  });

  if (!loginOk) {
    testStartFailRate.add(1);
    sleep(2);
    return;
  }

  sleep(Math.random() + 0.5); // 0.5-1.5s

  // 2-qadam: Test boshlash
  const startTime = Date.now();
  const startRes = http.post(
    `${BASE_URL}/api/student/test/${TEST_CONFIG.TEST_ID}/start`,
    JSON.stringify({}),
    { headers: { "Content-Type": "application/json" } }
  );

  testStartDuration.add(Date.now() - startTime);

  const startOk = check(startRes, {
    "test-start: status 200": (r) => r.status === 200,
    "test-start: attemptId mavjud": (r) => {
      try { return !!JSON.parse(r.body).attemptId; } catch { return false; }
    },
  });

  if (!startOk) {
    testStartFailRate.add(1);
    sleep(1);
    return;
  }

  const testData = JSON.parse(startRes.body);

  // 3-qadam: Birinchi 5 ta savolni olish
  for (let i = 1; i <= Math.min(5, testData.totalQuestions); i++) {
    const qStart = Date.now();
    const qRes = http.get(
      `${BASE_URL}/api/student/test/${TEST_CONFIG.TEST_ID}/question/${i}`
    );

    questionFetchDuration.add(Date.now() - qStart);

    check(qRes, {
      [`savol-${i}: status 200`]: (r) => r.status === 200,
      [`savol-${i}: savol matni bor`]: (r) => {
        try { return !!JSON.parse(r.body).question?.text; } catch { return false; }
      },
      [`savol-${i}: correctAnswer yo'q`]: (r) => {
        try {
          const body = JSON.parse(r.body);
          return !body.question?.correctAnswer && !body.correctAnswer;
        } catch { return false; }
      },
    });

    sleep(Math.random() * 0.5 + 0.2); // 0.2-0.7s
  }

  testStartFailRate.add(0);
  sleep(Math.random() * 2 + 1);
}
