# FAN OLIMPIADASI — Claude Code Yo'riqnomasi

## Loyiha haqida
Oriental Universiteti "Fan Olimpiadasi" platformasi.
11-sinf o'quvchilar uchun onlayn test va reyting tizimi.
500+ concurrent user uchun production-ready platforma.

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS (custom navy-gold theme)
- Neon Postgres + Prisma ORM (database, `prisma db push` — migration'siz)
- NextAuth.js (auth - telefon + parol, JWT 24h session)
- Vercel deploy (`build: "prisma db push && next build"`)
- xlsx kutubxonasi (Excel import/export)
- bcryptjs (parol hashing, salt rounds: 12)
- Zod (input validation)
- react-hot-toast (bildirishnomalar)
- recharts (admin analytics)
- lucide-react (ikonkalar)

## Dizayn qoidalari
- Rang: navy (#0f172a) + oltin (#d4a843) palitra
- Font: Playfair Display (sarlavha) + Outfit (body) + JetBrains Mono (raqamlar)
- Dark theme (landing), light theme (test page, admin panel)
- Glassmorphic kartochkalar, spotlight effektlar, premium ko'rinish
- Admin panel: light theme, Card/Modal/Button/Input/Select/Badge komponentlari
- Test sahifasi: light theme, responsive (mobile + desktop alohida layoutlar)

## Muhim qoidalar
1. Barcha matn O'ZBEK TILIDA bo'lsin
2. Test vaqtida xavfsizlik — fullscreen, tab detection, copy block, devtools detection, beforeunload, multi-tab prevention
3. Savollar bazasidan RANDOM tanlash, variantlar SHUFFLE (Fisher-Yates)
4. Ball hisoblash: distributed (100/N) yoki banded_fixed_variant (admin belgilagan band'lar)
5. To'g'ri javob HECH QACHON client ga yuborilmasin — faqat server-side scoring
6. Mobile responsive — xl breakpoint da desktop/mobile layoutlar almashinadi
7. UI komponentlar src/components/ui/ da, cn() utility ishlatiladi
8. Parollar faqat yaratilgan/yangilangan paytda client ga ko'rsatiladi, bazadan HECH QACHON qaytarilmaydi
9. Prisma schema o'zgartirilganda `prisma db push` build skriptida avtomatik ishlaydi — alohida migration kerak emas
10. ESLint: unused imports yo'q bo'lishi kerak, `<img>` o'rniga `next/image` yoki `eslint-disable` comment
11. Har bir javob alohida API orqali saqlanadi (real-time save, bulk emas)
12. DB transaction'lar batch mode da ishlatilsin (alohida UPDATE loop emas, `db.$transaction([...])`)
13. Rate limiting: answer (60/min), register (3/min), verify-code (5/min)

## Test boshlash jarayoni (muhim!)
1. O'quvchi "Testni boshlash" bosadi (PIN talab qilinishi mumkin)
2. Server: bazadan random N ta savol tanlaydi (distributed) yoki belgilangan savollarni oladi (banded)
3. Server: attempt_questions + attempt_answers jadvaliga yozadi (tartib + ball)
4. Server: savollar tartibini aralashtiradi (Fisher-Yates shuffle)
5. Client ga faqat savol matni + variantlar yuboriladi (to'g'ri javob YO'Q)
6. Fullscreen yoqiladi + useSecurity hook faollashadi
7. Timer boshlanadi (server-side vaqt tekshiruvi HAR SO'ROVDA)
8. Har bir savol ochilganda: agar is_shuffle_options=true → variantlar shuffle qilinadi, mapping saqlanadi
9. Har bir javob alohida POST /answer orqali saqlanadi
10. Vaqt tugaganda auto_timeout mode da submit (server-side scoring)
11. Browser yopilsa beforeunload ogohlantirish chiqadi
12. Internet uzilsa offline banner ko'rsatiladi
13. Resume: agar attempt bor va vaqti tugamagan — davom ettirish mumkin

## Xavfsizlik tizimlari
- **beforeunload**: browser yopishda ogohlantirish (test page)
- **Fullscreen**: test boshlanishida avtomatik
- **Tab switch**: visibilitychange event → security log
- **Copy/paste/cut**: preventDefault + log
- **Right-click**: contextmenu block + log
- **Keyboard shortcuts**: F12, Ctrl+Shift+I/J/C, Ctrl+U/S/P block
- **DevTools**: window size heuristic (3s interval)
- **Window blur**: log
- **Multi-tab prevention**: BroadcastChannel orqali duplicate tab aniqlash
- **Text selection**: userSelect: none
- **Offline detection**: navigator online/offline events + qizil banner
- **Rate limiting**: in-memory sliding window
- **Security headers**: X-Frame-Options DENY, HSTS, CSP, nosniff, Permissions-Policy

## Admin o'quvchilar boshqaruvi

### Sahifalar
- `/admin/students` — Ro'yxat (filter: viloyat, sinf, holat; sort: ism/sana; export; bulk actions)
- `/admin/students/[id]` — Profil (test natijalari, bloklash tarixi, xavfsizlik loglari)
- `/admin/students/import` — Excel/CSV import (3 bosqich: fayl → validatsiya → natija; batch 500 tadan)

### O'quvchi CRUD
- **Qo'shish**: AddStudentModal — fan tanlash, parol generatsiya + nusxalash, muvaffaqiyat ekrani, telefon dublikat check
- **Tahrirlash**: EditStudentModal — barcha maydonlar + fanlar + parol reset
- **Bloklash**: BlockStudentModal — muddatli (1kun/3kun/1hafta/1oy/doimiy), sabab kategoriyalari, bloklash tarixi (BlockHistory)
- **O'chirish**: DeleteStudentModal — ism yozib tasdiqlash, statistika, arxivlash varianti
- **Arxivlash**: soft delete — `isArchived=true`, ro'yxatdan yashiriladi, qayta tiklanadi
- **Bulk**: block/unblock/delete/archive/unarchive (100 tagacha)
- **Export**: filtrlangan ro'yxatni .xlsx ga yuklab olish

### Admin boshqa sahifalar
- `/admin/dashboard` — Statistika, analytics, hozir test ishlayotganlar, cleanup
- `/admin/questions` — Savollar CRUD + bulk import + parser
- `/admin/tests` — Test yaratish/tahrirlash, scoring mode, vaqt oynasi, PIN
- `/admin/results` — Natijalar ko'rish + export
- `/admin/security-logs` — Xavfsizlik loglari (red/yellow/green flagging)
- `/admin/access-codes` — Kirish kodlari generatsiya
- `/admin/notifications` — Bildirishnomalar yuborish
- `/admin/settings` — Sayt sozlamalari

### Student API endpointlar
- `POST /api/student/test/[id]/start` — Test boshlash (PIN, resume, random savollar)
- `GET /api/student/test/[id]/question/[n]` — N-chi savol (correctAnswer YUBORILMAYDI)
- `POST /api/student/test/[id]/answer` — Javob saqlash (rate limited: 60/min)
- `POST /api/student/test/[id]/submit` — Test yakunlash (server-side scoring, batch transaction)
- `GET /api/student/tests` — Mavjud testlar ro'yxati
- `GET /api/student/results` — O'z natijalari
- `GET /api/student/results/[attemptId]` — Batafsil natija (ownership check)
- `GET/PATCH /api/student/profile` — Profil
- `POST /api/student/security-event` — Xavfsizlik eventlari (batch)

### Admin API endpointlar
- `GET/POST /api/admin/students` — ro'yxat + yaratish
- `GET/PATCH/DELETE /api/admin/students/[id]` — profil + tahrirlash + o'chirish
- `PATCH /api/admin/students/[id]/block` — bloklash (duration, reason → BlockHistory)
- `PATCH /api/admin/students/[id]/reset-password` — parol reset
- `GET /api/admin/students/[id]/block-history` — bloklash tarixi
- `PATCH /api/admin/students/[id]/archive` — arxivlash toggle
- `POST /api/admin/students/bulk-action` — bulk amallar
- `POST /api/admin/students/import` — import (max 500/batch)
- `GET /api/admin/students/export` — export
- `GET /api/admin/students/check-phone` — telefon dublikat tekshirish
- `GET/POST /api/admin/questions` — savollar CRUD
- `GET/PATCH/DELETE /api/admin/questions/[id]` — savol tahrirlash
- `GET/POST /api/admin/tests` — testlar CRUD
- `GET/PATCH/DELETE /api/admin/tests/[id]` — test tahrirlash
- `GET /api/admin/results` — natijalar
- `GET /api/admin/active-attempts` — hozir test ishlayotganlar
- `POST /api/admin/cleanup` — vaqti tugagan testlarni avtomatik baholash (batch transaction)
- `GET /api/admin/security-logs` — xavfsizlik loglari
- `GET /api/admin/analytics` — statistika
- `GET /api/admin/stats` — umumiy raqamlar

### Auth API endpointlar
- `POST /api/auth/register` — ro'yxatdan o'tish (access code, rate limited: 3/min)
- `POST /api/auth/verify-code` — access code tekshirish (rate limited: 5/min)
- `POST/GET /api/auth/[...nextauth]` — NextAuth handlers

### Database (Student modeli)
- `isBlocked`, `blockedAt`, `blockedReason`, `blockedUntil` — bloklash
- `isArchived`, `archivedAt` — arxivlash (soft delete)
- `BlockHistory` modeli — bloklash/blokdan chiqarish tarixi (action, reason, duration, blockedBy)
- Auth: `blockedUntil` muddati o'tgan bo'lsa avtomatik unblock

### Rollar
- `admin`, `superadmin` — to'liq CRUD
- `moderator` — faqat ko'rish (read-only)

## Database modellari (17 ta)
1. **Admin** — admin akkauntlar (email, role: superadmin/admin/moderator)
2. **Subject** — fanlar (7 ta: Matematika, Informatika, Tarix, Ingliz tili, Biologiya, Ona tili, Jismoniy tarbiya)
3. **AccessCode** — kirish kodlari (ORIENTAL-XXXX-XXXX, maxUses, currentUses)
4. **Region** — viloyatlar (14 ta)
5. **District** — tumanlar
6. **Student** — o'quvchilar (phone unique, blocking, archiving)
7. **StudentSubject** — o'quvchi-fan bog'lanishi (many-to-many)
8. **Question** — savollar bazasi (4 variant, correctAnswer, difficulty, rasmlar)
9. **Test** — testlar (scoringMode: distributed/banded_fixed_variant, vaqt oynasi, PIN)
10. **TestAttempt** — test urinishlari (@@unique([studentId, testId]), IP, userAgent)
11. **AttemptQuestion** — urinishdagi savollar (displayOrder, assignedScore)
12. **AttemptAnswer** — javoblar (selectedAnswer, shuffledOptions mapping, isCorrect, score)
13. **SecurityLog** — xavfsizlik eventlari (9 ta event type)
14. **BlockHistory** — bloklash tarixi
15. **ActiveSession** — aktiv sessiyalar (1 o'quvchi = 1 qurilma)
16. **SiteSetting** — sayt sozlamalari (key-value)
17. **Notification** — bildirishnomalar
18. **TestQuestion** — test uchun tanlangan savollar (banded mode)
19. **TestScoreBand** — ball band'lari (banded mode)

## DB Indexlar (performance uchun muhim)
- `AttemptAnswer` — @@index([attemptId])
- `AttemptQuestion` — @@index([attemptId])
- `SecurityLog` — @@index([attemptId]), @@index([studentId])
- `Question` — @@index([subjectId])
- `TestAttempt` — @@index([studentId]), @@index([testId])
- `Notification` — @@index([recipientId, recipientType])

## Scoring tizimlari
- **distributed**: 100 / N, qoldiq birinchi savollarga +0.1 (masalan: 30 savol → 20×3.3 + 10×3.4 = 100)
- **banded_fixed_variant**: admin belgilagan savollar + ball band'lari (fromQuestion, toQuestion, scorePerQuestion)
- Ball hisoblash FAQAT server-side (submit endpoint da)
- Shuffle mapping reverse qilinadi: client javob A → mapping[A]=C → C vs correctAnswer

## Loyiha strukturasi (to'liq)
```
src/
├── app/
│   ├── (public)/                     — Landing + public natijalar
│   │   ├── page.tsx                  — Homepage (hero, schedule, prizes)
│   │   └── results/[subject]/        — Public natijalar
│   ├── (auth)/                       — Auth sahifalar
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (student)/                    — Student dashboard
│   │   ├── dashboard/page.tsx        — Bosh sahifa (testlar ro'yxati)
│   │   ├── dashboard/test/[id]/page.tsx — Test yechish interfeysi (ASOSIY)
│   │   ├── dashboard/results/page.tsx   — Natijalar
│   │   └── layout.tsx                — StudentNavbar
│   ├── (admin-auth)/                 — Admin login
│   │   └── admin/login/page.tsx
│   ├── admin/                        — Admin panel
│   │   ├── dashboard/page.tsx        — Statistika + analytics
│   │   ├── students/                 — O'quvchilar boshqaruvi
│   │   │   ├── page.tsx              — ro'yxat + filterlar
│   │   │   ├── [id]/page.tsx         — profil sahifasi
│   │   │   ├── import/page.tsx       — import wizard
│   │   │   └── _components/          — Modallar
│   │   ├── questions/                — Savollar boshqaruvi
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/edit/page.tsx
│   │   │   ├── import/page.tsx
│   │   │   └── bulk/route.ts
│   │   ├── tests/                    — Testlar boshqaruvi
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── results/                  — Natijalar
│   │   ├── security-logs/            — Xavfsizlik loglari
│   │   ├── access-codes/             — Kirish kodlari
│   │   ├── notifications/            — Bildirishnomalar
│   │   ├── settings/                 — Sozlamalar
│   │   └── layout.tsx                — Admin Sidebar
│   └── api/                          — 45+ API endpoint
│       ├── auth/                     — NextAuth + register + verify-code
│       ├── admin/                    — Admin CRUD endpointlar
│       │   ├── students/             — O'quvchilar (CRUD + bulk + import + export)
│       │   ├── questions/            — Savollar (CRUD + bulk)
│       │   ├── tests/                — Testlar (CRUD)
│       │   ├── results/              — Natijalar
│       │   ├── cleanup/route.ts      — Vaqti tugagan testlarni baholash
│       │   ├── active-attempts/route.ts — Hozir test ishlayotganlar
│       │   ├── security-logs/route.ts
│       │   ├── analytics/route.ts
│       │   └── stats/route.ts
│       └── student/                  — Student test endpointlar
│           ├── test/[id]/start/route.ts    — Test boshlash
│           ├── test/[id]/question/[n]/route.ts — Savol olish
│           ├── test/[id]/answer/route.ts   — Javob saqlash
│           ├── test/[id]/submit/route.ts   — Test yakunlash
│           ├── tests/route.ts              — Testlar ro'yxati
│           ├── results/route.ts            — Natijalar
│           ├── profile/route.ts            — Profil
│           └── security-event/route.ts     — Xavfsizlik eventlari
├── components/
│   ├── ui/                           — Button, Card, Modal, Input, Select, Badge, Icon3D
│   ├── landing/                      — Hero, SubjectsGrid, Schedule, Prizes, FAQ, CountdownTimer
│   ├── admin/                        — Sidebar, TestScoringConfigurator
│   ├── shared/                       — Navbar, StudentNavbar, Footer, Logo, NotificationBell
│   ├── test/                         — TestTimer, QuestionNav, OptionButton
│   └── icons/                        — OrientalLogo
├── hooks/
│   ├── useTimer.ts                   — Countdown timer (warning 5min, critical 1min)
│   └── useSecurity.ts                — Anti-cheating (fullscreen, tab, copy, devtools, multi-tab)
├── lib/
│   ├── auth.ts                       — NextAuth config (student + admin providers)
│   ├── db.ts                         — Prisma singleton client
│   ├── validators.ts                 — Zod schemalar
│   ├── student-utils.ts              — generatePassword, formatPhone, validateStudentRow
│   ├── utils.ts                      — cn(), formatDate, formatTimer, timezone
│   ├── rate-limit.ts                 — In-memory sliding window rate limiter
│   ├── scoring.ts                    — Ball hisoblash (distributed + banded)
│   ├── test-config.ts                — Test konfiguratsiya validatsiyasi
│   ├── question-parser.ts            — Savol matn parser (242 qator)
│   ├── question-shuffler.ts          — Savol aralashtirish
│   ├── test-attempt-progress.ts      — Progress tracking (answered/remaining/canSubmit)
│   ├── settings.ts                   — SiteSetting CRUD
│   ├── constants.ts                  — SUBJECTS, REGIONS, PRIZES, SCHEDULE, OLYMPIAD_DATE
│   └── icon-map.ts                   — Icon mappings
├── middleware.ts                      — Route protection (admin, student, public)
└── prisma/
    ├── schema.prisma                  — 19 model, DB indexlar
    └── seed.ts                        — Subjects, regions, admin, default codes
