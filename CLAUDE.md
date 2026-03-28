# FAN OLIMPIADASI — Claude Code Yo'riqnomasi

## Loyiha haqida
Oriental Universiteti "Fan Olimpiadasi" platformasi.
11-sinf o'quvchilar uchun onlayn test va reyting tizimi.

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS (custom green-gold theme + accent ranglar)
- Framer Motion (animatsiyalar)
- Lucide React (ikonalar)
- Recharts (grafiklar)
- Neon Postgres + Prisma ORM (database)
- NextAuth.js (auth - telefon + parol)
- Vercel deploy

## Dizayn tizimi (Premium UI)

### Rang palitrasi
- **Asosiy yashil:** #062a1e (900) → #22996a (500)
- **Oltin:** #d4a843 (500) → #f0d68a (300)
- **Fan accent ranglari:**
  - Matematika: blue/purple
  - Informatika: cyan/blue
  - Tarix: amber/orange
  - Ingliz tili: red/pink
  - Biologiya: emerald/teal
  - Ona tili: violet/purple
  - Jismoniy tarbiya: orange/red

### Fontlar
- Playfair Display — sarlavhalar (font-display)
- Outfit — body matn (font-body)
- JetBrains Mono — raqamlar, timer, kod (font-mono)

### Glassmorphism darajalari (4 ta)
- `.glass-subtle` — bg-white/3%, blur-8px, border-white/6%
- `.glass-medium` — bg-white/6%, blur-16px, border-white/8%
- `.glass-strong` — bg-green-800/60%, blur-24px, border-white/10%
- `.glass-gold` — bg-gold/5%, blur-16px, border-gold/15%
- `.glass` va `.glass-light` — legacy, saqlanadi

### Animatsiyalar
- `animate-gradient` — gradient-shift 3s (tugmalar uchun)
- `animate-float` — translateY 6s (dekorativ elementlar)
- `animate-glow-pulse` — box-shadow 2s (oltin glow)
- `animate-shine` — sweep 3s (podium)
- `animate-shimmer` — skeleton loading 1.5s
- `animate-slide-up` — kirish animatsiya 0.3s

### Utility klasslar
- `.glow-gold` / `.glow-green` — box-shadow effekt
- `.text-glow-gold` — text-shadow effekt
- `.gradient-divider` — seksiyalar orasidagi chiziq
- `.ornamental-line` — sarlavha dekor (64px gold gradient)
- `.noise-overlay` — subtle texture
- `.gradient-btn-premium` — animated gradient tugma
- `.skeleton` — yuklanish holati

### Tipografiya ierarxiyasi
- H1 (Hero): text-5xl → text-9xl
- H2 (Section): text-3xl → text-6xl
- H3 (Card): text-xl → text-2xl
- Body: text-base → text-lg, leading-relaxed
- Display numbers: text-4xl → text-6xl, font-mono, font-black

### Spacing
- Section padding: py-24 sm:py-32 lg:py-40
- Card padding: p-6 sm:p-7 (default), p-8 sm:p-10 (feature)
- Kompanentlar orasida: gap-5 → gap-6

### Micro-interactions
- Har bir interactive element: transition-all duration-300
- Hover: scale-[1.02] yoki -translate-y-1
- Active: scale-[0.98]
- Focus: ring-2 ring-gold-500/50 ring-offset-2

## UI Komponentlar

### Button (src/components/ui/Button.tsx)
- Variantlar: primary, premium, secondary, outline, ghost, danger
- Sizes: sm, md, lg, xl
- Props: loading (spinner), icon (ReactNode)
- Premium: animated gradient + glow hover

### Card (src/components/ui/Card.tsx)
- Variantlar: glass, solid, gold, glass-subtle, glass-strong, glass-gold, elevated, interactive, feature
- hover prop mavjud

### Input (src/components/ui/Input.tsx)
- icon prop — chap tomonda ikon
- Gold focus glow: shadow-[0_0_0_3px_rgba(212,168,67,0.1)]

### Modal (src/components/ui/Modal.tsx)
- Framer Motion entry/exit animatsiya
- Sizes: sm, md, lg, xl
- Gold accent line yuqorida
- backdrop-blur-xl

### Badge (src/components/ui/Badge.tsx)
- Variantlar: default, success, warning, error, gold, info
- Sizes: sm, md, lg

### Select (src/components/ui/Select.tsx)
- Chevron rotate animatsiya on focus

## Muhim qoidalar
1. Barcha matn O'ZBEK TILIDA bo'lsin
2. Test vaqtida xavfsizlik — fullscreen, tab detection, copy block
3. Savollar bazasidan RANDOM tanlash, variantlar SHUFFLE
4. Ball hisoblash: 100 / savollar_soni, qoldiq oxirgi savollarga +0.1
5. To'g'ri javob HECH QACHON client ga yuborilmasin
6. Mobile responsive — 375px dan katta barcha qurilmalarda ishlashi kerak
7. UI komponentlar src/components/ui/ da, cn() utility ishlatiladi
8. Backend kodni UMUMAN O'ZGARTIRMA — faqat frontend
9. Framer Motion faqat kerakli joyda — keraksiz re-render'lardan saqlaning
10. Accessibility — focus state, aria-label saqlash

## Test boshlash jarayoni (muhim!)
1. O'quvchi "Testni boshlash" bosadi
2. Server: bazadan random N ta savol tanlaydi
3. Server: attempt_questions jadvaliga yozadi (tartib + ball)
4. Server: savollar tartibini aralashtiradi
5. Agar is_shuffle_options=true → variantlar ham aralashtiriladi
6. Client ga faqat savol matni + variantlar yuboriladi (to'g'ri javob YO'Q)
7. Fullscreen yoqiladi
8. Timer boshlanadi

## Loyiha tuzilmasi
```
src/
├── app/
│   ├── globals.css          # CSS utilities, glassmorphism, animatsiyalar
│   ├── layout.tsx           # Root layout (fontlar, providers)
│   ├── page.tsx             # Landing page (noise-overlay, gradient-dividers)
│   ├── (auth)/              # Login, Register
│   ├── (student)/dashboard/ # Student dashboard, test/[id]
│   ├── (public)/results/    # Public leaderboard
│   ├── admin/               # Admin panel
│   └── api/                 # API routes (O'ZGARTIRMA!)
├── components/
│   ├── ui/                  # Button, Card, Input, Modal, Badge, Select
│   ├── shared/              # Navbar, Footer, Logo, StudentNavbar
│   ├── landing/             # Hero, CountdownTimer, SubjectsGrid, PrizePodium, Schedule, ContactSection, ParticleBackground
│   ├── test/                # TestTimer, OptionButton, QuestionNav
│   └── admin/               # Sidebar
├── hooks/                   # useTimer, useSecurity
├── lib/                     # utils, constants, auth, db, scoring, validators
└── types/                   # TypeScript declarations
```
