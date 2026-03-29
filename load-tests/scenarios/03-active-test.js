// ============================================
// Senariy 3: Test yechish yuklamasi (Active Test)
// ============================================
// Ishga tushirish:
//   k6 run scenarios/03-active-test.js
//
// 500 ta user bir vaqtda test yechadi, har 30-60 soniyada javob yuboradi

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";
import { BASE_URL, TEST_CONFIG } from "../config.js";
import { loginStudent } from "../helpers/auth.js";

// Custom metrikalar
const answerSaveDuration = new Trend("answer_save_duration", true);
const answerFailRate = new Rate("answer_fail_rate");

export const options = {
  stages: [
    { duration: "1m", target: 100 },  // Sekin boshlash
    { duration: "2m", target: 500 },  // 500 ga ko'tarish
    { duration: "5m", target: 500 },  // 5 daqiqa ushlab turish
    { duration: "1m", target: 0 },    // Tushirish
  ],
  thresholds: {
    answer_save_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
    answer_fail_rate: ["rate<0.02"],
  },
};

export default function () {
  // Login
  loginStudent(TEST_CONFIG.STUDENT_PHONE, TEST_CONFIG.STUDENT_PASSWORD);

  sleep(1);

  // Test boshlash (yoki davom ettirish)
  const startRes = http.post(
    `${BASE_URL}/api/student/test/${TEST_CONFIG.TEST_ID}/start`,
    JSON.stringify({}),
    { headers: { "Content-Type": "application/json" } }
  );

  if (startRes.status !== 200) {
    answerFailRate.add(1);
    sleep(5);
    return;
  }

  const testData = JSON.parse(startRes.body);
  const totalQ = testData.totalQuestions || 30;

  // Savollarni birma-bir yechish
  for (let i = 1; i <= totalQ; i++) {
    // Savolni olish
    const qRes = http.get(
      `${BASE_URL}/api/student/test/${TEST_CONFIG.TEST_ID}/question/${i}`
    );

    if (qRes.status !== 200) {
      answerFailRate.add(1);
      continue;
    }

    const qData = JSON.parse(qRes.body);
    const questionId = qData.question?.id;
    if (!questionId) continue;

    // O'ylash vaqti (30-60 soniya — realistik)
    sleep(Math.random() * 30 + 30);

    // Javob yuborish
    const answers = ["A", "B", "C", "D"];
    const randomAnswer = answers[Math.floor(Math.random() * 4)];

    const ansStart = Date.now();
    const ansRes = http.post(
      `${BASE_URL}/api/student/test/${TEST_CONFIG.TEST_ID}/answer`,
      JSON.stringify({ questionId, answer: randomAnswer }),
      { headers: { "Content-Type": "application/json" } }
    );

    answerSaveDuration.add(Date.now() - ansStart);

    const ok = check(ansRes, {
      "answer: status 200": (r) => r.status === 200,
      "answer: saved=true": (r) => {
        try { return JSON.parse(r.body).saved === true; } catch { return false; }
      },
    });

    answerFailRate.add(ok ? 0 : 1);
  }

  sleep(2);
}
