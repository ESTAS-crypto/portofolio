"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { oceanStore } from "@/lib/oceanStore";
import { audioEngine } from "@/lib/audioEngine";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const rnd = Math.random;

const UI_EXCLUDE_SELECTOR =
  "a, button, input, textarea, select, label, #portal, #nav, #menu, .gauge, .aud, .up";

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  p: number;
  b: number; // burst
  e: number; // eating golden glow
}

interface Jelly {
  x: number;
  y: number;
  hx: number;
  z: number;
  ph: number;
  h: number;
  vx: number;
  vy: number;
  g: number;   // glow
  f: number;   // flash
  jet: number;
}

interface Pellet {
  x: number;
  y: number;
  vy: number;
  l: number; // life (seconds)
  w: number; // phase
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  l: number; // life
  h: number; // hue
}

let hasShownReefHint = false;

export default function ReefCanvas({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const cv = canvasRef.current;
    if (!cv) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = window.innerWidth;
    let H = window.innerHeight;

    const getFishCount = (w: number) => {
      if (w < 640) return 22; // Mobile: dinaikkan dari 12 ke 22
      if (w < 1024) return 38; // Tablet: dinaikkan dari 18 ke 38
      if (w < 1440) return 56; // Laptop: dinaikkan dari 26 ke 56
      return 68; // Desktop lebar
    };

    const NJ = W < 640 ? 4 : W < 1100 ? 5 : 7;

    const F: Fish[] = [];
    const Jl: Jelly[] = [];
    const P: Pellet[] = [];
    const S: Spark[] = [];

    const updateHomes = () => {
      Jl.forEach((j, i) => {
        j.hx = ((i + 0.5) / Jl.length) * W;
      });
    };

    const syncFishCount = () => {
      const targetNF = getFishCount(W);
      while (F.length < targetNF) {
        F.push({
          x: rnd() * W,
          y: rnd() * H,
          vx: rnd() * 2 - 1,
          vy: rnd() * 2 - 1,
          s: 0.55 + rnd() * 0.45,
          p: rnd() * 6.28,
          b: 0,
          e: 0,
        });
      }
      if (F.length > targetNF) {
        F.length = targetNF;
      }
    };

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateHomes();
      syncFishCount();
    };

    const initialNF = getFishCount(W);
    for (let i = 0; i < initialNF; i++) {
      F.push({
        x: rnd() * W,
        y: rnd() * H,
        vx: rnd() * 2 - 1,
        vy: rnd() * 2 - 1,
        s: 0.55 + rnd() * 0.45,
        p: rnd() * 6.28,
        b: 0,
        e: 0,
      });
    }

    for (let i = 0; i < NJ; i++) {
      Jl.push({
        x: ((i + 0.5) / NJ) * W + (rnd() - 0.5) * (W / NJ) * 0.6,
        y: H * (0.15 + rnd() * 0.8),
        hx: 0,
        z: 0.55 + rnd() * 0.7,
        ph: rnd() * 6.28,
        h: 185 + rnd() * 115,
        vx: 0,
        vy: 0,
        g: 0,
        f: 0,
        jet: 0,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    let mouseX = -999;
    let mouseY = -999;
    let prevMouseX = -999;
    let prevMouseY = -999;
    let cursorSpeed = 0;
    let fishAlpha = 0;
    let jellyAlpha = 0;
    let lastScroll = window.scrollY;
    let lastTime = 0;
    let grab: { j: Jelly; ox: number; oy: number } | null = null;
    let lastSparkTime = 0;

    const getRadius = (j: Jelly) => 34 * j.z;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const emitSparks = (x: number, y: number, h: number, count: number, speed: number) => {
      for (let i = 0; i < count && S.length < 260; i++) {
        S.push({
          x,
          y,
          vx: (rnd() - 0.5) * speed,
          vy: (rnd() - 0.5) * speed,
          l: 1,
          h,
        });
      }
    };

    const triggerZap = (jelly: Jelly) => {
      jelly.f = 1.4;
      jelly.jet = 1;
      jelly.vy -= 2.6 * jelly.z;
      emitSparks(jelly.x, jelly.y, jelly.h, 14, 3);

      Jl.forEach((other) => {
        if (other !== jelly) {
          const dist = Math.hypot(other.x - jelly.x, other.y - jelly.y);
          setTimeout(() => {
            other.f = Math.max(other.f, 0.9);
          }, dist * 1.1);
        }
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      if (fishAlpha < 0.15 && jellyAlpha < 0.15) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest(UI_EXCLUDE_SELECTOR)) return;

      const px = e.clientX;
      const py = e.clientY;

      // Klik pada ubur-ubur
      if (jellyAlpha > 0.3) {
        for (const j of Jl) {
          if (Math.hypot(j.x - px, j.y - py) < getRadius(j) * 1.5) {
            triggerZap(j);
            if (e.pointerType !== "touch") {
              grab = { j, ox: j.x - px, oy: j.y - py };
              document.body.style.userSelect = "none";
            }
            return;
          }
        }
      }

      // Klik air untuk melempar 4 butir makanan ikan (hanya saat berada di bawah laut)
      const currentV = oceanStore.getDepth();
      if (fishAlpha > 0.2 && currentV < 0 && !oceanStore.isCalm()) {
        audioEngine.pop(460 + rnd() * 80, 0.4);
        for (let i = 0; i < 4; i++) {
          P.push({
            x: px + (rnd() - 0.5) * 26,
            y: py + (rnd() - 0.5) * 10,
            vy: 0.4 + rnd() * 0.3,
            l: 9,
            w: rnd() * 6.28,
          });
        }
      }
    };

    const onPointerUp = () => {
      if (grab) {
        grab = null;
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    const onTick = (t: number) => {
      const dt = Math.min(0.05, t - lastTime);
      lastTime = t;

      const sy = window.scrollY;
      const dy = sy - lastScroll;
      lastScroll = sy;

      const v = oceanStore.getDepth();
      const calm = oceanStore.isCalm();

      // Jika berada di daratan / udara (v >= 0), mode tenang, atau tab tidak aktif:
      // Segera kosongkan butiran makanan ikan, percikan ubur-ubur, dan bersihkan kanvas seketika!
      if (v >= 0 || calm || document.hidden) {
        if (P.length > 0) P.length = 0;
        if (S.length > 0) S.length = 0;
        if (fishAlpha > 0 || jellyAlpha > 0) {
          fishAlpha = 0;
          jellyAlpha = 0;
          ctx.clearRect(0, 0, W, H);
        }
        return;
      }

      // Saat di dalam air: respon fade-out cepat saat scroll ke atas, fade-in halus saat menyelam
      const targetFishAlpha = clamp(-v / 120, 0, 1);
      const targetJellyAlpha = clamp((-v - 150) / 150, 0, 1);
      const fadeSpeed = dy < 0 ? 0.32 : 0.12;

      fishAlpha += (targetFishAlpha - fishAlpha) * fadeSpeed;
      jellyAlpha += (targetJellyAlpha - jellyAlpha) * fadeSpeed;

      if (fishAlpha < 0.01 && jellyAlpha < 0.01) {
        if (P.length > 0) P.length = 0;
        ctx.clearRect(0, 0, W, H);
        return;
      }

      if (jellyAlpha > 0.5 && !hasShownReefHint) {
        hasShownReefHint = true;
        oceanStore.showToast("Coba sentuh dan tarik ubur-ubur. Klik air untuk memberi makan ikan.");
      }

      cursorSpeed += (Math.min(60, Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY)) - cursorSpeed) * 0.3;
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      // 1. Gambar Makanan Ikan (Pellets)
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.l -= dt;
        p.y += p.vy;
        p.x += Math.sin(t * 2 + p.w) * 0.25;

        if (p.l <= 0 || p.y > H + 10) {
          P.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(255, 226, 150, ${Math.min(1, p.l) * 0.9 * fishAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 6.283);
        ctx.fill();
      }

      const depth = clamp(-v / 1000, 0, 1);
      const threat = oceanStore.getThreat();

      // 2. Simulasi Ikan (Boids + Feeding)
      for (const a of F) {
        let ax = 0;
        let ay = 0;
        let cx = 0;
        let cy = 0;
        let vxs = 0;
        let vys = 0;
        let count = 0;
        let sx = 0;
        let sy2 = 0;

        for (const b of F) {
          if (a === b) continue;
          const dx = b.x - a.x;
          const dd = b.y - a.y;
          const d2 = dx * dx + dd * dd;
          if (d2 < 5600) {
            count++;
            cx += b.x;
            cy += b.y;
            vxs += b.vx;
            vys += b.vy;
            if (d2 < 500) {
              sx -= dx;
              sy2 -= dd;
            }
          }
        }

        if (count > 0) {
          ax += (cx / count - a.x) * 0.0016 + (vxs / count - a.vx) * 0.05 + sx * 0.012;
          ay += (cy / count - a.y) * 0.0016 + (vys / count - a.vy) * 0.05 + sy2 * 0.012;
        }

        // Mengejar makanan jika ada
        let bestPellet: Pellet | null = null;
        let bestDist = 420;
        for (const pellet of P) {
          const dist = Math.hypot(pellet.x - a.x, pellet.y - a.y);
          if (dist < bestDist) {
            bestDist = dist;
            bestPellet = pellet;
          }
        }

        if (bestPellet) {
          const dd = Math.max(bestDist, 1);
          ax += ((bestPellet.x - a.x) / dd) * 0.09;
          ay += ((bestPellet.y - a.y) / dd) * 0.09;
          if (bestDist < 12) {
            const idx = P.indexOf(bestPellet);
            if (idx !== -1) P.splice(idx, 1);
            a.e = 1;
            a.b = 0.6;
            emitSparks(a.x, a.y, 45, 5, 2);
          }
        }

        const mdx = mouseX - a.x;
        const mdy = mouseY - a.y;
        const md = Math.hypot(mdx, mdy) || 1;

        if (!bestPellet) {
          if (cursorSpeed > 16 && md < 170) {
            ax -= (mdx / md) * 0.5;
            ay -= (mdy / md) * 0.5;
            a.b = Math.max(a.b, 0.5);
          } else if (md < 380) {
            const k = md < 130 ? -0.5 : 0.9;
            ax += (mdx / md) * k * 0.03;
            ay += (mdy / md) * k * 0.03;
            if (md < 220) {
              ax += (-mdy / md) * 0.035;
              ay += (mdx / md) * 0.035;
            }
          }
        }

        ay -= dy * 0.03;
        a.vx += ax;
        a.vy += ay;

        // Reaksi ancaman dari paus / megalodon
        if (threat) {
          const tx = a.x - threat.x;
          const ty = a.y - threat.y;
          const td = Math.hypot(tx, ty) || 1;
          if (td < threat.r) {
            a.vx += (tx / td) * 0.5;
            a.vy += (ty / td) * 0.5;
            a.b = Math.max(a.b, 0.6);
          }
        }

        const speed = Math.hypot(a.vx, a.vy) || 1;
        const limit = (bestPellet ? 3.4 : 2) + a.b * 6;
        a.b *= 0.96;
        a.e *= 0.95;

        if (speed > limit) {
          a.vx *= limit / speed;
          a.vy *= limit / speed;
        } else if (speed < 0.7) {
          a.vx *= 0.7 / speed;
          a.vy *= 0.7 / speed;
        }

        a.x += a.vx;
        a.y += a.vy;

        // Wrap tepi layar
        if (a.x < -20) a.x = W + 20;
        if (a.x > W + 20) a.x = -20;
        if (a.y < -20) a.y = H + 20;
        if (a.y > H + 20) a.y = -20;

        const angle = Math.atan2(a.vy, a.vx);
        const waggle = Math.sin(t * 9 + a.p) * 2.2;

        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(angle);
        ctx.scale(a.s, a.s);
        ctx.fillStyle = `hsla(${185 + depth * 70}, 88%, ${72 - depth * 22 + a.e * 18}%, ${Math.min(1, 0.72 * fishAlpha + a.e * 0.45)})`;

        // Badan ikan
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 3.6, 0, 0, 6.283);
        ctx.fill();

        // Ekor ikan
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(-14, -4 + waggle);
        ctx.lineTo(-14, 4 + waggle);
        ctx.fill();
        ctx.restore();
      }

      // 3. Simulasi Ubur-Ubur (Lighter Blending)
      ctx.globalCompositeOperation = "lighter";

      if (jellyAlpha > 0.3 && cursorSpeed > 5 && t - lastSparkTime > 0.05 && Jl.some((j) => j.g > 0.15)) {
        lastSparkTime = t;
        emitSparks(mouseX, mouseY, 190 + rnd() * 100, 1, 0.8);
      }

      for (const j of Jl) {
        const r = getRadius(j);
        const dm = Math.hypot(mouseX - j.x, mouseY - j.y);

        j.g += ((dm < 300 ? 1 - dm / 300 : 0) - j.g) * 0.07;
        j.f *= 0.94;
        j.jet *= 0.95;
        j.ph += dt * (1.6 + 2 * j.g + 3 * j.jet);
        const pulse = Math.sin(j.ph) * 0.5 + 0.5;

        if (grab && grab.j === j) {
          const targetX = mouseX + grab.ox;
          const targetY = mouseY + grab.oy;
          j.vx = (targetX - j.x) * 0.3;
          j.vy = (targetY - j.y) * 0.3;
          j.x += j.vx;
          j.y += j.vy;
        } else {
          if (dm < 440 && dm > 40) {
            j.vx += ((mouseX - j.x) / dm) * 0.004 * (j.g + 0.15);
          }
          j.vx += (j.hx - j.x) * 0.0004 + Math.sin(t * 0.2 + j.z * 7) * 0.004;
          j.vx *= 0.985;
          j.vy *= 0.97;
          j.x += j.vx;
          j.y += j.vy - (0.14 + 0.5 * (1 - pulse)) * j.z - dy * 0.3 * j.z;
        }

        if (j.y < -r * 4) {
          j.y = H + r * 3;
          j.x = j.hx + (rnd() - 0.5) * (W / Jl.length) * 0.6;
          j.vx = 0;
        }
        if (j.y > H + r * 6) j.y = -r * 3;
        j.x = clamp(j.x, -r * 4, W + r * 4);

        const intensity = (0.3 + 0.5 * j.g + 0.7 * j.f) * jellyAlpha * (0.6 + 0.4 * j.z);
        const scaleX = 1 + 0.14 * pulse;
        const scaleY = 1 - 0.12 * pulse;
        const bias = clamp((mouseX - j.x) / 200, -1, 1) * j.g * r * 0.5;

        // Aura radial luar
        const auraGrad = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, r * 3);
        auraGrad.addColorStop(0, `hsla(${j.h}, 95%, 65%, ${intensity * 0.22})`);
        auraGrad.addColorStop(1, `hsla(${j.h}, 95%, 60%, 0)`);
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(j.x, j.y, r * 3, 0, 6.283);
        ctx.fill();

        // 6 Tentakel bergelombang
        ctx.strokeStyle = `hsla(${j.h}, 90%, 72%, ${intensity * 0.55})`;
        ctx.lineWidth = 1.6 * j.z;

        for (let k = 0; k < 6; k++) {
          const x0 = j.x + (-0.7 + k * 0.28) * r * scaleX;
          ctx.beginPath();
          ctx.moveTo(x0, j.y + r * 0.05);

          for (let s = 1; s <= 3; s++) {
            const f = s / 3;
            const sway = Math.sin(t * 1.4 + j.ph * 0.6 + k * 0.8 + s * 1.1) * r * 0.28 * (f + 0.2) + bias * f;
            ctx.quadraticCurveTo(
              x0 + sway * 1.4,
              j.y + r * 0.05 + r * 2.2 * f - r * 0.35,
              x0 + sway,
              j.y + r * 0.05 + r * 2.2 * f
            );
          }
          ctx.stroke();
        }

        // Lonceng elips ubur-ubur
        const bellGrad = ctx.createRadialGradient(j.x, j.y - r * 0.25, r * 0.1, j.x, j.y, r * 1.1);
        bellGrad.addColorStop(0, `hsla(${j.h}, 95%, 80%, ${intensity * 0.9})`);
        bellGrad.addColorStop(1, `hsla(${j.h}, 95%, 55%, ${intensity * 0.12})`);
        ctx.fillStyle = bellGrad;
        ctx.beginPath();
        ctx.ellipse(j.x, j.y, r * scaleX, r * scaleY, 0, Math.PI, 0);
        ctx.quadraticCurveTo(j.x, j.y + r * 0.4 * scaleY, j.x - r * scaleX, j.y);
        ctx.fill();
      }

      // 4. Percikan Plankton & Zap
      for (let i = S.length - 1; i >= 0; i--) {
        const s = S[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.97;
        s.vy *= 0.97;
        s.l -= dt * 0.9;
        if (s.l <= 0) {
          S.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `hsla(${s.h}, 100%, 75%, ${s.l * Math.max(fishAlpha, jellyAlpha)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, 6.283);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    gsap.ticker.add(onTick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      gsap.ticker.remove(onTick);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return <canvas id="reef" ref={canvasRef} aria-hidden="true" />;
}
