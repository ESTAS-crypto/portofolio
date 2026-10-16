# Dokumen Audit Komprehensif F14 – F23

**Status:** Selesai  
**Tanggal:** 2026-10-16  
**Penyusun:** Senior Front-End Engineer (Antigravity)  
**Referensi:** `Evan Atharasya · Portofolio (8).html` & codebase live Next.js

---

## 1. Pemetaan Arsitektur Existing

### (1) Store Mutable & Single GSAP Ticker
- **Lokasi:** `src/lib/oceanStore.ts`
- **Instance:** Singleton `oceanStore` dari kelas `OceanStore`.
- **Mekanisme State & Listener:**
  - Menyimpan state mutable terpusat (`depth`, `depthMeters`, `m`, `alt`, `calm`, `activeSkill`, `threat`, `volume`, `isMuted`, `isLowSpec`).
  - Fungsi `subscribe(listener)` untuk mendengarkan perubahan state secara umum tanpa re-render React berlebihan.
  - Nilai kedalaman `v` dihitung **tepat satu kali per frame** di loop GSAP ticker utama (`src/app/page.tsx` baris 52–66):
    ```ts
    const v = oceanStore.updateDepth(sy, heroH, docH, H);
    audioEngine.onFrame(v);
    ```
- **Rencana Ekstensi F14 & F16:**
  - Menambahkan state musim aktif (`season`: `'cerah' | 'kemarau' | 'hujan' | 'salju' | 'gugur' | 'semi'`), mode cuaca (`weatherMode`: `'auto' | 'cerah' | ...`), dan kualitas render (`qualityLevel`: `'hi' | 'mid' | 'lo'`) ke dalam `oceanStore`.
  - Menggunakan event bus bertipe di store untuk notifikasi antar-fitur tanpa variabel global `window.*`.

---

### (2) Komponen TimePanel
- **Lokasi:** `src/components/fx/TimePanel.tsx`
- **Struktur Baris Saat Ini:**
  1. Header `.tod-hd`: Label waktu `#todL` dan tombol tutup `.tod-x`.
  2. Slider `.tod-body`: Input range waktu `#todR` (0..1439 menit).
  3. Chip Preset `.tod-chips`: Subuh, Pagi, Siang, Sore, Senja, Malam.
  4. Baris Bulan `.tod-moon`: Tombol bulan sebelumnya (`‹`), `#mLbl`, tombol berikutnya (`›`).
  5. Baris Kontrol `.tod-ctl`: Tombol `[Otomatis]` (`#todA`) dan `[▶ Putar hari]`.
- **Kalkulasi Ukuran Bukaan (Dynamic Height):**
  - Menggunakan pengukuran dinamis `dims = { w: main.offsetWidth + 72, h: main.offsetHeight + 18 }`.
  - Ketika baris Musim `.tod-ssn` ditambahkan di antara `.tod-moon` dan `.tod-ctl`, bukaan panel akan secara otomatis menyesuaikan tinggi baris baru tersebut.
- **Pintasan Keyboard & Storage:**
  - Tombol `T` mengecilkan/membuka panel waktu.
  - Status tersimpan di `localStorage.getItem('todMin')`.

---

### (3) Sampler Tinggi Permukaan Ombak Kapal
- **Lokasi:** `src/lib/oceanSurface.ts`
- **Fungsi Utama:** `surf(x, frac, wvWidth, wvHeight)` dan `getWaveFrac(wvSvg, t)`.
- **Lookup Table (LUT):** `YT` (`Float32Array(1202)`) dihitung sekali dari kurva path SVG bezier gelombang laut.
- **OceanContext:**
  - Komponen `src/components/fx/Tide.tsx` mendaftarkan `setOceanContext(oc)` saat mount.
  - Menyediakan `surf(x, frac)` yang siap dipanggil kapan saja oleh kapal, cipratan air (`splash`), kilau air (`shimmer`), dan partikel cuaca (hujan/salju/daun gugur).
- **Elemen Terkait:**
  - `.tide` di dalam `<header id="hero">`.
  - Partikel cuaca F14 akan mendarat di `tt + surf(x, frac)` sehingga presisi menyentuh ombak yang bergerak.

---

### (4) Faktor Malam ($n$) dan Jam Langit di Store
- **Lokasi:** `src/lib/skyTimeEngine.ts`
- **Variabel:**
  - `skyEngine.sky.nightFactor`: bernilai `0` (siang murni) hingga `1` (malam murni), dihitung via `smoothstep(17.5, 20.5, h)` dan `1 - smoothstep(4.5, 7, h)`.
  - `skyEngine.sky.hour`: jam desimal `0.0 .. 24.0`.
  - `skyEngine.sky.sunElevation` & `skyEngine.sky.moonElevation`.
- **Integrasi Cuaca:**
  - Partikel hujan, daun, kelopak dikalikan `(1 - 0.55n)`.
  - Partikel salju dikalikan `(1 - 0.4n)`.
  - Wash warna musim dikalikan `(1 - 0.35n)`.

---

### (5) AudioEngine & SfxEngine
- **Lokasi:** `src/lib/audioEngine.ts` & `src/components/layout/AudioControl.tsx`
- **Struktur Bus Web Audio:**
  - `bAmb` (Bus Ambience): Terhubung ke filter lowpass kedalaman (`lpMaster`). Suara angin, deru ombak, dan lapisan kontinu musim dialirkan ke sini.
  - `bMus` (Bus Generative Music): Terhubung ke convolver reverb dan filter kedalaman.
  - `bSfx` (Bus Sound Effects): Terhubung langsung ke master gain.
  - `master`: Mengontrol volume keseluruhan dan mute / Mode Tenang.
- **Aturan Interaksi Pertama:** AudioContext dimulai/di-resume saat gestur pengguna pertama (`click`, `pointerdown`, `keydown`).
- **Penambahan Audio Musim (F14):**
  - Node kontinu: hujan (bandpass 3800 Hz + bandpass 1300 Hz dengan LFO 0.3 Hz), angin (lowpass 420 Hz responsif terhadap `gust`), kemarau (bandpass 900 Hz).
  - One-shot sintetis: guruh (`thunder`), hembusan angin (`whoosh`), desau dedaunan (`rustle`), serangga siang tonggeret (`cicada`), jangkrik malam (`cricket`), denting salju (`chime`), lonceng semi (`bell`).

---

### (6) Inventarisasi Semua Pemanggil Notifikasi / Toast
Berdasarkan audit ripgrep di seluruh direktori `src/`:

| No | File Pemanggil | Teks Notifikasi Lama | Pemicu (Trigger) | Frekuensi | Status Reduksi F14-F23 |
|---|---|---|---|---|---|
| 1 | `src/lib/oceanStore.ts:131` | "Mode tenang aktif" / "Mode tenang mati" | Klik tombol tenang / shortcut C | Setiap aksi | Pertahankan: "Mode tenang aktif" / "Mode tenang mati" (p:0) |
| 2 | `src/hooks/useKeyboardShortcuts.ts:31` | "Matikan mode tenang terlebih dahulu..." | Shortcut M saat mode tenang | Saat tombol ditekan | Teks diselaraskan (p:0) |
| 3 | `src/hooks/useKeyboardShortcuts.ts:34` | "Audio aktif" / "Audio dibisukan" | Shortcut M | Saat tombol ditekan | Ganti jadi "Musik nyala" / "Musik mati" (p:0) |
| 4 | `src/hooks/useKeyboardShortcuts.ts:45` | "C: mode tenang. M: suara. 1 sampai 4..." | Shortcut '?' | Saat tombol ditekan | Ringkas: "C tenang · M suara · T waktu · S musim · 1-4 bagian · Esc tutup" (p:0) |
| 5 | `src/components/sections/TreasureChest.tsx:15` | "Harta karun ditemukan! Sebuah pesan..." | Klik peti kontak | Tiap klik buka | Ringkas (p:1): catat ke Ikan-dex |
| 6 | `src/components/sections/Contact.tsx:85` | "Email disalin" | Klik tombol salin | Setiap aksi | Pertahankan: "Email disalin" (p:0) |
| 7 | `src/components/sections/Contact.tsx:87` | "Salin manual: ..." | Gagal clipboard | Saat error | Pertahankan (p:0) |
| 8 | `src/components/sections/About.tsx:78` | "{count} proyek memakai {skill}. Lihat..." | Klik chip skill | Setiap klik | Ringkas: "{Teknologi} dipakai di {n} proyek" (p:0) |
| 9 | `src/components/sections/About.tsx:82` | "Belum ada proyek publik dengan {skill}." | Klik chip skill kosong | Setiap klik | Ringkas: "{Teknologi}: belum ada proyek publik" (p:0) |
| 10 | `src/components/sections/About.tsx:85` | "Filter dibersihkan" | Klik unselect skill | Setiap klik | Pertahankan (p:0) |
| 11 | `src/components/layout/Toast.tsx:55` | "Mode tenang aktif: penyelam dan hewan..." | Scroll melewati laut atas | Sekali saat load, sekali di kedalaman | Ringkas: "Mode tenang aktif: makhluk laut disembunyikan" (p:1) |
| 12 | `src/components/layout/AudioControl.tsx:155` | "Musik nyala" / "Musik mati" | Tombol N | Setiap aksi | Pertahankan (p:0) |
| 13 | `src/components/layout/AudioControl.tsx:198` | "Matikan mode tenang terlebih dahulu..." | Klik audio saat calm | Setiap klik | Pertahankan (p:0) |
| 14 | `src/components/fx/ReefCanvas.tsx:314` | "Coba sentuh dan tarik ubur-ubur..." | Hover reef | Sekali seumur hidup | Ringkas: "Tarik ubur-ubur, klik air untuk memberi makan ikan" (p:1) |
| 15 | `src/components/fx/Creatures.tsx:192` | "Megalodon! Kamu beruntung..." / "Nx" | Megalodon muncul | Jarang | "Megalodon! Beruntung sekali" / "Megalodon lagi (Nx)" (p:1) |
| 16 | `src/components/fx/Creatures.tsx:339` | "Grrr! Jangan diganggu." | Klik megalodon | Saat diklik | Pertahankan: "Grrr! Jangan diganggu." (p:1) |
| 17 | `src/components/layout/AudioControl.tsx:163` | *MutationObserver pada .toast* | Membaca "Gerhana" | Tiap perubahan toast | **Dihapus & diganti** pemicu CustomEvent `ocean:eclipse`! |

---

### (7) Navbar, Menu Burger, Portal, Rute & Metadata
- **Navbar (`src/components/layout/Nav.tsx`):**
  - Memiliki container `#links` dengan pill aktif yang dihitung otomatis dari posisi tombol tautan.
  - Dua tombol baru F15: "Ringkasan" dan "Koleksi n/N" ditaruh di **luar** `#links` (hanya tampil pada `min-width: 861px`) agar kalkulasi posisi pill tidak rusak.
- **Menu Burger (`src/components/layout/MobileMenu.tsx`):**
  - Membuka menu fullscreen via clipPath lingkaran.
  - Dua item menu baru ("Ringkasan" dan "Koleksi") akan ditambahkan sebagai elemen `<button>` yang dimasukkan ke dalam selector animasi masuk berurutan GSAP (`querySelectorAll('a, button, small')`), serta memunculkan efek gelembung klik.
- **ProjectPortal (`src/components/portal/ProjectPortal.tsx`):**
  - Saat ini memuat `<OrbitMock>` (mock browser visual buatan).
  - F19 akan menyisipkan cover screenshot asli dengan `next/image` di dalam bingkai jendela browser modern, mempertahankan rasio 16:10 tanpa layout shift, dan tetap menyimpan `<OrbitMock>` sebagai cadangan (fallback).
- **Rute & Metadata:**
  - `src/app/page.tsx`: Halaman utama portofolio.
  - `src/app/sitemap.ts`: Ditambahkan 10 slug proyek untuk SSG `/proyek/[slug]`.
  - `src/app/opengraph-image.tsx`: OG Image dinamis dilindungi.

---

### (8) Modul Berat untuk Tuas Kualits (F16)
1. **WebGL Caustics (`src/components/fx/Caustics.tsx`):**
   - Tingkat `hi`: rendered setiap frame.
   - Tingkat `mid`: rendered setiap frame ke-2 (`frameCount % 2 === 0`).
   - Tingkat `lo`: canvas di-hide (`display: none`) dan rendering dihentikan.
2. **Boids Fish & Jellyfish (`src/components/fx/ReefCanvas.tsx`):**
   - Jumlah partikel diskalakan via `Math.ceil(count * scale)`:
     - `hi`: skala 1.0 (32–82 ikan, 4–7 ubur-ubur)
     - `mid`: skala 0.6
     - `lo`: skala 0.35 (minimal 4 ikan dan 2 ubur-ubur)
3. **Dekorasi Cahaya (`src/components/fx/LightingOverlays.tsx`):**
   - Pada tingkat `lo`, sembunyikan `#shafts` dan `#torch`.

---

## 2. DAFTAR TERLINDUNGI (Protected Surface)
Semua komponen, tata letak, dan fitur berikut **DILARANG DIUBAH / DIHAPUS**:
- Fitur F1 sampai F13 yang sudah stabil.
- Perubahan manual Evan:
  - Tautan Instagram (".x")
  - OG image dinamis & alias `og:url` (`evan-atharasya.vercel.app`)
  - Theme-color di header
  - Desain & simbol SVG kustom di `SvgSymbols.tsx`
  - Tata letak ikan dan makhluk di bagian Jelajah (`#deep`)
  - Konten cerita proyek di `src/data/projects.ts`
- Prinsip perubahan: **HANYA ADITIF** (menambahkan baris musim ke TimePanel, menambahkan API ke AudioEngine tanpa membuat context baru, menambahkan 2 tombol ke navbar & 2 item ke menu burger, menambahkan dialog modal terisolasi).
