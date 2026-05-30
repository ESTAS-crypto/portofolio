import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { LanguageProvider } from '@/src/hooks/useLanguage';
import './globals.css';

/* ─── Self-hosted Google Fonts via next/font (no external requests) ─── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

/* ─── SEO Metadata (rendered server-side for Google) ─── */
export const metadata = {
  title: 'Evan Atharasya — Creative Developer',
  description:
    'Full-Stack Developer & UI/UX Designer crafting stunning digital experiences. Portfolio showcasing modern web development projects with React, Next.js, and more.',
  keywords: [
    'Evan Atharasya',
    'portfolio',
    'developer',
    'full-stack developer',
    'UI/UX designer',
    'React',
    'Next.js',
    'web developer',
    'frontend developer',
    'creative developer',
  ],
  authors: [{ name: 'Evan Atharasya', url: 'https://github.com/ESTAS-crypto' }],
  creator: 'Evan Atharasya',
  openGraph: {
    title: 'Evan Atharasya — Creative Developer',
    description:
      'Full-Stack Developer & UI/UX Designer crafting stunning digital experiences.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: 'Evan Atharasya Portfolio Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evan Atharasya — Creative Developer',
    description:
      'Full-Stack Developer & UI/UX Designer crafting stunning digital experiences.',
    images: ['/preview.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
