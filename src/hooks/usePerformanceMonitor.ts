"use client";

import { useEffect } from "react";
import { oceanStore, QualityLevel } from "@/lib/oceanStore";
import { audioEngine } from "@/lib/audioEngine";

export function usePerformanceMonitor() {
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // 1. Initial quality level assessment
      let initialLevel: QualityLevel = "hi";

      // Weak device heuristic: concurrency <= 2, deviceMemory <= 1, or saveData
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
      };

      const isVeryWeak =
        (nav.hardwareConcurrency != null && nav.hardwareConcurrency <= 2) ||
        (nav.deviceMemory != null && nav.deviceMemory <= 1) ||
        nav.connection?.saveData === true;

      if (isVeryWeak) {
        initialLevel = "mid";
      }

      // Check sessionStorage 'q' (only used if lower than initialLevel)
      try {
        const stored = sessionStorage.getItem("q") as QualityLevel | null;
        if (stored === "lo") {
          initialLevel = "lo";
        } else if (stored === "mid" && initialLevel === "hi") {
          initialLevel = "mid";
        }
      } catch {}

      // URL parameter override: ?q=hi|mid|lo
      const urlParams = new URLSearchParams(window.location.search);
      const urlQ = urlParams.get("q") as QualityLevel | null;
      const isManualOverride = urlQ === "hi" || urlQ === "mid" || urlQ === "lo";

      if (isManualOverride && urlQ) {
        initialLevel = urlQ;
      }

      // Apply initial quality level immediately
      oceanStore.setQualityLevel(initialLevel);
      document.documentElement.setAttribute("data-q", initialLevel);

      // If manual override or reduced-motion, skip auto measurement
      if (isManualOverride || rm) {
        return;
      }

      // 2. Audio nudge (ajakan suara halus)
      const nudgeTimer = setTimeout(() => {
        try {
          if (rm) return;
          if (audioEngine.getActive()) return;
          const btn = document.getElementById("audBtn");
          if (!btn) return;

          btn.classList.add("nudge");
          const removeNudge = () => btn.classList.remove("nudge");
          btn.addEventListener("click", removeNudge, { once: true });
          setTimeout(removeNudge, 6000);
        } catch {}
      }, 6000);

      // 3. Measurement (requestAnimationFrame) starting 2.5s AFTER event load
      let startTimeout: NodeJS.Timeout | null = null;
      let animId: number | null = null;
      let active = true;

      const buffer = new Float32Array(400);
      let sampleCount = 0;
      let windowStartTime = 0;
      let lastFrameTime = 0;
      let slowWindowsCount = 0;
      let totalWindowsEvaluated = 0;

      const stopMeasurement = () => {
        active = false;
        if (animId != null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };

      const onVisibilityChange = () => {
        if (document.hidden) {
          sampleCount = 0;
          windowStartTime = 0;
          lastFrameTime = 0;
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      const loop = (now: number) => {
        if (!active) return;

        if (document.hidden) {
          animId = requestAnimationFrame(loop);
          return;
        }

        if (lastFrameTime === 0) {
          lastFrameTime = now;
          windowStartTime = now;
          sampleCount = 0;
          animId = requestAnimationFrame(loop);
          return;
        }

        const delta = now - lastFrameTime;
        lastFrameTime = now;

        // Ignore frames with diff > 250ms and reset window (tab paused / extreme scroll)
        if (delta > 250) {
          sampleCount = 0;
          windowStartTime = now;
          animId = requestAnimationFrame(loop);
          return;
        }

        if (sampleCount < buffer.length) {
          buffer[sampleCount++] = delta;
        }

        // Check if 4s window elapsed
        if (now - windowStartTime >= 4000) {
          if (sampleCount >= 30) {
            totalWindowsEvaluated++;

            // Calculate median frame time
            const slice = Array.from(buffer.subarray(0, sampleCount)).sort((a, b) => a - b);
            const midIndex = Math.floor(slice.length / 2);
            const median =
              slice.length % 2 === 0
                ? (slice[midIndex - 1] + slice[midIndex]) / 2
                : slice[midIndex];

            // Median > 30ms is considered slow (< ~33 fps)
            if (median > 30) {
              slowWindowsCount++;
              if (slowWindowsCount >= 2) {
                const current = oceanStore.getQualityLevel();
                const next: QualityLevel = current === "hi" ? "mid" : "lo";
                oceanStore.setQualityLevel(next);
                try {
                  sessionStorage.setItem("q", next);
                } catch {}
                slowWindowsCount = 0;

                // Stop if lowest reached
                if (next === "lo") {
                  stopMeasurement();
                  return;
                }
              }
            } else {
              slowWindowsCount = 0;
            }

            // Stop completely after 5 windows
            if (totalWindowsEvaluated >= 5) {
              stopMeasurement();
              return;
            }
          }

          // Reset window
          sampleCount = 0;
          windowStartTime = now;
        }

        animId = requestAnimationFrame(loop);
      };

      const startMeasuring = () => {
        startTimeout = setTimeout(() => {
          if (!active) return;
          lastFrameTime = 0;
          animId = requestAnimationFrame(loop);
        }, 2500);
      };

      if (document.readyState === "complete") {
        startMeasuring();
      } else {
        window.addEventListener("load", startMeasuring, { once: true });
      }

      return () => {
        active = false;
        if (startTimeout) clearTimeout(startTimeout);
        if (nudgeTimer) clearTimeout(nudgeTimer);
        stopMeasurement();
      };
    } catch {
      // Fails silently
    }
  }, []);
}
