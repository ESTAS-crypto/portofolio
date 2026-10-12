"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { siteConfig } from "@/data/site";
import Clouds from "@/components/fx/Clouds";
import Birds from "@/components/fx/Birds";
import Tide from "@/components/fx/Tide";

interface HeroProps {
  isNight: boolean;
  reducedMotion?: boolean;
}

export default function Hero({ isNight, reducedMotion = false }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const nameChars = Array.from(siteConfig.name);

  useGSAP(
    () => {
      if (reducedMotion || !heroRef.current) return;

      // Character intro stagger
      gsap.from(".ch", {
        y: 110,
        opacity: 0,
        rotate: 7,
        stagger: 0.045,
        duration: 1.3,
        ease: "expo.out",
        delay: 0.1,
      });

      gsap.from([".hi", ".role", ".hint"], {
        y: 24,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        delay: 0.7,
        ease: "power2.out",
      });

      // Hero dive scroll timeline (pin 160% + scrub: 1)
      const tl = gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const clouds = heroRef.current.querySelectorAll<HTMLDivElement>(".cl");
      clouds.forEach((c) => {
        const d = Number(c.dataset.d) || 1;
        const s = Number(c.dataset.s) || 1;
        tl.to(
          c,
          {
            x: () => d * window.innerWidth * 0.55 * s,
          },
          0
        );
      });

      tl.to(
        ".sun",
        {
          y: () => window.innerHeight * 0.5,
          scale: 1.3,
        },
        0
      )
        .to(
          heroRef.current,
          {
            "--h1": isNight ? "rgb(4,10,28)" : "rgb(31,79,143)",
            "--h2": isNight ? "rgb(24,44,96)" : "rgb(255,200,150)",
          },
          0
        )
        .to(
          ".hero-copy",
          {
            y: () => -window.innerHeight * 0.2,
            opacity: 0,
            ease: "power1.in",
            duration: 0.7,
          },
          0
        )
        .to(
          ".hint",
          {
            opacity: 0,
            duration: 0.15,
          },
          0
        )
        .to(
          ".tide",
          {
            y: () => -window.innerHeight * 1.02,
          },
          0
        );
    },
    { scope: heroRef, dependencies: [isNight, reducedMotion] }
  );

  return (
    <header
      id="hero"
      ref={heroRef}
      data-tod={isNight ? "night" : "day"}
    >
      <div className="sun" />
      <Clouds />
      <Birds reducedMotion={reducedMotion} />

      <div className="hero-copy">
        <p className="hi">Halo, saya</p>
        <h1 id="name">
          {nameChars.map((ch, i) => (
            <span key={i} className="ch">
              {ch}
            </span>
          ))}
        </h1>
        <p className="role">{siteConfig.role}</p>
      </div>

      <div className="hint">Gulir untuk menyelam</div>
      <Tide />
    </header>
  );
}
