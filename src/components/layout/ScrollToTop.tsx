"use client";

import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";

interface ScrollToTopProps {
  onNavigate: (id: string) => void;
  reducedMotion?: boolean;
}

export default function ScrollToTop({ onNavigate, reducedMotion = false }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const show = window.scrollY > window.innerHeight * 2.4;
      setIsVisible(show);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!reducedMotion) {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      for (let i = 0; i < 8; i++) {
        const bubble = document.createElement("i");
        const size = 5 + Math.random() * 9;
        bubble.className = "tb";
        bubble.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;z-index:35`;
        document.body.appendChild(bubble);

        gsap.to(bubble, {
          x: (Math.random() - 0.5) * 110,
          y: (Math.random() - 0.3) * 70,
          scale: 1.5,
          opacity: 0,
          duration: 0.9 + Math.random() * 0.6,
          ease: "power2.out",
          onComplete: () => bubble.remove(),
        });
      }
    }

    onNavigate("hero");
  };

  return (
    <button
      className={`up ${isVisible ? "show" : ""}`}
      id="up"
      type="button"
      data-go="hero"
      aria-label="Naik ke permukaan"
      onClick={handleClick}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      <span>Naik ke permukaan</span>
    </button>
  );
}
