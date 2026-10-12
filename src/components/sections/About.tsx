"use client";

import { useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { siteConfig, stats } from "@/data/site";
import { skills } from "@/data/skills";
import { projects } from "@/data/projects";
import { useActiveSkill } from "@/hooks/useOceanStore";
import { oceanStore } from "@/lib/oceanStore";

interface AboutProps {
  reducedMotion?: boolean;
}

export default function About({ reducedMotion = false }: AboutProps) {
  const aboutRef = useRef<HTMLElement>(null);
  const words = siteConfig.statement.trim().split(/\s+/);
  const reversedSkills = [...skills].reverse();
  const [activeSkill, setActiveSkill] = useActiveSkill();

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

  const handleSkillClick = useCallback(
    (skill: string) => {
      const nextSkill = activeSkill === skill ? "" : skill;
      setActiveSkill(nextSkill);

      if (nextSkill) {
        const key = nextSkill.toLowerCase();
        const count = projects.filter((p) =>
          p.tags.some((t) => t.toLowerCase() === key)
        ).length;

        if (count > 0) {
          oceanStore.showToast(
            `${count} proyek memakai ${nextSkill}. Lihat di Proyek dan Jelajah.`
          );
        } else {
          oceanStore.showToast(`Belum ada proyek publik dengan ${nextSkill}.`);
        }
      } else {
        oceanStore.showToast("Filter dibersihkan");
      }
    },
    [activeSkill, setActiveSkill]
  );

  const handleKeyDown = (e: React.KeyboardEvent, skill: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSkillClick(skill);
    }
  };

  return (
    <section id="about" ref={aboutRef}>
      <p className="statement" id="st">
        {words.map((w, i) => (
          <span key={i}>
            <span className="w">{w}</span>
            {i < words.length - 1 ? " " : ""}
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

      <p className="mhint">Klik sebuah teknologi untuk melihat proyek yang memakainya.</p>

      <div className="marq" aria-label="Teknologi yang saya pakai">
        <div className="row" id="r1">
          {skills.concat(skills).map((skill, i) => {
            const isSelected = activeSkill.toLowerCase() === skill.toLowerCase();
            return (
              <span
                key={i}
                className={isSelected ? "on" : ""}
                role="button"
                tabIndex={0}
                aria-label={`Lihat proyek yang memakai ${skill}`}
                onClick={() => handleSkillClick(skill)}
                onKeyDown={(e) => handleKeyDown(e, skill)}
              >
                {skill}
              </span>
            );
          })}
        </div>

        <div className="row r" id="r2">
          {reversedSkills.concat(reversedSkills).map((skill, i) => {
            const isSelected = activeSkill.toLowerCase() === skill.toLowerCase();
            return (
              <span
                key={i}
                className={isSelected ? "on" : ""}
                role="button"
                tabIndex={0}
                aria-label={`Lihat proyek yang memakai ${skill}`}
                onClick={() => handleSkillClick(skill)}
                onKeyDown={(e) => handleKeyDown(e, skill)}
              >
                {skill}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
