# Audit CV Portofolio Evan Atharasya

Dokumen ini disusun sebagai **Langkah 0 (Fase 0)** sebelum penulisan kode perbaikan generator CV, sesuai spesifikasi yang disetujui.

---

## 1. Inventaris Titik Sentuh CV (Touchpoints)

### a. Komponen & Tombol UI
- **Berkas**: `src/components/modals/RecruiterSummaryModal.tsx`
- **Elemen Tombol**:
  ```tsx
  <button type="button" id="cvBtn" onClick={handleDownloadCV}>
    Unduh CV (PDF)
  </button>
  ```
- **Fungsi Penangan**: `handleDownloadCV()` (baris 232–261).
- **ID & Selektor**: `#cvBtn` (digunakan oleh pengujian Playwright).

### b. Generator CV Lama
- **Tabel Data Teks Polos**: `CVT` (baris 14–51) di `RecruiterSummaryModal.tsx` berisi array baris teks manual hardcoded tanpa desain visual.
- **Generator PDF Klien Lama**: `makePDF(): Uint8Array` (baris 53–142) di `RecruiterSummaryModal.tsx`. Menghasilkan PDF 1.4 mentah berbasis koordinat teks satu kolom hitam-putih sederhana tanpa styling vektor, sidebar, maupun kartu proyek.

### c. Template Cetak & Stylesheet Cetak Lama
- **Template Cetak HTML**: `src/components/modals/RecruiterSummaryModal.tsx` (baris 340–352):
  ```tsx
  <div className="cvprint">
    <h3>Semua Proyek</h3>
    ...
  </div>
  ```
- **CSS Tersembunyi**: `src/app/globals.css` (baris 3924–3926):
  ```css
  .cvprint { display: none; }
  ```
- **Aturan Media Cetak**: `src/app/globals.css` (baris 3994–4030):
  ```css
  @media print {
    body > *:not(#sumOv) { display: none !important; }
    #sumOv { ... }
    #sumOv .cvprint { display: block !important; }
  }
  ```
  *(Akan dihapus pada Fase 3 setelah generator PDF baru aktif dan terverifikasi).*

### d. Berkas CV Statis
- **Direktori `public/cv/`**: Saat ini folder `public/cv/` belum ada (tidak ada file `public/cv/Evan-Atharasya-CV.pdf` di repo).
- **Perilaku**: Handler tombol saat ini mencoba mengecek `HEAD /cv/Evan-Atharasya-CV.pdf`. Karena file statis belum ada, alur langsung dialihkan ke generator PDF di klien.

### e. Teks Dialog Ringkasan
- Header: `siteConfig.name` ("Evan Atharasya")
- Deskripsi: "Full-stack developer dari Indonesia. Membangun aplikasi web, bot, dan alat berbasis AI."
- Bagian Proyek Unggulan (`FEATURED`): LUVENCE ID, VendTrack, Laporan Kunjungan Rumah.
- Bagian Keahlian Utama (`SKILLS`): 10 keahlian.
- Tombol Aksi: Email, GitHub (+ live repo count), LinkedIn, dan `Unduh CV (PDF)`.

### f. Pengujian Terkait CV
- **Berkas**: `tests/f14-f23.spec.ts`
  - Baris 47–49:
    ```ts
    const pdfBtn = page.locator("#cvBtn");
    await expect(pdfBtn).toBeVisible();
    await expect(pdfBtn).toContainText("Unduh CV");
    ```
  - Memastikan tombol `#cvBtn` ada di dialog `#sumOv` dan berlabel "Unduh CV".

### g. Sumber Data Konten
- `src/data/projects.ts`: Menyediakan data `projects` (slug, title, description, tags, url, story benefit / hasil).
- `src/data/skills.ts`: Menyediakan daftar lengkap 18 keahlian teknis.
- `src/data/site.ts`: Menyediakan nama, peran, kontak, ringkasan, dan statistik (47 repo, 18 teknologi, 3 proyek utama).

---

## 2. Jalur Unduhan (Download Flow)

Alur unduhan saat ini yang dipertahankan sepenuhnya:
1. Pengguna menekan `#cvBtn` pada modal Ringkasan (`#sumOv`).
2. Notifikasi awal: `oceanStore.toast("Mengunduh CV...", { p: 0 })`.
3. Pengecekan berkas statis: `fetch("/cv/Evan-Atharasya-CV.pdf", { method: "HEAD" })`.
   - **Jika berkas ada (`ok: true`)**: Unduh langsung berkas statis tersebut melalui elemen tautan virtual (`<a download="Evan-Atharasya-CV.pdf">`).
   - **Jika berkas tidak ada / 404**:
     - Muat modul generator PDF via dynamic import (`await import('@/lib/cv/makePdf')`).
     - Jalankan generator PDF baru untuk menghasilkan byte array PDF 1.4 A4.
     - Buat `Blob` dengan tipe MIME `application/pdf`.
     - Buat Object URL (`URL.createObjectURL(blob)`).
     - Picu unduhan otomatis dengan nama berkas `Evan-Atharasya-CV.pdf`.
     - Bersihkan URL memori (`URL.revokeObjectURL(url)`) setelah delay 4 detik.
4. **Penanganan Kesalahan**:
   - Jika proses gagal, tampilkan notifikasi toast: `"Unduhan tidak tersedia di tampilan ini"`.
   - **DILARANG**: Menggunakan `window.print()`.

---

## 3. Tangkapan Layar Baseline Modal Ringkasan

Tangkapan layar baseline dialog `#sumOv` sebelum modifikasi kode telah diambil pada 3 breakpoint standar:
- **Mobile (360 px)**: `docs/baseline/summary-dialog-360.png`
- **Tablet (768 px)**: `docs/baseline/summary-dialog-768.png`
- **Desktop (1440 px)**: `docs/baseline/summary-dialog-1440.png`

---

## 4. Daftar Terlindungi (Protected List)

Perubahan pada cabang `feat/cv-redesign` diisolasi HANYA pada modul CV dan tombol unduhan CV:
1. **Fitur Eksternal**:
   - F14 (Weather & season particles)
   - F15 (Recruiter modal layout, animation, keyboard trap, and GitHub stats)
   - F16 (Auto quality adjustment)
   - F17 (Audio system & ambient audio)
   - F18 (Time panel sync & day/night cycle)
   - F19 (Konami code easter egg)
   - F20 (Depth meter indicator & gauge sync)
   - F21 (Project detail routes `/proyek/[slug]`)
   - F22 (Live GitHub activity integration)
   - F23 (Explorer Dex achievements & discoveries)
2. **Integritas Kode**:
   - Seluruh perubahan manual Evan pada berkas situs, komponen, dan data.
   - Tidak menambah library baru ke dependensi produksi (menggunakan generator murni TS/JS tanpa dependensi).
   - Tidak merombak struktur dialog Ringkasan di luar logika generator unduh CV.
