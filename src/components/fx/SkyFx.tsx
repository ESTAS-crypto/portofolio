"use client";

/**
 * SkyFx — F1: Latar langit gradien yang berubah mengikuti waktu.
 * Juga menjadi container posisi celestial (sun orbit wrapper).
 */

import { useRef, useEffect } from "react";
import { skyEngine } from "@/lib/skyTimeEngine";

export default function SkyFx() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Update setiap kali skyEngine notify()
    const unsub = skyEngine.subscribe(() => {
      el.style.setProperty("--s1", skyEngine.sky.skyTop);
      el.style.setProperty("--s2", skyEngine.sky.skyBottom);
    });

    // Juga set awal
    el.style.setProperty("--s1", skyEngine.sky.skyTop);
    el.style.setProperty("--s2", skyEngine.sky.skyBottom);

    // Fade saat scroll
    const fade = () => {
      const hero = el.parentElement;
      if (!hero) return;
      el.style.opacity = Math.max(
        0,
        1 - scrollY / (hero.offsetHeight * 1.6 * 0.85)
      ).toFixed(3);
    };
    window.addEventListener("scroll", fade, { passive: true });
    fade();

    return () => {
      unsub();
      window.removeEventListener("scroll", fade);
    };
  }, []);

  return <div ref={ref} className="skyfx" id="skyfx" />;
}
