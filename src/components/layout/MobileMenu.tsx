"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/hooks/useLenis";
import { siteConfig } from "@/data/site";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
  burgerRect: DOMRect | null;
  reducedMotion?: boolean;
}

export default function MobileMenu({
  isOpen,
  onClose,
  onNavigate,
  burgerRect,
  reducedMotion = false,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { stop, start } = useLenis();

  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!isOpen) return;
    }

    const D = reducedMotion ? 0.01 : 1;
    const origin = burgerRect
      ? `${burgerRect.left + burgerRect.width / 2}px ${burgerRect.top + burgerRect.height / 2}px`
      : "50% 50%";

    if (isOpen) {
      el.hidden = false;
      el.style.pointerEvents = "auto";
      stop();

      gsap.fromTo(
        el,
        { clipPath: `circle(0px at ${origin})` },
        { clipPath: `circle(150vmax at ${origin})`, duration: 0.8 * D, ease: "power3.inOut" }
      );

      const items = el.querySelectorAll("a, small");
      gsap.fromTo(
        items,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.7 * D, delay: 0.3 * D, ease: "power3.out" }
      );
    } else {
      start();
      el.style.pointerEvents = "none";
      gsap.to(el, {
        clipPath: `circle(0px at ${origin})`,
        duration: 0.5 * D,
        ease: "power3.in",
        onComplete: () => {
          el.hidden = true;
          el.style.pointerEvents = "";
        },
      });
    }
  }, [isOpen, burgerRect, reducedMotion, stop, start]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    start();
    onClose();
    requestAnimationFrame(() => {
      onNavigate(id);
    });
  };

  return (
    <div id="menu" ref={menuRef} hidden>
      <a href="#about" onClick={(e) => handleLinkClick(e, "about")}>
        Tentang
      </a>
      <a href="#work" onClick={(e) => handleLinkClick(e, "work")}>
        Proyek
      </a>
      <a href="#deep" onClick={(e) => handleLinkClick(e, "deep")}>
        Jelajah
      </a>
      <a href="#contact" onClick={(e) => handleLinkClick(e, "contact")}>
        Hubungi
      </a>
      <small>{siteConfig.email}</small>
    </div>
  );
}
