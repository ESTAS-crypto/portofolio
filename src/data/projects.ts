import { Project } from "@/types/project";

export const projects: Project[] = [
  {
    slug: "luvence-id",
    title: "LUVENCE ID",
    description:
      "E-commerce parfum mewah dengan botol 3D interaktif, pembayaran Midtrans, ongkir RajaOngkir, dan AI Gemini.",
    tags: ["React", "Three.js", "Supabase"],
    url: "https://luvence-id.vercel.app/",
    cta: "Buka situs live",
    hue: 38,
    story: {
      problem:
        "Aroma tidak bisa dicium lewat layar, dan toko parfum online biasanya hanya gambar 2D yang datar.",
      solution:
        "Toko online dengan botol parfum 3D yang bisa diputar, kuis rekomendasi aroma, checkout Midtrans, ongkir otomatis, dan dashboard admin dengan AI Gemini.",
      benefit:
        "Belanja terasa mewah, dengan pertahanan siber berlapis dan notifikasi real-time ke Discord.",
    },
  },
  {
    slug: "vendtrack",
    title: "VendTrack",
    description:
      "Platform intelijen pasar Growtopia: vending machine, kurs DL/BGL ke Rupiah, dan radar moderator real-time.",
    tags: ["Next.js", "TypeScript", "Supabase"],
    url: "https://vend-finder.vercel.app/",
    cta: "Buka situs (perlu login Discord)",
    hue: 215,
    story: {
      problem:
        "Trader Growtopia sulit memantau harga, kurs DL/BGL, dan kehadiran moderator dari banyak sumber.",
      solution:
        "Dashboard Next.js dengan data vending, grafik kurs candlestick, radar moderator lewat SSE, dan login Discord dengan hak akses per role.",
      benefit:
        "Satu tempat memantau pasar, dengan keamanan berlapis seperti rate limiter dan sesi HMAC-SHA256.",
    },
  },
  {
    slug: "laporan-kunjungan-rumah",
    title: "Laporan Kunjungan Rumah",
    description:
      "Aplikasi Android offline-first untuk kader dan petugas puskesmas mencatat kunjungan rumah pasien.",
    tags: ["Privat", "Flutter", "Supabase"],
    hue: 170,
    priv: true,
    story: {
      problem:
        "Kader bekerja di lapangan yang sering tanpa sinyal, tapi tetap harus mencatat pemeriksaan dengan rapi.",
      solution:
        "Aplikasi Flutter offline-first yang menyimpan data lokal lalu sinkron otomatis ke Supabase, lengkap dengan foto, input suara, dan ekspor PDF.",
      benefit:
        "Laporan tersusun rapi, data aman lewat Row-Level Security, dan siap dicetak.",
    },
  },
  {
    slug: "tryout-snbt",
    title: "Tryout SNBT",
    description: "Platform simulasi ujian SNBT dengan 340+ soal latihan.",
    tags: ["JavaScript"],
    url: "https://github.com/ESTAS-crypto/TRYOUT-SNBT",
    cta: "Lihat di GitHub",
    hue: 200,
    story: {
      problem: "Persiapan SNBT butuh banyak latihan soal.",
      solution: "Platform simulasi ujian dengan 340+ soal.",
      benefit: "Pelajar bisa berlatih dan mengulang kapan saja.",
    },
  },
  {
    slug: "genzmart-pro",
    title: "GenZMart PRO",
    description: "Platform e-commerce untuk marketplace anak muda.",
    tags: ["PHP"],
    url: "https://github.com/ESTAS-crypto/GenZMart-PRO",
    cta: "Lihat di GitHub",
    hue: 330,
    story: {
      problem:
        "Anak muda butuh tempat belanja online yang sesuai gayanya.",
      solution: "Platform e-commerce berbasis PHP untuk marketplace Gen-Z.",
      benefit: "Katalog dan transaksi dalam satu aplikasi.",
    },
  },
  {
    slug: "nextjs-ai-chatbot",
    title: "AI Chatbot Next.js",
    description: "Chatbot berbasis AI yang dibangun dengan Next.js.",
    tags: ["TypeScript", "Next.js"],
    url: "https://github.com/ESTAS-crypto/nextjs-ai-chatbot",
    cta: "Lihat di GitHub",
    hue: 215,
    story: {
      problem: "Pengguna ingin bertanya dan dapat jawaban cepat.",
      solution: "Chatbot berbasis AI dengan Next.js dan TypeScript.",
      benefit: "Percakapan interaktif langsung di browser.",
    },
  },
  {
    slug: "ai-gratis",
    title: "AI Gratis",
    description: "Kumpulan alat AI gratis dalam satu tempat.",
    tags: ["JavaScript"],
    url: "https://github.com/ESTAS-crypto/AI-GRATIS",
    cta: "Lihat di GitHub",
    hue: 265,
    story: {
      problem: "Alat AI yang bagus sering berbayar.",
      solution: "Kumpulan alat AI gratis dalam satu tempat.",
      benefit: "Mudah dicoba tanpa biaya.",
    },
  },
  {
    slug: "manajemen-keuangan",
    title: "Manajemen Keuangan",
    description:
      "Sistem manajemen keuangan untuk mencatat dan memantau arus uang.",
    tags: ["PHP"],
    url: "https://github.com/ESTAS-crypto/ManajemenKeuangan",
    cta: "Lihat di GitHub",
    hue: 150,
    story: {
      problem:
        "Mencatat uang masuk dan keluar secara manual merepotkan.",
      solution: "Sistem manajemen keuangan berbasis PHP.",
      benefit: "Keuangan lebih tertata dan mudah dipantau.",
    },
  },
  {
    slug: "track-location",
    title: "Track Location",
    description: "Alat bantu Python untuk membaca dan melacak data lokasi.",
    tags: ["Python"],
    url: "https://github.com/ESTAS-crypto/track-location",
    cta: "Lihat di GitHub",
    hue: 185,
    story: {
      problem: "Butuh cara membaca data lokasi secara terprogram.",
      solution: "Alat bantu Python untuk melacak data lokasi.",
      benefit: "Data lokasi bisa diambil lewat skrip.",
    },
  },
  {
    slug: "sistem-laporan",
    title: "Sistem Laporan",
    description: "Sistem pengelolaan laporan berbasis JavaScript.",
    tags: ["JavaScript"],
    url: "https://github.com/ESTAS-crypto/Laporan-ibuk-",
    cta: "Lihat di GitHub",
    hue: 40,
    story: {
      problem: "Menyusun laporan secara manual memakan waktu.",
      solution: "Sistem pengelolaan laporan berbasis JavaScript.",
      benefit: "Laporan tersusun lebih rapi.",
    },
  },
];
