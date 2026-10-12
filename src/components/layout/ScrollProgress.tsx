"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function ScrollProgress({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reducedMotion || !barRef.current) return;

    gsap.to(barRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: "max",
        scrub: 0.2,
      },
    });
  }, [reducedMotion]);

  return <div ref={barRef} className="prog" aria-hidden="true" />;
}
