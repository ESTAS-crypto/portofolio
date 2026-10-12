"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { oceanStore } from "@/lib/oceanStore";
import Caustics from "./Caustics";

interface BubbleItem {
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Bubbles({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);

  useEffect(() => {
    // Generate 18 ambient bubbles on mount
    const items: BubbleItem[] = [];
    for (let i = 0; i < 18; i++) {
      items.push({
        left: Math.random() * 100,
        size: 8 + Math.random() * 34,
        duration: 9 + Math.random() * 12,
        delay: -Math.random() * 20,
      });
    }
    setBubbles(items);

    // Bubble trail under the surface
    let lastTime = 0;
    const handlePointerMove = (e: PointerEvent) => {
      if (
        reducedMotion ||
        e.pointerType === "touch" ||
        window.scrollY < window.innerHeight * 1.6 ||
        oceanStore.isCalm()
      ) {
        return;
      }
      const now = performance.now();
      if (now - lastTime < 70) return;
      lastTime = now;

      const d = document.createElement("i");
      const s = 6 + Math.random() * 10;
      d.className = "tb";
      d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px;`;
      document.body.appendChild(d);

      gsap.to(d, {
        y: -60 - Math.random() * 70,
        x: (Math.random() - 0.5) * 40,
        opacity: 0,
        scale: 1.4,
        duration: 1.4 + Math.random(),
        ease: "power1.out",
        onComplete: () => d.remove(),
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reducedMotion]);

  useGSAP(
    () => {
      if (reducedMotion || !containerRef.current) return;

      const aboutEl = document.getElementById("about");
      if (!aboutEl) return;

      gsap.to(containerRef.current, {
        opacity: 1,
        scrollTrigger: {
          trigger: aboutEl,
          start: "top bottom",
          end: "top 30%",
          scrub: true,
        },
      });
    },
    { dependencies: [reducedMotion] }
  );

  return (
    <div
      ref={containerRef}
      className="bubbles"
      id="bub"
      aria-hidden="true"
      style={reducedMotion ? { opacity: 1 } : undefined}
    >
      {!reducedMotion && <Caustics reducedMotion={reducedMotion} />}
      {bubbles.map((b, i) => (
        <i
          key={i}
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
