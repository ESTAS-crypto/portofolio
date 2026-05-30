const SITE_URL = 'https://portofolio-evan-atharasya.vercel.app';

export default function sitemap() {
  const now = new Date().toISOString();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}

