"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface LenisContextValue {
  lenis: Lenis | null;
  scrollTo: (target: number | string | HTMLElement, options?: { duration?: number; easing?: (t: number) => number }) => void;
  stop: () => void;
  start: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export function LenisProvider({
  children,
  reducedMotion = false,
}: {
  children: React.ReactNode;
  reducedMotion?: boolean;
}) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.085,
      autoToggle: false,
    });
    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Sync with ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
    };
  }, [reducedMotion]);

  const scrollTo = (
    target: number | string | HTMLElement,
    options?: { duration?: number; easing?: (t: number) => number; force?: boolean }
  ) => {
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
    if (lenisRef.current) {
      lenisRef.current.start();
      lenisRef.current.scrollTo(target, { ...options, force: true });
    } else {
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      } else if (typeof target === "string") {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else if (target && "scrollIntoView" in target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const stop = () => {
    lenisRef.current?.stop();
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
  };

  const start = () => {
    lenisRef.current?.start();
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
  };

  return (
    <LenisContext.Provider value={{ lenis: lenisInstance, scrollTo, stop, start }}>
      {children}
    </LenisContext.Provider>
  );
}

export function useLenis() {
  return useContext(LenisContext);
}
