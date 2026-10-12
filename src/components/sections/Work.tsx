"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { projects } from "@/data/projects";
import { useLenis } from "@/hooks/useLenis";
import { useActiveSkill } from "@/hooks/useOceanStore";
import { audioEngine } from "@/lib/audioEngine";

interface WorkProps {
  onOpenProject: (index: number, triggerElement: HTMLElement) => void;
  reducedMotion?: boolean;
}

export default function Work({ onOpenProject, reducedMotion = false }: WorkProps) {
  const workRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const { lenis } = useLenis();
  const [activeSkill] = useActiveSkill();

  const skillKey = activeSkill.toLowerCase();
  const hasMatches = !!activeSkill && projects.some((p) => p.tags.some((t) => t.toLowerCase() === skillKey));

  useGSAP(
    () => {
      if (reducedMotion || !workRef.current || !trackRef.current) return;

      const track = trackRef.current;
      const bar = barRef.current;
      const dist = () => track.scrollWidth - window.innerWidth;

      const hz = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: workRef.current,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            if (bar) bar.style.transform = `scaleX(${s.progress})`;
          },
        },
      });

      const cards = track.querySelectorAll<HTMLAnchorElement>(".card");
      cards.forEach((c, i) => {
        gsap.fromTo(
          c,
          { rotate: i % 2 ? -6 : 6, y: 60, scale: 0.9 },
          {
            rotate: 0,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: c,
              containerAnimation: hz,
              start: "left 98%",
              end: "left 55%",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: workRef, dependencies: [reducedMotion] }
  );

  useEffect(() => {
    if (reducedMotion || !trackRef.current) return;

    const cards = trackRef.current.querySelectorAll<HTMLAnchorElement>(".card");

    // 3D Tilt on hover (fine pointer)
    const handlers: { card: HTMLAnchorElement; move: (e: MouseEvent) => void; leave: () => void }[] = [];

    if (window.matchMedia("(pointer: fine)").matches) {
      cards.forEach((c) => {
        const move = (e: MouseEvent) => {
          const r = c.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(c, {
            rotationY: x * 10,
            rotationX: -y * 10,
            transformPerspective: 900,
            duration: 0.4,
            overwrite: "auto",
          });
        };

        const leave = () => {
          gsap.to(c, { rotationY: 0, rotationX: 0, duration: 0.6 });
        };

        c.addEventListener("mousemove", move);
        c.addEventListener("mouseleave", leave);
        handlers.push({ card: c, move, leave });
      });
    }

    // Velocity skewX with Lenis
    let skewDisposer: (() => void) | null = null;
    if (lenis) {
      const sk = Array.from(cards).map((c) => gsap.quickTo(c, "skewX", { duration: 0.6, ease: "power3" }));
      const onScroll = ({ velocity }: { velocity: number }) => {
        const s = Math.max(-8, Math.min(8, velocity * -0.6));
        sk.forEach((q) => q(s));
      };
      lenis.on("scroll", onScroll);
      skewDisposer = () => lenis.off("scroll", onScroll);
    }

    return () => {
      handlers.forEach(({ card, move, leave }) => {
        card.removeEventListener("mousemove", move);
        card.removeEventListener("mouseleave", leave);
      });
      skewDisposer?.();
    };
  }, [lenis, reducedMotion]);

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    audioEngine.sweepCard();
    onOpenProject(index, e.currentTarget as HTMLElement);
  };

  return (
    <section id="work" ref={workRef} aria-label="Proyek pilihan">
      <div className="track" id="track" ref={trackRef}>
        <div className="intro">
          <h2>Proyek pilihan</h2>
          <p>Terus gulir ke bawah, halaman akan bergeser ke samping.</p>
        </div>

        {projects.map((p, i) => {
          const isHit = !!activeSkill && p.tags.some((t) => t.toLowerCase() === skillKey);
          const isDim = !!activeSkill && hasMatches && !isHit;
          const cardClass = `card ${isHit ? "hit" : ""} ${isDim ? "dim" : ""}`.trim();

          return (
            <a
              key={p.slug}
              className={cardClass}
              href={p.url || "#"}
              onClick={(e) => handleCardClick(e, i)}
            >
              <div
                className="pv"
                style={{ "--h": p.hue } as React.CSSProperties}
              >
                <i />
                <i />
                <i />
                <b />
                <b />
                <b />
              </div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="tags">
                {p.tags.map((tag, tIdx) => (
                  <i key={tIdx}>{tag}</i>
                ))}
              </div>
            </a>
          );
        })}
      </div>

      <div className="wbar">
        <i ref={barRef} />
      </div>
    </section>
  );
}
