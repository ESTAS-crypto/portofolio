import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  authors: [{ name: siteConfig.name }],
  metadataBase: new URL("https://evan-atharasya.vercel.app"),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
    locale: "id_ID",
    url: "https://evan-atharasya.vercel.app",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  icons: {
    icon: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/icon-512.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "0t1JH8rP3YfI2uNtGqeH3MZ-cl3t2p0dcB92XKPkV4I",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b7fb3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${bricolageGrotesque.variable} ${figtree.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-site-verification" content="0t1JH8rP3YfI2uNtGqeH3MZ-cl3t2p0dcB92XKPkV4I" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          id="tod-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=new Date().getHours();var isNight=h>=19||h<5;document.documentElement.dataset.tod=isNight?'night':'day';}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
