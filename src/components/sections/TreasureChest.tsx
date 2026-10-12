"use client";

import { useState, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { oceanStore } from "@/lib/oceanStore";

export default function TreasureChest({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    oceanStore.showToast(
      nextOpen
        ? "Harta karun ditemukan! Sebuah pesan rahasia: teruslah berkarya dan berenang."
        : "Peti ditutup kembali."
    );

    if (nextOpen && !reducedMotion && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.35;

      for (let i = 0; i < 28; i++) {
        const coin = document.createElement("i");
        const size = 8 + Math.random() * 9;
        const vx = (Math.random() - 0.5) * 380;
        const up = -(140 + Math.random() * 230);

        coin.className = "coin";
        coin.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px`;
        document.body.appendChild(coin);

        gsap
          .timeline({ onComplete: () => coin.remove() })
          .to(coin, {
            x: vx * 0.5,
            y: up,
            duration: 0.45,
            ease: "power2.out",
          })
          .to(coin, {
            x: vx,
            y: up + 380 + Math.random() * 200,
            rotation: Math.random() * 540,
            opacity: 0,
            duration: 0.9 + Math.random() * 0.4,
            ease: "power2.in",
          });
      }
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`chest ${isOpen ? "open" : ""}`}
      id="chest"
      type="button"
      aria-expanded={isOpen}
      onClick={handleClick}
    >
      <svg viewBox="0 0 160 120" aria-hidden="true">
        <ellipse className="glow" cx="80" cy="56" rx="78" ry="46" fill="#ffd36b" opacity="0" />
        <rect x="20" y="58" width="120" height="52" rx="8" fill="#8a5a2b" />
        <rect x="20" y="76" width="120" height="6" fill="#5b3a1a" />
        <ellipse className="gold" cx="80" cy="60" rx="52" ry="9" fill="#ffc83d" />
        <circle className="gold" cx="62" cy="55" r="5" fill="#fff" />
        <circle className="gold" cx="94" cy="54" r="4" fill="#ff9aa2" />
        <rect x="72" y="72" width="16" height="18" rx="3" fill="#ffd36b" />
        <g className="lid">
          <path d="M20 58A60 42 0 0 1 140 58Z" fill="#a56a32" />
          <path d="M20 58A60 42 0 0 1 140 58" stroke="#5b3a1a" strokeWidth="4" fill="none" />
        </g>
      </svg>
      <span className="chest-caption cl">{isOpen ? "Harta karun ditemukan!" : "Klik petinya"}</span>
    </button>
  );
}
