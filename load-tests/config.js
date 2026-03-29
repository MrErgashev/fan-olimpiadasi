// ============================================
// Fan Olimpiadasi — Load Test Konfiguratsiyasi
// ============================================
// Bu faylda URL va kalitlarni o'zgartiring

export const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Test uchun foydalanish mumkin bo'lgan ma'lumotlar
export const TEST_CONFIG = {
  // Mavjud access code (testdan oldin yarating yoki mavjudini yozing)
  ACCESS_CODE: __ENV.ACCESS_CODE || "ORIENTAL-2026-TEST",

  // Test ID (mavjud aktiv testning ID si)
  TEST_ID: __ENV.TEST_ID || "test-id-shu-yerga",

  // Login uchun test o'quvchi
  STUDENT_PHONE: __ENV.STUDENT_PHONE || "+998901234567",
  STUDENT_PASSWORD: __ENV.STUDENT_PASSWORD || "TestParol123",
};

// Maqsadlar (thresholds)
export const THRESHOLDS = {
  // 95% so'rovlar 2 soniyadan kam
  http_req_duration_p95: 2000,
  // 99% so'rovlar 5 soniyadan kam
  http_req_duration_p99: 5000,
  // Xato foizi 1% dan kam
  http_req_failed_rate: 0.01,
};
