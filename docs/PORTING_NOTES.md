# PORTING NOTES: ARSITEKTUR & PEMETAAN MODUL

Catatan teknis keputusan arsitektur, pemetaan kode monolitik asli ke struktur modular Next.js 15 App Router + React 19 + TypeScript strict, dan strategi pencegahan bug.

---

## 1. Pemetaan File Asli ke Komponen Baru

| Fitur / Bagian Asli (Line di HTML Asli) | Komponen Baru di Next.js | Deskripsi Tanggung Jawab |
|---|---|---|
| `<div class="prog">` (L19, L241, L386) | `src/components/layout/ScrollProgress.tsx` | Progress bar fixed atas (scaleX 0 &rarr; 1). |
| `<div class="cur">` (L28-30, L241, L408-411, L546-548) | `src/components/layout/Cursor.tsx` | Custom cursor cerdas dengan label kontekstual (Masuk, Buka, Geser). |
| `<a class="skip">` (L157, L242) | `src/components/layout/SkipLink.tsx` | Skip to content link untuk aksesibilitas keyboard (WCAG). |
| `#nav` (L20-24, L118-127, L134-144, L244-249, L559-608) | `src/components/layout/Nav.tsx` | Kapsul navbar melayang, logo ikan bersudut dinamis, fluid pill highlight, progress bar. |
| `#menu` & `.burger` (L128-132, L248, L250, L587-595) | `src/components/layout/MobileMenu.tsx` | Menu layar penuh responsive dengan animasi circular clip-path dari burger button. |
| `#gauge` (L166-185, L252, L656-690) | `src/components/layout/Gauge.tsx` | Aside meter ketinggian/kedalaman interaktif, rail gradasi, riak 0m, peek info zona. |
| `.aud`, `#audBtn`, `#vol` (L146-153, L254, L610-639) | `src/components/layout/AudioControl.tsx` | Equalizer visualizer dan slider volume dengan integrasi web audio engine. |
| `.toast` (L158, L255, L650) | `src/components/layout/Toast.tsx` | Toast notifikasi global untuk feedback (misal salin email). |
| `#hero` (L35-53, L159-163, L259-276, L370-381) | `src/components/sections/Hero.tsx` | Hero langit senja/malam, pin scrub 160%, awan, burung, matahari, name stagger, ombak tide. |
| `.cl` (Awan SVG L38, L237, L261-265, L376) | `src/components/fx/Clouds.tsx` | 5 awan SVG dengan data-direction dan data-speed. |
| `.bird` (Burung SVG L112-113, L266-269, L505-507) | `src/components/fx/Birds.tsx` | 4 burung camar melayang bolak-balik dengan sayap mengepak. |
| `.tide` (Ombak pasang L48-53, L239, L272-275, L381) | `src/components/fx/Tide.tsx` | Layer ombak ganda dan solid block warna `--c`. |
| `#about` (L55-62, L278-282, L393-395, L646-648) | `src/components/sections/About.tsx` | Statement text scroll-scrub word by word, counter stats naik, marquee skill. |
| `.kin`, `#kt` (L154-155, L284, L642-645) | `src/components/sections/KineticMarquee.tsx` | Teks outline raksasa responsif terhadap arah dan kecepatan scroll mouse/touch. |
| `#work` (L63-80, L286-291, L355-356, L397-401, L412-414, L553-556) | `src/components/sections/Work.tsx` | Horizontal pinned track, containerAnimation kartu, 3D mouse tilt, Lenis skewX velocity. |
| `#deep` (L91-102, L293-298, L420-456) | `src/components/sections/Deep.tsx` | Dunia laut dalam 3 lapis parallax, touch/mouse drag, rumput laut, ikan penasaran, water ripples. |
| `.weed` (Rumput laut L97-98, L424-427) | `src/components/fx/Seaweed.tsx` | Rumput laut bergoyang SVG yang digenerate dengan variasi tinggi. |
| Canvas WebGL Caustics (L114, L508-532) | `src/components/fx/Caustics.tsx` | Dynamic import WebGL canvas native shader tanpa library eksternal. |
| `.bubbles` (Gelembung CSS L31-33, L256, L359-360, L385) | `src/components/fx/Bubbles.tsx` | 18 gelembung CSS naik dengan durasi dan ukuran acak. |
| `#portal` (L103-109, L193-226, L307-315, L457-496) | `src/components/portal/ProjectPortal.tsx` | Modal studi kasus, circle clip-path reveal, focus trap, escape key, prev/next. |
| `.mock`, `.orbit` (L213-226, L314, L476-478, L494) | `src/components/portal/OrbitMock.tsx` | 3D window mockup dengan tag chips mengorbit dan rotasi responsif terhadap kursor. |
| `#contact` (L81-89, L299-305, L402-405, L415-417, L650-653) | `src/components/sections/Contact.tsx` | Staggered title, magnetic email button, copy to clipboard, tautan sosial. |
| Web Audio Synthesizer (L533-545, L610-639) | `src/lib/audioEngine.ts` | Brown noise sea swell, wind bandpass, depth lowpass, bubble pop, fish whoosh. |
| Shaders (L512-520) | `src/lib/shaders.ts` | Vertex dan fragment shader WebGL caustics. |
| GSAP & ScrollTrigger Registry | `src/lib/gsap.ts` | Registrasi plugin `gsap` dan `ScrollTrigger` terpusat sekali pakai. |
| Project Data & Story Data | `src/data/projects.ts` | Definisi typed data proyek, tag, hue, story (masalah, solusi, manfaat). |
| Skills Data | `src/data/skills.ts` | Daftar keahlian teknis untuk marquee. |
| Site Config | `src/data/site.ts` | Meta data nama, email, stats, tautan sosial. |

---

## 2. Rencana Implementasi Bertahap (Fase 1 - 5)

- **Fase 1: Scaffold & Tokens**
  - Setup Next.js 15 + React 19 + TypeScript strict + Tailwind CSS v4.
  - Setup dependensi: `gsap`, `@gsap/react`, `lenis`.
  - Konfigurasi `next/font` untuk Bricolage Grotesque & Figtree.
  - Port seluruh CSS tokens dan keyframes ke `src/app/globals.css`.
  - Setup type definitions di `src/types/project.ts` dan data di `src/data/`.
  
- **Fase 2: Port Komponen & Paritas Animasi**
  - Buat hooks (`useLenis`, `useReducedMotion`, `useNightMode`, `useAudio`, dll).
  - Port library animasi `src/lib/gsap.ts`, audio engine `src/lib/audioEngine.ts`, shaders `src/lib/shaders.ts`.
  - Port komponen layout: Nav, MobileMenu, Gauge, Cursor, AudioControl, ScrollProgress, SkipLink, Toast.
  - Port komponen sections & effects: Hero, About, KineticMarquee, Work, Deep, Contact.
  - Port komponen portal: ProjectPortal, OrbitMock.
  - Sambungkan koordinasi global (goTo navigation, depth color tweening, bubbling layer).

- **Fase 3: Bersih-bersih & Refaktor**
  - Hapus kode warisan (old snd button, old meter, #load stub, [data-go-old]).
  - Resolusi bentrok nama kelas `.links`.
  - Perbaiki bug pita biru muda di kedalaman ~11m (isolasi tide z-index & sizing).
  - Pastikan cleanup sempurna di setiap `useGSAP` dan unmount listener.

- **Fase 4: QA, Responsif, Aksesibilitas, & Performa**
  - Uji di seluruh breakpoint (320px, 375px, 768px, 860px, 1024px, 1440px, 1920px, 2400px, landscape HP).
  - Pastikan prefer-reduced-motion bekerja menyeluruh.
  - Verifikasi keyboard navigation (focus visible, dialog modal focus trap, Esc key, Arrow keys).
  - Implementasi dynamic import untuk Caustics dan ProjectPortal.
  - Metadata SEO, OpenGraph image, sitemap.ts, robots.ts, JSON-LD.

- **Fase 5: Dokumentasi & Deployment**
  - Buat README.md lengkap dengan petunjuk instalasi, development, build, dan deploy ke Vercel.
  - Verifikasi build produksi (`pnpm build`).

---

## 3. Catatan Perbaikan Bug Pasca-Migrasi

### 1. Perbaikan Runtime Error `Cannot find module './828.js'`
- **Penyebab**: Penggunaan `next/dynamic` dengan `{ ssr: false }` pada `ProjectPortal` dan `Caustics` memecah kode menjadi chunk webpack terpisah yang dapat desinkronisasi saat dev server aktif atau saat hot module reload.
- **Solusi**: Diubah ke static import langsung (`import ProjectPortal from "@/components/portal/ProjectPortal";` dan `import Caustics from "./Caustics";`). Kedua komponen sudah berstatus `"use client"` dan membungkus seluruh interaksi WebGL/DOM ke dalam `useEffect`, sehingga 100% aman tanpa dynamic import.

### 2. Perbaikan Ikan & Rumput Laut Hilang di Kedalaman 877m
- **Penyebab**:
  1. `schoolFish` semula diinisialisasi melalui `useState([])` dan baru diisi di `useEffect`. Karena `schoolFish` masuk sebagai dependensi `useGSAP`, GSAP me-revert konteks dan mengeksekusi ulang `gsap.from("#deep .lay", ...)`.
  2. Ketika `gsap.from()` dieksekusi saat elemen sudah ter-scrub atau memiliki inline style `opacity: 0`, GSAP mencatat nilai `opacity: 0` sebagai target akhir (to value). Akibatnya, saat pengunjung menggulir lebih dalam ke 877m (melewati `top 25%`), opacity tetap `0`.
- **Solusi**:
  1. Inisialisasi `schoolFish` diubah ke `useMemo` dengan formula pseudo-acak deterministik, sehingga elemen langsung tersedia saat pertama kali mount tanpa re-render ekstra.
  2. Animasi entrance zoom diubah dari `gsap.from` menjadi `gsap.fromTo` dengan nilai target eksplisit `{ scale: 1, opacity: 1 }`.
  3. Menghapus `schoolFish` dari dependensi `useGSAP` sehingga tween tidak dibuat berulang kali.
  4. Menjadikan parameter `Seaweed` deterministik untuk mencegah React hydration mismatch.
- **Hasil Verifikasi**: Di kedalaman 843m maupun 877m–880m, seluruh ikan proyek (ikan interaktif), ikan kecil gerombolan (`.sf`), dan rumput laut (`.weed`) tampil utuh, berenang, dan berinteraksi dengan sempurna.

---

## 4. Porting Portfolio-v3 (Fitur Baru & Penyempurnaan Lanjutan)

Porting fitur lengkap dari spesifikasi referensi `Evan Atharasya · Portofolio (4).html` (Portfolio-v3) tanpa merombak arsitektur Next.js 15 + React 19 yang sudah stabil:

### 4.1 Modul & Komponen yang Diimplementasikan
1. **Mode Tenang (Calm Mode)**:
   - Tombol `#calmBtn` di kapsul audio dengan ikon ombak.
   - Mengontrol class `.calm` pada `<html>` dan disinkronkan ke `localStorage('calm')`.
   - Menghentikan/menyembunyikan animasi berat: buddy, pet fish, boids reef canvas, makhluk laut dalam, gelembung latar, burung, dan mematikan audio.
   - Pintasan keyboard: `C`.

2. **AudioEngine v2**:
   - Synthesizer Web Audio berbasis 4-lapisan Pink Noise (buffer 6 detik dengan dual-pole highpass) untuk lapisan angin (bandpass 650Hz), ombak laut (lowpass 1000Hz), laut dalam (lowpass 450Hz), dan drone bawah air (lowpass 120Hz).
   - Pemetaan dinamis multi-filter terhadap kedalaman `v`.
   - Efek transisi batas permukaan air: `plunge` (-8m) dan `emerge` (+8m).
   - Efek suara interaktif: `sweepCard()` saat klik kartu atau ikan proyek, `singWhale()` saat paus melintas, `rumbleMegalodon()` saat megalodon muncul.
   - Sound gesture safety: audio hanya dimulai setelah interaksi pengguna sadar (klik `#audBtn`).

3. **Penyelam (Buddy) & Ikan Peliharaan**:
   - Komponen `src/components/fx/Buddy.tsx` dengan SVG diver terartikulasi (tangan, kaki, sirip, tabung oksigen, syal bergoyang).
   - Lampu sorot kedalaman otomatis menyala di zona gelap (`--lamp`).
   - Penjejakan mouse halus, kedipan mata periodik, klik untuk flip 360° + semburan 9 gelembung regulator + dialog kontekstual.
   - Ikan peliharaan (`.bd-pet`) mengorbit secara dinamis di sekitar penyelam.

4. **Reef Canvas (Terumbu Interaktif)**:
   - Komponen `src/components/fx/ReefCanvas.tsx` menggunakan single 2D Canvas `z-20`.
   - Algoritma Boids untuk kawanan ikan (12-26 ekor) dengan perilaku interaktif: menghindar kursor, bereaksi pada ancaman predator (`oceanStore.state.threat`), dan mengejar makanan pelet.
   - Interaksi pelet makanan: klik air untuk melempar 4 butir makanan ikan dengan kilau makan dan percikan spark.
   - Ubur-ubur interaktif (4-7 ekor): sentuh dan lempar (drag & throw), efek petir elektrik berantai (lightning zap), dan percikan plankton.
   - Pengecualian klik interaktif UI (`button, a, input, [role='button'], #portal, .card, .fish, .chest, .aud`).

5. **Paus & Megalodon v3**:
   - Deformasi kurva Catmull-Rom closed cubic Bezier (`src/lib/bezierDeform.ts`) yang menghasilkan pergerakan gelombang tubuh organik real-time (bukan sekadar rotasi SVG kaku).
   - Penjadwal kemunculan acak (RNG) makhluk di kedalaman dengan konfigurasi produksi serta mode pengujian instan via URL `?ocean=test`.
   - Siaran ancaman `oceanStore.setThreat({ x, y, r })` saat makhluk lewat, memicu kawanan ikan menghindar secara realistis.
   - Efek visual peringatan merah (`.alert`) dan getaran layar saat Megalodon mendekat, dipadukan efek suara gemuruh frekuensi rendah.

6. **Filter Keahlian (Skill -> Proyek)**:
   - Marquee teknologi di `#about` interaktif dua arah (klik atau Enter/Space).
   - Menyorot kartu di `#work` dan ikan di `#deep` yang cocok (`.hit`), dan meredupkan yang tidak cocok (`.dim`).
   - Notifikasi Toast instan menampilkan jumlah proyek yang relevan.
   - Marquee menjeda animasi saat disentuh/hover untuk kenyamanan pemilihan teknologi.

7. **Riak Air Hero**:
   - Komponen `src/components/fx/RippleCanvas.tsx` terpasang di atas ombak section Hero.
   - Kanvas 2D merender gelombang elips memudar saat kursor mouse bergerak atau mengklik zona air hero (80% - 97% ketinggian).

8. **Peti Harta Karun (Treasure Chest)**:
   - Komponen `src/components/sections/TreasureChest.tsx` di section Kontak.
   - Tutup peti SVG berotasi elastis menggunakan cubic-bezier pegas.
   - Semburan 28 koin emas partikel bergaya fisika saat dibuka, dengan kilau emas dan teks label status dinamis.

9. **Tombol Naik ke Permukaan & Pintasan Keyboard**:
   - Tombol kapsul `#up` muncul otomatis saat kedalaman scroll melampaui `2.4 H`.
   - Semburan gelembung air saat diklik dan transisi kembali ke permukaan laut.
   - Pintasan keyboard global:
     - `C`: Toggle Mode Tenang.
     - `M`: Bisukan / aktifkan suara laut.
     - `1` - `4`: Lompat ke Tentang, Proyek, Jelajah, Kontak.
     - `?`: Menampilkan ringkasan pintasan keyboard.

10. **Penunjuk Kedalaman Responsif & Store Terpusat**:
    - `src/lib/oceanStore.ts` mengkalkulasi variabel `v` satu kali per frame pada ticker GSAP terpusat.
    - Layout bersih dan adaptif pada mobile (`<= 760px`, `<= 360px`).
    - Aturan proteksi media query layar pendek desktop (`max-height: 520px and min-width: 761px`) agar tidak menimpa layout kapsul mobile.

### 4.2 Hasil Pengujian Otomatis (Playwright E2E)
Seluruh 7 skenario pengujian di `tests/smoke.spec.ts` berjalan dan lulus 100%:
1. `Verifikasi render Hero dan Navigasi` &mdash; PASSED
2. `Verifikasi Project Portal buka, panah keyboard, dan Escape` &mdash; PASSED
3. `Verifikasi Mode Tenang (Calm Mode) toggle dan shortcut C` &mdash; PASSED
4. `Verifikasi Filter Skill di Tentang ke Proyek` &mdash; PASSED
5. `Verifikasi Peti Harta Karun di Kontak` &mdash; PASSED
6. `Verifikasi Tombol Naik ke Permukaan (#up)` &mdash; PASSED
7. `Verifikasi Pintasan Keyboard (? untuk bantuan, M untuk bisukan audio)` &mdash; PASSED

### 4.3 Perbaikan Regresi Hero Pinning & Build Next.js 15
1. **Perbaikan Hero Pinning Ganda (`transform: translate(0px, 1152px)` pada scroll 0)**:
   - **Penyebab**: `useNightMode` merubah state `isNight` dari `false` menjadi `true` setelah mount di waktu malam (setelah pukul 19:00). Karena `isNight` didaftarkan sebagai dependencies `useGSAP` di [Hero.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/components/sections/Hero.tsx), ScrollTrigger membuat pin ganda pada spacer (`padding: 2304px` bukannya `1152px`), menyebabkan elemen `#hero` terdorong keluar layar sejauh 1152px pada scroll 0.
   - **Solusi**: Mengganti dependencies `useGSAP` menjadi `[reducedMotion]` dengan `revertOnUpdate: true`, serta menggunakan fungsi dinamis untuk `--h1` dan `--h2` berdasarkan attribute `data-tod`.
2. **Perbaikan Spasi Kata Teks Statement & Kontak**:
   - Memastikan spasi `" "` berada di antara elemen `inline-block` `<span className="w">` agar kata tidak menyatu saat dirender browser.
3. **Perbaikan Attribute `hidden` pada Project Portal**:
   - Mengubah atribut statis `hidden` menjadi `hidden={!isOpen}` pada [ProjectPortal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/components/portal/ProjectPortal.tsx) agar modal dapat terbuka secara konsisten pada interaksi klik.
4. **Perbaikan CSS Siluet Makhluk Laut (`.beast`, `.alert`, `.ring`)**:
   - Menambahkan deklarasi CSS `.beast`, `.alert`, `.ring`, dan `@keyframes wbob` dengan `pointer-events: none` ke [globals.css](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/app/globals.css) agar tidak mengganggu klik elemen halaman.
5. **Perbaikan Build Next.js 15 (`Invariant: no direct app page entry found for /_not-found`)**:
   - Menambahkan [not-found.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/app/not-found.tsx) untuk memenuhi invariant Next.js 15 App Router sehingga `pnpm build` sukses 100%.

### 4.4 Perbaikan Masalah Interaksi, Scroll Portal, & Sinkronisasi Waktu Malam

1. **Perbaikan Kepala Buddy Berosilasi / Looping Bertubi-tubi**:
   - **Penyebab**: Karakter penyelam berenang menghadap ke kanan. Ketika kursor mouse berada di sebelah kiri (area membaca teks konten yang mencakup sebagian besar layar), nilai sudut relatif `Math.atan2(dy, dx)` berada di sekitar ±180° (branch cut). Setiap pergerakan vertikal kecil saat penyelam mengapung menyebabkan sudut melompat drastis antara +28° (menunduk) dan -28° (menengadah) secara bergantian di setiap frame (feedback loop).
   - **Solusi**: Di [Buddy.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/components/fx/Buddy.tsx), menggunakan koordinat jangkar stabil dari container luar (`bdRect`), menerapkan deadzone jarak (`> 45px` dan `pointer: fine`), serta menggunakan formula pitch vertikal bebas diskontinuitas `Math.atan2(ptrDy, Math.max(80, Math.abs(ptrDx)))` yang dihaluskan secara eksponensial (`headRot += (targetHeadDeg - headRot) * 0.1`). Gerakan kepala kini stabil dan halus tanpa osilasi.

2. **Perbaikan Modal Project Portal Tidak Bisa Di-scroll**:
   - **Penyebab**: 
     1. Lenis menangani event `wheel` dan `touchmove` pada `window` secara default dan memanggil `event.preventDefault()` jika elemen target tidak memiliki atribut `data-lenis-prevent`.
     2. Transisi zoom SVG `clipPath: circle(...)` mempertahankan inline style `clipPath`, yang membatasi area interaksi viewport.
   - **Solusi**:
     1. Pada [ProjectPortal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/components/portal/ProjectPortal.tsx), menambahkan atribut `data-lenis-prevent` dan `data-lenis-prevent-scroll`, serta `onWheel` dan `onTouchMove` `stopPropagation()`.
     2. Meng-clamp titik pusat ekspansi `cx` dan `cy` ke batas viewport, serta membersihkan inline style `clipPath` menggunakan `gsap.set(portal, { clearProps: "clipPath" })` saat animasi selesai terbuka.
     3. Pada [globals.css](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/app/globals.css), memastikan `#portal` memiliki aturan `overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior: contain;`. Modal kini dapat di-scroll dengan mulus baik menggunakan mouse wheel maupun gesture sentuh.

3. **Perbaikan Mode Malam Otomatis Berdasarkan Waktu (19.00 - 05.00)**:
   - **Penyebab**: `useNightMode` awalnya mengembalikan `false` secara default pada SSR dan klien tertahan oleh `suppressHydrationWarning`. Selain itu, GSAP mengunci nilai warna inline `--h1: rgb(59,127,196)` dan `--h2: rgb(191,230,251)` saat inisialisasi awal sehingga menimpa selector CSS `#hero[data-tod="night"]`.
   - **Solusi**:
     1. Pada [useNightMode.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/hooks/useNightMode.ts), menghitung `hour >= 19 || hour < 5` secara konsisten pada inisialisasi awal dan menambahkan interval timer 10 detik agar pergantian waktu malam/siang terjadi secara otomatis secara real-time.
     2. Pada [Hero.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/components/sections/Hero.tsx), mendaftarkan `isNight` dalam dependencies GSAP, menetapkan variabel awal `--h1: rgb(8,16,44)` dan `--h2: rgb(52,82,140)` secara eksplisit via `gsap.set`, serta menghapus `suppressHydrationWarning`. Tampilan langit malam (bintang berkelip, bulan temaram, dan gradien gelap) kini tampil akurat saat jam 19.00 s.d. 05.00.



4. **Perbaikan Teks Keterangan Peti Harta Karun ("Klik petinya" / "Harta karun ditemukan!") Tidak di Tengah**:
   - **Penyebab**:
     1. Terjadi tabrakan selector nama kelas global `.cl`. Di [globals.css](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/app/globals.css), `.cl` didefinisikan sebagai elemen awan pada Hero dengan `position: absolute` dan pada media query layar kecil (`max-width: 600px`) diberikan `scale: 0.6; transform-origin: 0 0;`. Akibatnya, label peti `<span className="cl">` terdorong keluar flow normal, mengecil ke pojok kiri atas, dan terdistorsi ke kiri.
     2. Tombol `.chest` menggunakan `display: block` dengan lebar terbatas `clamp(130px, 22vw, 200px)` tanpa flexbox centering atau text alignment yang tepat, sehingga teks yang lebih panjang atau saat di layar mobile bergeser ke kiri dan tidak sejajar dengan pengait peti.
   - **Solusi**:
     1. Mengisolasi selector CSS awan agar hanya menarget `#hero .cl` dan media query `#hero .cl`, sehingga tidak pernah bentrok dengan elemen di section lain.
     2. Mengubah `.chest` menjadi flex column container (`display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: fit-content; max-width: 100%`) dan mengatur ukuran SVG peti secara mandiri (`width: clamp(130px, 22vw, 200px); height: auto; margin: 0 auto;`).
     3. Menambahkan kelas khusus `.chest-caption` pada [TreasureChest.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/components/sections/TreasureChest.tsx) dengan styling badge kapsul elegan (`display: inline-flex; position: static !important; scale: 1 !important; transform-origin: center center !important; text-align: center; padding: 6px 18px; border-radius: 999px; background: rgba(255, 233, 168, 0.1); border: 1px solid rgba(255, 233, 168, 0.25); backdrop-filter: blur(8px)`).
     4. Memvalidasi posisi horizontal tengah dengan presisi piksel menggunakan Playwright test (`Math.abs(svgCenter - labelCenter) < 1px`) baik pada desktop (1280px) maupun mobile (390px) dalam kondisi tertutup maupun terbuka.

5. **Perbaikan Penyelam & Makanan Ikan Tidak Langsung Hilang Saat Scroll Cepat ke Daratan**:
   - **Penyebab**:
     1. Pada `Buddy.tsx`, pengurangan opacity menggunakan lerp lambat `opacity += (0 - opacity) * 0.1` yang memerlukan ~45 frame (~750ms) sebelum mencapai batas sembunyi `opacity < 0.01`. Akibatnya, saat pengguna scroll cepat ke atas ke section Hero/daratan (`v >= 0`), penyelam dan balon bicaranya masih melayang di langit.
     2. Pada `ReefCanvas.tsx`, array butiran makanan ikan `P` (pellets) memiliki umur hidup 9 detik dan tidak pernah dikosongkan saat kedalaman berpindah ke daratan. Opacity pellet dibatasi minimal `Math.max(fishAlpha, 0.4)`, dan saat `fishAlpha < 0.02` fungsi melakukan `return` sebelum `ctx.clearRect(0, 0, W, H)`, sehingga butiran makanan ikan tertinggal di layar daratan.
   - **Solusi**:
     1. Pada [Buddy.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/components/fx/Buddy.tsx), menambahkan pengecekan instan saat berada di daratan (`v >= 0 || calm`): seketika mengatur `opacity = 0`, `visibility = "hidden"` untuk `#buddy` dan `#bdPet`, menghentikan timer & menyembunyikan balon bicara `#bdSay`, serta menghentikan kalkulasi sendi saat di daratan.
     2. Pada [ReefCanvas.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/src/components/fx/ReefCanvas.tsx), menambahkan pengecekan instan saat berada di daratan (`v >= 0 || calm || document.hidden`): seketika mengosongkan seluruh array makanan ikan (`P.length = 0`) dan percikan (`S.length = 0`), mereset alpha ke 0, dan membersihkan kanvas secara menyeluruh (`ctx.clearRect(0, 0, W, H)`). Opacity pellet kini dikalikan langsung dengan `fishAlpha` agar memudar mulus bersama air.
     3. Memvalidasi dengan pengujian otomatis Playwright [fast-scroll.spec.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/Website%20Portofolio/tests/fast-scroll.spec.ts) yang mengonfirmasi bahwa saat scroll instan ke daratan, opacity penyelam = 0, visibility = hidden, dan tidak ada sisa makanan ikan di daratan.
