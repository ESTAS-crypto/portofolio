import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "@/data/projects";

type Props = {
  params: Promise<{ slug: string }>;
};

function resolveProject(slug: string) {
  const normalized = slug === "ai-chatbot-nextjs" ? "nextjs-ai-chatbot" : slug;
  return projects.find((p) => p.slug === normalized);
}

export function generateStaticParams() {
  const base = projects.map((p) => ({ slug: p.slug }));
  return [...base, { slug: "ai-chatbot-nextjs" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = resolveProject(slug);

  if (!project) {
    return {
      title: "Proyek Tidak Ditemukan — Evan Atharasya",
    };
  }

  const title = `${project.title} — Evan Atharasya`;
  const desc = project.description;
  const url = `https://www.estas.my.id/proyek/${project.slug}`;
  const ogImage = `/projects/${project.slug}/cover.png`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: "Evan Atharasya",
      locale: "id_ID",
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 750,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = resolveProject(slug);

  if (!project) {
    notFound();
  }

  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const prevProject =
    projects[(currentIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    author: {
      "@type": "Person",
      name: "Evan Atharasya",
      url: "https://www.estas.my.id",
    },
    url: `https://www.estas.my.id/proyek/${project.slug}`,
    image: `https://www.estas.my.id/projects/${project.slug}/cover.png`,
  };

  return (
    <main
      className="prj-page"
      style={
        {
          "--hh": project.hue,
        } as React.CSSProperties
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="prj-glow" aria-hidden="true" />

      <div className="prj-container">
        {/* Navigation / Breadcrumb */}
        <nav className="prj-nav" aria-label="Breadcrumb">
          <Link href="/#work" className="prj-back-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Laut
          </Link>
          <div className="prj-crumbs">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <Link href="/#work">Proyek</Link>
            <span>/</span>
            <span className="cur">{project.title}</span>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="prj-header">
          <div className="prj-tags">
            {project.tags.map((tag) => (
              <span key={tag} className="prj-tag">
                {tag}
              </span>
            ))}
            {project.priv && <span className="prj-tag priv">Proyek Privat</span>}
          </div>
          <h1 className="prj-title">{project.title}</h1>
          <p className="prj-lead">{project.description}</p>
        </header>

        {/* 16:10 Browser Window Frame */}
        <section className="prj-frame-box" aria-label="Screenshot Proyek">
          <div className="prj-browser-frame">
            <div className="prj-browser-bar">
              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />
              <span className="prj-address">
                https://estas.my.id/proyek/{project.slug}
              </span>
            </div>
            <div className="prj-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/projects/${project.slug}/cover.png`}
                alt={`Screenshot ${project.title}`}
                className="prj-img"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* Story Section: Masalah, Solusi, Manfaat */}
        <section className="prj-story-grid" aria-label="Cerita Proyek">
          <article className="prj-story-card">
            <div className="prj-story-icon icon-prob">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2>Masalah</h2>
            <p>{project.story.problem}</p>
          </article>

          <article className="prj-story-card">
            <div className="prj-story-icon icon-sol">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h2>Solusi</h2>
            <p>{project.story.solution}</p>
          </article>

          <article className="prj-story-card">
            <div className="prj-story-icon icon-ben">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>Manfaat</h2>
            <p>{project.story.benefit}</p>
          </article>
        </section>

        {/* Action Button */}
        <div className="prj-cta-box">
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="prj-main-cta"
            >
              <span>{project.cta || "Kunjungi Proyek"}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : (
            <span className="prj-priv-badge">
              Proyek Internal Puskesmas (Kader & Petugas)
            </span>
          )}
        </div>

        {/* Next / Previous Project Carousel Navigation */}
        <footer className="prj-footer-nav" aria-label="Navigasi Proyek Lainnya">
          <Link
            href={`/proyek/${prevProject.slug}`}
            className="prj-prev-next prev"
          >
            <span className="lbl">← Proyek Sebelumnya</span>
            <span className="nm">{prevProject.title}</span>
          </Link>
          <Link
            href={`/proyek/${nextProject.slug}`}
            className="prj-prev-next next"
          >
            <span className="lbl">Proyek Berikutnya →</span>
            <span className="nm">{nextProject.title}</span>
          </Link>
        </footer>
      </div>
    </main>
  );
}
