# FAN OLIMPIADASI — Claude Code Yo'riqnomasi

## Loyiha haqida
Oriental Universiteti "Fan Olimpiadasi" platformasi.
11-sinf o'quvchilar uchun onlayn test va reyting tizimi.

## Tech Stack
- Next.js 14.2.35 (App Router) + TypeScript 5 (strict mode)
- React 18 + Tailwind CSS 3.4.1 (custom navy-gold theme)
- PostgreSQL + Prisma ORM 5.22.0 (Neon hosted)
- NextAuth.js 4.24.13 (JWT + Credentials — telefon + parol)
- Framer Motion 12.38 (animatsiyalar)
- KaTeX + react-markdown (matematik formulalar)
- Recharts (grafiklar), Lucide React (ikonkalar)
- react-hot-toast (bildirishnomalar)
- Vercel deploy

## Loyiha tuzilishi
```
src/
├── app/                  # Next.js App Router sahifalari va API
│   ├── (admin-auth)/     # Admin login
│   ├── (auth)/           # Login, Register
│   ├── (public)/         # Natijalar sahifasi
│   ├── (student)/        # Dashboard, test, natijalar
│   ├── admin/            # Admin panel (dashboard, testlar, savollar, kodlar)
│   └── api/              # 20 ta API endpoint
├── components/
│   ├── admin/            # Admin sidebar
│   ├── icons/            # OrientalLogo
│   ├── landing/          # 15 ta landing komponent (Hero, FAQ, Prizes...)
│   ├── shared/           # Navbar, Footer, Logo, Providers
│   ├── test/             # OptionButton, QuestionNav, TestTimer
│   └── ui/               # Badge, Button, Card, Input, Modal, Select
├── hooks/                # useTimer, useSecurity, useDeviceCapability
├── lib/                  # auth, db, utils, scoring, validators, constants
├── types/                # TypeScript tiplar
└── middleware.ts          # NextAuth middleware (role-based access)
```

## Dizayn qoidalari
- Rang: navy-950 (#0a1628) + gold-500 (#d4a843) palitra
- Font: Playfair Display (sarlavha) + Outfit (body) + JetBrains Mono (raqamlar)
- Premium ko'rinish: glassmorphic kartochkalar, spotlight effektlar, glow animatsiyalar
- Tailwind custom: 16 ta keyframe animatsiya, card/glow-gold shadow'lar
- Path alias: `@/*` → `./src/*`

## Ma'lumotlar bazasi (Prisma modellari)
- **Admin** — rollar: superadmin, admin, moderator
- **Subject** — fanlar (slug, icon, emoji, tartib)
- **AccessCode** — ro'yxatdan o'tish kodlari (max uses, expiry)
- **Region / District** — viloyat / tuman
- **Student** — o'quvchilar (telefon auth, viloyat/tuman, sinf)
- **StudentSubject** — o'quvchi-fan bog'lanishi (many-to-many)
- **Question** — savollar (qiyinlik, rasm, A-D variantlar, to'g'ri javob, tushuntirish)
- **Test** — testlar (vaqt, ball qoidalari, randomizatsiya)
- **TestAttempt** — test urinishlari (boshlanish, tugash, ball, device fingerprint)
- **AttemptQuestion** — attemptga tayinlangan savollar
- **AttemptAnswer** — javoblar (vaqt, shuffled variantlar)
- **SecurityLog** — xavfsizlik hodisalari (9 tur)

## API endpointlar
- **Auth:** `/api/auth/[...nextauth]`, `/api/auth/register`, `/api/auth/verify-code`
- **Student:** `/api/student/tests`, `/api/student/test/[id]/start|question|answer|submit`, `/api/student/security-event`, `/api/student/results`
- **Admin:** `/api/admin/tests`, `/api/admin/questions`, `/api/admin/questions/bulk`, `/api/admin/codes`, `/api/admin/students`, `/api/admin/results`, `/api/admin/stats`, `/api/admin/security-logs`
- **Public:** `/api/subjects`, `/api/results/public`

## Muhim qoidalar
1. Barcha matn O'ZBEK TILIDA bo'lsin
2. Test vaqtida xavfsizlik — fullscreen, tab detection, copy block, devtools detection, device fingerprint
3. Savollar bazasidan RANDOM tanlash, variantlar SHUFFLE
4. Ball hisoblash: 100 / savollar_soni, qoldiq oxirgi savollarga +0.1
5. To'g'ri javob HECH QACHON client ga yuborilmasin
6. Mobile responsive — 640px dan katta barcha qurilmalarda ishlashi kerak
7. UI komponentlar `src/components/ui/` da, `cn()` utility ishlatiladi
8. Komponentlar `src/components/` ichida feature bo'yicha guruhlangan (landing/, shared/, test/, admin/)

## Test boshlash jarayoni (muhim!)
1. O'quvchi "Testni boshlash" bosadi
2. Server: bazadan random N ta savol tanlaydi
3. Server: attempt_questions jadvaliga yozadi (tartib + ball)
4. Server: savollar tartibini aralashtiradi
5. Agar is_shuffle_options=true → variantlar ham aralashtiriladi
6. Client ga faqat savol matni + variantlar yuboriladi (to'g'ri javob YO'Q)
7. Fullscreen yoqiladi
8. Timer boshlanadi

## Skriptlar
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint tekshirish
npm run db:push      # Prisma schema push
npm run db:seed      # Database seed
npm run db:studio    # Prisma Studio
npm run db:generate  # Prisma client generate
```
