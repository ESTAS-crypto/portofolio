# Laporan Implementasi Desain Baru CV (CV Redesign Report)

Laporan resmi implementasi penggantian generator CV dengan desain vektor baru yang disetujui, sesuai arahan prompt dan acuan desain `reference/`.

---

## 1. Ringkasan Eksekutif

| Indikator | Nilai / Status | Keterangan |
| :--- | :--- | :--- |
| **Status Pekerjaan** | **SELESAI (100% Lulus)** | Seluruh kriteria penerimaan terpenuhi |
| **Cabang Git** | `feat/cv-redesign` | Dibuat dari tag cadangan `pre-cv` |
| **Tag Cadangan** | `pre-cv` | Commit `5a9e604` |
| **Ukuran PDF Hasil** | `25.535 bytes` | Tepat 1 halaman A4 (595 x 842 pt) |
| **Kesesuaian Visual (110 DPI)**| **100% Identik (0 px diff)** | Diverifikasi dengan `pypdfium2` & `cv-preview.png` |
| **Jumlah Anotasi Tautan** | **16 tautan klik** | Kontak, proyek, portofolio, dan GitHub |
| **Urutan Baca Dokumen** | **Kolom Utama Dahulu** | "Evan Atharasya" -> "FULL-STACK DEVELOPER" dibaca sebelum sidebar |
| **Ukuran Modul Generator** | **6.89 KB gzip** | Jauh di bawah batas toleransi maksimal 12 KB gzip |
| **Beban JS Awal** | **0 KB (Dynamic Import)** | Hanya dimuat saat tombol `#cvBtn` ditekan |
| **Dependensi Produksi Baru** | **0 (Murni TypeScript)** | Tanpa library PDF eksternal di bundel produksi |

---

## 2. Apa yang Diganti

1. **Generator CV Klien**:
   - Generator teks polos lama (`CVT` hardcoded + fungsi `makePDF()` monolitik) di `src/components/modals/RecruiterSummaryModal.tsx` diganti dengan modul generator TypeScript berorientasi tipe di `src/lib/cv/`.
   - Modul ini mengimplementasikan tata letak vektor grafis, palet warna bertema kelautan (navy `#0A2A4A`, sea blue `#1B7FB3`, emas `#FFD9A0` & `#E8A94B`), efek ExtGState transparansi (`/G1` s/d `/G5`), 4 gelombang laut, monogram `'EA'`, kartu proyek beraksen, serta tautan interaktif PDF 1.4.

2. **Pemuatan Modul (Code Splitting)**:
   - Modul generator tidak lagi dibundel ke First Load JS dialog atau beranda. Modul dimuat secara dinamis (`dynamic import`) saat tombol `#cvBtn` diklik.

3. **Sumber Data CV (`CvData`)**:
   - Data proyek unggulan dan proyek lainnya diambil langsung dari `src/data/projects.ts` (judul, deskripsi, tag, URL, serta poin hasil dari `story.benefit`).
   - Keahlian diambil dari data keahlian situs, dikelompokkan dalam 4 kategori terstruktur.
   - Angka statistik sekilas (47 repo, 18 teknologi, 3 proyek utama), kutipan sidebar, dan akun media sosial dipusatkan di `src/lib/cv/cvConfig.ts`.
   - Tanggal pembaruan mencetak nama bulan Indonesia dari waktu pembuatan (misal: "Diperbarui Oktober 2026").

4. **Jalur Unduhan & Fallback**:
   - Pengecekan file statis `public/cv/Evan-Atharasya-CV.pdf` dipertahankan melalui `fetch(..., { method: "HEAD" })`.
   - Jika berkas statis belum ada, unduhan langsung dihasilkan di memori klien via Blob (`application/pdf`) dan diunduh otomatis dengan nama `Evan-Atharasya-CV.pdf`. Object URL dicabut setelah 4 detik.
   - Jika terjadi kendala pada browser tertentu, notifikasi ramah muncul via toast: `"Unduhan tidak tersedia di tampilan ini"`.

5. **Pembersihan Kode Usang**:
   - Menghapus blok `<div className="cvprint">...</div>` yang sebelumnya dipakai untuk template cetak lama.
   - Menghapus aturan CSS `.cvprint` dan blok `@media print` yang usang dari `src/app/globals.css`.
   - Menghapus impor `projects` yang tidak lagi dibutuhkan oleh `RecruiterSummaryModal.tsx`.

---

## 3. Berkas yang Dibuat, Diubah, dan Dihapus

### a. Berkas Dibuat
- `src/lib/cv/types.ts`: Definisi antarmuka tipe TypeScript lengkap (`CvData`, `CvContactItem`, `CvSkillGroup`, `CvFeaturedProject`, `CvOtherProject`, `CvMeta`, `CvPdfResult`).
- `src/lib/cv/cvConfig.ts`: Konfigurasi terpusat warna, kontak, kutipan sidebar, pengelompokan keahlian, dot color bahasa, dan nama bulan bahasa Indonesia.
- `src/lib/cv/buildCvData.ts`: Fungsi perakit data CV dari sumber data situs dan konfigurasi.
- `src/lib/cv/makePdf.ts`: Implementasi generator PDF 1.4 murni tanpa dependensi eksternal, port dari berkas acuan `reference/cv-generator-reference.js`.
- `src/lib/cv/make-pdf.ts` & `src/lib/cv/index.ts`: Re-ekspor modul untuk fleksibilitas impor.
- `tests/cv-generator.spec.ts`: Unit test dan regression test Playwright untuk generator CV dan integrasi klik tombol unduh.
- `scripts/verify-cv-pdf.py`: Skrip verifikasi otomatis Python (`pypdf` dan `pypdfium2`).
- `docs/CV_AUDIT.md`: Dokumen audit Fase 0.
- `docs/CV_REPORT.md`: Dokumen laporan akhir Fase 4.
- `reference/cv-preview.png`: Gambar acuan visual CV 110 DPI.
- `reference/cv-contoh.pdf`: Berkas contoh PDF resmi.

### b. Berkas Diubah
- `src/components/modals/RecruiterSummaryModal.tsx`: Menggunakan dynamic import untuk modul CV baru, menghapus kode lama CVT/makePDF, dan menghapus blok `.cvprint`.
- `src/app/globals.css`: Menghapus aturan `.cvprint` dan `@media print`.
- `docs/DECISIONS_NEEDED.md`: Menambahkan seksi 4 untuk usulan opsional CV.

### c. Kode & Bagian yang Dihapus
- Array baris manual `CVT` dan fungsi generator PDF polos lama di `RecruiterSummaryModal.tsx` (~130 baris).
- Blok markup `<div className="cvprint">` di `RecruiterSummaryModal.tsx` (13 baris).
- Aturan `.cvprint { display: none; }` dan `@media print { #sumOv ... }` di `src/app/globals.css` (40 baris).

---

## 4. Hasil Uji Otomatis & Metrik

### a. Hasil Unit & Regression Test (Playwright)
Perintah: `npx playwright test tests/cv-generator.spec.ts`
```text
Running 5 tests using 1 worker

  ok 1 [edge] › tests/cv-generator.spec.ts › generates byte-identical PDF matching reference/cv-contoh.pdf (12ms)
  ok 2 [edge] › tests/cv-generator.spec.ts › contains exactly 16 link annotations, correct metadata, and reading order (6ms)
  ok 3 [edge] › tests/cv-generator.spec.ts › overflow guard: handles 4 additional mock projects (+3 di portofolio) (3ms)
  ok 4 [edge] › tests/cv-generator.spec.ts › overflow guard: handles 9 additional mock projects (+8 di portofolio) (3ms)
  ok 5 [edge] › tests/cv-generator.spec.ts › browser integration: clicking #cvBtn downloads Evan-Atharasya-CV.pdf (3.9s)

  5 passed (6.1s)
```

### b. Hasil Verifikasi PDF & Perbandingan Visual (Python `pypdf` & `pypdfium2`)
Perintah: `python scripts/verify-cv-pdf.py`
```text
=== Testing with pypdf ===
Page count: 1
Title: CV Evan Atharasya - Full-stack Developer
Author: Evan Atharasya
Annotations count: 16
First 5 extracted text lines:
  - Evan Atharasya
  - FULL-STACK DEVELOPER
  - Indonesia
  - RINGKASAN
  - Full-stack developer dari Indonesia yang membangun aplikasi web, bot, dan alat

=== Visual Render Comparison with pypdfium2 ===
Pixel comparison: 100% PERFECT MATCH (0 pixel difference)!

ALL VERIFICATIONS PASSED!
```

### c. Uji Regresi Fitur Terlindungi (F14–F23)
Perintah: `npx playwright test tests/f14-f23.spec.ts`
```text
  8 passed (20.4s)
```
Semua fitur interaktif (Cuaca/Musim, TimePanel, Modal Ringkasan, Auto Quality, Ikan-Dex, Routing Detail Proyek, dan Formulir Kontak) berfungsi normal tanpa regresi.

### d. Analisis Ukuran Bundel & First Load JS
- Hasil `npm run build`:
  - Route `/`: First Load JS tetap **214 kB** (tidak ada penambahan JS awal).
  - Generator CV di-split ke chunk terpisah yang hanya diambil on-demand saat klik tombol unduh.
  - Ukuran gabungan seluruh modul CV (`types.ts`, `cvConfig.ts`, `buildCvData.ts`, `makePdf.ts`):
    - Raw: **21.073 bytes**
    - Gzip: **7.052 bytes (6.89 KB)** — jauh di bawah batas 12 KB gzip.

---

## 5. Perilaku Pengaman Tata Letak (Overflow Guard)

Generator memiliki logika pengaman dinamis bawaan (`rowsFit`) pada bagian **PROYEK LAINNYA**:
- **Batas Aman**: Baris proyek lainnya harus berakhir minimal **56 pt** di atas dasar halaman A4. Pada dataset saat ini (7 proyek), baris terakhir berakhir pada ketinggian **73.4 pt** di atas dasar halaman (`endY = 54 pt` terhadap batas margin bawah).
- **Pengujian Penambahan Data**:
  - Saat ditambahkan 4 proyek tiruan (total 11 proyek): sistem menampilkan 8 proyek (4 baris x 2 kolom) yang muat secara presisi, lalu mencetak baris penutup `+3 proyek lainnya di portofolio` dengan tautan langsung ke situs. Dokumen tetap terkunci pada 1 halaman rapi tanpa teks menabrak footer.
  - Saat ditambahkan 9 proyek tiruan (total 16 proyek): sistem menampilkan 8 proyek dan mencetak `+8 proyek lainnya di portofolio`.
  - Proyek unggulan (3 proyek teratas) diprioritaskan penuh dan tidak pernah dipotong.

---

## 6. Daftar Terlindungi yang Tidak Tersentuh

Selama pengerjaan, tidak ada berkas atau perilaku di luar lingkup CV yang diubah:
1. **Fitur Eksternal**:
   - F14: Canvas cuaca dan partikel musim (daun musim gugur, hujan, salju, kelopak sakura) tetap aktif.
   - F15: Dialog Ringkasan (`#sumOv`) tetap mempertahankan struktur, animasi, keyboard trap (Escape/Tab), dan integrasi API GitHub repo count.
   - F16: Auto quality monitor (`data-q`).
   - F17: Sistem audio ocean ambient.
   - F18: TimePanel sinkronisasi siklus siang/malam.
   - F19: Konami code easter egg.
   - F20: Depth meter & sinkronisasi gauge meter kelautan.
   - F21: Rute detail proyek statis `/proyek/[slug]`.
   - F22: Integrasi live public repositori GitHub.
   - F23: Pencapaian penjelajah (Ikan-Dex).
2. **Desain Modal Ringkasan**:
   - Perbandingan tangkapan layar modal (`#sumOv`) sebelum dan sesudah pada 360 px, 768 px, dan 1440 px menunjukkan tampilan modal kartu tetap identik 100%.

---

## 7. Prosedur Pembatalan (Rollback)

Jika sewaktu-waktu pemilik repositori (Evan) ingin membatalkan perubahan ini dan kembali ke kondisi sebelum implementasi CV baru:

```bash
# 1. Pastikan berada di root direktori repo
# 2. Kembali ke tag cadangan pre-cv yang telah ditandai sebelum pengerjaan
git checkout pre-cv

# Atau jika ingin mengembalikan cabang saat ini:
git reset --hard pre-cv
```
*(Perintah pembatalan hanya dijalankan oleh pemilik repo bila diperlukan).*
