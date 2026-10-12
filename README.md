# Evan Atharasya · Portofolio

Situs portofolio interaktif modern berkinerja tinggi yang dimigrasikan dari file monolitik vanilla HTML/CSS/JS (`Evan Atharasya · Portofolio (1).html`) menjadi arsitektur modular **Next.js 15 (App Router)**, **React 19**, **TypeScript strict**, dan **Tailwind CSS v4** dengan 100% paritas visual dan perilaku animasi 1:1.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: [React 19](https://react.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + CSS Design Tokens & Native Keyframes di `globals.css`
- **Animasi & Scroll**:
  - [GSAP 3](https://gsap.com/) + ScrollTrigger via `@gsap/react` (`useGSAP`)
  - [Lenis](https://lenis.darkroom.engineering/) terintegrasi ke GSAP Ticker & ScrollTrigger
- **Typography**: `next/font/google` ([Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) 500/700/800 & [Figtree](https://fonts.google.com/specimen/Figtree) 400/500/600)
- **Shaders & Audio**:
  - WebGL Canvas Caustics Shader native (tanpa three.js, resolusi 0.5x, auto pause saat hidden)
  - Web Audio API synthesizer (brown noise sea swell, wind bandpass, depth lowpass, UI sound pops & whoosh)
- **Pengujian**: Playwright Smoke Tests & Browser Subagent QA
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🌊 Peta Fitur & Interaksi Utama

1. **Hero Sky Dive**:
   - Section di-pin 160% tinggi viewport dengan scrub timeline GSAP.
   - 5 awan SVG bergeser horizontal ke arah berlawanan, matahari terbenam membesar, teks copywriting memudar ke atas.
   - Deteksi **Night Mode** otomatis berdasarkan jam lokal (19:00 - 05:00) secara hydration-safe pada client.
   - Ombak pasang surut (`.tide`) naik menutup layar transisi ke laut.
2. **Global Background Depth Tweening**:
   - Variabel CSS `--c` di-tween sepanjang scroll dokumen dari `rgb(27, 127, 179)` ke `rgb(10, 63, 102)` hingga `rgb(3, 17, 31)`.
3. **Floating Glass Nav**:
   - Kapsul kaca dengan efek blur (`backdrop-filter: blur(14px)`).
   - Fluid highlight pill yang berpindah halus (`back.out(1.6)`) mengikuti menu aktif dan hover pointer.
   - Logo ikan yang miring dinamis merespons arah kecepatan scroll (`rotation: ±42deg`).
   - Mobile fullscreen overlay menu dengan transisi circular `clip-path` dari tombol burger.
4. **Interactive Altitude & Depth Gauge**:
   - Rail vertikal di sisi kanan menghitung elevasi (+3.200 m di udara &rarr; 0 m permukaan &rarr; -1.000 m zona senja).
   - Efek riak air saat menembus 0 m, peek tip alert pergantian zona, dan klik rail/titik section untuk melompat.
5. **Smart Ring Cursor**:
   - Hanya aktif pada pointer presisi (`pointer: fine`).
   - Posisi kursor di-lerp halus dengan `gsap.quickTo`.
   - Menampilkan label kontekstual: "Masuk" (ikan), "Buka" (kartu proyek), "Geser" (laut dalam).
6. **About Section**:
   - Teks statement menyala kata demi kata mengikuti scroll scrub.
   - Counter angka statistik menghitung naik otomatis saat masuk viewport (47 repo, 18 teknologi, 3 proyek utama).
   - Dua baris marquee keahlian bergerak berlawanan arah.
7. **Kinetic Marquee**:
   - Teks outline raksasa bergerak horizontal dengan kecepatan dan arah yang mengikuti kecepatan scroll pengguna.
8. **Horizontal Work Track**:
   - Pin vertikal yang menggeser track horizontal kartu proyek pilihan.
   - Rotasi dan scale masuk kartu via `containerAnimation`, 3D tilt pada hover mouse, dan kemiringan `skewX` dinamis sesuai kecepatan Lenis.
9. **Deep Sea Parallax & Curious Fish**:
   - 3 lapisan paralaks dunia bawah laut yang dapat digeser via mouse X maupun touch drag (`touch-action: pan-y`).
   - Ikan penasaran mendekati kursor saat kursor berjarak < 300px.
   - Rumput laut bergoyang SVG prosedural, sinar matahari bawah air, dan riak air saat klik.
10. **Project Portal (Case Study Modal)**:
    - Buka modal dengan transisi zoom lingkaran dari titik klik + zoom in ke mata ikan pemicu.
    - Konten studi kasus terstruktur: **Masalah**, **Solusi**, **Manfaat**, teknologi, dan tombol aksi (GitHub / demo privat via mailto).
    - Window mockup 3D dengan chip teknologi yang mengorbit.
    - Navigasi antar proyek via tombol atau panah keyboard (`ArrowRight` / `ArrowLeft`), dan tutup via `Escape`.
11. **Responsive & Aksesibilitas**:
    - Dukungan penuh `prefers-reduced-motion` (menonaktifkan animasi berlebih, layout stack vertikal di Work).
    - Skip-to-content link, focus visible outline `var(--sun)`, modal dialog `aria-modal="true"` dengan focus trapping & restoration.

---

## 📁 Struktur Direktori

```plaintext
├── docs/
│   ├── INVENTORY.md             # Analisis mendalam & inventarisasi kode awal
│   └── PORTING_NOTES.md         # Catatan pemetaan arsitektur modular
├── public/                      # Static assets
├── src/
│   ├── app/
│   │   ├── globals.css          # Design token, keyframes, utilities
│   │   ├── layout.tsx           # Root layout, Google fonts, metadata
│   │   ├── page.tsx             # Main page container & section coordinator
│   │   ├── opengraph-image.tsx  # Dynamic OG image generation
│   │   ├── robots.ts            # Robots configuration
│   │   └── sitemap.ts           # Sitemap generator
│   ├── components/
│   │   ├── fx/                  # Caustics, Bubbles, Clouds, Birds, Tide, Seaweed
│   │   ├── layout/              # Nav, MobileMenu, Gauge, Cursor, AudioControl, Toast, SkipLink
│   │   ├── portal/              # ProjectPortal, OrbitMock
│   │   └── sections/            # Hero, About, KineticMarquee, Work, Deep, Contact
│   ├── data/
│   │   ├── projects.ts          # Data terpisah proyek & studi kasus
│   │   ├── site.ts              # Data profil, links, deskripsi, zona
│   │   └── skills.ts            # Data daftar skill marquee
│   ├── hooks/                   # useLenis, useReducedMotion, useNightMode
│   ├── lib/
│   │   ├── audioEngine.ts       # Native Web Audio synthesizer
│   │   ├── gsap.ts              # Central GSAP & ScrollTrigger registry
│   │   ├── math.ts              # Interpolasi, clamp, format angka
│   │   └── shaders.ts           # WebGL caustics shaders
│   └── types/
│       └── project.ts           # TypeScript interfaces & types
├── tests/
│   └── smoke.spec.ts            # Playwright smoke tests
├── package.json
└── tsconfig.json
```

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- Node.js >= 18 (diuji pada v24)
- pnpm >= 9 (diuji pada v12)

### 1. Instalasi Dependensi
```bash
pnpm install
```

### 2. Jalankan Server Development
```bash
pnpm run dev
```
Buka browser di `http://localhost:3000`.

### 3. Build & Jalankan Mode Produksi
```bash
pnpm run build
pnpm run start
```

### 4. Menjalankan Smoke Test
```bash
pnpm run test:smoke
```

---

## ☁️ Deploy ke Vercel

Proyek ini telah dikonfigurasi penuh dan siap dideploy langsung ke [Vercel](https://vercel.com/):

### Metode 1: Melalui Vercel CLI
```bash
pnpm dlx vercel
```

### Metode 2: Melalui Dashboard Vercel (Git Integration)
1. Push branch `main` ke repository GitHub `https://github.com/ESTAS-crypto/portofolio.git`.
2. Buka dashboard Vercel & pilih **Import Project**.
3. Pilih repository `portofolio`.
4. Framework preset akan terdeteksi otomatis sebagai **Next.js**.
5. Klik **Deploy**.

---

## 📝 Lisensi & Kredit

Dibuat dengan dedikasi penuh oleh **Evan Atharasya** ([@ESTAS-crypto](https://github.com/ESTAS-crypto)).
Dibuat dengan secangkir kopi dan langit yang cerah.
