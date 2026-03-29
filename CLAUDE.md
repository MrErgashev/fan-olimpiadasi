# FAN OLIMPIADASI — Claude Code Yo'riqnomasi

## Loyiha haqida
Oriental Universiteti "Fan Olimpiadasi" platformasi.
11-sinf o'quvchilar uchun onlayn test va reyting tizimi.

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS (custom green-gold theme)
- Neon Postgres + Prisma ORM (database, `prisma db push` — migration'siz)
- NextAuth.js (auth - telefon + parol)
- Vercel deploy (`build: "prisma db push && next build"`)
- xlsx kutubxonasi (Excel import/export)

## Dizayn qoidalari
- Rang: quyuq yashil (#0a3d2a) + oltin (#d4a843) palitra
- Font: Playfair Display (sarlavha) + Outfit (body) + JetBrains Mono (raqamlar)
- Dark theme, glassmorphic kartochkalar, spotlight effektlar
- Premium/tantanali ko'rinish
- Admin panel: light theme, Card/Modal/Button/Input/Select/Badge komponentlari

## Muhim qoidalar
1. Barcha matn O'ZBEK TILIDA bo'lsin
2. Test vaqtida xavfsizlik — fullscreen, tab detection, copy block
3. Savollar bazasidan RANDOM tanlash, variantlar SHUFFLE
4. Ball hisoblash: 100 / savollar_soni, qoldiq oxirgi savollarga +0.1
5. To'g'ri javob HECH QACHON client ga yuborilmasin
6. Mobile responsive — 640px dan katta barcha qurilmalarda ishlashi kerak
7. UI komponentlar src/components/ui/ da, cn() utility ishlatiladi
8. Parollar faqat yaratilgan/yangilangan paytda client ga ko'rsatiladi, bazadan HECH QACHON qaytarilmaydi
9. Prisma schema o'zgartirilganda `prisma db push` build skriptida avtomatik ishlaydi — alohida migration kerak emas
10. ESLint: unused imports yo'q bo'lishi kerak, `<img>` o'rniga `next/image` yoki `eslint-disable` comment

## Test boshlash jarayoni (muhim!)
1. O'quvchi "Testni boshlash" bosadi
2. Server: bazadan random N ta savol tanlaydi
3. Server: attempt_questions jadvaliga yozadi (tartib + ball)
4. Server: savollar tartibini aralashtiradi
5. Agar is_shuffle_options=true → variantlar ham aralashtiriladi
6. Client ga faqat savol matni + variantlar yuboriladi (to'g'ri javob YO'Q)
7. Fullscreen yoqiladi
8. Timer boshlanadi

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

### API endpointlar
- `GET/POST /api/admin/students` — ro'yxat (filter, sort, pagination) + yaratish (subjectIds, returnPassword)
- `GET/PATCH/DELETE /api/admin/students/[id]` — profil (batafsil include) + tahrirlash + o'chirish
- `PATCH /api/admin/students/[id]/block` — bloklash (duration, reason → BlockHistory)
- `PATCH /api/admin/students/[id]/reset-password` — parol reset (generatePassword → hash)
- `GET /api/admin/students/[id]/block-history` — bloklash tarixi
- `PATCH /api/admin/students/[id]/archive` — arxivlash/qayta tiklash toggle
- `POST /api/admin/students/bulk-action` — bulk (block/unblock/delete/archive/unarchive)
- `POST /api/admin/students/import` — import (max 500/batch, password generatsiya)
- `GET /api/admin/students/export` — export (filtrlangan)
- `GET /api/admin/students/check-phone` — telefon dublikat tekshirish (excludeId)

### Database (Student modeli)
- `isBlocked`, `blockedAt`, `blockedReason`, `blockedUntil` — bloklash
- `isArchived`, `archivedAt` — arxivlash (soft delete)
- `BlockHistory` modeli — bloklash/blokdan chiqarish tarixi (action, reason, duration, blockedBy)
- Auth: `blockedUntil` muddati o'tgan bo'lsa avtomatik unblock

### Rollar
- `admin`, `superadmin` — to'liq CRUD
- `moderator` — faqat ko'rish (read-only)

## Loyiha strukturasi (asosiy)
```
src/
├── app/
│   ├── admin/
│   │   ├── students/
│   │   │   ├── page.tsx          — ro'yxat + filterlar
│   │   │   ├── [id]/page.tsx     — profil sahifasi
│   │   │   ├── import/page.tsx   — import wizard
│   │   │   └── _components/     — AddStudent, EditStudent, Block, Delete, BulkAction modallar
│   │   ├── dashboard/
│   │   ├── questions/
│   │   ├── tests/
│   │   ├── results/
│   │   └── settings/
│   └── api/admin/students/       — barcha API endpointlar
├── components/ui/                — Button, Card, Modal, Input, Select, Badge, Icon3D
├── lib/
│   ├── auth.ts                   — NextAuth (student-login, admin-login, blockedUntil check)
│   ├── db.ts                     — Prisma client
│   ├── validators.ts             — Zod schemalar
│   ├── student-utils.ts          — generatePassword, formatPhone, validateStudentRow
│   └── utils.ts                  — cn(), formatDate, formatTimer
└── prisma/schema.prisma          — 14 model (Student, BlockHistory, Subject, Test, ...)
