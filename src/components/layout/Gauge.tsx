"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { gaugeSections, depthZones } from "@/data/site";
import { formatNumberId } from "@/lib/math";

interface GaugeProps {
  onNavigate: (id: string) => void;
  reducedMotion?: boolean;
}

export default function Gauge({ onNavigate, reducedMotion = false }: GaugeProps) {
  const gaugeRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const surfRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);
  const zoneRef = useRef<HTMLElement>(null);
  const tipRef = useRef<HTMLElement>(null);

  const [activeSecIndex, setActiveSecIndex] = useState(0);

  useEffect(() => {
    const G = gaugeRef.current;
    const rail = railRef.current;
    const fill = fillRef.current;
    const surf = surfRef.current;
    const mark = markRef.current;
    const dot = dotRef.current;
    const num = numRef.current;
    const unit = unitRef.current;
    const zone = zoneRef.current;
    const tip = tipRef.current;

    if (!G || !rail || !fill || !surf || !mark || !dot || !num || !unit || !zone || !tip) return;

    const small = window.matchMedia("(max-width: 760px)");
    let H = window.innerHeight;
    let mx = 1;
    let he = 1;
    let railH = 1;
    let ys = [0, 0, 0, 0, 0];
    let disp = 3200;
    let my = 0;
    let currentZoneKey = "";
    let lastSign = 1;
    let peekTimeout: NodeJS.Timeout | null = null;

    const dots = rail.querySelectorAll<HTMLButtonElement>(".g-sec");

    const calc = () => {
      const hero = document.getElementById("hero");
      H = window.innerHeight;
      mx = Math.max(1, document.documentElement.scrollHeight - H);
      he = (hero?.offsetHeight || H) * 1.6;
      railH = rail.clientHeight;

      gaugeSections.forEach(({ id }, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const p = el.parentElement && el.parentElement.classList.contains("pin-spacer") ? el.parentElement : el;
        ys[i] = id === "hero" ? 0 : p.getBoundingClientRect().top + window.scrollY;
        if (dots[i]) {
          dots[i].style.top = `${Math.min(100, Math.max(0, (ys[i] / mx) * 100))}%`;
        }
      });

      surf.style.top = `${Math.min(100, (he / mx) * 100)}%`;
    };

    const triggerRipple = () => {
      if (reducedMotion) return;
      const rip = document.createElement("i");
      rip.className = "g-rip";
      dot.appendChild(rip);
      gsap.fromTo(
        rip,
        { scale: 0.3, opacity: 0.9 },
        {
          scale: 4.5,
          opacity: 0,
          duration: 1.1,
          ease: "power2.out",
          onComplete: () => rip.remove(),
        }
      );
    };

    const onFrame = () => {
      const y = window.scrollY;
      const p = Math.min(1, Math.max(0, y / mx));

      // Calculate altitude (+3200 to 0) or depth (0 to -1000)
      const v = y < he ? Math.round(3200 * (1 - y / he)) : -Math.round(((y - he) / Math.max(1, mx - he)) * 1000);

      disp += (v - disp) * (reducedMotion ? 1 : 0.14);
      if (Math.abs(v - disp) < 0.6) disp = v;
      const d = Math.round(disp);

      num.textContent = formatNumberId(d);
      unit.textContent = d > 5 ? "m di atas laut" : d > -5 ? "m, di permukaan" : "m di bawah laut";

      const z = depthZones.find((item) => item.matches(v)) || depthZones[3];

      if (z.key !== currentZoneKey) {
        const isFirst = !currentZoneKey;
        currentZoneKey = z.key;
        zone.textContent = z.title;
        tip.textContent = z.description;
        G.style.setProperty("--gc", z.color);

        if (!isFirst && !reducedMotion) {
          gsap.fromTo([zone, tip], { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 });
          gsap.fromTo(dot, { scale: 1.9 }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" });
          G.classList.add("peek");
          if (peekTimeout) clearTimeout(peekTimeout);
          peekTimeout = setTimeout(() => G.classList.remove("peek"), 2600);
        }
      }

      // Check crossing of sea surface (0m)
      const sign = v > 0 ? 1 : -1;
      if (sign !== lastSign) {
        lastSign = sign;
        triggerRipple();
      }

      const targetY = p * railH;
      my += (targetY - my) * (reducedMotion ? 1 : 0.2);

      if (!small.matches) {
        mark.style.transform = `translateY(${my}px)`;
      }

      fill.style.transform = `scaleY(${p})`;

      let activeIdx = 0;
      ys.forEach((posY, i) => {
        if (posY <= y + H * 0.45) activeIdx = i;
      });
      setActiveSecIndex(activeIdx);
    };

    const handleRailClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".g-sec")) return;

      const rect = rail.getBoundingClientRect();
      const clickRatio = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      const targetScroll = clickRatio * mx;
      window.scrollTo({ top: targetScroll, behavior: reducedMotion ? "auto" : "smooth" });
    };

    rail.addEventListener("click", handleRailClick);
    window.addEventListener("resize", calc);
    document.fonts?.ready.then(calc);
    ScrollTrigger.addEventListener("refresh", calc);

    calc();
    gsap.ticker.add(onFrame);

    return () => {
      rail.removeEventListener("click", handleRailClick);
      window.removeEventListener("resize", calc);
      ScrollTrigger.removeEventListener("refresh", calc);
      gsap.ticker.remove(onFrame);
      if (peekTimeout) clearTimeout(peekTimeout);
    };
  }, [reducedMotion]);

  return (
    <aside className="gauge" id="gauge" ref={gaugeRef} aria-label="Penunjuk ketinggian dan kedalaman">
      <div className="g-rail" id="gRail" ref={railRef}>
        <i className="g-fill" id="gFill" ref={fillRef} />
        <i className="g-surf" id="gSurf" ref={surfRef}>
          <em>Permukaan laut</em>
        </i>
        {gaugeSections.map((sec, i) => (
          <button
            key={sec.id}
            type="button"
            className={`g-sec ${activeSecIndex === i ? "on" : ""}`}
            data-go={sec.id}
            data-l={sec.label}
            aria-label={`Pergi ke ${sec.label}`}
            onClick={() => onNavigate(sec.id)}
          />
        ))}
      </div>

      <div className="g-mark" id="gMark" ref={markRef}>
        <span className="g-dot" ref={dotRef} />
        <div className="g-card">
          <b id="gNum" ref={numRef}>
            3.200
          </b>
          <span id="gUnit" ref={unitRef}>
            m di atas laut
          </span>
          <strong id="gZone" ref={zoneRef}>
            Di udara
          </strong>
          <small id="gTip" ref={tipRef} />
        </div>
      </div>
    </aside>
  );
}
