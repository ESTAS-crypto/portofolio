"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { siteConfig, stats } from "@/data/site";
import { skills } from "@/data/skills";

interface AboutProps {
  reducedMotion?: boolean;
}

export default function About({ reducedMotion = false }: AboutProps) {
  const aboutRef = useRef<HTMLElement>(null);
  const words = siteConfig.statement.trim().split(/\s+/);
  const reversedSkills = [...skills].reverse();

  useGSAP(
    () => {
      if (reducedMotion || !aboutRef.current) return;

      // Statement text word-by-word scroll-scrub
      gsap.fromTo(
        ".statement .w",
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: {
            trigger: "#st",
            start: "top 80%",
            end: "bottom 50%",
            scrub: true,
          },
        }
      );

      // Stats counter count-up
      const statBlocks = aboutRef.current.querySelectorAll<HTMLSpanElement>("#stats b");
      statBlocks.forEach((b) => {
        const target = Number(b.dataset.n) || 0;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: b,
            start: "top 85%",
            once: true,
          },
          onUpdate: () => {
            b.textContent = Math.round(obj.val).toString();
          },
        });
      });
    },
    { scope: aboutRef, dependencies: [reducedMotion] }
  );

  return (
    <section id="about" ref={aboutRef}>
      <p className="statement" id="st">
        {words.map((w, i) => (
          <span key={i} className="w">
            {w}{" "}
          </span>
        ))}
      </p>

      <div className="stats" id="stats">
        {stats.map((s, i) => (
          <div key={i}>
            <b data-n={s.number}>{reducedMotion ? s.number : 0}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="marq" aria-label="Teknologi yang saya pakai">
        <div className="row" id="r1">
          {skills.concat(skills).map((skill, i) => (
            <span key={i}>{skill}</span>
          ))}
        </div>
        <div className="row r" id="r2">
          {reversedSkills.concat(reversedSkills).map((skill, i) => (
            <span key={i}>{skill}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
