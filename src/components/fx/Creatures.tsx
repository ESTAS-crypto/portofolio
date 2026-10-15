"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { oceanStore } from "@/lib/oceanStore";
import { audioEngine } from "@/lib/audioEngine";
import { getOceanConfig } from "@/lib/oceanConfig";
import {
  WHALE_DATA,
  MEGALODON_DATA,
  CreatureData,
  buildDeformedPath,
  calcWaveOffset,
} from "@/lib/bezierDeform";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const UI_EXCLUDE_SELECTOR =
  "a, button, input, textarea, select, label, #portal, #nav, #menu, .gauge, .aud, .up";

interface ActiveCreature {
  el: HTMLDivElement;
  mega: boolean;
  dir: number;
  w: number;
  S: CreatureData;
  t0: number;
  dur: number;
  y0: number;
  fy: number;
  so: number;
  sos: number;
  boost: number;
  pulse: number;
  ph: number;
  pv: number;
  py: number;
  A: number;
  w2: number;
  b: SVGPathElement;
  f: SVGPathElement;
  e: SVGCircleElement;
  wd: HTMLElement;
}

export default function Creatures({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const whaleRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const whaleBodyRef = useRef<SVGPathElement>(null);
  const whaleFinRef = useRef<SVGPathElement>(null);
  const whaleEyeRef = useRef<SVGCircleElement>(null);

  const megaBodyRef = useRef<SVGPathElement>(null);
  const megaFinRef = useRef<SVGPathElement>(null);
  const megaEyeRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const bw = whaleRef.current;
    const bm = megaRef.current;
    const al = alertRef.current;
    const wb = whaleBodyRef.current;
    const wf = whaleFinRef.current;
    const we = whaleEyeRef.current;
    const mb = megaBodyRef.current;
    const mf = megaFinRef.current;
    const me = megaEyeRef.current;

    if (!bw || !bm || !al || !wb || !wf || !we || !mb || !mf || !me) return;

    const CFG = getOceanConfig();

    let cr: ActiveCreature | null = null;
    let nextRoll = 0;
    let cool = 0;
    let lastTime = 0;
    let mouseX = -999;
    let mouseY = -999;
    let lastScroll = window.scrollY;
    let seenMegalodonCount = 0;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const emitRings = (x: number, y: number, color: string) => {
      for (let i = 0; i < 3; i++) {
        const ring = document.createElement("i");
        ring.className = "ring";
        ring.style.cssText = `left:${x}px;top:${y}px;border-color:${color}`;
        document.body.appendChild(ring);
        gsap.fromTo(
          ring,
          { scale: 0.2, opacity: 0.8 },
          {
            scale: 4 + i,
            opacity: 0,
            duration: 1.6,
            delay: i * 0.35,
            ease: "power2.out",
            onComplete: () => ring.remove(),
          }
        );
      }
    };

    const emitBubbles = (x: number, y: number) => {
      for (let i = 0; i < 10; i++) {
        const bubble = document.createElement("i");
        const s = 5 + Math.random() * 9;
        bubble.className = "tb";
        bubble.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px`;
        document.body.appendChild(bubble);
        gsap.to(bubble, {
          x: (Math.random() - 0.5) * 90,
          y: -60 - Math.random() * 90,
          opacity: 0,
          scale: 1.5,
          duration: 1 + Math.random(),
          ease: "power1.out",
          onComplete: () => bubble.remove(),
        });
      }
    };

    const drawCreature = (c: ActiveCreature, t: number) => {
      const A = c.A * (1 + c.boost * 0.8);
      c.b.setAttribute("d", buildDeformedPath(c.S.body, t, A, c.w2));
      c.f.setAttribute("d", buildDeformedPath(c.S.fin, t, A, c.w2));
      c.e.setAttribute("cy", (c.S.eye[1] + calcWaveOffset(c.S.eye[0], t, A, c.w2)).toFixed(1));
    };

    const spawn = (kind: "whale" | "mega") => {
      const isMega = kind === "mega";
      const el = isMega ? bm : bw;
      const S = isMega ? MEGALODON_DATA : WHALE_DATA;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const w = Math.min(window.innerWidth * (isMega ? 0.95 : 0.8), isMega ? 1100 : 900);
      const H = window.innerHeight;
      const y0 = H * (isMega ? 0.3 + Math.random() * 0.25 : 0.2 + Math.random() * 0.35);

      el.style.width = `${w}px`;
      el.style.visibility = "visible";
      el.style.opacity = "0";

      cr = {
        el,
        mega: isMega,
        dir,
        w,
        S,
        t0: lastTime,
        dur: isMega ? 13 : 26,
        y0,
        fy: 0,
        so: 0,
        sos: 0,
        boost: 0,
        pulse: 0,
        ph: Math.random() * 6.28,
        pv: 0,
        py: y0,
        A: isMega ? 30 : 24,
        w2: isMega ? 3.2 : 1.9,
        b: isMega ? mb : wb,
        f: isMega ? mf : wf,
        e: isMega ? me : we,
        wd: el.firstElementChild as HTMLElement,
      };

      cr.e.setAttribute("cx", String(S.eye[0]));
      drawCreature(cr, lastTime);

      const spawnH = w * 0.377;
      const initialThreat = {
        x: (dir > 0 ? -w * 1.05 : window.innerWidth + w * 0.05) + w * 0.5,
        y: y0 + spawnH * 0.5,
        r: w * (isMega ? 0.45 : 0.3),
        mega: isMega,
      };
      oceanStore.setThreat(initialThreat);
      if (typeof window !== "undefined") {
        (window as unknown as { __threat?: typeof initialThreat }).__threat = initialThreat;
      }

      if (isMega) {
        seenMegalodonCount++;
        oceanStore.showToast(
          seenMegalodonCount > 1
            ? `Megalodon lagi! Sudah ${seenMegalodonCount}x kamu lihat.`
            : "Megalodon! Kamu beruntung melihatnya."
        );

        gsap.fromTo(
          al,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.7,
            yoyo: true,
            repeat: 3,
            ease: "sine.inOut",
            onComplete: () => {
              al.style.opacity = "0";
            },
          }
        );
        audioEngine.rumbleMegalodon();
      } else if (Math.random() < 0.5) {
        setTimeout(() => {
          if (cr && !cr.mega) {
            audioEngine.singWhale();
          }
        }, 3000);
      }
    };

    const end = () => {
      if (cr) {
        cr.el.style.visibility = "hidden";
        cr = null;
      }
      cool = lastTime + CFG.cooldownMin + Math.random() * (CFG.cooldownMax - CFG.cooldownMin);
      oceanStore.setThreat(null);
      if (typeof window !== "undefined") {
        (window as unknown as { __threat?: null }).__threat = null;
      }
    };

    const abort = () => {
      if (!cr) return;
      const el = cr.el;
      cr = null;
      oceanStore.setThreat(null);
      if (typeof window !== "undefined") {
        (window as unknown as { __threat?: null }).__threat = null;
      }
      cool = lastTime + 4;
      gsap.to(el, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          el.style.visibility = "hidden";
        },
      });
    };

    const step = (t: number, dy: number) => {
      if (!cr) return;
      const c = cr;
      const H = window.innerHeight;
      const p = (t - c.t0) / c.dur;
      if (p >= 1) {
        end();
        return;
      }

      const e = c.mega
        ? p < 0.5
          ? 2 * p * p
          : 1 - Math.pow(-2 * p + 2, 2) / 2
        : p;

      const x =
        c.dir > 0
          ? -c.w * 1.05 + (window.innerWidth + c.w * 1.1) * e
          : window.innerWidth + c.w * 0.05 - (window.innerWidth + c.w * 1.15) * e;

      c.so = (c.so - dy * 0.12) * 0.995;
      c.sos += (c.so - c.sos) * 0.08;
      c.boost *= 0.985;
      c.pulse *= 0.97;

      const h = c.w * 0.377;
      const follow =
        mouseY > -900
          ? clamp((mouseY - (c.y0 + h / 2)) * (c.mega ? 0.28 : 0.16), -H * 0.14, H * 0.14)
          : 0;
      c.fy += (follow - c.fy) * 0.025;

      const y = c.y0 + Math.sin(p * Math.PI * 2 * 1.4 + c.ph) * H * 0.035 + c.fy + c.sos;

      c.pv += (y - c.py - c.pv) * 0.08;
      c.py = y;

      const pitch = c.dir * clamp(c.pv * 14, -12, 12);

      c.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      if (c.wd) {
        c.wd.style.transform = `rotate(${pitch.toFixed(2)}deg) scaleX(${c.dir > 0 ? -1 : 1})`;
      }

      drawCreature(c, t);

      const f = Math.min(1, (p * c.dur) / 2.5, ((1 - p) * c.dur) / 2.5);
      c.el.style.opacity = (f * f * (3 - 2 * f) * (c.mega ? 0.55 : 0.3)).toFixed(3);

      const threatObj = {
        x: x + c.w * 0.5,
        y: y + h * 0.5,
        r: c.w * (c.mega ? 0.45 : 0.3) * (1 + c.pulse * 0.6),
        mega: c.mega,
      };
      oceanStore.setThreat(threatObj);
      if (typeof window !== "undefined") {
        (window as unknown as { __threat?: typeof threatObj }).__threat = threatObj;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!cr) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest(UI_EXCLUDE_SELECTOR)) return;

      const r = cr.el.getBoundingClientRect();
      if (
        e.clientX < r.left + r.width * 0.04 ||
        e.clientX > r.left + r.width * 0.96 ||
        e.clientY < r.top + r.height * 0.12 ||
        e.clientY > r.top + r.height * 0.88
      ) {
        return;
      }

      const headX = cr.dir < 0 ? r.left + r.width * 0.07 : r.right - r.width * 0.07;
      const headY = r.top + r.height * 0.5;

      cr.boost = 1;
      emitBubbles(e.clientX, e.clientY);

      if (cr.mega) {
        cr.pulse = 1;
        emitRings(headX, headY, "rgba(255,90,90,0.85)");
        audioEngine.rumbleMegalodon();
        oceanStore.showToast("Grrr! Jangan diganggu.");
      } else {
        emitRings(headX, headY, "rgba(160,220,255,0.85)");
        audioEngine.singWhale();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);

    const onTick = (t: number) => {
      lastTime = t;
      const sy = window.scrollY;
      const dy = sy - lastScroll;
      lastScroll = sy;

      const v = oceanStore.getDepth();
      const m = Math.max(0, -v);
      const calm = oceanStore.isCalm();

      if (cr && (m < 100 || calm)) {
        abort();
      }

      if (cr) {
        step(t, dy);
      } else {
        oceanStore.setThreat(null);
      }

      if (cr || calm || document.hidden || m < CFG.whaleDepth || t < nextRoll || t < cool) {
        return;
      }

      nextRoll = t + CFG.rollMin + Math.random() * (CFG.rollMax - CFG.rollMin);
      const r = Math.random();

      if (m >= CFG.megaDepth && r < CFG.megaChance) {
        spawn("mega");
      } else if (r < CFG.megaChance + CFG.whaleChance) {
        spawn("whale");
      }
    };

    gsap.ticker.add(onTick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      gsap.ticker.remove(onTick);
      oceanStore.setThreat(null);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      <div className="alert" id="alert" ref={alertRef} aria-hidden="true" />

      {/* Paus Siluet SVG */}
      <div className="beast" id="wlW" ref={whaleRef} aria-hidden="true">
        <div className="wd">
          <svg className="wi" viewBox="0 0 610 230">
            <defs>
              <linearGradient id="wg3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5fb2e8" />
                <stop offset="1" stopColor="#2a78b8" />
              </linearGradient>
            </defs>
            <path id="wlWb" ref={whaleBodyRef} fill="url(#wg3)" />
            <path id="wlWf" ref={whaleFinRef} fill="#2a78b8" />
            <circle id="wlWe" ref={whaleEyeRef} cy="112" r="5" fill="#cfe6f7" />
          </svg>
        </div>
      </div>

      {/* Megalodon Siluet SVG */}
      <div className="beast" id="wlM" ref={megaRef} aria-hidden="true">
        <div className="wd">
          <svg className="wi" viewBox="0 0 610 230">
            <defs>
              <linearGradient id="mg3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7fa3c0" />
                <stop offset="1" stopColor="#2c4e6b" />
              </linearGradient>
            </defs>
            <path id="wlMb" ref={megaBodyRef} fill="url(#mg3)" />
            <path id="wlMf" ref={megaFinRef} fill="#2c4e6b" />
            <circle id="wlMe" ref={megaEyeRef} cy="108" r="5" fill="#ff5a5a" />
          </svg>
        </div>
      </div>
    </>
  );
}
