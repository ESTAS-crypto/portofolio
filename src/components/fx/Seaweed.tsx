"use client";

import { useMemo } from "react";

interface SeaweedProps {
  count: number;
  hMin: number;
  hMax: number;
  opacity: number;
}

export default function Seaweed({ count, hMin, hMax, opacity }: SeaweedProps) {
  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Deterministic spread to ensure zero hydration mismatch
      const pseudo = ((i * 37 + 13) % 100) / 100;
      const pseudo2 = ((i * 53 + 29) % 100) / 100;
      const pseudo3 = ((i * 71 + 41) % 100) / 100;
      const h = hMin + pseudo * (hMax - hMin);
      const left = (i / count) * 100 + pseudo2 * 3;
      const width = h * 0.12;
      const delay = -pseudo3 * 4;
      const duration = 3 + pseudo2 * 3;
      return { h, left, width, delay, duration };
    });
  }, [count, hMin, hMax]);

  return (
    <>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="weed"
          style={{
            left: `${item.left}%`,
            height: `${item.h}px`,
            width: `${item.width}px`,
            opacity,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          <svg viewBox="0 0 20 200" preserveAspectRatio="none">
            <path
              d="M10 200C-6 150 26 110 10 60S14 14 10 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </>
  );
}
