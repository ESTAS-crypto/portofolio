# UPDATE INVENTORY & RENCANA IMPLEMENTASI (Portfolio-v3 Porting)

Dokumen ini disusun sebagai **Langkah 0: Analisis & Rencana Arsitektur** sebelum memulai proses coding pembaruan portofolio dari file spesifikasi referensi `Evan Atharasya · Portofolio (4).html` (Portfolio-v3) ke dalam basis kode Next.js 15 + React 19 + TypeScript.

---

## 1. Inventarisasi Struktur Repo Saat Ini

### 1.1 Komponen (`src/components/`)
- **`fx/`**:
  - `Birds.tsx`: 4 burung camar SVG terbang di langit hero.
  - `Bubbles.tsx`: Gelembung latar CSS + integrasi kanvas WebGL Caustics.
  - `Caustics.tsx`: Kanvas WebGL shader caustics air laut interaktif.
  - `Clouds.tsx`: 5 awan SVG dengan arah paralaks berlawanan di hero.
  - `Seaweed.tsx`: Rumput laut SVG bergoyang di section laut dalam.
  - `Tide.tsx`: Ombak SVG ganda naik saat menyelam.
- **`layout/`**:
  - `AudioControl.tsx`: Kapsul audio v1 (hanya tombol suara + slider).
  - `Cursor.tsx`: Smart cursor 36px dengan label dinamis ("Masuk", "Buka", "Geser").
  - `Gauge.tsx`: Penunjuk ketinggian/kedalaman vertikal desktop & kapsul mobile.
  - `MobileMenu.tsx`: Menu fullscreen melingkar (`clip-path: circle(...)`).
  - `Nav.tsx`: Navbar kaca dengan pill cair, indikator progres, dan logo ikan dinamis.
  - `ScrollProgress.tsx`: Garis progres atas 3px.
  - `SkipLink.tsx`: Aksesibilitas skip ke `#about`.
  - `SvgSymbols.tsx`: Master symbol `#cl`, `#fish`, `#wv`.
  - `Toast.tsx`: Notifikasi pill mengambang.
- **`portal/`**:
  - `ProjectPortal.tsx`: Modal dialog studi kasus proyek dengan mockup 3D & orbit tags.
- **`sections/`**:
  - `Hero.tsx`: Section langit, matahari, judul split-char, dan pasang surut.
  - `About.tsx`: Teks statement scrubbed, counter statistik, dan 2 baris marquee teknologi.
  - `KineticMarquee.tsx`: Marquee outline raksasa yang peka kecepatan scroll.
  - `Work.tsx`: Pin horizontal track kartu proyek pilihan dengan tilt & skew.
  - `Deep.tsx`: Section laut dalam 3 layer paralaks (L0, L1, L2) dengan ikan proyek.
  - `Contact.tsx`: Section ajakan kolaborasi dengan tombol email magnetik & salin clipboard.

### 1.2 Hooks (`src/hooks/`)
- `useLenis.tsx`: Provider context Lenis smooth scroll terhubung ke GSAP ScrollTrigger.
- `useNightMode.ts`: Deteksi waktu malam lokal (19:00 - 05:00) untuk tampilan langit.
- `useReducedMotion.ts`: Deteksi prefers-reduced-motion media query.

### 1.3 Library & Utilitas (`src/lib/`)
- `audioEngine.ts`: Implementasi AudioEngine v1 (noise buffer dasar + click pop / sweep).
- `gsap.ts`: Registrasi plugin GSAP & ScrollTrigger.
- `math.ts`: Fungsi `clamp` dan `lerp`.
- `shaders.ts`: Vertex dan Fragment shader WebGL untuk efek caustics.

### 1.4 Data & Tipe (`src/data/`, `src/types/`)
- `data/projects.ts`: Daftar 10 proyek lengkap dengan masalah, solusi, manfaat, tag, warna.
- `data/skills.ts`: Array 18 teknologi yang dikuasai.
- `data/site.ts`: Metadata portofolio dan tautan sosial.
- `types/project.ts`: Definisi interface TypeScript untuk Project & Story.

---

## 2. Analisis Perbandingan: Reference Portfolio-v3 vs Repo Saat Ini

| Fitur / Modul | Status di Repo Saat Ini | Spesifikasi di Portfolio-v3 (HTML Referensi) | Perubahan / Aksi Porting |
|---|---|---|---|
| **Mode Tenang (Calm Mode)** | ❌ Belum ada | Tombol `#calmBtn` di kapsul audio, toggle `.calm` pada `<html>`, simpan ke `localStorage('calm')`. Menyembunyikan seluruh makhluk, gelembung kursor, reef canvas, burung, mematikan audio, toast status, pintasan `C`. | Buat `CalmContext` / integrasikan ke `OceanStore`. Tambahkan tombol gelombang di `AudioControl`. Pasang selector `.calm` di CSS. |
| **Mesin Audio (AudioEngine v2)** | ⚠️ Versi v1 sederhana | Versi v2 lengkap: 4 layer (angin, ombak, air, drone 3 osc) dengan pink noise 6 detik, mapping kedalaman multi-filter (lowpass master 9000Hz s.d. 450Hz), efek plunge (-8m), emerge (+8m), card sweep, nyanyian paus, geraman megalodon. Pop klik acak dihapus. | Tulis ulang `src/lib/audioEngine.ts` menjadi AudioEngine v2 murni. Pertahankan efek sweep klik ikan/proyek. |
| **Karakter Penyelam (Buddy)** | ❌ Belum ada (hanya SVG diam di versi awal) | Komponen SVG berpersendian lengkap: lengan, kaki berkibar, syal berombak, senter menyala di kedalaman, mata melacak kursor, kedipan acak, interaksi salto + gelembung saat diklik, ikan peliharaan mengorbit, balon ucapan kontekstual. | Buat komponen `src/components/fx/Buddy.tsx` dengan pergerakan frame-by-frame via single ticker. |
| **Reef Canvas (Terumbu 2D)** | ❌ Belum ada (ikan lama static di Deep.tsx) | Satu fixed canvas z-20 menggabungkan kawanan ikan boids (12-26 ekor) + ubur-ubur bercahaya (4-7 ekor). Fitur: ikan mengejar pakan saat air diklik (4 butir), ubur-ubur bisa di-drag & dilempar, efek sambaran petir zap berantai, percikan plankton. | Buat komponen `src/components/fx/ReefCanvas.tsx`. Terhubung ke store mutable untuk menghindari thrashing DOM. |
| **Paus & Megalodon v3** | ❌ Belum ada | Makhluk laut raksasa SVG dengan deformasi kontur kurva Bezier tertutup Catmull-Rom real-time (bukan rotasi statis). Scheduler RNG (rollMin 2-10s, cooldown 8-22s, paus >= 150m, megalodon >= 400m). Mode uji terpisah. Broadcast `threat` ke ikan terumbu. Efek suara nyanyian paus / geraman megalodon + vignette merah. | Buat `src/components/fx/Creatures.tsx` dan `src/lib/oceanConfig.ts`. |
| **Filter Skill ke Proyek** | ❌ Chip teks biasa | Chip di About marquee interaktif (`role="button"`). Klik memilih filter skill, menyorot ikan & kartu proyek yang cocok (`.hit`), meredupkan yang lain (`.dim`). Toast jumlah proyek. Pause on hover. | Update `About.tsx`, `Work.tsx`, dan `Deep.tsx` agar membaca `activeSkill` dari `OceanStore`. |
| **Riak Air Hero** | ❌ Belum ada | Kanvas riak elips di batas laut hero (y: 80%-97%). Muncul saat mouse bergerak >26px atau saat diklik (3 riak). Memudar seiring scroll. | Buat `src/components/fx/RippleCanvas.tsx` di dalam `Hero.tsx`. |
| **Peti Harta Karun** | ❌ Belum ada | Tombol SVG peti harta di atas judul `#contact`. Klik membuka tutup dengan animasi pegas (`cubic-bezier`), cahaya emas menyala, label dinamis, 28 koin emas berhamburan dengan fisika gravitasi. | Buat `src/components/sections/TreasureChest.tsx` di `Contact.tsx`. |
| **Tombol Naik & Pintasan** | ❌ Belum ada | Tombol kapsul `#up` muncul saat scroll > 2.4 H. Klik menggulir ke `#hero` dengan gelembung. Pintasan keyboard global: `C` (calm), `M` (mute), `1-4` (navigasi), `?` (bantuan pintasan). | Buat `src/components/layout/ScrollToTop.tsx` dan hook `useKeyboardShortcuts.ts`. |
| **Penunjuk Kedalaman Responsif** | ⚠️ Sudah diperbaiki sebagian | Kapsul satu baris di mobile (<=760px), font clamp, perataan rapi di <=360px dan layar pendek (<=520px height), equalizer bar audio dengan tinggi resting bervariasi (0.5, 0.85, 0.4, 0.65). | Sinkronkan style CSS dan struktur Gauge agar 100% identik dengan v3. |
| **Single Ocean Loop & Store** | ⚠️ Masih terpisah di tiap komponen | Penghitungan kedalaman satu pintu per frame: `v = scrollY < he ? 3200*(1-sy/he) : -(sy-he)/max(1, mx-he)*1000`. Dibagikan via mutable ref/store ke semua modul. | Buat `src/lib/oceanStore.ts` dan hubungkan ke satu ticker GSAP utama. |

---

## 3. Rencana Pemetaan Komponen & Hook Baru

```
src/
├── components/
│   ├── fx/
│   │   ├── Buddy.tsx            <-- BARU: Penyelam SVG artikulasi + ikan peliharaan + ucapan
│   │   ├── ReefCanvas.tsx       <-- BARU: Canvas 2D terumbu (boids ikan makan + ubur-ubur drag/zap)
│   │   ├── Creatures.tsx        <-- BARU: Paus & Megalodon v3 deformasi kurva Catmull-Rom
│   │   ├── RippleCanvas.tsx     <-- BARU: Riak air elips di hero section
│   │   ├── Birds.tsx            <-- EXISTING: Update sembunyikan saat calm
│   │   ├── Bubbles.tsx          <-- EXISTING: Update sembunyikan saat calm
│   │   ├── Caustics.tsx         <-- EXISTING: Degradasi resolusi otomatis jika FPS rendah
│   │   ├── Clouds.tsx           <-- EXISTING
│   │   ├── Seaweed.tsx          <-- EXISTING
│   │   └── Tide.tsx             <-- EXISTING
│   ├── layout/
│   │   ├── AudioControl.tsx     <-- UPDATE: Integrasi Calm button + AudioEngine v2 + EQ bar v3
│   │   ├── ScrollToTop.tsx      <-- BARU: Tombol naik ke permukaan (muncul > 2.4 H)
│   │   ├── Gauge.tsx            <-- UPDATE: Terhubung ke OceanStore + style responsif v3
│   │   ├── Nav.tsx              <-- EXISTING: Navbar
│   │   ├── Cursor.tsx           <-- UPDATE: Trail bubble disembunyikan saat calm
│   │   └── Toast.tsx            <-- EXISTING: Helper toast global
│   ├── sections/
│   │   ├── Hero.tsx             <-- UPDATE: Injeksi RippleCanvas
│   │   ├── About.tsx            <-- UPDATE: Skill chip button + activeSkill filter
│   │   ├── Work.tsx             <-- UPDATE: Hit/dim styling sesuai activeSkill
│   │   ├── Deep.tsx             <-- UPDATE: Hit/dim styling sesuai activeSkill + suara sweep
│   │   └── Contact.tsx          <-- UPDATE: Injeksi TreasureChest
│   └── portal/
│       └── ProjectPortal.tsx    <-- EXISTING: Modal cerita proyek
├── hooks/
│   ├── useOceanStore.ts         <-- BARU: Akses reaktif ke OceanStore (depth, calm, activeSkill, threat)
│   ├── useKeyboardShortcuts.ts  <-- BARU: Pintasan keyboard C, M, 1-4, ?
│   ├── usePerformanceMonitor.ts <-- BARU: Deteksi FPS / hardwareConcurrency untuk degradasi
│   ├── useLenis.tsx             <-- EXISTING
│   └── useReducedMotion.ts      <-- EXISTING
├── lib/
│   ├── oceanStore.ts            <-- BARU: Mutable store satu pintu (depth, threat, calm, activeSkill)
│   ├── oceanConfig.ts           <-- BARU: Konfigurasi RNG paus/megalodon (default produksi vs test)
│   ├── audioEngine.ts           <-- UPDATE TOTAL: AudioEngine v2 (pink noise 4-layer, sweep, plunge, roar)
│   └── bezierDeform.ts          <-- BARU: Titik WH & MG + Catmull-Rom deformer
└── tests/
    └── smoke.spec.ts            <-- UPDATE: Playwright test mencakup 10 kriteria fitur v3
```

---

## 4. Konfigurasi Produksi vs Mode Uji (`oceanConfig.ts`)

Sesuai Aturan Emas:
- **Default Produksi**:
  - `rollMin`: 2 detik
  - `rollMax`: 10 detik
  - `whaleChance`: 0.5
  - `megaChance`: 0.1
  - `cooldownMin`: 8 detik
  - `cooldownMax`: 22 detik
  - `whaleDepth`: 150 meter
  - `megaDepth`: 400 meter
- **Mode Uji** (hanya aktif jika query `?ocean=test` atau `NEXT_PUBLIC_OCEAN_TEST=true`):
  - `rollMin`: 1, `rollMax`: 3, `whaleChance`: 0.5, `megaChance`: 0.5, `cooldownMin`: 2, `cooldownMax`: 5, `whaleDepth`: 120, `megaDepth`: 150.

---

## 5. Rencana Tahapan Implementasi (Sesuai SOP)
1. **Fase 1: Infrastruktur Bersama**:
   - `oceanStore.ts` & `oceanConfig.ts`
   - Refactor `audioEngine.ts` ke AudioEngine v2
   - Context Mode Tenang (`calm`) & CSS global tokens
2. **Fase 2: Komponen Interaktif & Fitur Visual**:
   - `Buddy.tsx` (Penyelam artikulasi)
   - `ReefCanvas.tsx` (Ikan makan & ubur-ubur interaktif)
   - `Creatures.tsx` (Paus & Megalodon Catmull-Rom)
   - `RippleCanvas.tsx` (Riak air Hero)
   - `TreasureChest.tsx` (Peti harta karun)
   - Filter skill ke proyek di `About.tsx`, `Work.tsx`, `Deep.tsx`
   - `ScrollToTop.tsx` & Keyboard Shortcuts (`C`, `M`, `1-4`, `?`)
3. **Fase 3: Pembersihan Kode Warisan & Verifikasi Paritas**:
   - Menghapus artefak kode lama yang sudah mati.
   - Memastikan suara sweep saat klik ikan tetap hidup dan aktif.
4. **Fase 4: Performa, Aksesibilitas, dan Pengujian**:
   - Automated degradation (FPS monitor & hardwareConcurrency).
   - Pengujian breakpoint 320, 375, 768, 1024, 1440, 1920, 2560 px.
   - Pengujian Playwright E2E.
5. **Fase 5: Dokumentasi & Deployment**:
   - Pembaruan `docs/PORTING_NOTES.md` dan `README.md`.
