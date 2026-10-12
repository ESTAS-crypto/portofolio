"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface Ripple {
  x: number;
  y: number;
  t: number;
  m: number; // scale multiplier
}

export default function RippleCanvas({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const rc = canvasRef.current;
    const hero = document.getElementById("hero");
    if (!rc || !hero) return;

    const ctx = rc.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    const R: Ripple[] = [];
    let lx = -99;
    let ly = -99;

    const handleResize = () => {
      W = hero.clientWidth;
      H = hero.clientHeight;
      rc.width = W * dpr;
      rc.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const getLocalPos = (e: PointerEvent): [number, number] => {
      const b = hero.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    };

    const handlePointerMove = (e: PointerEvent) => {
      const [px, py] = getLocalPos(e);
      if (py < H * 0.8 || py > H * 0.97) return;

      if (Math.hypot(px - lx, py - ly) > 26) {
        lx = px;
        ly = py;
        R.push({ x: px, y: py, t: 0, m: 1 });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const [px, py] = getLocalPos(e);
      if (py < H * 0.8 || py > H * 0.97) return;

      for (let i = 0; i < 3; i++) {
        R.push({ x: px, y: py, t: -i * 0.18, m: 1.7 });
      }
    };

    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerdown", handlePointerDown);

    const onTick = () => {
      const op = Math.max(0, 1 - window.scrollY / (H * 0.35));
      rc.style.opacity = op.toFixed(2);

      if (op < 0.01 && !R.length) return;

      ctx.clearRect(0, 0, W, H);

      for (let i = R.length - 1; i >= 0; i--) {
        const r = R[i];
        r.t += 0.017;
        if (r.t < 0) continue;

        const k = r.t / 1.4;
        if (k >= 1) {
          R.splice(i, 1);
          continue;
        }

        const rad = k * 90 * r.m;

        // Cincin luar
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - k) * 0.55})`;
        ctx.lineWidth = 2 * (1 - k) + 0.5;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rad, rad * 0.26, 0, 0, 6.283);
        ctx.stroke();

        // Cincin dalam
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - k) * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rad * 0.6, rad * 0.16, 0, 0, 6.283);
        ctx.stroke();
      }
    };

    gsap.ticker.add(onTick);

    return () => {
      window.removeEventListener("resize", handleResize);
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerdown", handlePointerDown);
      gsap.ticker.remove(onTick);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return <canvas id="ripl" className="ripl" ref={canvasRef} aria-hidden="true" />;
}
