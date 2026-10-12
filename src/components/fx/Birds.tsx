"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const birdsData = [
  { top: "18%", width: 46 },
  { top: "28%", width: 32 },
  { top: "36%", width: 58 },
  { top: "13%", width: 28 },
];

export default function Birds({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion || !containerRef.current) return;

      const birds = containerRef.current.querySelectorAll<HTMLDivElement>(".bird");
      birds.forEach((b, i) => {
        gsap.fromTo(
          b,
          { x: -160 },
          {
            x: () => window.innerWidth + 160,
            duration: 16 + i * 4,
            delay: 2.5 + i * 2.5,
            repeat: -1,
            ease: "none",
          }
        );
        gsap.to(b, {
          y: `+=${14 + i * 6}`,
          duration: 2.2 + i * 0.4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  return (
    <div ref={containerRef} aria-hidden="true">
      {birdsData.map((bird, i) => (
        <div key={i} className="bird" style={{ top: bird.top, width: `${bird.width}px` }}>
          <svg viewBox="0 0 40 16">
            <path
              d="M1 12Q10 -2 20 9Q30 -2 39 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
