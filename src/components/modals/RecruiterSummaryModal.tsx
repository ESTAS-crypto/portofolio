"use client";

import { useEffect, useRef, useState } from "react";
import { oceanStore } from "@/lib/oceanStore";
import { siteConfig } from "@/data/site";

interface RecruiterSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  openerElement?: HTMLElement | null;
}

const FEATURED = [
  { name: "LUVENCE ID", tech: "React · Three.js · Supabase", url: "https://luvence-id.vercel.app/" },
  { name: "VendTrack", tech: "Next.js · TypeScript · Supabase", url: "https://vend-finder.vercel.app/" },
  { name: "Laporan Kunjungan Rumah", tech: "Flutter · Supabase · proyek privat", url: null },
];

const SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PHP",
  "Python",
  "Flutter",
  "Supabase",
  "Tailwind",
];

export default function RecruiterSummaryModal({
  isOpen,
  onClose,
  openerElement,
}: RecruiterSummaryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [ghPublicRepos, setGhPublicRepos] = useState<number | null>(null);

  // Fetch live public activity (F22)
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    fetch("https://api.github.com/users/ESTAS-crypto")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && typeof data.public_repos === "number") {
          setGhPublicRepos(data.public_repos);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const el = dialogRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.classList.add("on");
      closeBtnRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      openerElement?.focus?.();
    };
  }, [isOpen, onClose, openerElement]);

  const handleDownloadCV = async () => {
    oceanStore.toast("Mengunduh CV...", { p: 0 });
    try {
      const check = await fetch("/cv/Evan-Atharasya-CV.pdf", { method: "HEAD" });
      if (check.ok) {
        const a = document.createElement("a");
        a.href = "/cv/Evan-Atharasya-CV.pdf";
        a.download = "Evan-Atharasya-CV.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
    } catch (_) {}

    try {
      const { makePDF } = await import("@/lib/cv/makePdf");
      const { bytes } = makePDF();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Evan-Atharasya-CV.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (_) {
      oceanStore.toast("Unduhan tidak tersedia di tampilan ini", { p: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      id="sumOv"
      className="ovl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sumT"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="ovp" data-lenis-prevent tabIndex={-1}>
        <div className="ovh" style={{ "--i": 0 } as React.CSSProperties}>
          <div>
            <h2 id="sumT">{siteConfig.name}</h2>
            <p>
              Full-stack developer dari Indonesia. Membangun aplikasi web, bot, dan alat berbasis AI.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            className="ovx"
            type="button"
            aria-label="Tutup ringkasan"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <h3 style={{ "--i": 1 } as React.CSSProperties}>Proyek Unggulan</h3>
        <ul className="sl">
          {FEATURED.map((item, idx) => (
            <li key={item.name} style={{ "--i": idx + 2 } as React.CSSProperties}>
              <div>
                <b>{item.name}</b>
                <span>{item.tech}</span>
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Buka
                </a>
              )}
            </li>
          ))}
        </ul>

        <h3 style={{ "--i": 5 } as React.CSSProperties}>Keahlian Utama</h3>
        <div className="sc">
          {SKILLS.map((skill, idx) => (
            <i key={skill} style={{ "--i": idx + 6 } as React.CSSProperties}>
              {skill}
            </i>
          ))}
        </div>

        <div className="act" style={{ "--i": 16 } as React.CSSProperties}>
          <a href={`mailto:${siteConfig.email}`}>Email</a>
          <a href="https://github.com/ESTAS-crypto" target="_blank" rel="noopener noreferrer">
            GitHub{ghPublicRepos != null ? ` (${ghPublicRepos} repos)` : ""}
          </a>
          <a
            href="https://www.linkedin.com/in/evanatharasya"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <button type="button" id="cvBtn" onClick={handleDownloadCV}>
            Unduh CV (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
