import { CvContactItem, CvSkillGroup, CvStatItem, CvMeta } from "./types";

export const CV_COLORS = {
  NAVY: "#0A2A4A",
  INK: "#0B2239",
  GRAY: "#334155",
  MUTE: "#64748B",
  SEA: "#1B7FB3",
  SEAD: "#0F5F8A",
  GOLD: "#FFD9A0",
  GOLD2: "#E8A94B",
  LINE: "#D6E4EE",
  CARD: "#F4F8FB",
  SKY: "#9FD3F0",
  WHITE: "#FFFFFF",
} as const;

export const CV_CONTACTS: CvContactItem[] = [
  {
    type: "EMAIL",
    display: "evanatharasya@gmail.com",
    url: "mailto:evanatharasya@gmail.com",
  },
  {
    type: "GITHUB",
    display: "github.com/ESTAS-crypto",
    url: "https://github.com/ESTAS-crypto",
  },
  {
    type: "LINKEDIN",
    display: "linkedin.com/in/evanatharasya",
    url: "https://www.linkedin.com/in/evanatharasya",
  },
  {
    type: "INSTAGRAM",
    display: "@evanatharasya.x",
    url: "https://www.instagram.com/evanatharasya.x",
  },
  {
    type: "PORTOFOLIO",
    display: "portofolio-evan-atharasya.vercel.app",
    url: "https://portofolio-evan-atharasya.vercel.app/",
  },
];

export const CV_SKILL_GROUPS: CvSkillGroup[] = [
  {
    category: "BAHASA",
    skills: ["JavaScript", "TypeScript", "PHP", "Python"],
  },
  {
    category: "FRONTEND & MOBILE",
    skills: ["React", "Next.js", "Three.js", "Tailwind", "Bootstrap", "Flutter"],
  },
  {
    category: "BACKEND & DATA",
    skills: ["Node.js", "Laravel", "MySQL", "MongoDB", "Firebase", "Supabase"],
  },
  {
    category: "ALAT",
    skills: ["Docker", "Git"],
  },
];

export const CV_STATS: CvStatItem[] = [
  { value: "47", label: "repositori di GitHub" },
  { value: "18", label: "teknologi yang dipakai" },
  { value: "3", label: "proyek utama" },
];

export const CV_SIDEBAR_QUOTES = {
  quote1: "Dari langit sampai dasar laut.",
  quote2: "Selami portofolio interaktifnya.",
  quote2Url: "https://portofolio-evan-atharasya.vercel.app/",
};

export const CV_LANGUAGE_DOT_COLORS: Record<string, string> = {
  JavaScript: "#E8C547",
  PHP: "#7A86B8",
  TypeScript: "#3B82C4",
  Python: "#3B7DA8",
};

export const CV_FEATURED_ACCENTS = [
  CV_COLORS.GOLD2,
  "#3B82C4",
  "#1FA08A",
];

export const CV_OTHER_PROJECT_OVERRIDES: Record<
  string,
  {
    tech?: string;
    dotColor?: string;
    description?: string;
  }
> = {
  "tryout-snbt": {
    tech: "JavaScript",
    dotColor: "#E8C547",
    description: "Simulasi ujian SNBT dengan 340+ soal latihan.",
  },
  "genzmart-pro": {
    tech: "PHP",
    dotColor: "#7A86B8",
    description: "E-commerce untuk marketplace anak muda.",
  },
  "nextjs-ai-chatbot": {
    tech: "TypeScript, Next.js",
    dotColor: "#3B82C4",
    description: "Chatbot berbasis AI dengan Next.js.",
  },
  "ai-gratis": {
    tech: "JavaScript",
    dotColor: "#E8C547",
    description: "Kumpulan alat AI gratis dalam satu tempat.",
  },
  "manajemen-keuangan": {
    tech: "PHP",
    dotColor: "#7A86B8",
    description: "Mencatat dan memantau arus uang.",
  },
  "track-location": {
    tech: "Python",
    dotColor: "#3B7DA8",
    description: "Alat Python untuk melacak data lokasi.",
  },
  "sistem-laporan": {
    tech: "JavaScript",
    dotColor: "#E8C547",
    description: "Pengelolaan laporan berbasis JavaScript.",
  },
};

export const CV_FOOTER = {
  note: "Daftar lengkap dan demo interaktif:",
  displayUrl: "portofolio-evan-atharasya.vercel.app",
  url: "https://portofolio-evan-atharasya.vercel.app/",
};

export const CV_MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const CV_DEFAULT_META: CvMeta = {
  title: "CV Evan Atharasya - Full-stack Developer",
  author: "Evan Atharasya",
  subject: "Curriculum vitae",
  keywords: "full-stack, React, Next.js, Flutter, Supabase",
  lang: "id-ID",
};
