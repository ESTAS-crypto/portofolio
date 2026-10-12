# INVENTORY PORTFOLIO-V2 (Evan Atharasya · Portofolio)

Dokumen ini merupakan hasil analisis mendalam (Langkah 0) terhadap file spesifikasi asli `Evan Atharasya · Portofolio (1).html` (72KB, 694 baris). Seluruh design token, modul, state, breakpoint, perilaku animasi, dependensi, dan kode warisan telah dipetakan secara komprehensif untuk memastikan 100% paritas visual dan fungsional pada migrasi Next.js 15 + React 19 + TypeScript.

---

## 1. Daftar Section & Elemen UI

| Section / Komponen | ID / Selector | Peran & Struktur | Interaksi / Animasi Utama |
|---|---|---|---|
| **SVG Symbols** | `<symbol id="cl">`, `<symbol id="fish">`, `<symbol id="wv">` | Master vektor untuk awan (4 lingkaran + 1 pill), ikan (badan + mata + sirip), dan gelombang laut (1200x120 SVG curve). | Digunakan berulang melalui `<use href="#...">` di berbagai section. |
| **Scroll Progress Bar** | `.prog` | Garis tipis 3px fixed di top (`var(--sun)`). | `transform: scaleX(progress)` dari 0 ke 1 diikat ke seluruh dokumen via ScrollTrigger (`scrub: 0.2`). |
| **Smart Cursor** | `.cur` | Lingkaran 36px fixed dengan border putih 2px, `mix-blend-mode: difference`, label pseudo-element `::after`. | Pointer:fine only. Lerp position via `gsap.quickTo`, scale 1.7x saat hover interaktif, scale 2.4x dengan label teks ("Masuk", "Buka", "Geser"). |
| **Skip Link** | `.skip` | Aksesibilitas skip-to-content ke `#about`. | Tersembunyi di atas viewport (`top: -60px`), muncul ke `top: 12px` saat di-focus. |
| **Navigation Bar** | `#nav` | Kapsul kaca melayang (`backdrop-filter: blur(14px)`), logo ikan + nama, daftar tautan, tombol CTA Hubungi, tombol burger. | Mengecil & menggelap saat scroll > 80px (`.sm`), garis progres di bagian bawah via `--p`, pill cair berpindah (`back.out(1.6)`), logo ikan berenang miring sesuai arah scroll (`rotation: ±42deg`). Tombol burger muncul pada screen ≤ 860px. |
| **Mobile Menu** | `#menu` | Overlay layar penuh gradien `#1b7fb3` ke `#03111f`. | Animasi buka/tutup via `clip-path: circle(...)` dari koordinat tombol burger. Mengunci scroll Lenis. |
| **Altitude/Depth Gauge** | `#gauge` (aside) | Rail penunjuk ketinggian dan kedalaman di kanan (3.200 m di udara s.d. -1.000 m di dasar laut), dot penanda, card angka & zona, titik section yang dapat diklik. | Menghitung ketinggian/kedalaman secara matematis sesuai scroll (memperhitungkan pin-spacer). Efek riak gelombang saat menembus 0 m, peek tip info saat zona berganti. Di layar HP (≤ 760px) berubah menjadi kapsul mini horizontal di kiri bawah. |
| **Audio Controller** | `.aud`, `#audBtn`, `#vol` | Kapsul audio di pojok kanan bawah dengan visualizer equalizer (4 bar) dan slider volume ekspansif. | Web Audio sintetis (tanpa aset mp3/wav eksternal): brown noise laut dengan LFO swell + wind bandpass filter yang sensitif terhadap kedalaman laut. Efek suara klik (pop bubble) dan whoosh saat masuk portal ikan. |
| **Toast** | `.toast` | Notifikasi pill melayang di bagian bawah layar. | Menampilkan status seperti "Email disalin" dengan auto fade-out. |
| **Bubbles Layer** | `.bubbles` (`#bub`) | Kontainer fixed untuk 18 gelembung CSS naik + kanvas WebGL caustics. | Opacity di-fade in saat masuk ke section `#about`. |
| **Hero Section** | `#hero` (header) | Langit senja/malam dengan matahari, 5 awan dengan arah berlawanan, 4 burung camar terbang melayang, judul nama split-char stagger, ombak pasang surut (`.tide`). | Section di-pin 160% tinggi layar (`pin: true, scrub: 1`). Matahari terbenam, awan terbelah ke samping, langit berganti warna senja/malam, ombak naik menutupi layar. Dukungan auto Night Mode (19:00 - 05:00) dengan bintang berkilau dan bulan. |
| **About Section** | `#about` | Teks statement menyala kata demi kata, statistik pencapaian, dan 2 baris marquee teknologi. | Scrubbing pembacaan teks kata per kata (`.statement .w`). Statistik counter angka naik (47 repo, 18 teknologi, 3 proyek utama). Marquee infinite berlawanan arah. |
| **Kinetic Marquee** | `.kin`, `#kt` | Teks outline raksasa bergerak horizontal tanpa henti. | Kecepatan dan arah bergeser otomatis merespons kecepatan scroll mouse / touch (`gsap.ticker`). |
| **Work Section** | `#work` | Track horizontal scroll proyek pilihan. | Pin vertikal yang menggeser track horizontal (`scrub: 1`). Kartu proyek masuk dengan rotasi dan scaling dinamis via `containerAnimation`, tilt 3D interaktif pada hover, dan efek skewX dinamis sesuai kecepatan scroll Lenis. Progress bar di bagian bawah track (`.wbar`). |
| **Deep Section (Laut Dalam)** | `#deep` | Dunia bawah laut 3 lapis kedalaman (L0, L1, L2). | Parallax horizontal via pergerakan mouse / sentuhan drag (touch-action: pan-y). Berisi ikan proyek interaktif (button berlabel), kawanan ikan kecil berenang bolak-balik, rumput laut bergoyang SVG, sinar matahari bawah air (`.rays`), dan efek riak air saat klik. |
| **Project Portal (Modal Dialog)** | `#portal` | Modal detail studi kasus proyek (`role="dialog" aria-modal="true"`). | Membuka dengan transisi dramatis: `clip-path` melingkar membesar dari titik klik + zoom in ke mata ikan pemicu (transform-origin 82% 43%). Dilengkapi 3D window mockup dengan chip teknologi yang mengorbit, navigasi Prev/Next, escape key, dan pencegah scroll Lenis. |
| **Contact Section** | `#contact` | Judul staggered, tombol email magnetik, tombol salin email ke clipboard, tautan profil sosial. | Efek hover magnetik pada tombol email (`elastic.out`). Stagger animasi huruf saat masuk viewport. |
| **Footer** | `footer` | Teks penutup sederhana dengan copyright / credit. | "Dibuat dengan secangkir kopi dan langit yang cerah." |

---

## 2. Modul-Modul JavaScript & Logika Fungsional

1. **Inisialisasi & Time of Day Detection**:
   - Menghitung jam lokal pengunjung: `NIGHT = hours >= 19 || hours < 5`.
   - Mengatur dataset `#hero[data-tod="night"]`.
   - Memasangkan data proyek `projects` dengan data cerita `stories`.
2. **Text Splitter (`words`)**:
   - Memecah teks innerHTML menjadi rentetan `<span class="w">` untuk animasi pembacaan scroll scrub pada `#st` dan `#ct`.
3. **DOM Builder**:
   - Injeksi kartu horizontal ke `#track`.
   - Injeksi tag skill ganda ke marquee `#r1` dan `#r2` (reverse).
   - Injeksi 18 elemen gelembung CSS `.bubbles i` acak.
4. **GSAP + ScrollTrigger + Lenis Setup**:
   - Integrasi Lenis lerp `0.085` dengan `ScrollTrigger.update` dan `gsap.ticker.add`.
   - Lag smoothing dinonaktifkan (`lagSmoothing(0)`).
   - Penanganan `prefers-reduced-motion` (`rm` class toggle).
5. **Timeline Hero Dive**:
   - Pin `#hero` dengan jarak `+=160%`, `scrub: 1`.
   - Translasi awan ke kiri/kanan berdasarkan `data-d` dan `data-s`.
   - Matahari bergerak turun dan membesar.
   - Perubahan variabel warna langit `--h1` dan `--h2`.
   - Copywriting memudar ke atas, ombak `.tide` naik 102% tinggi layar.
6. **Latar Belakang Global (Depth Background Color Tween)**:
   - Scrubbing variabel `--c` di `:root` sepanjang dokumen:
     `rgb(27, 127, 179)` (Hero/About) &rarr; `rgb(10, 63, 102)` (Work/Deep) &rarr; `rgb(3, 17, 31)` (Dasar Laut/Contact).
7. **Horizontal Scroll Work Track**:
   - Pin `#work` sebesar selisih `scrollWidth - innerWidth`.
   - `containerAnimation` untuk memicu animasi masuk kartu (rotasi -6°/6° ke 0°, skala 0.9 ke 1).
   - Update `.wbar i` skala progress.
8. **Interaksi Pointer (Fine Pointer)**:
   - Posisi kursor lerp halus menggunakan `gsap.quickTo`.
   - 3D Card Tilt pada hover kartu proyek (rotasi sumbu X dan Y berbasis koordinat kursor, `transformPerspective: 900`).
   - Tombol magnetik `.mag` pada email kontak (`elastic.out(1, 0.4)`).
   - Bubble trail kursor saat berada di bawah permukaan laut (scrollY > 1.6 * innerHeight).
   - Card skewX dinamis sesuai kecepatan scroll Lenis (`velocity * -0.6`, batas clamp ±8).
9. **Dunia Laut Dalam (Parallax Deep Sea & Fish)**:
   - 3 lapisan paralaks (L0: 130vw, L1: 175vw, L2: 215vw).
   - Algoritma rumput laut (`weeds`) dengan SVG paths acak.
   - Algoritma berenang ikan (`swim`): bolak-balik horizontal dengan `scaleX(1/-1)` dan oscilasi vertikal `sine.inOut`.
   - Kawanan ikan kecil (`sf`) di L0 dan L2.
   - Tombol ikan proyek (`fish`) di L1 dengan warna hsl sesuai hue proyek.
   - Pergeseran horizontal L0-L2 melalui mousemove dan touch drag (`pointerdown`, `pointermove`).
   - Ikan penasaran mendekati kursor saat kursor berjarak < 300px.
   - Efek riak air (`rip`) saat area air diklik.
10. **Project Portal Transition & Orbit Mockup**:
    - Zoom masuk dramatis dari posisi ikan atau kartu yang diklik.
    - `clip-path: circle(...)` membesar hingga 150vmax.
    - Scaling ikan pembuka ke arah matanya (`transform-origin: 82% 43%` atau `18% 43%`).
    - Stagger fade-in konten dialog dan mockup 3D.
    - Navigasi antar proyek (Next/Prev dan ArrowLeft/ArrowRight) dengan transisi slide lateral.
    - Parallax blob latar belakang dan tilt 3D mockup saat mouse digerakkan di dalam portal.
    - Orbit tech chip berputar mengelilingi jendela mockup.
    - Penguncian scroll Lenis saat portal terbuka dan pengembalian fokus ke pemicu saat ditutup.
11. **WebGL Caustics Shader**:
    - Kanvas WebGL native resolusi 0.5x di dalam `#bub`.
    - Vertex shader 2D quad; Fragment shader kalkulasi caustics matematika algoritmik 4 iterasi loop sin/cos caustics.
    - Peka terhadap posisi mouse (`M`), waktu (`T`), dan kedalaman scroll (`D`).
    - Otomatis pause render jika layer gelembung tidak terlihat (opacity < 0.02).
12. **Web Audio Engine (Sadar Kedalaman & Interaktif)**:
    - AudioContext sintetis tanpa aset file audio.
    - Suara deburan ombak laut: Brown noise buffer (3-4 detik) dilewatkan Low-pass filter dengan LFO modulation.
    - Suara hembusan angin: Bandpass filter (700Hz, Q 0.6) dengan gain terpisah.
    - Adaptif terhadap kedalaman scroll: frekuensi low-pass turun dari 1400Hz ke 300Hz saat menyelam lebih dalam, suara angin mengecil.
    - Efek suara bubble pop (sine wave exponential ramp up/down) untuk hover ikan dan klik link.
    - Efek suara whoosh (bandpass buffer source ramp) saat membuka proyek ikan/kartu.
    - Slider volume 0-100 dengan transisi smooth gain.
13. **Dynamic Gauge Engine**:
    - Menghitung ketinggian/kedalaman aktual: dari +3.200 m di udara &rarr; 0 m di permukaan &rarr; -1.000 m di zona senja.
    - Memperhitungkan `.pin-spacer` ScrollTrigger untuk penentuan koordinat section.
    - 4 zona kedalaman: "Di udara" (sky), "Permukaan laut" (surf), "Zona cahaya" (sun), "Zona senja" (twi).
    - Animasi pergantian zona teks dan efek riak dot saat melewati batas 0 m.
    - Klik rail untuk scrolling langsung ke ketinggian yang dipilih.
14. **Kinetic Marquee Engine**:
    - Mengukur kecepatan scroll (`dy = scrollY - lastY`) dalam `gsap.ticker`.
    - Mengubah arah geser marquee teks outline secara kinetik.

---

## 3. Design Tokens (CSS Variables)

| Token CSS | Nilai Asli / Deskripsi | Pemetaan di Proyek Baru |
|---|---|---|
| `--c` | `rgb(27,127,179)` dinamis &rarr; `rgb(10,63,102)` &rarr; `rgb(3,17,31)` | Warna latar laut global, di-tween sepanjang scroll. |
| `--ink` | `#0a2a4a` | Warna teks gelap / kontras (hero copy, button text). |
| `--sun` | `#ffd9a0` | Warna kuning hangat aksen matahari, outline fokus, dan progress bar. |
| `--glass` | `rgba(255,255,255,.08)` | Background kaca translucent untuk kartu dan chip. |
| `--line` | `rgba(255,255,255,.2)` | Border halus kaca translucent. |
| `--head` | `"Bricolage Grotesque", "Trebuchet MS", system-ui, sans-serif` | Font heading (Bricolage Grotesque 500, 700, 800 via `next/font`). |
| `--body` | `"Figtree", "Segoe UI", system-ui, sans-serif` | Font isi (Figtree 400, 500, 600 via `next/font`). |
| `--h1` / `--h2` | Hero sky gradient: Day `rgb(59,127,196)` &rarr; `rgb(191,230,251)`; Night `rgb(8,16,44)` &rarr; `rgb(52,82,140)` | Gradien langit Hero dinamis. |
| `--h` / `--hh` | HSL Hue per proyek (misal 38, 215, 170, 200, 330) | Warna tema dinamis per kartu dan portal proyek. |
| `--pbg` | `hsl(var(--h) 55% 13%)` | Warna background portal proyek. |
| `--pc` | `hsl(var(--h) 85% 62%)` | Warna aksen teks dan border portal proyek. |
| `--gc` | Warna aksen zona gauge (`#bfe6fb`, `#ffffff`, `#5fd0ff`, `#8f9bff`) | Glow dan highlight penunjuk zona. |

---

## 4. Breakpoint & Aturan Media Queries

| Breakpoint / Query | Efek Perilaku di File Asli |
|---|---|
| `pointer: fine` | Menampilkan custom cursor `.cur`, mengaktifkan event mousemove/hover 3D tilt, bubble trail, dan magnetik button. |
| `prefers-reduced-motion: reduce` | Mematikan animasi CSS (`animation: none!important`, `transition: none!important`), menyederhanakan timeline GSAP, menyembunyikan burung, menonaktifkan lerp dan tilt, hero tinggi normal tanpa pin horizontal di work. |
| `min-width: 1800px` | `html { font-size: 19px }` (skala proporsional layar ultrawide). |
| `min-width: 2400px` | `html { font-size: 24px }` (skala layar 4K). |
| `max-width: 980px` | Layout portal proyek beralih dari grid 2 kolom ke single column flex layout berurutan. |
| `max-width: 860px` | Nav link desktop dan CTA disembunyikan; tombol burger `.burger` aktif menampilkan navigasi layar penuh. |
| `max-width: 760px` | Gauge di sebelah kanan beralih menjadi mini capsule horizontal di kiri bawah (`left: 4vw, bottom: 22px`); rail/sec/surf/dot disembunyikan. Menutup menu mobile jika ukuran layar melebihi 760px. |
| `max-width: 600px` | Awan diskalakan 0.6x; hero copy padding-bottom 12vh; work card intro disesuaikan ke 78vw. |
| `max-width: 520px` | Suara tombol menyusut jadi ikon mini; gauge card mengecil; judul deep sea diatur ulang; portal padding-top 14vh. |
| `max-width: 380px` | Ukuran font brand nav mengecil, lebar logo ikan mengecil ke 26px, padding tombol kontak mengecil. |
| `max-height: 520px` (Landscape Mobile) | Hero min-height dinonaktifkan, ombak mengecil (min 70px), role/hint disembunyikan, kartu work menyesuaikan tinggi 80svh, gauge dinaikkan ke top 14vh, height 70vh. |

---

## 5. State Global Aplikasi

1. **Scroll State**:
   - `scrollY`, `velocity`, `direction` (didukung oleh Lenis instance).
   - `activeSection`: `'hero' | 'about' | 'work' | 'deep' | 'contact'`.
   - `scrollProgress`: 0.0 s.d. 1.0 (digunakan oleh nav progress `--p` dan top progress `.prog`).
2. **Environment & Pengaturan**:
   - `isNightMode`: boolean (dihitung di client setelah mount: `hour >= 19 || hour < 5`).
   - `prefersReducedMotion`: boolean (sinkron dengan `window.matchMedia`).
   - `isFinePointer`: boolean (sinkron dengan `pointer: fine`).
3. **Gauge State**:
   - `currentAltitude`: angka meter (-1000 s.d. +3200).
   - `currentZone`: `sky` | `surf` | `sun` | `twi`.
4. **Audio State**:
   - `audioInitialized`: boolean.
   - `isPlaying`: boolean (default `false`, hanya aktif setelah interaksi eksplisit pengguna).
   - `volume`: number (0.0 s.d. 1.0, default 0.6).
5. **Portal Dialog State**:
   - `isOpen`: boolean.
   - `activeProjectIndex`: number (0 s.d. projects.length - 1).
   - `triggerElement`: HTMLElement | null (untuk pengembalian fokus saat dialog ditutup).
6. **Mobile Navigation State**:
   - `isMenuOpen`: boolean.

---

## 6. Dependensi CDN yang Harus Diganti ke NPM

| Dependensi CDN Asli | Paket Pengganti Modern NPM |
|---|---|
| `lenis@1.1.14/dist/lenis.min.js` | `lenis` (`import Lenis from 'lenis'`) |
| `gsap/3.12.5/gsap.min.js` | `gsap` (`import gsap from 'gsap'`) |
| `gsap/3.12.5/ScrollTrigger.min.js` | `gsap/ScrollTrigger` (`import { ScrollTrigger } from 'gsap/ScrollTrigger'`) |
| `@gsap/react` | `@gsap/react` (`import { useGSAP } from '@gsap/react'`) |
| Google Fonts CDN (`Bricolage Grotesque`, `Figtree`) | `next/font/google` (`Bricolage_Grotesque`, `Figtree`) |

---

## 7. Kode Mati & Warisan (Dead Code / Technical Debt yang Harus Dihapus)

1. **Tombol Suara Lama (`.snd`)**:
   - Masih ada elemen `<button class="snd" id="snd">` (baris 253) dan skrip handler (baris 534-545), padahal disembunyikan dengan `.snd{display:none!important}` karena sudah digantikan oleh `.aud` / `#audBtn`.
   - **Tindakan**: Hapus total elemen dan handler suara lama.
2. **Altitude Meter Lama (`.meter`)**:
   - Masih ada `<div class="meter" aria-hidden="true">` (baris 251) dan updater di baris 387-392, padahal disembunyikan dengan `.meter{display:none!important}` karena sudah digantikan oleh `#gauge`.
   - **Tindakan**: Hapus total elemen dan updater meter lama.
3. **Preloader Stub (`#load`)**:
   - Baris 110-111 & baris 502-504 berisi kode preloader `#load` yang di file aslinya bahkan tidak ada tag HTML-nya di body (hanya dicek `$('#load') || {remove(){}}`).
   - **Tindakan**: Hapus sisa kode mati preloader tersebut.
4. **Selector Navigasi Lama (`[data-go-old]`)**:
   - Baris 363-364 mendaftarkan click listener untuk `[data-go-old]`, tetapi semua tautan di HTML menggunakan `[data-go]`. Ini adalah kode sisa refaktor sebelumnya yang bertumpuk dengan navigasi baru di baris 586.
   - **Tindakan**: Hapus selector dan handler duplikat.
5. **Bentrok Nama Kelas `.links`**:
   - Kelas `.links` digunakan di `#nav .links` (baris 123) DAN di `#contact .links` (baris 87), sehingga di file asli terdapat banyak style override (baris 143-144).
   - **Tindakan**: Berikan penamaan modular tersendiri untuk Nav Links dan Contact Social Links (atau pisahkan dalam modul komponen masing-masing).
6. **Duplikasi CSS Rules**:
   - `#nav` didefinisikan di baris 20-21, ditimpa di baris 118-127, lalu ditimpa lagi di baris 134-144.
   - Media query `@media (max-width:760px)` muncul berulang-ulang di beberapa baris terpisah (baris 117, 184, 228, 229).
   - **Tindakan**: Gabungkan dan rapikan secara terstruktur per komponen dengan Tailwind v4 dan CSS modul.

---

## 8. Root Cause Analisis Masalah Tampilan (Pita Biru Muda di Kedalaman ~11m)

- **Gejala**: Munculnya pita warna biru muda horizontal yang menutupi teks `#about` di awal penyelaman (~11 meter).
- **Penyebab Teridentifikasi**:
  1. Pada file asli, `.tide` berada di dalam `#hero` dengan posisi `top: 78%` dan `.solid` berukuran `130vh` dengan background `var(--c)`.
  2. Saat `#hero` di-pin 160% tinggi layar, timeline menggerakkan `.tide` ke atas: `tl.to(".tide", { y: () => -innerHeight * 1.02 })`. Namun, jika rasio scroll scrub berada di antara transisi akhir hero dan awal about, celah clipping antara `.wv` (gelombang) dan `.solid` atau warna gradien langit `--h2` (`rgb(191,230,251)` yang berwarna biru sangat muda) sempat terlihat karena `#hero` belum ter-unpin secara sempurna atau gelombang belum menutup penuh viewport sebelum section berikutnya masuk.
  3. Ditambah lagi, kanvas WebGL caustics di `#bub` memiliki blending default yang di-fade in saat `#about` mulai masuk (`top bottom` ke `top 30%`), sehingga perpotongan alpha caustics di atas warna langit yang masih ada di background menghasilkan artefak pita biru muda.
- **Solusi yang Diterapkan**:
  - Pastikan `.tide` menutupi viewport 100% penuh sebelum unpin hero terjadi (pastikan tinggi `.solid` minimal 100svh + toleransi overflow).
  - Tentukan koordinat stacking context (`z-index`) yang bersih antara Hero, Tide, WebGL caustics layer, dan section About.
  - Setel transisi warna background body `--c` agar menyatu mulus tanpa celah warna langit yang tersisa.
