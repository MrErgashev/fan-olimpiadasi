# FAN OLIMPIADASI — Claude Code Yo'riqnomasi

## Loyiha haqida
Oriental Universiteti "Fan Olimpiadasi" platformasi.
11-sinf o'quvchilar uchun onlayn test va reyting tizimi.
7 ta fan: Matematika, Informatika, Tarix, Ingliz tili, Biologiya, Ona tili, Jismoniy tarbiya.

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS (custom navy-gold theme)
- Neon Postgres + Prisma ORM (database)
- NextAuth.js v4 (auth — telefon+parol / email+parol)
- Framer Motion (animatsiyalar)
- Zod (validatsiya)
- KaTeX (matematik formulalar)
- Vercel deploy

## Loyiha tuzilmasi
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Student auth (login, register)
│   ├── (admin-auth)/       # Admin auth (admin/login)
│   ├── (student)/          # Student dashboard, test, results
│   ├── (admin)/            # Admin panel (dashboard, questions, tests, students, results, codes, security-logs)
│   ├── (public)/           # Umumiy natijalar sahifasi
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Button, Input, Select, Card, Badge, Modal
│   ├── shared/             # Navbar, StudentNavbar, Footer, Logo, Providers, ScrollToTop
│   ├── landing/            # Hero, CountdownTimer, SubjectsGrid, PrizesSection, FAQ, Schedule va boshqalar
│   ├── test/               # TestTimer, QuestionNav, OptionButton
│   ├── admin/              # Sidebar
│   └── icons/              # OrientalLogo SVG
├── lib/
│   ├── auth.ts             # NextAuth config (student-login, admin-login providers)
│   ├── db.ts               # Prisma client singleton
│   ├── constants.ts        # Fanlar, viloyatlar, sovrinlar, sana, kontakt
│   ├── validators.ts       # Zod sxemalar (accessCode, register, login)
│   ├── scoring.ts          # Ball hisoblash (100 ball taqsimlash)
│   ├── question-parser.ts  # Savollarni bulk import qilish parseri
│   └── utils.ts            # cn(), formatPhone(), formatDate(), formatTimer()
├── hooks/
│   ├── useSecurity.ts      # Test xavfsizlik monitoring
│   ├── useTimer.ts         # Countdown timer
│   └── useDeviceCapability.ts
└── types/
    └── next-auth.d.ts      # NextAuth tip kengaytmalari
```

## API Routes
**Auth:** `/api/auth/[...nextauth]`, `/api/auth/register`, `/api/auth/verify-code`
**Student:** `/api/student/tests`, `/api/student/results`, `/api/student/test/[id]/start`, `/api/student/test/[id]/question/[n]`, `/api/student/test/[id]/answer`, `/api/student/test/[id]/submit`, `/api/student/security-event`
**Admin:** `/api/admin/tests`, `/api/admin/questions`, `/api/admin/questions/bulk`, `/api/admin/students`, `/api/admin/results`, `/api/admin/codes`, `/api/admin/security-logs`, `/api/admin/stats`
**Public:** `/api/subjects`, `/api/results/public`

## Database modellari (Prisma)
Admin, Student, Subject, Region, District, AccessCode, StudentSubject, Question, Test, TestAttempt, AttemptAnswer, AttemptQuestion, SecurityLog

## Dizayn qoidalari
- Rang: navy (#0a3d2a) + oltin (#d4a843) palitra
- Font: Playfair Display (sarlavha) + Outfit (body) + JetBrains Mono (raqamlar)
- Dark theme, glassmorphic kartochkalar, spotlight effektlar
- Premium/tantanali ko'rinish
- Framer Motion animatsiyalar

## Muhim qoidalar
1. Barcha matn O'ZBEK TILIDA bo'lsin
2. Test vaqtida xavfsizlik — fullscreen, tab detection, copy block, devtools block
3. Savollar bazasidan RANDOM tanlash, variantlar SHUFFLE
4. Ball hisoblash: 100 / savollar_soni, qoldiq oxirgi savollarga +0.1
5. To'g'ri javob HECH QACHON client ga yuborilmasin
6. Mobile responsive — 640px dan katta barcha qurilmalarda ishlashi kerak
7. UI komponentlar src/components/ui/ da, cn() utility ishlatiladi
8. Logo komponent (`src/components/shared/Logo.tsx`) — size: sm/md/lg/xl, variant: light/dark

## Auth tizimi
- **Student:** telefon + parol → `student-login` provider
- **Admin:** email + parol → `admin-login` provider (rollar: superadmin, admin, moderator)
- **Middleware:** `/dashboard/*` → student only, `/admin/*` → admin only
- **Session:** JWT strategiya, 24 soat

## Test boshlash jarayoni (muhim!)
1. O'quvchi "Testni boshlash" bosadi
2. Server: bazadan random N ta savol tanlaydi
3. Server: attempt_questions jadvaliga yozadi (tartib + ball)
4. Server: savollar tartibini aralashtiradi
5. Agar is_shuffle_options=true → variantlar ham aralashtiriladi
6. Client ga faqat savol matni + variantlar yuboriladi (to'g'ri javob YO'Q)
7. Fullscreen yoqiladi
8. Timer boshlanadi

## Xavfsizlik monitoringi (useSecurity hook)
Tab switch, fullscreen exit, copy attempt, devtools open, right click, keyboard shortcut, window blur, suspicious speed, multiple device — barchasi server ga log qilinadi.

## Seed ma'lumotlar
- Default admin: admin@oriental.uz / admin123
- Test access code: ORIENTAL-2026-TEST (100 ta ishlatish)
- 7 ta fan va 14 ta viloyat oldindan kiritilgan

## Environment variables
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_URL` — App URL
- `NEXTAUTH_SECRET` — JWT secret
