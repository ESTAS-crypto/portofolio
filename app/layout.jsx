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

/* ─── Site Configuration ─── */
const SITE_URL = 'https://portofolio-evan-atharasya.vercel.app';
const SITE_NAME = 'Evan Atharasya';
const SITE_TITLE = 'Evan Atharasya — Creative Developer & UI/UX Designer';
const SITE_DESCRIPTION =
  'Portfolio of Evan Atharasya — Full-Stack Developer & UI/UX Designer. Crafting stunning, modern web experiences with React, Next.js, JavaScript, and more. Available for freelance and collaboration.';
const SITE_DESCRIPTION_ID =
  'Portofolio Evan Atharasya — Developer Full-Stack & Desainer UI/UX. Membuat pengalaman web modern yang memukau dengan React, Next.js, JavaScript, dan lainnya. Tersedia untuk freelance dan kolaborasi.';

/* ─── SEO Metadata (rendered server-side for Google) ─── */
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // English keywords
    'Evan Atharasya',
    'portfolio',
    'developer',
    'full-stack developer',
    'UI/UX designer',
    'React developer',
    'Next.js developer',
    'web developer',
    'frontend developer',
    'creative developer',
    'JavaScript developer',
    'freelance developer',
    // Indonesian keywords
    'portofolio',
    'developer Indonesia',
    'developer full-stack',
    'desainer UI/UX',
    'pembuat website',
    'jasa pembuatan website',
    'web developer Indonesia',
  ],
  authors: [{ name: SITE_NAME, url: `${SITE_URL}` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en': SITE_URL,
      'id': SITE_URL,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    alternateLocale: ['id_ID'],
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Creative Developer Portfolio`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/preview.png'],
    creator: '@evanatharasya',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here after registering:
    // google: 'your-google-verification-code',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  other: {
    'google-site-verification': 'google906c57050ca11120',
  },
};

export const viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
};

/* ─── JSON-LD Structured Data for Google Rich Results ─── */
function JsonLd() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Evan Atharasya',
    url: SITE_URL,
    image: `${SITE_URL}/favicon.png`,
    jobTitle: 'Full-Stack Developer & UI/UX Designer',
    description: SITE_DESCRIPTION,
    sameAs: [
      'https://github.com/ESTAS-crypto',
      'https://instagram.com/evanatharasya.x',
      'https://www.linkedin.com/in/evan-atharasya-64b1621b7/',
    ],
    knowsAbout: [
      'React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js',
      'Python', 'UI/UX Design', 'Web Development', 'Full-Stack Development',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    author: {
      '@type': 'Person',
      name: 'Evan Atharasya',
    },
    inLanguage: ['en', 'id'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
