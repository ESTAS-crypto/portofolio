"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { siteConfig } from "@/data/site";
import Clouds from "@/components/fx/Clouds";
import Birds from "@/components/fx/Birds";
import Tide from "@/components/fx/Tide";
import RippleCanvas from "@/components/fx/RippleCanvas";
import SkyFx from "@/components/fx/SkyFx";
import CelestialBodies from "@/components/fx/CelestialBodies";
import TimePanel from "@/components/fx/TimePanel";

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

      // Sky gradient is now managed by SkyFx + skyEngine, so we only need
      // to animate the sun/celestial body downward and fade hero copy.
      tl.to(
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
    { scope: heroRef, dependencies: [reducedMotion, isNight], revertOnUpdate: true }
  );

  return (
    <header
      id="hero"
      ref={heroRef}
      data-tod={isNight ? "night" : "day"}
    >
      <SkyFx />
      <CelestialBodies reducedMotion={reducedMotion} />
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
      <RippleCanvas reducedMotion={reducedMotion} />
      <TimePanel reducedMotion={reducedMotion} />
    </header>
  );
}
