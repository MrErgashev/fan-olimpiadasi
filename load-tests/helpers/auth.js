import http from "k6/http";
import { BASE_URL } from "../config.js";

/**
 * NextAuth orqali login qilish va session cookie olish
 */
export function loginStudent(phone, password) {
  // CSRF token olish
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  const csrfToken = JSON.parse(csrfRes.body).csrfToken;

  // Login
  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/student-login`,
    {
      phone,
      password,
      csrfToken,
      json: "true",
    },
    {
      redirects: 0,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return loginRes;
}

/**
 * Admin login
 */
export function loginAdmin(email, password) {
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  const csrfToken = JSON.parse(csrfRes.body).csrfToken;

  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/admin-login`,
    {
      email,
      password,
      csrfToken,
      json: "true",
    },
    {
      redirects: 0,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return loginRes;
}

/**
 * Session cookie bilan API ga so'rov yuborish
 */
export function authenticatedGet(url, params = {}) {
  return http.get(url, params);
}

export function authenticatedPost(url, body, params = {}) {
  return http.post(url, JSON.stringify(body), {
    ...params,
    headers: {
      "Content-Type": "application/json",
      ...(params.headers || {}),
    },
  });
}
