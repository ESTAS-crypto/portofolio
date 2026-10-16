"use client";

import { useEffect, useRef, useState } from "react";
import { oceanStore } from "@/lib/oceanStore";
import { siteConfig } from "@/data/site";
import { projects } from "@/data/projects";

interface RecruiterSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  openerElement?: HTMLElement | null;
}

const CVT: [string, number, number, number][] = [
  ["Evan Atharasya", 22, 1, 0],
  ["Full-stack developer | Indonesia", 11, 0, 2],
  ["evanatharasya@gmail.com | github.com/ESTAS-crypto | linkedin.com/in/evanatharasya", 9, 0, 4],
  ["Portofolio: portofolio-evan-atharasya.vercel.app", 9, 0, 1],
  ["RINGKASAN", 10, 1, 18],
  [
    "Full-stack developer dari Indonesia yang membangun aplikasi web, bot, dan alat berbasis AI. Menyukai antarmuka yang nyaman dan kode yang rapi.",
    10,
    0,
    4,
  ],
  ["PROYEK UNGGULAN", 10, 1, 16],
  ["LUVENCE ID - React, Three.js, Supabase", 10.5, 1, 6],
  ["luvence-id.vercel.app", 9, 0, 1],
  ["VendTrack - Next.js, TypeScript, Supabase", 10.5, 1, 6],
  ["vend-finder.vercel.app", 9, 0, 1],
  ["Laporan Kunjungan Rumah - Flutter, Supabase (proyek privat)", 10.5, 1, 6],
  ["PROYEK LAINNYA", 10, 1, 16],
  ["Tryout SNBT - JavaScript", 10, 0, 4],
  ["GenZMart PRO - PHP", 10, 0, 3],
  ["AI Chatbot Next.js - TypeScript, Next.js", 10, 0, 3],
  ["AI Gratis - JavaScript", 10, 0, 3],
  ["Manajemen Keuangan - PHP", 10, 0, 3],
  ["Track Location - Python", 10, 0, 3],
  ["Sistem Laporan - JavaScript", 10, 0, 3],
  ["KEAHLIAN", 10, 1, 16],
  [
    "JavaScript, TypeScript, PHP, Python, React, Next.js, Node.js, Laravel, Flutter, Three.js, Tailwind, Bootstrap, MySQL, MongoDB, Firebase, Supabase, Docker, Git",
    10,
    0,
    4,
  ],
  ["KONTAK", 10, 1, 16],
  ["Email: evanatharasya@gmail.com", 10, 0, 4],
  ["GitHub: github.com/ESTAS-crypto", 10, 0, 3],
  ["LinkedIn: linkedin.com/in/evanatharasya", 10, 0, 3],
];

export function makePDF(): Uint8Array {
  const PW = 595;
  const PH = 842;
  const M = 56;
  const mw = PW - 2 * M;
  const pages: string[][] = [[]];
  const esc = (t: string) =>
    t
      .replace(/[^\x20-\x7e]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  let y = PH - M;

  for (const it of CVT) {
    const t = it[0];
    const sz = it[1];
    const bold = it[2] === 1;
    const lh = sz * 1.4;
    const cpl = Math.floor(mw / (sz * 0.54));
    y -= it[3];
    const rows: string[] = [];
    let line = "";
    for (const w of t.split(" ")) {
      if (line && (line + " " + w).length > cpl) {
        rows.push(line);
        line = w;
      } else {
        line = line ? line + " " + w : w;
      }
    }
    if (line) rows.push(line);

    for (const r of rows) {
      if (y - lh < M) {
        pages.push([]);
        y = PH - M;
      }
      pages[pages.length - 1].push(
        "BT /F" + (bold ? 2 : 1) + " " + sz + " Tf " + M + " " + (y - sz).toFixed(1) + " Td (" + esc(r) + ") Tj ET"
      );
      y -= lh;
    }
  }

  const objs: string[] = [];
  const add = (o: string) => objs.push(o);
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  add("<< /Title (CV Evan Atharasya) /Author (Evan Atharasya) >>");

  const kids: string[] = [];
  for (const pg of pages) {
    const body = pg.join("\n");
    add("<< /Length " + body.length + " >>\nstream\n" + body + "\nendstream");
    const c = objs.length;
    add(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
        PW +
        " " +
        PH +
        "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " +
        c +
        " 0 R >>"
    );
    kids.push(objs.length + " 0 R");
  }
  objs[1] = "<< /Type /Pages /Count " + kids.length + " /Kids [" + kids.join(" ") + "] >>";

  let out = "%PDF-1.4\n";
  const off: number[] = [];
  objs.forEach((o, i) => {
    off.push(out.length);
    out += i + 1 + " 0 obj\n" + o + "\nendobj\n";
  });
  const x = out.length;
  out +=
    "xref\n0 " +
    (objs.length + 1) +
    "\n0000000000 65535 f \n" +
    off.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("") +
    "trailer\n<< /Size " +
    (objs.length + 1) +
    " /Root 1 0 R /Info 5 0 R >>\nstartxref\n" +
    x +
    "\n%%EOF\n";
  return new TextEncoder().encode(out);
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
      const bytes = makePDF();
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
      oceanStore.toast("Gagal mengunduh CV", { p: 0 });
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

        {/* Print template for window.print() */}
        <div className="cvprint">
          <h3>Semua Proyek</h3>
          <ul>
            {projects.map((p) => (
              <li key={p.title}>
                <b>{p.title}</b> — {p.tags.join(", ")}
              </li>
            ))}
          </ul>
          <p>
            {siteConfig.email} · github.com/ESTAS-crypto · linkedin.com/in/evanatharasya
          </p>
        </div>
      </div>
    </div>
  );
}
