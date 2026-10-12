import { SocialLink, StatItem, DepthZone } from "@/types/project";

export const siteConfig = {
  name: "Evan Atharasya",
  title: "Evan Atharasya · Portofolio",
  description:
    "Full-stack developer dan student developer dari Indonesia yang membangun aplikasi web, bot otomasi, dan alat berbasis AI.",
  role: "Full-stack developer dari Indonesia yang membangun aplikasi web, bot, dan alat berbasis AI.",
  statement:
    "Saya Evan, full-stack developer dan student developer dari Indonesia. Saya membangun aplikasi web, bot otomasi, dan alat berbasis AI, dari toko online sampai sistem keuangan. Saya suka antarmuka yang nyaman dan kode yang rapi.",
  contactHeading: "Ayo bikin sesuatu bareng.",
  contactDescription:
    "Punya proyek, magang, atau ide kolaborasi? Kirim pesan, saya balas secepatnya.",
  email: "evanatharasya@gmail.com",
  kineticMarqueeText: "Membangun web, bot, dan alat AI — ",
  footerText: "Dibuat dengan secangkir kopi dan langit yang cerah.",
};

export const stats: StatItem[] = [
  { number: 47, label: "repositori di GitHub" },
  { number: 18, label: "teknologi yang dipakai" },
  { number: 3, label: "proyek utama" },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/ESTAS-crypto" },
  { label: "LinkedIn", url: "https://linkedin.com/in/evanatharasya" },
  { label: "Instagram", url: "https://instagram.com/evanatharasya" },
];

export const depthZones: DepthZone[] = [
  {
    key: "sky",
    title: "Di udara",
    description: "Angin dan awan menemanimu.",
    color: "#bfe6fb",
    matches: (v) => v > 5,
  },
  {
    key: "surf",
    title: "Permukaan laut",
    description: "Batas antara langit dan laut.",
    color: "#ffffff",
    matches: (v) => v > -5,
  },
  {
    key: "sun",
    title: "Zona cahaya",
    description: "Cahaya matahari masih menembus.",
    color: "#5fd0ff",
    matches: (v) => v > -200,
  },
  {
    key: "twi",
    title: "Zona senja",
    description: "Cahaya hampir habis di sini.",
    color: "#8f9bff",
    matches: () => true,
  },
];

export const navItems = [
  { id: "about", label: "Tentang" },
  { id: "work", label: "Proyek" },
  { id: "deep", label: "Jelajah" },
];

export const gaugeSections = [
  { id: "hero", label: "Langit" },
  { id: "about", label: "Tentang" },
  { id: "work", label: "Proyek" },
  { id: "deep", label: "Jelajah" },
  { id: "contact", label: "Kontak" },
];
