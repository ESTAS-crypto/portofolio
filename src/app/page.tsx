"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LenisProvider, useLenis } from "@/hooks/useLenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { siteConfig } from "@/data/site";
import { oceanStore } from "@/lib/oceanStore";
import { audioEngine } from "@/lib/audioEngine";

import SvgSymbols from "@/components/layout/SvgSymbols";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Cursor from "@/components/layout/Cursor";
import SkipLink from "@/components/layout/SkipLink";
import Nav from "@/components/layout/Nav";
import Gauge from "@/components/layout/Gauge";
import AudioControl from "@/components/layout/AudioControl";
import ScrollToTop from "@/components/layout/ScrollToTop";
import Toast from "@/components/layout/Toast";
import Bubbles from "@/components/fx/Bubbles";
import Buddy from "@/components/fx/Buddy";
import ReefCanvas from "@/components/fx/ReefCanvas";
import Creatures from "@/components/fx/Creatures";
import LightingOverlays from "@/components/fx/LightingOverlays";
import SmartFavicon from "@/components/fx/SmartFavicon";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import KineticMarquee from "@/components/sections/KineticMarquee";
import Work from "@/components/sections/Work";
import Deep from "@/components/sections/Deep";
import Contact from "@/components/sections/Contact";
import ProjectPortal from "@/components/portal/ProjectPortal";
import RecruiterSummaryModal from "@/components/modals/RecruiterSummaryModal";
import ExplorerDexModal from "@/components/modals/ExplorerDexModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

function PortfolioApp({ reducedMotion }: { reducedMotion: boolean }) {
  usePerformanceMonitor();
  const { scrollTo } = useLenis();

  const [portalOpen, setPortalOpen] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [portalTriggerElement, setPortalTriggerElement] = useState<HTMLElement | null>(null);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [dexOpen, setDexOpen] = useState(false);
  const [summaryOpener, setSummaryOpener] = useState<HTMLElement | null>(null);
  const [dexOpener, setDexOpener] = useState<HTMLElement | null>(null);
  const [dexCount, setDexCount] = useState(0);
  const [hasNewDiscovery, setHasNewDiscovery] = useState(false);

  const handleOpenSummary = (opener?: HTMLElement | null) => {
    setSummaryOpener(opener || null);
    setSummaryOpen(true);
  };

  const handleOpenDex = (opener?: HTMLElement | null) => {
    setDexOpener(opener || null);
    setDexOpen(true);
  };

  const handleDiscoveryChange = useCallback((count: number, hasNew: boolean) => {
    setDexCount(count);
    setHasNewDiscovery(hasNew);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || summaryOpen || dexOpen || portalOpen) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;

      const k = e.key.toLowerCase();
      if (k === "r") {
        setSummaryOpen(true);
      } else if (k === "k") {
        setDexOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [summaryOpen, dexOpen, portalOpen]);

  // Single Ocean Loop: menghitung kedalaman SEKALI per frame dan membagikannya ke semua modul
  useEffect(() => {
    let heroEl: HTMLElement | null = null;

    const onTick = () => {
      if (!heroEl) heroEl = document.getElementById("hero");
      const H = window.innerHeight;
      const heroH = heroEl ? heroEl.offsetHeight : H;
      const docH = document.documentElement.scrollHeight;
      const sy = window.scrollY;
      const v = oceanStore.updateDepth(sy, heroH, docH, H);
      audioEngine.onFrame(v);
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
    };
  }, []);

  // Global background color tween across scroll depth
  useGSAP(
    () => {
      if (reducedMotion) return;

      const root = document.documentElement;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      tl.to(root, { "--c": "rgb(10,63,102)", ease: "none" }).to(root, {
        "--c": "rgb(3,17,31)",
        ease: "none",
      });

      document.fonts?.ready.then(() => {
        ScrollTrigger.refresh();
      });
    },
    { dependencies: [reducedMotion] }
  );

  // Centralized section navigation
  const handleNavigate = useCallback(
    (id: string) => {
      if (id === "hero") {
        scrollTo(0, { duration: 1.6 });
        return;
      }

      const targetEl = document.getElementById(id);
      if (!targetEl) return;

      // Account for GSAP ScrollTrigger pin start ONLY for work section, otherwise use element top
      let targetY = 0;
      if (id === "work") {
        const st = ScrollTrigger.getAll().find(
          (s) => s.trigger === targetEl || s.trigger === targetEl.firstElementChild
        );
        if (st && typeof st.start === "number") {
          targetY = st.start;
        } else {
          const parent =
            targetEl.parentElement && targetEl.parentElement.classList.contains("pin-spacer")
              ? targetEl.parentElement
              : targetEl;
          targetY = parent.getBoundingClientRect().top + window.scrollY;
        }
      } else {
        const parent =
          targetEl.parentElement && targetEl.parentElement.classList.contains("pin-spacer")
            ? targetEl.parentElement
            : targetEl;
        targetY = parent.getBoundingClientRect().top + window.scrollY;
      }

      const distance = Math.abs(targetY - window.scrollY);
      const duration = Math.min(2.8, Math.max(1.2, distance / 2800));

      scrollTo(targetY, {
        duration,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    },
    [scrollTo]
  );

  const handleOpenProject = useCallback((index: number, triggerEl: HTMLElement) => {
    setActiveProjectIndex(index);
    setPortalTriggerElement(triggerEl);
    setPortalOpen(true);
  }, []);

  const handleCloseProject = useCallback(() => {
    setPortalOpen(false);
  }, []);

  // Pintasan keyboard global (C: calm, M: suara, 1-4: lompat bagian, ?: bantuan)
  useKeyboardShortcuts({
    onNavigate: handleNavigate,
    isPortalOpen: portalOpen,
  });

  return (
    <>
      <SvgSymbols />
      <ScrollProgress reducedMotion={reducedMotion} />
      <Cursor reducedMotion={reducedMotion} />
      <SkipLink />
      <Nav
        onNavigate={handleNavigate}
        reducedMotion={reducedMotion}
        onOpenSummary={handleOpenSummary}
        onOpenDex={handleOpenDex}
        dexCount={dexCount}
        hasNewDiscovery={hasNewDiscovery}
      />
      <Gauge onNavigate={handleNavigate} reducedMotion={reducedMotion} />
      <AudioControl reducedMotion={reducedMotion} />
      <ScrollToTop onNavigate={handleNavigate} reducedMotion={reducedMotion} />
      <Toast />
      <Bubbles reducedMotion={reducedMotion} />
      <Buddy reducedMotion={reducedMotion} />
      <ReefCanvas reducedMotion={reducedMotion} />
      <Creatures reducedMotion={reducedMotion} />
      <LightingOverlays reducedMotion={reducedMotion} />
      <SmartFavicon />

      <main>
        <Hero reducedMotion={reducedMotion} />
        <About reducedMotion={reducedMotion} />
        <KineticMarquee reducedMotion={reducedMotion} />
        <Work onOpenProject={handleOpenProject} reducedMotion={reducedMotion} />
        <Deep onOpenProject={handleOpenProject} reducedMotion={reducedMotion} />
        <Contact reducedMotion={reducedMotion} />
      </main>

      <ProjectPortal
        isOpen={portalOpen}
        activeProjectIndex={activeProjectIndex}
        triggerElement={portalTriggerElement}
        onClose={handleCloseProject}
        onNavigateProject={setActiveProjectIndex}
        reducedMotion={reducedMotion}
      />

      <RecruiterSummaryModal
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        openerElement={summaryOpener}
      />

      <ExplorerDexModal
        isOpen={dexOpen}
        onClose={() => setDexOpen(false)}
        openerElement={dexOpener}
        onDiscoveryChange={handleDiscoveryChange}
      />

      <footer>{siteConfig.footerText}</footer>
    </>
  );
}

export default function Home() {
  const reducedMotion = useReducedMotion();

  return (
    <LenisProvider reducedMotion={reducedMotion}>
      <PortfolioApp reducedMotion={reducedMotion} />
    </LenisProvider>
  );
}
