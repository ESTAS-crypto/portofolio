"use client";

import { useEffect } from "react";
import { oceanStore } from "@/lib/oceanStore";

export function usePerformanceMonitor() {
  useEffect(() => {
    // 1. Cek hardware concurrency
    if (typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      oceanStore.setLowSpec(true);
    }

    // 2. Monitor FPS dinamis selama 3 detik pertama
    let frameCount = 0;
    let startTime = performance.now();
    let animId: number;

    const checkFPS = (now: number) => {
      frameCount++;
      const elapsed = now - startTime;

      if (elapsed >= 3000) {
        const fps = (frameCount / elapsed) * 1000;
        if (fps < 40) {
          oceanStore.setLowSpec(true);
        }
        return; // Selesai profiling awal
      }

      animId = requestAnimationFrame(checkFPS);
    };

    animId = requestAnimationFrame(checkFPS);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);
}
