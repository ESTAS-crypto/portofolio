# Catatan Keputusan & Usulan (Decisions Needed)

Dokumen ini mencatat keputusan arsitektur, pendaftaran pustaka pihak ketiga baru, dan usulan fitur opsional (F23) untuk persetujuan Evan.

---

## 1. Pendaftaran Pustaka Baru (Sesuai Aturan Keselamatan)
Berdasarkan spesifikasi keselamatan, penambahan dependensi baru hanya diizinkan untuk:
1. **`@playwright/test`**: Sudah terpasang sebagai `devDependency` (`^1.64.0`). Dipakai untuk smoke test, visual regression baseline, dan penangkapan screenshot live.
2. **`sharp`** (`dependency`): Dipakai untuk pemrosesan gambar screenshot portal (konversi ke WebP, kompresi kualitas 82, pembuatan varian 1600x1000 dan 800x500, serta pengekstrakan blurDataURL).
3. **`zod`** (`dependency`): Dipakai untuk validasi runtime skema input Route Handler `/api/contact` (panjang pesan, format email, validasi timestamp, dan verifikasi honeypot anti-spam).
4. **`resend`** (`dependency`): SDK resmi Resend untuk pengiriman email transaksional di sisi server (Route Handler `/api/contact`) ke `CONTACT_TO`. Kunci API tidak pernah bocor ke bundel klien.

---

## 2. Resolusi Slug Proyek: `nextjs-ai-chatbot` vs `ai-chatbot-nextjs`
- **Temuan:** Di data produksi repo (`src/data/projects.ts` baris 87), slug yang sudah terdaftar dan live adalah `nextjs-ai-chatbot`. Pada teks prompt terdapat referensi penamaan `ai-chatbot-nextjs`.
- **Keputusan:** Sesuai Prinsip Utama 1 (Kode repo yang sudah ada adalah sumber kebenaran), slug utama tetap `nextjs-ai-chatbot`. Rute `/proyek/nextjs-ai-chatbot` di-generate sebagai halaman kanonikal statis (SSG), sementara `/proyek/ai-chatbot-nextjs` diberikan rewrite/redirect otomatis ke slug kanonikal agar kedua URL dapat diakses tanpa 404.

---

## 3. Usulan F23: Tampilan Keahlian Berdasarkan Zona Kedalaman (Opsional)
> [!NOTE]
> Fitur ini **TIDAK DIKERJAKAN** sampai Evan memberikan persetujuan tertulis. Bagian Tentang saat ini dipertahankan seutuhnya.

### Latar Belakang & Konsep
Di bagian Tentang (`#about`), keahlian saat ini ditampilkan dalam barisan marquee chip horizontal dinamis (`KineticMarquee`). Usulan F23 menawarkan integrasi tematik kelautan di mana keahlian dibagi berdasarkan kedalaman pemahaman:
1. **Zona Permukaan / Sinar Matahari (0 – 200 m):**
   - *Keahlian Utama & Fondasi (Dikuasai Mendalam):* JavaScript, TypeScript, React, Next.js, Node.js, CSS/Tailwind.
   - *Gaya Visual:* Chip dengan aksen terang keemasan/cyan, kontras tinggi, animasi terapung santai.
2. **Zona Senja / Twilight Zone (200 – 600 m):**
   - *Teknologi Pendukung & Backend:* PHP, Python, Flutter, Supabase, PostgreSQL, Docker, Git.
   - *Gaya Visual:* Chip semi-transparan dengan pendaran bioluminesensi halus (indigo/ungu laut).
3. **Zona Palung / Abyssal Zone (600 – 1000 m):**
   - *Eksplorasi Baru & Riset:* AI Integration (Gemini, OpenAI API), WebGL/Three.js Shaders, Distributed Realtime Systems.
   - *Gaya Visual:* Pendaran neon elektrik gelap dengan partikel misterius.

### Dampak Aksesibilitas & Mitigasi
- **Struktur Semantik:** Keahlian tetap menggunakan elemen semantik bertingkat (`<section>`, `<h3>`, `<ul>`, `<li>`) sehingga pembaca layar (screen reader) dapat bernavigasi per zona tanpa kebingungan.
- **Dukungan Keyboard:** Setiap chip tetap dapat difokus via Tab dan ditekan via Enter/Space untuk memicu filter proyek.
- **Prefers-Reduced-Motion:** Efek melayang dinonaktifkan jika reduced-motion aktif, digantikan tata letak kartu grid statis yang rapi.
- **Rekomendasi:** Jika Evan ingin mencoba tampilan ini, perubahan dapat dicoba dalam branch terpisah `feat/depth-skills` setelah seluruh F14-F22 dinyatakan stabil.
