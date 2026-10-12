"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { projects } from "@/data/projects";
import Seaweed from "@/components/fx/Seaweed";
import { useActiveSkill } from "@/hooks/useOceanStore";
import { audioEngine } from "@/lib/audioEngine";

interface DeepProps {
  onOpenProject: (index: number, triggerElement: HTMLElement) => void;
  reducedMotion?: boolean;
}

interface SchoolFishItem {
  left: number;
  top: number;
  width: number;
  layer: 0 | 2;
}

export default function Deep({ onOpenProject, reducedMotion = false }: DeepProps) {
  const deepRef = useRef<HTMLElement>(null);
  const l0Ref = useRef<HTMLDivElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Ref = useRef<HTMLDivElement>(null);
  const [activeSkill] = useActiveSkill();

  const skillKey = activeSkill.toLowerCase();
  const hasMatches = !!activeSkill && projects.some((p) => p.tags.some((t) => t.toLowerCase() === skillKey));

  // Deterministic helper for SSR-safe layout coordinates
  const schoolFish = useMemo<SchoolFishItem[]>(() => {
    const items: SchoolFishItem[] = [];
    for (let i = 0; i < 26; i++) {
      items.push({
        left: ((i * 13 + 5) % 92),
        top: 12 + ((i * 11 + 7) % 65),
        width: 20 + ((i * 7 + 3) % 24),
        layer: i % 2 === 0 ? 0 : 2,
      });
    }
    return items;
  }, []);

  // Fish swim state & positions
  const fishPositions = useMemo(() => {
    return projects.map((p, i) => {
      const left = 8 + i * (78 / projects.length);
      const top = 24 + (i % 3) * 12 + ((i * 7) % 8);
      const width = 95 + (i % 4) * 14;
      return { left, top, width, color: `hsl(${p.hue} 85% 62%)` };
    });
  }, []);

  useGSAP(
    () => {
      if (reducedMotion || !deepRef.current) return;

      // Entrance zoom - Use fromTo so opacity and scale are strictly pinned and don't re-capture 0
      gsap.fromTo(
        "#deep .lay",
        {
          scale: 1.3,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          transformOrigin: "50% 50%",
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: deepRef.current,
            start: "top 90%",
            end: "top 25%",
            scrub: true,
          },
        }
      );

      // Swim animation helper
      const animateSwim = (el: HTMLElement, sv: SVGElement, range: number) => {
        let dir = Math.random() < 0.5 ? 1 : -1;
        const go = () => {
          gsap.set(sv, { scaleX: dir });
          gsap.to(el, {
            x: dir * range * (0.3 + Math.random() * 0.7),
            duration: 4 + Math.random() * 5,
            ease: "sine.inOut",
            onComplete: () => {
              dir = -dir;
              go();
            },
          });
        };
        go();

        gsap.to(el, {
          y: `+=${10 + Math.random() * 16}`,
          duration: 2 + Math.random() * 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      };

      // Animate project fishes
      const fishBtns = deepRef.current.querySelectorAll<HTMLButtonElement>(".fish");
      fishBtns.forEach((btn) => {
        const svg = btn.querySelector("svg");
        if (svg) animateSwim(btn, svg, 90);
      });

      // Animate small fish
      const sfs = deepRef.current.querySelectorAll<HTMLDivElement>(".sf");
      sfs.forEach((sf) => {
        const svg = sf.querySelector("svg");
        if (svg) animateSwim(sf, svg, 160);
      });
    },
    { scope: deepRef, dependencies: [reducedMotion] }
  );

  useEffect(() => {
    const deep = deepRef.current;
    const L0 = l0Ref.current;
    const L1 = l1Ref.current;
    const L2 = l2Ref.current;
    if (!deep || !L0 || !L1 || !L2) return;

    const layers = [L0, L1, L2];
    const quickSetters = layers.map((l) => gsap.quickTo(l, "x", { duration: 1.1, ease: "power3" }));

    let m = 0.3;
    let lastClientX = 0;

    const pan = () => {
      layers.forEach((l, i) => {
        quickSetters[i](-m * (l.offsetWidth - window.innerWidth));
      });
    };

    pan();
    window.addEventListener("resize", pan);

    const handlePointerDown = (e: PointerEvent) => {
      lastClientX = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        m = Math.min(1, Math.max(0, m - ((e.clientX - lastClientX) / window.innerWidth) * 1.6));
        lastClientX = e.clientX;
      } else {
        m = e.clientX / window.innerWidth;
      }
      pan();

      // Curious fish reaction (desktop / fine pointer)
      if (!reducedMotion && e.pointerType !== "touch") {
        const fishButtons = deep.querySelectorAll<HTMLButtonElement>(".fish");
        fishButtons.forEach((f) => {
          const rect = f.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          const isNear = Math.hypot(dx, dy) < 300;
          const innerPush = f.querySelector<HTMLElement>(".push");
          if (innerPush) {
            gsap.to(innerPush, {
              x: isNear ? Math.max(-45, Math.min(45, dx * 0.22)) : 0,
              y: isNear ? Math.max(-30, Math.min(30, dy * 0.22)) : 0,
              duration: 0.9,
              overwrite: "auto",
            });
          }
        });
      }
    };

    // Water ripple on click
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".fish") || reducedMotion) return;

      const rect = deep.getBoundingClientRect();
      const rip = document.createElement("div");
      rip.className = "rip";
      rip.style.left = `${e.clientX - rect.left}px`;
      rip.style.top = `${e.clientY - rect.top}px`;
      deep.appendChild(rip);

      gsap.fromTo(
        rip,
        { scale: 0.2, opacity: 0.8 },
        {
          scale: 5,
          opacity: 0,
          duration: 1.4,
          ease: "power2.out",
          onComplete: () => rip.remove(),
        }
      );
    };

    deep.addEventListener("pointerdown", handlePointerDown);
    deep.addEventListener("pointermove", handlePointerMove);
    deep.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", pan);
      deep.removeEventListener("pointerdown", handlePointerDown);
      deep.removeEventListener("pointermove", handlePointerMove);
      deep.removeEventListener("click", handleClick);
    };
  }, [reducedMotion]);

  return (
    <section id="deep" ref={deepRef} aria-label="Laut dalam">
      <div className="rays" />

      {/* Layer 0: Background seaweed & small fish */}
      <div className="lay" id="L0" ref={l0Ref}>
        <Seaweed count={22} hMin={90} hMax={200} opacity={0.3} />
        {schoolFish
          .filter((f) => f.layer === 0)
          .map((f, i) => (
            <div
              key={i}
              className="sf"
              style={{
                left: `${f.left}%`,
                top: `${f.top}%`,
                width: `${f.width}px`,
              }}
            >
              <svg viewBox="0 0 120 60">
                <use href="#fish" />
              </svg>
            </div>
          ))}
      </div>

      {/* Layer 1: Interactive project fish */}
      <div className="lay" id="L1" ref={l1Ref}>
        {projects.map((p, i) => {
          const pos = fishPositions[i];
          const isHit = !!activeSkill && p.tags.some((t) => t.toLowerCase() === skillKey);
          const isDim = !!activeSkill && hasMatches && !isHit;
          const fishClass = `fish ${isHit ? "hit" : ""} ${isDim ? "dim" : ""}`.trim();

          return (
            <button
              key={p.slug}
              type="button"
              className={fishClass}
              data-name={p.title}
              aria-label={`Masuk ke cerita proyek ${p.title}`}
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                width: `${pos.width}px`,
                color: pos.color,
              }}
              onPointerEnter={() => {
                audioEngine.pop(300);
              }}
              onClick={(e) => {
                audioEngine.sweepCard();
                onOpenProject(i, e.currentTarget);
              }}
            >
              <span className="push">
                <svg viewBox="0 0 120 60" aria-hidden="true">
                  <use href="#fish" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      {/* Layer 2: Foreground seaweed & small fish */}
      <div className="lay" id="L2" ref={l2Ref}>
        <Seaweed count={26} hMin={140} hMax={300} opacity={0.75} />
        {schoolFish
          .filter((f) => f.layer === 2)
          .map((f, i) => (
            <div
              key={i}
              className="sf"
              style={{
                left: `${f.left}%`,
                top: `${f.top}%`,
                width: `${f.width}px`,
              }}
            >
              <svg viewBox="0 0 120 60">
                <use href="#fish" />
              </svg>
            </div>
          ))}
      </div>

      <div className="dhead">
        <h2>Menyelam lebih dalam</h2>
        <p>Setiap ikan menyimpan cerita satu proyek.</p>
      </div>
      <div className="dhint">
        Gerakkan mouse atau geser untuk menjelajah, klik ikan untuk masuk
      </div>
    </section>
  );
}
