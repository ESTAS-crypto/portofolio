"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function Cursor({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const cur = cursorRef.current;
    if (!cur) return;

    const quickX = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    const quickY = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      quickX(e.clientX);
      quickY(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const fishEl = target.closest(".fish");
      const cardEl = target.closest(".card");
      const deepEl = target.closest("#deep");

      const label = fishEl ? "Masuk" : cardEl ? "Buka" : deepEl ? "Geser" : "";
      cur.dataset.l = label;

      if (label) {
        gsap.to(cur, { scale: 2.4, duration: 0.3 });
      } else if (target.closest("a, button")) {
        gsap.to(cur, { scale: 1.7, duration: 0.3 });
      } else {
        gsap.to(cur, { scale: 1, duration: 0.3 });
      }
    };

    const handleMouseLeave = () => {
      cur.dataset.l = "";
      gsap.to(cur, { scale: 1, duration: 0.3 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [reducedMotion]);

  return <div ref={cursorRef} className="cur" aria-hidden="true" />;
}
