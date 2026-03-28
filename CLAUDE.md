# FAN OLIMPIADASI — Claude Code Yo'riqnomasi

## Loyiha haqida
Oriental Universiteti "Fan Olimpiadasi" platformasi.
11-sinf o'quvchilar uchun onlayn test va reyting tizimi.

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS (custom navy-gold theme)
- Neon Postgres + Prisma ORM (database)
- NextAuth.js (auth - telefon + parol)
- Framer Motion (animatsiyalar)
- Vercel deploy

## Dizayn qoidalari
- Rang: quyuq navy (#0a1628) + oltin (#d4a843) palitra
- Font: Playfair Display (sarlavha) + Outfit (body) + JetBrains Mono (raqamlar)
- Dark theme, glassmorphic kartochkalar, spotlight effektlar
- Premium/tantanali ko'rinish
- Animatsiyalar: shimmer, shine sweep, glow pulse, floating elementlar
- Mobilga og'ir animatsiyalar o'chiriladi (useDeviceCapability hook)
- `prefers-reduced-motion` hurmat qilinadi

## Loyiha strukturasi
```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Global stillar, animatsiya keyframelar
│   ├── layout.tsx          # Root layout (fontlar)
│   └── page.tsx            # Landing sahifa
├── components/
│   ├── landing/            # Landing sahifa seksiyalari
│   │   ├── Hero.tsx        # Bosh sahifa (particle, spotlight, parallax)
│   │   ├── CountdownTimer.tsx  # Glassmorphic timer, 3D flip
│   │   ├── ParticleBackground.tsx  # Canvas particle tizimi
│   │   ├── SpotlightEffect.tsx     # Mouse-follow oltin nur
│   │   └── ...             # Boshqa seksiyalar
│   ├── shared/             # Navbar, Footer, Logo
│   ├── ui/                 # Button, Card, Modal (cn() utility)
│   ├── icons/              # SVG ikonlar
│   ├── admin/              # Admin komponentlar
│   └── test/               # Test komponentlar
├── hooks/
│   ├── useDeviceCapability.ts  # Mobile/reduced-motion aniqlash
│   ├── useSecurity.ts      # Test xavfsizlik
│   └── useTimer.ts         # Timer hook
├── lib/
│   ├── constants.ts        # Olimpiada sanasi, fanlar, jadval
│   └── utils.ts            # cn() va boshqa utility
└── types/                  # TypeScript tiplar
```

## CSS effektlar (globals.css)
- `.text-gradient-gold` — oltin gradient matn
- `.text-gradient-gold-shimmer` — animatsiyali oltin shimmer matn
- `.title-shine` — yorug'lik to'lqini sarlavha ustidan o'tadi
- `.badge-shimmer` — badge ga shimmer border
- `.shine-sweep` — button ga hover shine effekt
- `.glass-*` — glassmorphic effektlar (subtle, medium, gold, light)
- `.ornamental-line` — dekorativ oltin chiziq
- `.text-glow-gold`, `.text-glow-white` — matn glow effektlar

## Muhim qoidalar
1. Barcha matn O'ZBEK TILIDA bo'lsin
2. Test vaqtida xavfsizlik — fullscreen, tab detection, copy block
3. Savollar bazasidan RANDOM tanlash, variantlar SHUFFLE
4. Ball hisoblash: 100 / savollar_soni, qoldiq oxirgi savollarga +0.1
5. To'g'ri javob HECH QACHON client ga yuborilmasin
6. Mobile responsive — 640px dan katta barcha qurilmalarda ishlashi kerak
7. UI komponentlar src/components/ui/ da, cn() utility ishlatiladi
8. Og'ir animatsiyalar (canvas, spotlight, floating) mobilga o'chiriladi
9. CSS animatsiyalar (shimmer, glow) barcha qurilmalarda ishlaydi

## Test boshlash jarayoni (muhim!)
1. O'quvchi "Testni boshlash" bosadi
2. Server: bazadan random N ta savol tanlaydi
3. Server: attempt_questions jadvaliga yozadi (tartib + ball)
4. Server: savollar tartibini aralashtiradi
5. Agar is_shuffle_options=true → variantlar ham aralashtiriladi
6. Client ga faqat savol matni + variantlar yuboriladi (to'g'ri javob YO'Q)
7. Fullscreen yoqiladi
8. Timer boshlanadi
