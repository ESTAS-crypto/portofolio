"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { navItems, siteConfig } from "@/data/site";
import MobileMenu from "./MobileMenu";

interface NavProps {
  onNavigate: (id: string) => void;
  reducedMotion?: boolean;
}

export default function Nav({ onNavigate, reducedMotion = false }: NavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const linksWrapRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLElement>(null);
  const fishLogoRef = useRef<SVGSVGElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const [activeId, setActiveId] = useState("hero");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [burgerRect, setBurgerRect] = useState<DOMRect | null>(null);

  const isHoveredRef = useRef(false);
  const lastScrollY = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const movePill = useCallback(
    (targetEl: HTMLElement | null, snap = false) => {
      const pill = pillRef.current;
      if (!pill) return;
      const D = reducedMotion ? 0.01 : 1;

      if (!targetEl) {
        gsap.to(pill, { opacity: 0, duration: 0.3, overwrite: "auto" });
        return;
      }

      gsap.to(pill, {
        x: targetEl.offsetLeft,
        width: targetEl.offsetWidth,
        opacity: 1,
        duration: snap ? 0 : 0.6 * D,
        ease: "back.out(1.6)",
        overwrite: "auto",
      });
    },
    [reducedMotion]
  );

  // Position pill on active item
  const updatePillToActive = useCallback(() => {
    if (isHoveredRef.current || !linksWrapRef.current) return;
    const currentLink = linksWrapRef.current.querySelector(
      `a[data-go="${activeId}"]`
    ) as HTMLElement | null;
    movePill(currentLink);
  }, [activeId, movePill]);

  useEffect(() => {
    updatePillToActive();
  }, [activeId, updatePillToActive]);

  useEffect(() => {
    const nav = navRef.current;
    const fish = fishLogoRef.current;
    if (!nav) return;

    if (!reducedMotion) {
      gsap.from(nav, { y: -90, opacity: 0, duration: 1.1, ease: "expo.out", delay: 0.3 });
    }

    const sections = ["hero", "about", "work", "deep", "contact"];

    const handleScroll = () => {
      const H = window.innerHeight;
      const y = window.scrollY;
      const mx = document.documentElement.scrollHeight - H;

      // Update nav progress indicator
      nav.style.setProperty("--p", (mx > 0 ? Math.min(1, y / mx) : 0).toString());
      nav.classList.toggle("sm", y > 80);

      // Determine active section
      let currentSection = "hero";
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= H * 0.45) {
          currentSection = id;
        }
      });
      setActiveId(currentSection);

      // Fish logo tilt
      const dy = y - lastScrollY.current;
      lastScrollY.current = y;

      if (!reducedMotion && fish && Math.abs(dy) > 1) {
        gsap.to(fish, { rotation: dy > 0 ? 42 : -42, duration: 0.5, overwrite: "auto" });
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          gsap.to(fish, { rotation: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
        }, 160);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
      updatePillToActive();
      if (window.innerWidth > 760 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [reducedMotion, isMenuOpen, updatePillToActive]);

  const burstBubbles = (e: React.MouseEvent) => {
    if (reducedMotion) return;
    for (let i = 0; i < 8; i++) {
      const d = document.createElement("i");
      const s = 5 + Math.random() * 9;
      d.className = "tb";
      d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px;`;
      document.body.appendChild(d);
      gsap.to(d, {
        x: (Math.random() - 0.5) * 110,
        y: (Math.random() - 0.3) * 70,
        scale: 1.5,
        opacity: 0,
        duration: 0.9 + Math.random() * 0.6,
        ease: "power2.out",
        onComplete: () => d.remove(),
      });
    }
  };

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    burstBubbles(e);
    onNavigate(id);
  };

  const toggleBurger = () => {
    if (burgerRef.current) {
      setBurgerRect(burgerRef.current.getBoundingClientRect());
    }
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      <div id="nav" ref={navRef} role="navigation" aria-label="Navigasi utama">
        <a
          className="brand"
          href="#hero"
          data-go="hero"
          onClick={(e) => handleLinkClick(e, "hero")}
        >
          <svg ref={fishLogoRef} className="lf" viewBox="0 0 120 60" aria-hidden="true">
            <use href="#fish" />
          </svg>
          <b>{siteConfig.name}</b>
        </a>

        <div
          className="links nav-links-wrap"
          id="links"
          ref={linksWrapRef}
          onPointerLeave={() => {
            isHoveredRef.current = false;
            updatePillToActive();
          }}
          onFocusCapture={() => {
            isHoveredRef.current = false;
          }}
        >
          <i ref={pillRef} className="pill" aria-hidden="true" />
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-go={item.id}
              aria-current={activeId === item.id ? "true" : undefined}
              onPointerEnter={(e) => {
                isHoveredRef.current = true;
                movePill(e.currentTarget);
              }}
              onFocus={(e) => movePill(e.currentTarget)}
              onPointerMove={(e) => {
                if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
                const r = e.currentTarget.getBoundingClientRect();
                gsap.to(e.currentTarget, {
                  x: (e.clientX - r.left - r.width / 2) * 0.22,
                  y: (e.clientY - r.top - r.height / 2) * 0.3,
                  duration: 0.3,
                  overwrite: "auto",
                });
              }}
              onPointerLeave={(e) => {
                gsap.to(e.currentTarget, {
                  x: 0,
                  y: 0,
                  duration: 0.7,
                  ease: "elastic.out(1, 0.4)",
                });
              }}
              onClick={(e) => handleLinkClick(e, item.id)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          className="cta"
          href="#contact"
          data-go="contact"
          onClick={(e) => handleLinkClick(e, "contact")}
        >
          Hubungi
        </a>

        <button
          ref={burgerRef}
          className={`burger ${isMenuOpen ? "on" : ""}`}
          id="burger"
          type="button"
          aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isMenuOpen}
          aria-controls="menu"
          onClick={toggleBurger}
        >
          <span />
          <span />
        </button>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        burgerRect={burgerRect}
        reducedMotion={reducedMotion}
      />
    </>
  );
}
