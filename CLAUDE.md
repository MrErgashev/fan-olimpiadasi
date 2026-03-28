# FAN OLIMPIADASI — Claude Code Yo'riqnomasi

## Loyiha haqida
Oriental Universiteti "Fan Olimpiadasi" platformasi.
11-sinf o'quvchilar uchun onlayn test va reyting tizimi.

## Tech Stack
- Next.js 14.2 App Router + React 18 + TypeScript 5
- Tailwind CSS 3.4 (navy-gold premium theme)
- PostgreSQL (Neon) + Prisma ORM 5
- NextAuth.js 4 (telefon + parol / email + parol)
- Framer Motion (animatsiyalar)
- Recharts (admin statistika grafiklari)
- KaTeX (matematik formulalar)
- Zod (validatsiya)
- Vercel deploy

## Loyiha tuzilishi

```
src/
├── app/
│   ├── (admin-auth)/admin/login/    # Admin login
│   ├── (auth)/                      # Student login/register
│   ├── (public)/                    # Ochiq sahifalar (results)
│   ├── (student)/dashboard/         # Student dashboard + test
│   ├── admin/                       # Admin panel (dashboard, tests, questions, results, students, access-codes, security-logs)
│   ├── api/                         # API routes (20+ endpoint)
│   ├── layout.tsx                   # Root layout (fontlar)
│   └── page.tsx                     # Landing page
├── components/
│   ├── ui/                          # UI primitives (Card, Input, Select, Button, Badge, Modal)
│   ├── landing/                     # Landing sahifa komponentlari (14 ta)
│   ├── test/                        # Test komponentlari (TestTimer, OptionButton, QuestionNav)
│   ├── Sidebar.tsx                  # Admin sidebar
│   ├── Navbar.tsx                   # Landing navbar
│   ├── StudentNavbar.tsx            # Student navbar
│   └── ...                          # Logo, Footer, Providers, ScrollToTop
├── hooks/
│   ├── useSecurity.ts               # Test xavfsizligi (fullscreen, tab, copy, devtools)
│   ├── useTimer.ts                  # Countdown timer
│   └── useDeviceCapability.ts       # Qurilma imkoniyatlari
├── lib/
│   ├── auth.ts                      # NextAuth konfiguratsiya (2 ta provider)
│   ├── db.ts                        # Prisma client singleton
│   ├── utils.ts                     # cn(), telefon format, sana format
│   ├── constants.ts                 # Fanlar, viloyatlar, sovrinlar
│   ├── scoring.ts                   # Ball hisoblash
│   ├── question-parser.ts           # Savol matnini parse qilish
│   └── validators.ts               # Zod sxemalari
└── types/
    └── next-auth.d.ts               # NextAuth tip kengaytmalari
```

## Ma'lumotlar bazasi (Prisma modellari)
- **Admin** — admin foydalanuvchilar (superadmin, admin, moderator rollari)
- **Student** — talabalar (telefon, parol, viloyat, tuman)
- **Subject** — fanlar
- **Question** — savollar (multiple choice, variantlar)
- **Test** — testlar konfiguratsiyasi
- **TestAttempt** — test urinishlari (ball, vaqt)
- **AttemptQuestion** — urinishga biriktirilgan savollar
- **AttemptAnswer** — javoblar
- **AccessCode** — ro'yxatdan o'tish kodlari
- **Region / District** — viloyat va tumanlar
- **SecurityLog** — xavfsizlik hodisalari

## API endpointlar
- `/api/auth/[...nextauth]` — NextAuth handler
- `/api/auth/register` — ro'yxatdan o'tish
- `/api/auth/verify-code` — kirish kodi tekshirish
- `/api/admin/*` — admin CRUD (tests, questions, students, results, stats, codes, security-logs)
- `/api/student/*` — test boshlash, savol olish, javob yuborish, natijalar
- `/api/subjects` — fanlar ro'yxati
- `/api/results/public` — ommaviy natijalar

## Autentifikatsiya
- **Student**: telefon + parol (NextAuth credentials)
- **Admin**: email + parol (NextAuth credentials)
- JWT strategiya, 24 soat muddati
- Middleware orqali himoyalangan: `/admin/*` (admin role), `/dashboard/*` (student role)
- Ochiq yo'llar: `/`, `/login`, `/register`, `/admin/login`, `/results/*`

## Dizayn qoidalari
- **Asosiy rang**: navy (#0a1628) + oltin (#d4a843) palitra
- **Legacy rang**: yashil (#0a3d2a) — admin/student sahifalarda
- **Fontlar**: Playfair Display (sarlavha) + Outfit (body) + JetBrains Mono (raqamlar)
- Dark theme, glassmorphic kartochkalar (glass, glass-strong, glass-gold klasslari)
- Premium animatsiyalar (glow-pulse, breathing-glow, float, shimmer)
- UI komponentlar `src/components/ui/` da, `cn()` utility ishlatiladi

## Muhim qoidalar
1. Barcha matn **O'ZBEK TILIDA** bo'lsin
2. Test vaqtida xavfsizlik — fullscreen, tab detection, copy block, devtools detection
3. Savollar bazasidan RANDOM tanlash, variantlar SHUFFLE
4. Ball hisoblash: 100 / savollar_soni, qoldiq oxirgi savollarga +0.1
5. To'g'ri javob **HECH QACHON** client ga yuborilmasin
6. Mobile responsive — 640px dan katta barcha qurilmalarda ishlashi kerak
7. Admin rollari: superadmin > admin > moderator

## Test boshlash jarayoni (muhim!)
1. O'quvchi "Testni boshlash" bosadi
2. Server: bazadan random N ta savol tanlaydi
3. Server: attempt_questions jadvaliga yozadi (tartib + ball)
4. Server: savollar tartibini aralashtiradi
5. Agar is_shuffle_options=true → variantlar ham aralashtiriladi
6. Client ga faqat savol matni + variantlar yuboriladi (to'g'ri javob YO'Q)
7. Fullscreen yoqiladi
8. Timer boshlanadi
