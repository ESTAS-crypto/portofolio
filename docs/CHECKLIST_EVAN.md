# Checklist Persiapan Evan Atharasya (F14 – F23)

Dokumen ini memuat daftar hal yang perlu disiapkan oleh Evan untuk fitur F14 sampai F23. Agen tidak memblokir pekerjaan bila daftar ini belum lengkap: cover sementara / placeholder dan generator PDF di sisi klien disediakan secara otomatis.

---

### 1. SCREENSHOT PROYEK ASLI untuk Jendela Portal (F19)
- **2 Proyek Live (Otomatis):**
  - **LUVENCE ID** (`https://luvence-id.vercel.app/`): diambil otomatis via skrip Playwright (`cover-1600.webp`, `cover-800.webp`, `mobile-390.webp`).
  - **VendTrack** (`https://vend-finder.vercel.app/`): diambil otomatis via skrip Playwright (`cover-1600.webp`, `cover-800.webp`, `mobile-390.webp`).
- **7 Proyek GitHub (Perlu Screenshot / Cover):**
  - `tryout-snbt`
  - `genzmart-pro`
  - `nextjs-ai-chatbot` (alias `ai-chatbot-nextjs`)
  - `ai-gratis`
  - `manajemen-keuangan`
  - `track-location`
  - `sistem-laporan`
  *(Sebelum disediakan Evan, sistem membuat cover bergaya kartu dengan nama, stack, dan badge placeholder yang jelas).*
- **1 Proyek Privat (WAJIB Disamarkan):**
  - `laporan-kunjungan-rumah`: WAJIB gambar yang sudah disamarkan (nama pasien, alamat, wajah, data sensisif dikaburkan). Sebelum ada, sistem memakai cover bertuliskan "Proyek privat".

### 2. File CV PDF (F15)
- Letakkan file PDF final di: `public/cv/Evan-Atharasya-CV.pdf`.
- Sebelum file statis ada, tombol "Unduh CV (PDF)" secara otomatis menghasilkan dokumen PDF 1 halaman standar A4 (595x842 pt) langsung di browser via Blob tanpa memicu dialog cetak (`window.print()`).

### 3. Kunci Pengirim Email untuk Pesan dalam Botol (F20)
- Masukkan ke environment variable di dashboard **Vercel** (JANGAN di-commit ke repositori / kode):
  - `RESEND_API_KEY`: API Key dari resend.com
  - `CONTACT_TO`: `evanatharasya@gmail.com`
- File `.env.example` telah disiapkan di root repo sebagai panduan variabel tanpa nilai sensitif.

### 4. Persetujuan Tertulis untuk F23 (Opsional)
- F23 (tampilan skill bertingkat berdasarkan kedalaman laut di bagian Tentang) bersifat opsional dan **TIDAK DIKERJAKAN** sebelum ada persetujuan tertulis dari Evan. Usulan desain lengkap dicatat di `docs/DECISIONS_NEEDED.md`.
