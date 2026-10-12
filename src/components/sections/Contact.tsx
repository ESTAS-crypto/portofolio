"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { siteConfig, socialLinks } from "@/data/site";
import { showToast } from "@/components/layout/Toast";
import TreasureChest from "./TreasureChest";

interface ContactProps {
  reducedMotion?: boolean;
}

export default function Contact({ reducedMotion = false }: ContactProps) {
  const contactRef = useRef<HTMLElement>(null);
  const magBtnRef = useRef<HTMLAnchorElement>(null);
  const titleWords = siteConfig.contactHeading.trim().split(/\s+/);

  useGSAP(
    () => {
      if (reducedMotion || !contactRef.current) return;

      gsap.from("#ct .w", {
        yPercent: 110,
        opacity: 0,
        rotate: 4,
        stagger: 0.1,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: contactRef.current,
          start: "top 60%",
        },
      });

      gsap.from("p, .btn, .contact-social-links", {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        delay: 0.4,
        scrollTrigger: {
          trigger: contactRef.current,
          start: "top 60%",
        },
      });
    },
    { scope: contactRef, dependencies: [reducedMotion] }
  );

  useEffect(() => {
    const mag = magBtnRef.current;
    if (!mag || reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const r = mag.getBoundingClientRect();
      gsap.to(mag, {
        x: (e.clientX - r.left - r.width / 2) * 0.35,
        y: (e.clientY - r.top - r.height / 2) * 0.5,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(mag, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.4)",
      });
    };

    mag.addEventListener("mousemove", handleMouseMove);
    mag.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      mag.removeEventListener("mousemove", handleMouseMove);
      mag.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [reducedMotion]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      showToast("Email disalin");
    } catch {
      showToast(`Salin manual: ${siteConfig.email}`);
    }
  };

  return (
    <section id="contact" ref={contactRef}>
      <TreasureChest reducedMotion={reducedMotion} />
      <h2 id="ct">
        {titleWords.map((word, i) => (
          <span key={i}>
            <span className="w">{word}</span>
            {i < titleWords.length - 1 ? " " : ""}
          </span>
        ))}
      </h2>
      <p>{siteConfig.contactDescription}</p>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
        <a
          ref={magBtnRef}
          className="btn mag"
          href={`mailto:${siteConfig.email}`}
        >
          {siteConfig.email}
        </a>
        <button
          className="btn"
          id="cpy"
          type="button"
          style={{
            border: 0,
            cursor: "pointer",
            background: "rgba(255, 255, 255, 0.16)",
            color: "#fff",
          }}
          onClick={handleCopyEmail}
        >
          Salin email
        </button>
      </div>

      <div className="contact-social-links">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
