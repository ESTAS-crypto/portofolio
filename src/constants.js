/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO CONSTANTS
   Centralized config — edit here to update everywhere.
   ═══════════════════════════════════════════════════════════════ */

/** GitHub username used for API fetching & profile link */
export const GITHUB_USERNAME = 'ESTAS-crypto';

/** Personal info */
export const PROFILE = {
  firstName: 'Evan',
  lastName: 'Atharasya',
  fullName: 'Evan Atharasya',
  initials: 'EA',
  tagline: 'Full-Stack Developer & UI/UX Designer',
  bio: "I'm a creative developer who blends design with code. Building modern web experiences that are fast, accessible, and visually stunning.",
};

/** Typing animation roles in Hero */
export const HERO_ROLES = [
  'Full-Stack Developer',
  'UI/UX Designer',
  'Creative Coder',
  'Problem Solver',
];

/** Social links — used in Navbar & Contact */
export const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    url: `https://github.com/${GITHUB_USERNAME}`,
    label: `@${GITHUB_USERNAME}`,
    color: '#f0f0f5',
    hoverColor: '#c084fc',
    hoverBg: 'rgba(240,240,245,0.08)',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/evanatharasya.x',
    label: '@evanatharasya.x',
    color: '#f0f0f5',
    hoverColor: '#e1306c',
    hoverBg: 'rgba(225,48,108,0.08)',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/evan-atharasya-64b1621b7/',
    label: 'Evan Atharasya',
    color: '#f0f0f5',
    hoverColor: '#0a66c2',
    hoverBg: 'rgba(10,102,194,0.08)',
  },
];

/** Skills data for About bento card */
export const SKILLS = [
  { name: 'React', level: 92, color: '#61dafb', icon: '⚛️' },
  { name: 'JavaScript', level: 95, color: '#f7df1e', icon: '⚡' },
  { name: 'Python', level: 82, color: '#3572A5', icon: '🐍' },
  { name: 'Node.js', level: 85, color: '#68a063', icon: '🟢' },
  { name: 'TypeScript', level: 78, color: '#3178c6', icon: '🔷' },
  { name: 'Figma', level: 75, color: '#f24e1e', icon: '🎨' },
];

/** Tech stack for the marquee section */
export const TECH_STACK = [
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'JavaScript', color: '#f7df1e' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Python', color: '#3776ab' },
  { name: 'Tailwind', color: '#38bdf8' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'MongoDB', color: '#47a248' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'AWS', color: '#ff9900' },
  { name: 'Figma', color: '#f24e1e' },
  { name: 'GraphQL', color: '#e10098' },
  { name: 'Redis', color: '#dc382d' },
  { name: 'Git', color: '#f05032' },
  { name: 'Firebase', color: '#ffca28' },
];

/** Experience timeline data */
export const EXPERIENCES = [
  {
    year: '2024 — Present',
    role: 'Senior Full-Stack Developer',
    company: 'Tech Innovators Inc.',
    description: 'Leading development of AI-powered SaaS products. Building scalable architectures serving 100K+ users with 99.9% uptime.',
    tech: ['React', 'Node.js', 'AWS', 'Python'],
    color: '#8b5cf6',
    icon: '🚀',
    highlights: ['Led team of 5 engineers', 'Reduced load time by 60%', 'Architected microservices'],
  },
  {
    year: '2023 — 2024',
    role: 'Frontend Developer',
    company: 'Digital Agency Co.',
    description: 'Crafted award-winning web experiences for Fortune 500 clients. Implemented complex animations and micro-interactions.',
    tech: ['Next.js', 'Framer Motion', 'TypeScript'],
    color: '#06b6d4',
    icon: '✨',
    highlights: ['10+ client projects delivered', 'Awwwards Honorable Mention', '45% engagement increase'],
  },
  {
    year: '2022 — 2023',
    role: 'UI/UX Designer & Developer',
    company: 'StartupHub',
    description: 'Designed and developed user interfaces for 10+ startup products. Bridged design and engineering.',
    tech: ['Figma', 'React', 'Tailwind CSS'],
    color: '#ec4899',
    icon: '🎨',
    highlights: ['Designed 10+ products', 'Created design system', 'User research & testing'],
  },
  {
    year: '2021 — 2022',
    role: 'Junior Developer',
    company: 'WebCraft Studios',
    description: 'Built responsive websites and web applications. Learned modern frameworks and best practices in agile teams.',
    tech: ['HTML/CSS', 'JavaScript', 'Vue.js'],
    color: '#10b981',
    icon: '🌱',
    highlights: ['20+ websites built', 'Learned agile workflow', 'First open source PR'],
  },
];

/** Navigation items */
export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10' },
  { id: 'about', label: 'About', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'projects', label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { id: 'skills', label: 'Skills', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'experience', label: 'Experience', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

/** Language metadata for project cards */
export const LANG_META = {
  JavaScript: { color: '#f7df1e', icon: '⚡' },
  TypeScript: { color: '#3178c6', icon: '🔷' },
  Python: { color: '#3572A5', icon: '🐍' },
  HTML: { color: '#e34c26', icon: '🌐' },
  CSS: { color: '#563d7c', icon: '🎨' },
  PHP: { color: '#777BB4', icon: '🐘' },
  Java: { color: '#b07219', icon: '☕' },
  Dart: { color: '#00B4AB', icon: '🎯' },
  Lua: { color: '#000080', icon: '🌙' },
  default: { color: '#8b5cf6', icon: '📦' },
};

/**
 * Manual projects for private repos or non-GitHub projects.
 * These will be merged with GitHub repos and shown in the Featured Work section.
 * 
 * Fields:
 *   name        - Project name (required)
 *   description - Short description
 *   language    - Primary language (matches LANG_META keys)
 *   homepage    - Live URL (only accessible link for private repos)
 *   html_url    - GitHub repo URL (leave null for private repos)
 *   isPrivate   - true = show "Private" badge, hide "Code" button
 *   pushed_at   - Last update date (ISO string) — used for sorting & "updated X ago"
 *   created_at  - First publish date (ISO string) — shown as "Published X ago"
 *   size        - Repo size in KB (for display)
 */
export const MANUAL_PROJECTS = [
  {
    name: 'Luvence.id',
    description: 'Website parfum premium dengan desain modern dan elegan.',
    language: 'JavaScript',
    homepage: 'https://luvence-id.vercel.app/',
    html_url: null,
    isPrivate: true,
    created_at: '2026-03-04T00:00:00Z',   // First published
    pushed_at: '2026-05-27T00:00:00Z',     // Last updated
    size: 150000,
  },];
