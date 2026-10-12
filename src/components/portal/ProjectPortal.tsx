"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";
import { useLenis } from "@/hooks/useLenis";
import OrbitMock from "./OrbitMock";

interface ProjectPortalProps {
  isOpen: boolean;
  activeProjectIndex: number;
  triggerElement: HTMLElement | null;
  onClose: () => void;
  onNavigateProject: (index: number) => void;
  reducedMotion?: boolean;
}

export default function ProjectPortal({
  isOpen,
  activeProjectIndex,
  triggerElement,
  onClose,
  onNavigateProject,
  reducedMotion = false,
}: ProjectPortalProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const pFishRef = useRef<SVGSVGElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isTransitioningRef = useRef(false);

  const { stop, start } = useLenis();

  const currentProject = projects[activeProjectIndex] || projects[0];

  // Open / Close Timeline
  useEffect(() => {
    const portal = portalRef.current;
    const pFish = pFishRef.current;
    if (!portal || !pFish) return;

    const D = reducedMotion ? 0.01 : 1;

    if (isOpen) {
      portal.hidden = false;
      portal.scrollTop = 0;
      stop();

      const rect = triggerElement
        ? triggerElement.getBoundingClientRect()
        : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 100, height: 60 };

      const isFish = triggerElement?.classList.contains("fish") ?? false;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const svgEl = triggerElement?.querySelector("svg");
      const flip = isFish && svgEl && Number(gsap.getProperty(svgEl, "scaleX")) < 0 ? -1 : 1;

      gsap.set(pFish, {
        display: isFish ? "block" : "none",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        opacity: 1,
        scaleX: flip,
        scaleY: 1,
        transformOrigin: `${flip < 0 ? 18 : 82}% 43%`,
      });

      gsap.set(".pbody", { opacity: 1, y: 0 });
      gsap.set(".pbody > *", { opacity: 0 });

      timelineRef.current?.kill();

      const tl = gsap.timeline({
        onComplete: () => {
          closeBtnRef.current?.focus();
        },
      });
      timelineRef.current = tl;

      tl.fromTo(
        portal,
        { clipPath: `circle(0px at ${cx}px ${cy}px)` },
        { clipPath: `circle(150vmax at ${cx}px ${cy}px)`, duration: D * 0.8, ease: "power3.inOut" }
      );

      if (isFish) {
        tl.to(
          pFish,
          { scaleX: flip * 26, scaleY: 26, duration: D * 1.4, ease: "power4.in" },
          D * 0.3
        ).to(pFish, { opacity: 0, duration: D * 0.35 }, D * 1.35);
      }

      const t0 = isFish ? D * 1.3 : D * 0.45;

      tl.fromTo(
        ".pbody > *:not(.pvis)",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.09 * D, duration: 0.8 * D, ease: "power3.out" },
        t0
      ).fromTo(
        ".pvis",
        { opacity: 0, scale: 0.7, rotate: -8 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1.1 * D, ease: "back.out(1.4)" },
        t0 + 0.15 * D
      );
    }
  }, [isOpen, triggerElement, reducedMotion, stop]);

  const handleClose = useCallback(() => {
    const portal = portalRef.current;
    const tl = timelineRef.current;
    if (!portal || portal.hidden || !tl) return;

    tl.eventCallback("onComplete", null);
    tl.eventCallback("onReverseComplete", () => {
      portal.hidden = true;
      start();
      triggerElement?.focus();
      onClose();
    });

    tl.timeScale(1.6).reverse();
  }, [start, triggerElement, onClose]);

  // Navigate Prev / Next project
  const handleNavProject = useCallback(
    (direction: number) => {
      if (isTransitioningRef.current || !isOpen) return;
      isTransitioningRef.current = true;

      const nextIndex = (activeProjectIndex + direction + projects.length) % projects.length;
      const K = reducedMotion ? 0.01 : 1;

      gsap.to(".pbody > *", {
        x: -direction * 60,
        opacity: 0,
        duration: 0.28 * K,
        stagger: 0.02 * K,
        ease: "power2.in",
        onComplete: () => {
          onNavigateProject(nextIndex);
          if (portalRef.current) portalRef.current.scrollTop = 0;

          gsap.fromTo(
            ".pbody > *:not(.pvis)",
            { x: direction * 60, opacity: 0 },
            { x: 0, opacity: 1, stagger: 0.07 * K, duration: 0.6 * K, ease: "power3.out" }
          );

          gsap.fromTo(
            ".pvis",
            { x: direction * 140, opacity: 0, rotate: direction * 8 },
            {
              x: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.9 * K,
              ease: "back.out(1.3)",
              onComplete: () => {
                isTransitioningRef.current = false;
              },
            }
          );
        },
      });
    },
    [activeProjectIndex, isOpen, reducedMotion, onNavigateProject]
  );

  // Keyboard navigation (Esc, ArrowRight, ArrowLeft)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        handleNavProject(1);
      } else if (e.key === "ArrowLeft") {
        handleNavProject(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, handleNavProject]);

  // Spotlight & Blobs parallax
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const portal = portalRef.current;
    if (!portal) return;

    portal.style.setProperty("--mx", `${e.clientX}px`);
    portal.style.setProperty("--my", `${e.clientY}px`);

    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;

    const blobs = portal.querySelectorAll<HTMLDivElement>(".blob");
    blobs.forEach((b, k) => {
      gsap.to(b, {
        x: nx * (70 + k * 50),
        y: ny * (70 + k * 50),
        duration: 1.4,
        overwrite: "auto",
      });
    });

    const mock = portal.querySelector("#mock");
    if (mock) {
      gsap.to(mock, {
        rotationY: nx * 26,
        rotationX: -ny * 20,
        transformPerspective: 900,
        duration: 0.7,
        overwrite: "auto",
      });
    }
  };

  const actionHref = currentProject.priv
    ? `mailto:${siteConfig.email}?subject=${encodeURIComponent("Minta demo proyek: " + currentProject.title)}`
    : currentProject.url || "#";

  const actionText = currentProject.priv
    ? "Minta demo privat"
    : currentProject.cta || "Lihat di GitHub";

  return (
    <div
      id="portal"
      ref={portalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pt"
      hidden
      style={
        {
          "--pbg": `hsl(${currentProject.hue} 55% 13%)`,
          "--pc": `hsl(${currentProject.hue} 85% 62%)`,
          "--hh": currentProject.hue,
        } as React.CSSProperties
      }
      onPointerMove={handlePointerMove}
    >
      <div className="blob b1">
        <i />
      </div>
      <div className="blob b2">
        <i />
      </div>
      <div className="blob b3">
        <i />
      </div>
      <div className="spot" />

      {/* Floating particles */}
      <div className="pfx">
        {Array.from({ length: 26 }, (_, i) => {
          const s = 3 + (i % 5) * 1.5;
          const left = (i * 3.8) % 100;
          const duration = 8 + (i % 6) * 2;
          const delay = -(i % 8) * 2;
          const dx = ((i % 5) - 2) * 20;
          return (
            <i
              key={i}
              style={
                {
                  left: `${left}%`,
                  width: `${s}px`,
                  height: `${s}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  "--dx": `${dx}px`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      <svg ref={pFishRef} className="pfish" viewBox="0 0 120 60" aria-hidden="true">
        <use href="#fish" />
      </svg>

      <div className="pbody">
        <div className="ptop">
          <button ref={closeBtnRef} className="x" id="px" type="button" onClick={handleClose}>
            Kembali ke laut
          </button>
          <span id="cnt">{`${activeProjectIndex + 1} / ${projects.length}`}</span>
        </div>

        <h2 id="pt">{currentProject.title}</h2>
        <p className="lead" id="pd">
          {currentProject.description}
        </p>

        <div className="cols">
          <div>
            <h3>Masalah</h3>
            <p id="pm">{currentProject.story.problem}</p>
          </div>
          <div>
            <h3>Solusi</h3>
            <p id="ps">{currentProject.story.solution}</p>
          </div>
          <div>
            <h3>Manfaat</h3>
            <p id="pr">{currentProject.story.benefit}</p>
          </div>
        </div>

        <div className="tags" id="ptg">
          {currentProject.tags.map((t, idx) => (
            <i key={idx}>{t}</i>
          ))}
        </div>

        <a
          className="btn"
          id="pl"
          href={actionHref}
          target={currentProject.priv ? undefined : "_blank"}
          rel={currentProject.priv ? undefined : "noopener noreferrer"}
        >
          {actionText}
        </a>

        <div className="pnav">
          <button className="x" id="pp" type="button" onClick={() => handleNavProject(-1)}>
            Sebelumnya
          </button>
          <button className="x" id="pn" type="button" onClick={() => handleNavProject(1)}>
            Berikutnya
          </button>
        </div>

        <OrbitMock title={currentProject.title} tags={currentProject.tags} />
      </div>
    </div>
  );
}
