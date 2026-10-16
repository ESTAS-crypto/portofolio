"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { oceanStore, SeasonName, WeatherMode } from "@/lib/oceanStore";
import { audioEngine } from "@/lib/audioEngine";
import { getOceanContext } from "@/lib/oceanSurface";
import { skyEngine } from "@/lib/skyTimeEngine";

interface WeatherCanvasProps {
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  p: number;
  c: number;
  r: number;
  wx: number;
  wy: number;
  fl?: number;
}

interface Ripple {
  x: number;
  t: number;
}

interface Spark {
  x: number;
  y: number;
  t: number;
  d: number;
}

interface Cloud {
  x: number;
  y: number;
  s: number;
  v: number;
}

interface LightningBolt {
  pts: [number, number][];
  br: [number, number][][];
  t: number;
}

const SE: SeasonName[] = ["cerah", "kemarau", "hujan", "salju", "gugur", "semi"];
const LB: Record<SeasonName, string> = {
  cerah: "Cerah",
  kemarau: "Kemarau",
  hujan: "Hujan",
  salju: "Salju",
  gugur: "Gugur",
  semi: "Semi",
};

const HINT: Partial<Record<SeasonName, string>> = {
  kemarau: "ketuk langit untuk kilatan",
  hujan: "ketuk langit untuk kilat",
  salju: "gerakkan kursor meniup salju",
  gugur: "gerakkan kursor meniup daun",
  semi: "gerakkan kursor meniup kelopak",
};

const TINT: Record<string, [number, number, number, number]> = {
  kemarau: [255, 170, 70, 0.17],
  hujan: [55, 75, 105, 0.34],
  salju: [185, 212, 255, 0.17],
  gugur: [255, 140, 50, 0.14],
  semi: [255, 175, 205, 0.1],
};

const LC = ["#e8742a", "#c9461d", "#f2a93b", "#9c5a2b"];
const PC = ["#ffc2d4", "#ff9fbd", "#ffe0ea"];

const rnd = Math.random;
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ss = (a: number, b: number, x: number) => {
  const t = cl((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const mk = <T,>(n: number, f: (idx: number) => T): T[] => Array.from({ length: n }, (_, i) => f(i));

const AU3: SeasonName[] = ["cerah", "kemarau", "hujan"];
const MW: (number[] | null)[] = [
  null,
  [0.33, 0, 0.67],
  [0.3, 0, 0.7],
  [0.45, 0.05, 0.5],
  [0.55, 0.15, 0.3],
  [0.5, 0.3, 0.2],
  [0.3, 0.65, 0.05],
  [0.25, 0.72, 0.03],
  [0.25, 0.72, 0.03],
  [0.35, 0.55, 0.1],
  [0.55, 0.15, 0.3],
  [0.4, 0.05, 0.55],
  [0.33, 0, 0.67],
];

export default function WeatherCanvas({ reducedMotion = false }: WeatherCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const hero = document.getElementById("hero");
    if (!hero) return;

    let W = hero.clientWidth;
    let H = hero.clientHeight;

    const size = () => {
      W = hero.clientWidth;
      H = hero.clientHeight;
      cv.width = W;
      cv.height = H;
    };
    size();

    window.addEventListener("resize", size);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(size);
      ro.observe(hero);
    }

    let mode: WeatherMode = "auto";
    let cur: SeasonName = "cerah";

    try {
      const saved = localStorage.getItem("season") as WeatherMode | null;
      if (saved && (saved === "auto" || SE.includes(saved as SeasonName))) {
        mode = saved;
      }
    } catch (_) {}

    const AW = { left: 0 };
    const RW: { ok: boolean; code: number | null; t: number } = { ok: false, code: null, t: 0 };

    function mapW(code: number, m?: number): SeasonName {
      m = m || new Date().getMonth() + 1;
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
        return "hujan";
      }
      if ((code === 0 || code === 1) && m >= 6 && m <= 9) {
        return "kemarau";
      }
      return "cerah";
    }

    function pickAuto(first = false): SeasonName {
      if (RW.ok && RW.code != null) {
        AW.left = 900;
        return mapW(RW.code);
      }
      const m = new Date().getMonth() + 1;
      const wt = (MW[m] || [0.4, 0.3, 0.3]).slice();
      const h = skyEngine.sky.hour || 12;

      wt[2] *= h >= 13 && h < 19 ? 1.5 : h >= 6 && h < 10 ? 0.5 : 1;
      if (cur === "kemarau") wt[2] = 0;
      if (cur === "hujan") wt[1] = 0;
      if (!first && AU3.includes(cur)) wt[AU3.indexOf(cur)] *= 0.25;

      const sum = wt[0] + wt[1] + wt[2];
      let r = rnd() * sum;
      let i = 0;
      while (i < 2 && r > wt[i]) {
        r -= wt[i];
        i++;
      }
      const nx = AU3[i] || "cerah";
      AW.left = nx === "hujan" ? 60 + rnd() * 70 : 70 + rnd() * 90;
      return nx;
    }

    if (mode === "auto") {
      cur = pickAuto(true);
    } else {
      cur = mode as SeasonName;
    }

    oceanStore.setSeason(cur);
    oceanStore.setWeatherMode(mode);

    const w: Record<string, number> = {};
    SE.forEach((s) => (w[s] = s === cur ? 1 : 0));

    const P = (): Particle => ({
      x: rnd() * (W || 1200),
      y: rnd() * ((H || 800) * 0.7),
      z: 0.5 + rnd() * 0.9,
      p: rnd() * 6.3,
      c: (rnd() * 4) | 0,
      r: rnd() * 6,
      wx: 0,
      wy: 0,
    });

    const rain = mk(150, P);
    const snow = mk(110, P);
    const lf = mk(30, P);
    const pt = mk(44, P);
    const dust = mk(36, P);
    const rip: Ripple[] = [];
    const spk: Spark[] = [];
    const cld: Cloud[] = mk(7, (i) => ({
      x: i / 7,
      y: 0.03 + rnd() * 0.2,
      s: 0.16 + rnd() * 0.12,
      v: 6 + rnd() * 8,
    }));
    const L = { next: 6 + rnd() * 8, f: 0, d: 0, cool: 0 };
    const B: LightningBolt[] = [];
    const S = { flare: 0, gust: 0, mx: -999, my: -999, vx: 0, vy: 0, t: 0, on: false };

    let HT = 0;
    let WL = (x: number) => {
      const oc = getOceanContext();
      if (!oc) return HT;
      return HT + oc.surf(cl(x, 0, W), oc.frac(performance.now() / 1000));
    };

    function setCur(s: SeasonName) {
      cur = s;
      oceanStore.setSeason(s);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ocean:season", { detail: s }));
      }
    }

    function hintToast(s: SeasonName, src?: string) {
      let seen: Record<string, number> = {};
      try {
        seen = JSON.parse(localStorage.getItem("seasonHints") || "{}");
      } catch (_) {}

      const first = !seen[s] && HINT[s];
      if (src === "key" || first) {
        let h = first ? HINT[s] || "" : "";
        if (h && window.matchMedia("(pointer: coarse)").matches) {
          h = h.replace("gerakkan kursor", "geser jari");
        }
        oceanStore.toast(LB[s] + (h ? ` · ${h}` : ""), { p: 0 });
      }
      if (first) {
        seen[s] = 1;
        try {
          localStorage.setItem("seasonHints", JSON.stringify(seen));
        } catch (_) {}
      }
    }

    function setMode(s: WeatherMode, quiet = false, src?: string) {
      mode = s;
      oceanStore.setWeatherMode(s);
      try {
        localStorage.setItem("season", s);
      } catch (_) {}

      if (s === "auto") {
        setCur(pickAuto(true));
        if (!quiet && src === "key") oceanStore.toast("Cuaca otomatis", { p: 0 });
      } else {
        setCur(s as SeasonName);
        if (!quiet) hintToast(s as SeasonName, src);
      }
      if (!quiet) audioEngine.seasonSfx(cur);
    }

    // Listener for custom events from TimePanel or elsewhere
    const handleSetSeasonEvent = (e: Event) => {
      const detail = (e as CustomEvent<WeatherMode>).detail;
      if (detail) setMode(detail, false, "event");
    };
    window.addEventListener("ocean:set-mode", handleSetSeasonEvent);

    // Weather API update listener (F18)
    const handleWeatherUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ code: number }>).detail;
      if (detail && typeof detail.code === "number") {
        RW.ok = true;
        RW.code = detail.code;
        RW.t = Date.now();
        if (mode === "auto") {
          const nx = mapW(detail.code);
          if (nx !== cur) setCur(nx);
          AW.left = 900;
        }
      }
    };
    window.addEventListener("ocean:weather-update", handleWeatherUpdate);

    // Keyboard shortcut 'S'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== "s") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      const portal = document.getElementById("portal");
      if (portal && !portal.hidden) return;

      const L2: WeatherMode[] = ["auto", ...SE];
      const idx = L2.indexOf(mode);
      const nextMode = L2[(idx + 1) % L2.length];
      setMode(nextMode, false, "key");
    };
    window.addEventListener("keydown", handleKeyDown);

    // Interactive pointer movement & tap
    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(8, now - S.t) / 1000;
      if (S.mx > -900) {
        S.vx = cl((e.clientX - S.mx) / dt, -2500, 2500);
        S.vy = cl((e.clientY - S.my) / dt, -2500, 2500);
      }
      S.mx = e.clientX;
      S.my = e.clientY;
      S.t = now;
      S.on = true;
    };

    const handlePointerLeave = () => {
      S.on = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    const wind = (arr: Particle[], cx: number, cy: number, vx: number, vy: number, r: number, k: number) => {
      for (const p of arr) {
        if (p.y == null) continue;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy);
        if (d < r) {
          const f = (1 - d / r) * k;
          p.wx = cl(p.wx + vx * f * 0.0035, -460, 460);
          p.wy = cl(p.wy + vy * f * 0.0035, -360, 360);
        }
      }
    };

    const burst = (arr: Particle[], cx: number, cy: number, r: number, s: number, up?: number) => {
      for (const p of arr) {
        if (p.y == null) continue;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy);
        if (d < r) {
          const f = 1 - d / r;
          const a = Math.atan2(dy, dx);
          p.wx += Math.cos(a) * s * f;
          p.wy += Math.sin(a) * s * f - (up ? s * 0.6 * f : 0);
        }
      }
    };

    function strike(x: number) {
      const oc = getOceanContext();
      const f = oc ? oc.frac(performance.now() / 1000) : 0;
      const y1 = WL(x);
      const pts: [number, number][] = [[x, -10]];
      let cx0 = x;
      let cy0 = -10;
      for (let i = 0; i < 10; i++) {
        cy0 += ((y1 + 10) / 10) * (0.8 + rnd() * 0.4);
        cx0 += (rnd() - 0.5) * 60;
        pts.push([cx0, Math.min(cy0, y1)]);
      }
      pts[10] = [cx0, y1];

      const br: [number, number][][] = [];
      for (let k = 0; k < 3; k++) {
        const s = pts[2 + ((rnd() * 6) | 0)];
        const q: [number, number][] = [s];
        let bx = s[0];
        let by = s[1];
        const dir = rnd() < 0.5 ? -1 : 1;
        for (let j = 0; j < 4; j++) {
          bx += dir * (10 + rnd() * 22);
          by += 14 + rnd() * 22;
          q.push([bx, by]);
        }
        br.push(q);
      }

      B.push({ pts, br, t: 0 });
      L.f = 1;
      L.d = rnd() < 0.5 ? 1 : 0;
      L.cool = 1.4;
      const d = cl(0.25 + (Math.abs(x - W / 2) / W) * 1.1 + rnd() * 0.4, 0.2, 1.6);

      if (oc && oc.splash) {
        try {
          oc.splash(cl(x, 0, W), oc.surf(cl(x, 0, W), f), false, true);
        } catch (_) {}
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ocean:thunder", { detail: { delay: d } }));
      }
      audioEngine.oneShot("thunder", { d });
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (reducedMotion || cur === "cerah") return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest && t.closest("a,button,input,select,textarea,[role=button],.todx,#nav,#menu,.gauge,.aud,.up,#portal")) {
        return;
      }
      const hr = hero.getBoundingClientRect();
      const x = e.clientX - hr.left;
      const y = e.clientY - hr.top;
      if (window.scrollY > window.innerHeight * 0.7 || y < 0 || y > H || y > WL(x) - 6) return;

      if (cur === "hujan") {
        if (L.cool <= 0) strike(x);
      } else if (cur === "salju") {
        burst(snow, x, y, 300, 520, 1);
        burst(dust, x, y, 300, 300, 0);
        S.gust = 1;
        audioEngine.oneShot("whoosh", { k: 1 });
        audioEngine.sfx("chime");
      } else if (cur === "kemarau") {
        S.flare = 1;
        burst(dust, x, y, 320, 380, 1);
        S.gust = 0.7;
        audioEngine.oneShot("whoosh", { k: 0.5 });
      } else {
        burst(cur === "gugur" ? lf : pt, x, y, 320, 440, 1);
        S.gust = 1;
        audioEngine.oneShot("whoosh", { k: 0.9 });
        if (cur === "gugur") audioEngine.oneShot("rustle");
        else audioEngine.sfx("bell");
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);

    function drift(
      arr: Particle[],
      a: number,
      c: { vy: number; f: number; sw: number; vx: number; dr: number; rx: number; ry: number; cols: string[] },
      t: number,
      dt: number,
      sc: number,
      ex: number
    ) {
      if (!ctx) return;
      for (const p of arr) {
        if (p.y == null) {
          p.x = rnd() * W;
          p.y = rnd() * H * 0.7;
        }
        p.wx *= ex;
        p.wy *= ex;

        if (p.fl) {
          p.fl += dt;
          p.x += c.dr * dt;
          p.y = WL(p.x) - 1;
          if (p.fl > 3.5) {
            p.fl = 0;
            p.x = rnd() * W;
            p.y = -12 - rnd() * H * 0.2;
          }
        } else {
          p.y += (c.vy * (0.6 + 0.6 * p.z) * sc + p.wy) * dt;
          p.x += (Math.sin(t * c.f + p.p) * c.sw + c.vx * p.z + p.wx) * dt;
          p.r += dt * (0.8 + p.z) + Math.abs(p.wx) * dt * 0.01;
          if (p.x > W + 20) p.x = -10;
          if (p.x < -30) p.x = W + 10;
          if (p.y > WL(p.x) - 2) p.fl = 0.01;
        }

        const al = a * (p.fl ? Math.max(0, 1 - p.fl / 3.5) : 1);
        if (al < 0.02) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.fl ? 0 : p.r);
        ctx.scale(1, p.fl ? 0.25 : 0.25 + 0.75 * Math.abs(Math.cos(p.p + t * 1.3)));
        ctx.globalAlpha = al;
        ctx.fillStyle = c.cols[p.c % c.cols.length];
        ctx.beginPath();
        ctx.ellipse(0, 0, c.rx * (0.7 + 0.5 * p.z) * sc, c.ry * (0.7 + 0.5 * p.z) * sc, 0, 0, 6.283);
        ctx.fill();
        ctx.restore();
      }
    }

    let lastRate = 1;
    let cvEmpty = 0;

    const tick = (t: number, dtms?: number) => {
      const dt = Math.min(0.05, (dtms || 16) / 1000);
      const k = 1 - Math.exp(-dt * (mode === "auto" ? 0.35 : 2.5));
      const ex = Math.exp(-dt * 1.8);

      SE.forEach((s) => (w[s] += ((s === cur ? 1 : 0) - w[s]) * k));

      if (mode === "auto") {
        AW.left -= dt;
        if (AW.left <= 0) {
          const nx = pickAuto(false);
          setCur(nx);
        }
      }

      const rate = 1 + 0.9 * (w.hujan || 0) - 0.2 * (w.salju || 0);
      if (Math.abs(rate - lastRate) > 0.02) {
        lastRate = rate;
        const oc = getOceanContext();
        if (oc && oc.wv && oc.wv.getAnimations) {
          try {
            oc.wv.getAnimations({ subtree: true }).forEach((an) => (an.playbackRate = rate));
          } catch (_) {}
        }
      }

      L.cool = Math.max(0, L.cool - dt);
      S.gust *= Math.exp(-dt * 1.6);
      S.flare *= Math.exp(-dt * 1.6);

      const n = skyEngine.sky.nightFactor || 0;
      audioEngine.seasonTick(dt, w, S.gust, n);

      if (!SE.some((s) => s !== "cerah" && w[s] > 0.01)) {
        if (!cvEmpty) {
          ctx.clearRect(0, 0, W, H);
          cvEmpty = 1;
        }
        return;
      }
      cvEmpty = 0;

      const scale = oceanStore.getQualityScale();
      const lim = <T,>(arr: T[]): T[] => arr.slice(0, Math.ceil(arr.length * scale));

      const oc = getOceanContext();
      const hr = hero.getBoundingClientRect();
      const tt = oc && oc.tide ? oc.tide.getBoundingClientRect().top - hr.top : H * 0.7;
      const f = oc ? oc.frac(t) : 0;
      const fade = cl(1 - window.scrollY / (window.innerHeight * 0.9), 0, 1);
      const h = skyEngine.sky.hour || 12;
      const dim = 1 - 0.55 * n;
      const sc = cl(H / 700, 0.8, 1.6);
      const mv = !reducedMotion;

      HT = tt;
      WL = (x: number) => (oc ? tt + oc.surf(cl(x, 0, W), f) : tt);

      ctx.clearRect(0, 0, W, H);
      if (fade < 0.01) return;

      // Color tints per season
      for (const s in TINT) {
        const a = TINT[s];
        const o = a[3] * (w[s] || 0) * fade * (1 - 0.35 * n);
        if (o > 0.005) {
          ctx.fillStyle = `rgba(${a[0]},${a[1]},${a[2]},${o.toFixed(3)})`;
          ctx.fillRect(0, 0, W, H);
        }
      }

      const mx = S.mx - hr.left;
      const my = S.my - hr.top;
      const sp = Math.hypot(S.vx, S.vy);
      const moving = mv && S.on && sp > 180 && my > 0 && my < tt;
      if (moving) {
        const k2 = cl(sp / 1600, 0, 1);
        S.gust = Math.max(S.gust, k2 * 0.8);
        [snow, lf, pt, dust].forEach((arr) => wind(arr, mx, my, S.vx, S.vy, 150, 1));
        S.vx *= 0.85;
        S.vy *= 0.85;
      }

      // Storm clouds
      if (mv) {
        const aH = (w.hujan || 0) * 0.55 * fade * dim;
        const aS = (w.salju || 0) * 0.34 * fade * (1 - 0.3 * n);
        const fl = L.f;
        if (aH > 0.01 || aS > 0.01) {
          for (const c of cld) {
            c.x += (c.v * dt * (1 + S.gust * 2)) / W;
            if (c.x > 1.3) c.x = -0.3;
            const cx0 = c.x * W;
            const cy0 = c.y * H;
            const r0 = c.s * W;
            const col =
              aH > aS
                ? [lerp(62, 205, fl), lerp(74, 212, fl), lerp(98, 240, fl), aH]
                : [205, 215, 230, aS];
            const a = col[3];
            for (let q = 0; q < 4; q++) {
              const qx = cx0 + (q - 1.5) * r0 * 0.55;
              const qy = cy0 + Math.sin(q * 1.7 + c.s * 9) * r0 * 0.12;
              const g = ctx.createRadialGradient(qx, qy, 0, qx, qy, r0 * 0.7);
              g.addColorStop(0, `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${a.toFixed(3)})`);
              g.addColorStop(1, `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},0)`);
              ctx.fillStyle = g;
              ctx.fillRect(qx - r0 * 0.7, qy - r0 * 0.7, r0 * 1.4, r0 * 1.4);
            }
          }
        }
      }

      // Kemarau: Sun glare & heat shimmer
      if ((w.kemarau || 0) > 0.01) {
        const aS2 = ((h - 6) / 24) * 2 * Math.PI;
        const se = Math.max(0, Math.sin(aS2));
        const sx = ((50 - 38 * Math.cos(aS2)) / 100) * W;
        const sy = ((78 - 66 * Math.sin(aS2)) / 100) * H;
        const a = (w.kemarau || 0) * fade * dim;

        const gl = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.42);
        gl.addColorStop(
          0,
          `rgba(255,240,200,${((0.26 + 0.04 * Math.sin(t * 1.1)) * a * se + S.flare * 0.45 * a).toFixed(3)})`
        );
        gl.addColorStop(1, "rgba(255,240,200,0)");
        ctx.fillStyle = gl;
        ctx.fillRect(0, 0, W, H);

        const g = ctx.createLinearGradient(0, tt - H * 0.3, 0, tt + 10);
        g.addColorStop(0, "rgba(255,215,150,0)");
        g.addColorStop(1, `rgba(255,215,150,${(0.3 * a).toFixed(3)})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, tt - H * 0.3, W, H * 0.3 + 10);

        if (mv) {
          ctx.strokeStyle = `rgba(255,235,190,${(0.1 * a).toFixed(3)})`;
          ctx.lineWidth = 2;
          for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            for (let x = 0; x <= W; x += 14) {
              const y = tt - 8 - j * 13 + Math.sin(x * 0.025 + t * 1.6 + j * 1.7) * (2 + j * 0.5);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          for (const p of lim(dust)) {
            if (p.y == null) {
              p.x = rnd() * W;
              p.y = rnd() * H * 0.7;
            }
            p.wx *= ex;
            p.wy *= ex;
            p.x += (10 + 12 * p.z + p.wx) * dt;
            p.y += (Math.sin(t * 0.5 + p.p) * 6 + p.wy) * dt;
            if (p.x > W + 10) p.x = -10;
            if (p.x < -10) p.x = W + 10;
            ctx.fillStyle = `rgba(255,226,170,${(0.35 * a * p.z * 0.8).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 0.8 + 1.3 * p.z, 0, 6.283);
            ctx.fill();
          }
        }
      }

      // Hujan: Raindrops, ripples, splash sparks, lightning
      if (mv && (w.hujan || 0) > 0.01) {
        const a = (w.hujan || 0) * fade * dim;
        ctx.lineCap = "round";

        for (const p of lim(rain)) {
          if (p.y == null || p.y > WL(p.x)) {
            if (p.y != null && rip.length < 28 && rnd() < 0.6) {
              rip.push({ x: p.x, t: 0 });
            }
            p.x = rnd() * W * 1.15;
            p.y = p.y == null ? rnd() * H * 0.7 : -rnd() * H * 0.3;
          }

          if (S.on && Math.hypot(p.x - mx, p.y - my) < 48 && my < tt) {
            if (spk.length < 40) {
              spk.push({ x: p.x, y: p.y, t: 0, d: rnd() < 0.5 ? -1 : 1 });
            }
            p.y = -rnd() * H * 0.3;
            p.x = rnd() * W * 1.15;
          }

          const vy = (950 + 650 * p.z) * sc;
          const vx = (-170 * p.z - S.gust * 120) * sc;
          p.x += vx * dt;
          p.y += vy * dt;

          ctx.strokeStyle = `rgba(205,225,245,${(0.45 * a * p.z).toFixed(3)})`;
          ctx.lineWidth = 0.9 * p.z;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - vx * 0.022, p.y - vy * 0.022);
          ctx.stroke();
        }

        for (let i = rip.length - 1; i >= 0; i--) {
          const r0 = rip[i];
          r0.t += dt;
          if (r0.t > 0.5) {
            rip.splice(i, 1);
            continue;
          }
          const u = r0.t / 0.5;
          ctx.strokeStyle = `rgba(225,240,255,${(0.55 * (1 - u) * a).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(r0.x, WL(r0.x) + 1, 3 + 11 * u, 1 + 3 * u, 0, 0, 6.283);
          ctx.stroke();
        }

        for (let i = spk.length - 1; i >= 0; i--) {
          const q = spk[i];
          q.t += dt;
          if (q.t > 0.28) {
            spk.splice(i, 1);
            continue;
          }
          const u = q.t / 0.28;
          ctx.strokeStyle = `rgba(225,240,255,${(0.7 * (1 - u) * a).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(q.x + q.d * u * 14, q.y - u * 10 + u * u * 14);
          ctx.lineTo(q.x + q.d * u * 18, q.y - u * 13 + u * u * 18);
          ctx.stroke();
        }

        if ((w.hujan || 0) > 0.7) {
          L.next -= dt;
          if (L.next <= 0) {
            L.next = RW.ok && (RW.code ?? 0) >= 95 ? 4 + rnd() * 6 : 9 + rnd() * 14;
            strike(W * (0.1 + rnd() * 0.8));
          }
        }
      }

      if (L.d && L.f < 0.12) {
        L.f = 0.7;
        L.d = 0;
      }
      L.f *= Math.exp(-dt * 7);

      if (L.f > 0.01) {
        ctx.fillStyle = `rgba(235,240,255,${(L.f * 0.42 * fade).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Lightning branches
      ctx.globalCompositeOperation = "lighter";
      ctx.lineJoin = "round";
      for (let i = B.length - 1; i >= 0; i--) {
        const b = B[i];
        b.t += dt;
        if (b.t > 0.45) {
          B.splice(i, 1);
          continue;
        }
        const u = b.t / 0.45;
        const al = Math.pow(1 - u, 1.6) * (0.75 + 0.25 * Math.sin(b.t * 90));
        const path = (q: [number, number][]) => {
          ctx.beginPath();
          q.forEach((pp, j) => (j ? ctx.lineTo(pp[0], pp[1]) : ctx.moveTo(pp[0], pp[1])));
          ctx.stroke();
        };

        ctx.strokeStyle = `rgba(170,190,255,${(0.3 * al).toFixed(3)})`;
        ctx.lineWidth = 9;
        path(b.pts);
        ctx.strokeStyle = `rgba(255,255,255,${al.toFixed(3)})`;
        ctx.lineWidth = 2.4;
        path(b.pts);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = `rgba(210,225,255,${(0.8 * al).toFixed(3)})`;
        b.br.forEach(path);
      }
      ctx.globalCompositeOperation = "source-over";

      // Salju: Snowflakes
      if (mv && (w.salju || 0) > 0.01) {
        const a = (w.salju || 0) * fade * (1 - 0.4 * n);
        for (const p of lim(snow)) {
          if (p.y == null) {
            p.x = rnd() * W;
            p.y = rnd() * H * 0.7;
          }
          p.wx *= ex;
          p.wy *= ex;
          p.y += ((24 + 38 * p.z) * sc + p.wy) * dt;
          p.x += ((Math.sin(t * 0.8 + p.p) * 16 - 10) * p.z + p.wx) * dt;
          const wy = WL(p.x);
          if (p.y > wy - 4 || p.x < -30 || p.x > W + 30) {
            p.x = rnd() * W * 1.05;
            p.y = -8 - rnd() * H * 0.2;
            p.wx = 0;
            p.wy = 0;
            continue;
          }
          let al = a * (0.45 + 0.4 * p.z);
          if (wy - p.y < 34) al *= (wy - p.y) / 34;
          const r = (0.8 + 1.9 * p.z) * sc;
          ctx.fillStyle = `rgba(255,255,255,${(al * 0.22).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 2, 0, 6.283);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${al.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, 6.283);
          ctx.fill();
        }
      }

      // Gugur: Falling leaves
      if (mv && (w.gugur || 0) > 0.01) {
        drift(
          lim(lf),
          (w.gugur || 0) * fade * dim,
          { vy: 40, f: 0.9, sw: 26, vx: 18, dr: 14, rx: 6, ry: 3, cols: LC },
          t,
          dt,
          sc,
          ex
        );
      }

      // Semi: Blossom petals
      if (mv && (w.semi || 0) > 0.01) {
        drift(
          lim(pt),
          (w.semi || 0) * fade * dim,
          { vy: 30, f: 0.7, sw: 30, vx: 26, dr: 18, rx: 4, ry: 2.4, cols: PC },
          t,
          dt,
          sc,
          ex
        );
      }
    };

    function loadRealWeather() {
      fetch("/api/weather")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((j) => {
          const code = j && j.code;
          if (typeof code !== "number") return;
          RW.ok = true;
          RW.code = code;
          RW.t = Date.now();
          if (mode === "auto") {
            const nx = mapW(code);
            if (nx !== cur) setCur(nx);
            AW.left = 900;
          }
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("ocean:weather-update", {
                detail: { code, city: "Surabaya" },
              })
            );
          }
        })
        .catch(() => {
          fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=-7.2575&longitude=112.7521&current=weather_code&timezone=Asia%2FJakarta"
          )
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((j) => {
              const code = j?.current?.weather_code;
              if (typeof code !== "number") return;
              RW.ok = true;
              RW.code = code;
              RW.t = Date.now();
              if (mode === "auto") {
                const nx = mapW(code);
                if (nx !== cur) setCur(nx);
                AW.left = 900;
              }
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("ocean:weather-update", {
                    detail: { code, city: "Surabaya" },
                  })
                );
              }
            })
            .catch(() => {
              if (Date.now() - RW.t > 2700000) RW.ok = false;
            });
        });
    }

    const rwTimer = setTimeout(loadRealWeather, 1200);
    const rwInterval = setInterval(loadRealWeather, 15 * 60 * 1000);

    return () => {
      clearTimeout(rwTimer);
      clearInterval(rwInterval);
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", size);
      if (ro) ro.disconnect();
      window.removeEventListener("ocean:set-mode", handleSetSeasonEvent);
      window.removeEventListener("ocean:weather-update", handleWeatherUpdate);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} id="wx" aria-hidden="true" />;
}
