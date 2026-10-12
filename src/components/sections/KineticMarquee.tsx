"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { siteConfig } from "@/data/site";

interface KineticMarqueeProps {
  reducedMotion?: boolean;
}

export default function KineticMarquee({ reducedMotion = false }: KineticMarqueeProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const repeatedText = siteConfig.kineticMarqueeText.repeat(4);

  useEffect(() => {
    if (reducedMotion) return;

    const kt = textRef.current;
    if (!kt) return;

    let x = 0;
    let v = 0;
    let dir = -1;
    let last = window.scrollY;

    const tickerCb = () => {
      const dy = window.scrollY - last;
      last = window.scrollY;

      if (Math.abs(dy) > 0.5) {
        dir = dy > 0 ? -1 : 1;
      }

      v += (Math.min(Math.abs(dy), 60) * 0.6 - v) * 0.1;
      x += dir * (0.6 + v);

      const w = kt.scrollWidth / 4;
      if (x < -w) x += w;
      if (x > 0) x -= w;

      kt.style.transform = `translateX(${x}px)`;
    };

    gsap.ticker.add(tickerCb);
    return () => gsap.ticker.remove(tickerCb);
  }, [reducedMotion]);

  return (
    <section className="kin" aria-hidden="true">
      <div className="kt" id="kt" ref={textRef}>
        {repeatedText}
      </div>
    </section>
  );
}
