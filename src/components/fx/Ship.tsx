"use client";

/**
 * Ship — F11: Kapal Nelayan, Joran Lentur, Penyelam, Kilau & Cipratan.
 * Disinkronkan persis seperti referensi HTML Evan Atharasya (7).html.
 *
 * Fitur:
 * - Lambung kapal deep navy (#0b2a4a) dengan aksen emas, jendela, lentera, dan bendera
 * - 3 nelayan bertopi (kuning, oranye, merah) dengan jaket biru (#174676)
 * - Joran lentur berpegas (spring-physics) + senar bergantung + pelampung di permukaan ombak
 * - 4 garis senar bawah air dengan kedalaman menurun
 * - Tambalan air lokal (.ptc) + bayangan lambung (#shg) + buih air (.fml, .fb0, .fb1)
 * - Interaksi klik nelayan -> joran menyentak & ikan melompat (ocean:catch)
 * - Penyelam bersendi (dvw) berdiri di kapal, melambaikan tangan saat disentuh
 * - Lompat parabola giant-stride bersendi ke laut dengan cipratan realistis & gelembung
 * - Kanvas kilau air (.glt): pantulan matahari/bulan/gerhana + lentera kapal di ombak
 * - Kanvas cipratan air realistis (.spl): semburan runcing, mahkota, tetesan & cincin riak
 * - Mengikuti kontur gelombang air secara akurat (pitch + Y)
 */

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { clamp } from "@/lib/math";
import { surf, getWaveFrac, setOceanContext } from "@/lib/oceanSurface";

interface ShipProps {
  reducedMotion?: boolean;
}

export default function Ship({ reducedMotion = false }: ShipProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const sp = containerRef.current;
    if (!sp) return;

    const tide = sp.closest(".tide") as HTMLDivElement | null;
    if (!tide) return;

    const wv = tide.querySelector(".wv") as HTMLDivElement | null;
    const w1 = wv?.querySelector("svg") as SVGSVGElement | null;
    if (!wv || !w1) return;

    const rm = reducedMotion;
    const rnd = Math.random;
    const NS = "http://www.w3.org/2000/svg";
    const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

    // ─── Sampler permukaan ombak ─────────────────────────────────────────
    let Wd = wv.clientWidth;
    let Hd = wv.clientHeight;
    let spx = 0;
    let spw = 0;
    let cy = 0;
    let ca = 0;

    function lay() {
      if (!wv || !sp) return;
      Wd = wv.clientWidth;
      Hd = wv.clientHeight;
      spw = sp.offsetWidth;
      spx = sp.offsetLeft + spw / 2;
    }
    lay();
    window.addEventListener("resize", lay);
    document.fonts?.ready.then(lay);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => lay());
      ro.observe(tide);
      ro.observe(wv);
      ro.observe(sp);
    }
    const layTimer = setInterval(() => {
      if (!document.hidden) lay();
    }, 400);

    function frac(t: number): number {
      return getWaveFrac(w1, t);
    }

    function surfAt(x: number, f: number): number {
      return surf(x, f, Wd, Hd);
    }

    // ─── Buih samping (.foam) ──────────────────────────────────────────
    const foam = document.createElement("div");
    foam.className = "foam";
    foam.innerHTML = "<i></i>";
    tide.appendChild(foam);

    // ─── Efek air dasar & Konteks Laut ──────────────────────────────────
    function mkEl<K extends keyof HTMLElementTagNameMap>(tag: K, c: string, s?: string): HTMLElementTagNameMap[K] {
      const e = document.createElement(tag);
      e.className = c;
      if (s) e.style.cssText = s;
      tide!.appendChild(e);
      return e;
    }

    function bub(x: number, y: number) {
      const e = document.createElement("i");
      const s = 4 + rnd() * 7;
      e.className = "tb";
      e.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;z-index:6`;
      document.body.appendChild(e);
      gsap.to(e, {
        y: -50 - rnd() * 60,
        x: (rnd() - 0.5) * 26,
        opacity: 0,
        scale: 1.4,
        duration: 1.1 + rnd(),
        ease: "power1.out",
        onComplete: () => e.remove(),
      });
    }

    const oc = {
      tide,
      wv,
      surf: surfAt,
      frac,
      splash: (x: number, y: number, big?: boolean, silent?: boolean) => {
        if (!silent) document.dispatchEvent(new CustomEvent("ocean:splash"));
        const k = big ? 1 : 0.5;
        const col = mkEl("i", "col", "height:" + (64 * k + 20) + "px;margin-top:-" + (64 * k + 20) + "px");
        gsap.fromTo(col, { x, y, scaleY: 0, opacity: 1 }, { scaleY: 1, duration: 0.22, ease: "power2.out" });
        gsap.to(col, { opacity: 0, duration: 0.35, delay: 0.2, onComplete: () => col.remove() });
        for (let i = 0; i < (big ? 3 : 2); i++) {
          const r = mkEl("i", "erg");
          gsap.fromTo(
            r,
            { x, y, scale: 0.3, opacity: 0.9 },
            { scale: (big ? 4 : 2.5) + i, opacity: 0, duration: 1.2, delay: i * 0.14, ease: "power2.out", onComplete: () => r.remove() }
          );
        }
        for (let i = 0; i < (big ? 22 : 10); i++) {
          const s = 3 + rnd() * 5;
          const d = mkEl("i", "drop", `width:${s}px;height:${s}px`);
          const a = (-90 + (rnd() - 0.5) * 100) * (Math.PI / 180);
          const sp2 = (40 + rnd() * 100) * k + 20;
          gsap.set(d, { x, y });
          gsap.to(d, { x: x + Math.cos(a) * sp2, y: y + Math.sin(a) * sp2, duration: 0.32 + rnd() * 0.12, ease: "power2.out" });
          gsap.to(d, { y: y + 30, opacity: 0, duration: 0.5, delay: 0.32, ease: "power2.in", onComplete: () => d.remove() });
        }
      },
      bub,
      st: () => ({ cy, ca, spx, spw, sh: sp.offsetHeight }),
    };

    (window as unknown as { __oc: typeof oc }).__oc = oc;
    setOceanContext({
      tide,
      wv,
      wvSvg: w1,
      surf: surfAt,
      frac,
      splash: oc.splash,
      bub,
      st: oc.st,
    });

    // ─── Kapal Mengikuti Gelombang (Ticker) ──────────────────────────────
    const tickShip = (t: number) => {
      const f = frac(t);
      const shh = sp.offsetHeight || 120;
      const wCenter = surfAt(spx, f);
      const wLeft = surfAt(spx - spw * 0.32, f);
      const wRight = surfAt(spx + spw * 0.32, f);

      // Ketinggian vertikal: 50% titik tengah kapal + 25% kedua sisi + draft alami kapal (+shh * 0.04)
      const y = wCenter * 0.5 + (wLeft + wRight) * 0.25 + shh * 0.04;
      // Sudut kemiringan (pitch): mengikuti lereng ombak lokal secara presisi tanpa lag
      const a = cl(Math.atan2(wRight - wLeft, spw * 0.64) * 57.3 * 0.85, -11, 11);

      // Kecepatan lerp responsif (0.55): menghilangkan phase lag sehingga kapal pas di puncak saat ombak mencapai puncak
      cy += (y - cy) * 0.55;
      ca += (a - ca) * 0.5;

      sp.style.transform = `translate3d(0,${cy.toFixed(1)}px,0) rotate(${ca.toFixed(2)}deg)`;
      foam.style.transform = `translate3d(${spx.toFixed(1)}px,${(cy - 1).toFixed(1)}px,0)`;
    };

    if (!rm) gsap.ticker.add(tickShip);
    else tickShip(0);

    // ─── Helper konversi koordinat kapal ke tide space ────────────────────
    function toT(ux: number, uy: number, s: { sh: number; spw: number; spx: number; ca: number; cy: number }): [number, number] {
      const k = s.sh / 110;
      const xo = (s.spw - 200 * k) / 2;
      const x = s.spx - s.spw / 2 + xo + ux * k;
      const y = -0.88 * s.sh + uy * k;
      const a = (s.ca * Math.PI) / 180;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const dx = x - s.spx;
      return [s.spx + dx * c - y * sn, s.cy + dx * sn + y * c];
    }

    // ─── Joran Lentur, Senar, Pelampung, Tambalan Air (SVG .ln) ───────────
    const RODS = [
      { x: 112, y: 45, len: 80, ang: -26, off: 22 },
      { x: 136, y: 54, len: 68, ang: -30, off: 26 },
      { x: 162, y: 45, len: 56, ang: -36, off: 30 },
    ];

    const lnSvg = document.createElementNS(NS, "svg");
    lnSvg.setAttribute("class", "ln");
    lnSvg.setAttribute("aria-hidden", "true");

    const mkSvg = (n: string, a: Record<string, string>) => {
      const e = document.createElementNS(NS, n);
      for (const k in a) e.setAttribute(k, a[k]);
      lnSvg.appendChild(e);
      return e;
    };

    const Rd = RODS.map((r) => ({
      ...r,
      rod: mkSvg("path", { fill: "none", stroke: "#0b2a4a", "stroke-width": "2", "stroke-linecap": "round" }),
      ln: mkSvg("path", { fill: "none", stroke: "#0b2a4a", "stroke-width": ".9", "stroke-opacity": ".8" }),
      lu: [0, 1, 2, 3].map(() => mkSvg("path", { fill: "none", stroke: "#0b2a4a", "stroke-width": ".8", "stroke-linecap": "round" })),
      bb: mkSvg("g", {}),
      tip: { x: 0, y: 0, vx: 0, vy: 0, init: false },
      b: { x: 0, init: false },
      tens: 0,
      ph: rnd() * 6,
    }));

    Rd.forEach((r) => {
      r.bb.innerHTML = "<circle r='3.2' fill='#fff'/><path d='M-3.2 0a3.2 3.2 0 0 1 6.4 0z' fill='#e85d5d'/>";
    });

    // Tambalan air di bawah lambung (agar tidak bolong di atas ombak)
    const dfs = mkSvg("defs", {});
    dfs.innerHTML = "<radialGradient id='shg'><stop offset='0' stop-color='#0b2a4a' stop-opacity='.42'/><stop offset='1' stop-color='#0b2a4a' stop-opacity='0'/></radialGradient>";
    const ptc = mkSvg("path", { class: "ptc" });
    const shd = mkSvg("ellipse", { fill: "url(#shg)" });
    const fml = mkSvg("path", { fill: "none", stroke: "#fff", "stroke-width": "2", "stroke-opacity": ".6", "stroke-linecap": "round" });
    const fb0 = mkSvg("circle", { fill: "#fff", "fill-opacity": ".7" });
    const fb1 = mkSvg("circle", { fill: "#fff", "fill-opacity": ".7" });
    [dfs, ptc, shd, fml, fb0, fb1].reverse().forEach((e) => lnSvg.prepend(e));

    tide.insertBefore(lnSvg, wv);

    let lt = 0;
    const stepRods = (t: number) => {
      const dt = Math.min(0.05, t - lt) || 0.016;
      lt = t;
      const s = oc.st();
      const k = s.sh / 110;
      const f = frac(t);

      Rd.forEach((r) => {
        const [hx, hy] = toT(r.x, r.y, s);
        const len = r.len * k;
        const ang = ((r.ang + s.ca) * Math.PI) / 180 + 0.03 * Math.sin(t * 1.2 + r.ph);
        const rx = hx + Math.cos(ang) * len;
        const ry = hy + Math.sin(ang) * len + len * 0.07 * (1 + r.tens);
        const T = r.tip;

        if (!T.init) {
          T.x = rx;
          T.y = ry;
          T.init = true;
        }
        T.vx += ((rx - T.x) * 80 - T.vx * 7) * dt;
        T.vy += ((ry - T.y) * 80 - T.vy * 7) * dt;
        T.x += T.vx * dt;
        T.y += T.vy * dt;

        const mx = (hx + T.x) / 2 - T.vx * 0.012;
        const my = (hy + T.y) / 2 + len * 0.05 + len * 0.1 * r.tens;
        r.rod.setAttribute("d", `M${hx.toFixed(1)} ${hy.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${T.x.toFixed(1)} ${T.y.toFixed(1)}`);

        const B = r.b;
        const off = r.off * k;
        if (!B.init) {
          B.x = T.x + off;
          B.init = true;
        }
        B.x += (T.x + off - B.x) * (1 - Math.exp(-dt * 0.5));

        const bx = B.x;
        const by = surfAt(bx + Math.sin(t * 0.4 + r.ph) * 3, f) - 1 + Math.sin(t * 1.7 + r.ph) * 1.2 + r.tens * 7;
        const L = Math.hypot(bx - T.x, by - T.y);
        const sag = Math.max(5, L * 0.1) * (1 - 0.85 * r.tens);
        const cx2 = (T.x + bx) / 2 + T.vx * 0.05;
        const cy2 = (T.y + by) / 2 + sag;
        r.ln.setAttribute("d", `M${T.x.toFixed(1)} ${T.y.toFixed(1)}Q${cx2.toFixed(1)} ${cy2.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);

        const sl = (surfAt(bx + 6, f) - surfAt(bx - 6, f)) / 12;
        r.bb.setAttribute("transform", `translate(${bx.toFixed(1)} ${(by - 0.5).toFixed(1)}) rotate(${(Math.atan(sl) * 57.3).toFixed(1)})`);

        let px = bx;
        let py = by + 2;
        r.lu.forEach((p, j) => {
          const nx = bx + Math.sin(t * 0.9 + j + r.ph) * (j + 1);
          const ny = by + 2 + (j + 1) * 11;
          p.setAttribute("d", `M${px.toFixed(1)} ${py.toFixed(1)}L${nx.toFixed(1)} ${ny.toFixed(1)}`);
          p.setAttribute("stroke-opacity", String([0.5, 0.34, 0.2, 0.09][j]));
          px = nx;
          py = ny;
        });
      });
    };

    const patchStep = (t: number) => {
      const s = oc.st();
      const f = frac(t);
      const [x0, y0] = toT(26, 87, s);
      const [x1, y1] = toT(164, 87, s);
      const ext = s.spw * 0.5;
      const xL = x0 - ext;
      const xR = x1 + ext;
      const tl = surfAt(xL, f);
      const tr = surfAt(xR, f);
      const q = (v: number) => v.toFixed(1);

      let d = `M${q(xL)} ${q(tl)}C${q(xL + ext * 0.55)} ${q(tl)} ${q(x0 - ext * 0.35)} ${q(y0)} ${q(x0)} ${q(y0)}`;
      let df = `M${q(x0)} ${q(y0)}`;
      for (let k = 1; k <= 6; k++) {
        const u = k / 6;
        const x = x0 + (x1 - x0) * u;
        const y = y0 + (y1 - y0) * u + Math.sin(t * 2.1 + k * 1.3) * 1.4;
        const p = `L${q(x)} ${q(y)}`;
        d += p;
        df += p;
      }
      d += `C${q(x1 + ext * 0.35)} ${q(y1)} ${q(xR - ext * 0.55)} ${q(tr)} ${q(xR)} ${q(tr)}V${(s.sh * 4).toFixed(0)}H${q(xL)}Z`;
      ptc.setAttribute("d", d);
      fml.setAttribute("d", df);

      shd.setAttribute("cx", q((x0 + x1) / 2));
      shd.setAttribute("cy", q((y0 + y1) / 2 + s.sh * 0.1));
      shd.setAttribute("rx", q(s.spw * 0.42));
      shd.setAttribute("ry", q(s.sh * 0.1));

      fb0.setAttribute("cx", q(x0));
      fb0.setAttribute("cy", q(y0));
      fb0.setAttribute("r", q(2.5 + 1.2 * Math.sin(t * 3)));
      fb1.setAttribute("cx", q(x1));
      fb1.setAttribute("cy", q(y1));
      fb1.setAttribute("r", q(3 + 1.4 * Math.sin(t * 2.6 + 1)));
    };

    if (!rm) {
      gsap.ticker.add(stepRods);
      gsap.ticker.add(patchStep);
    } else {
      stepRods(0);
      patchStep(0);
    }

    // ─── Ikan Menyambar & Melompat Saat Joran Diklik ──────────────────────
    function bite(i: number, big: number) {
      const r = Rd[i];
      if (!r || rm) return;
      gsap.killTweensOf(r);
      gsap.fromTo(r, { tens: 0 }, { tens: big ? 1 : 0.8, duration: 0.12, ease: "power2.out" });
      gsap.to(r, { tens: 0, duration: 0.9, delay: 0.25, ease: "elastic.out(1,.4)" });
    }

    function leap(r: (typeof Rd)[0]) {
      const B = r.b;
      const y = surfAt(B.x, frac(performance.now() / 1000));
      const dir = rnd() < 0.5 ? -1 : 1;
      const fish = document.createElementNS(NS, "svg");
      fish.setAttribute("viewBox", "0 0 120 60");
      fish.setAttribute("class", "cf");
      fish.innerHTML = "<use href='#fish'/>";
      tide!.insertBefore(fish, wv);

      document.dispatchEvent(new CustomEvent("ocean:catch"));
      gsap.set(fish, { x: B.x, y: y + 8, rotation: 0, scaleX: dir, opacity: 1, transformOrigin: "50% 50%" });
      gsap
        .timeline({ onComplete: () => fish.remove() })
        .to(fish, { y: y - 70, x: B.x - dir * 18, rotation: dir * -40, duration: 0.38, ease: "power2.out" }, 0.16)
        .to(fish, { y: y + 12, x: B.x - dir * 40, rotation: dir * 40, duration: 0.36, ease: "power2.in" }, 0.5)
        .call(() => oc.splash(B.x - dir * 40, y, false, true), undefined, 0.84);
    }

    // ─── Penyelam Bersendi (Diver dvw) ──────────────────────────────────
    const dvw = sp.querySelector(".dvw") as HTMLDivElement | null;
    const qEl = (s: string) => dvw?.querySelector(s) as SVGElement | null;
    const P: Record<string, SVGElement | null> = {
      to: qEl(".to"),
      al: qEl(".al"),
      fl: qEl(".fl"),
      ar: qEl(".ar"),
      fr: qEl(".fr"),
      l1: qEl(".l1"),
      s1: qEl(".s1"),
      l2: qEl(".l2"),
      s2: qEl(".s2"),
    };
    const ORG: Record<string, string> = {
      to: "30 56",
      l1: "30 56",
      l2: "30 56",
      s1: "30 74",
      s2: "30 74",
      al: "30 38",
      ar: "30 38",
      fl: "30 49",
      fr: "30 49",
    };
    for (const k in P) {
      if (P[k]) gsap.set(P[k]!, { svgOrigin: ORG[k] });
    }

    let jumped = false;
    let busy = false;
    let idleTween: gsap.core.Tween | null = null;

    function startIdle() {
      if (rm || !P.to) return;
      idleTween = gsap.to(P.to, { rotation: 1.4, duration: 1.7, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }
    startIdle();

    // Lompat parabola halus bersendi
    const NM = ["to", "al", "ar", "l1", "s1", "l2", "s2"];
    const K: [number, number[]][] = [
      [0, [0, 0, 0, 0, 0, 0, 0, 1, 1]],
      [0.16, [-10, -50, -45, 32, -58, 22, -50, 0.88, 1.05]],
      [0.3, [-6, 40, 30, 20, -20, 5, -20, 1.07, 0.96]],
      [0.45, [-3, 125, 105, 14, -8, -6, -10, 1.04, 0.97]],
      [0.62, [-4, 95, 80, 40, -14, -26, -34, 1, 1]],
      [0.9, [1, 25, 20, 6, 0, -2, 0, 1, 1]],
      [1.25, [0, 10, 10, -10, 0, 8, 0, 1, 1]],
      [1.95, [0, 8, 8, -14, 0, 12, 0, 1, 1]],
    ];
    const keyPose = (tau: number) => {
      let i = 0;
      while (i < K.length - 2 && tau > K[i + 1][0]) i++;
      const a = K[i];
      const b = K[i + 1];
      const u = cl((tau - a[0]) / (b[0] - a[0]), 0, 1);
      return a[1].map((v, j) => v + (b[1][j] - v) * u);
    };

    function jump() {
      if (jumped || busy || !dvw) return;
      jumped = true;
      if (rm) {
        dvw.style.visibility = "hidden";
        return;
      }
      busy = true;
      if (idleTween) {
        idleTween.kill();
        idleTween = null;
      }

      const r = dvw.getBoundingClientRect();
      const t = tide!.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      const sx = r.left - t.left;
      const sy = r.top - t.top;

      tide!.insertBefore(dvw, wv);
      dvw.classList.add("fly");
      dvw.style.width = w + "px";
      dvw.style.height = h + "px";
      dvw.style.transformOrigin = "50% 100%";

      const ex = sx - Math.min(window.innerWidth * 0.15, 210);
      const wl = surfAt(ex + w / 2, frac(performance.now() / 1000) + 0.95 / 12);
      const yl = wl - h * 0.9;
      const cur = [0, 0, 0, 0, 0, 0, 0, 1, 1];

      const t0 = performance.now();
      let last = t0;
      let splashed = false;
      let bt2 = 0;

      const jumpTick = () => {
        const now = performance.now();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const tau = (now - t0) / 1000;
        const tg = keyPose(tau);
        const k = 1 - Math.exp(-dt * 16);

        cur.forEach((v, j) => {
          cur[j] = v + (tg[j] - v) * k;
        });
        NM.forEach((n, j) => {
          if (P[n]) P[n]!.setAttribute("transform", `rotate(${cur[j].toFixed(1)} ${ORG[n]})`);
        });

        let x = sx;
        let y = sy;
        let op = 1;

        if (tau < 0.3) {
          x = sx;
          y = sy + h * 0.05 * Math.sin((tau / 0.3) * Math.PI);
        } else if (tau < 0.95) {
          const u = (tau - 0.3) / 0.65;
          x = sx + (ex - sx) * u;
          y = sy + (yl - sy) * u - h * 1.15 * 4 * u * (1 - u);
        } else {
          const s = (tau - 0.95) / 0.9;
          const e = 1 - Math.pow(1 - cl(s, 0, 1), 2);
          x = ex - w * 0.1 * e;
          y = yl + h * 1.7 * e;
          op = cl(1 - (s - 0.55) / 0.45, 0, 1);
        }

        dvw.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${cur[8].toFixed(3)},${cur[7].toFixed(3)})`;
        dvw.style.opacity = String(op);

        if (!splashed && tau >= 0.95) {
          splashed = true;
          oc.splash(ex + w / 2, wl, true);
        }
        if (tau > 0.97 && tau < 1.9 && now - bt2 > 90) {
          bt2 = now;
          const b = dvw.getBoundingClientRect();
          oc.bub(b.left + b.width / 2, b.top + b.height * 0.4);
        }
        if (tau >= 1.9) {
          gsap.ticker.remove(jumpTick);
          dvw.style.display = "none";
          busy = false;
        }
      };

      gsap.ticker.add(jumpTick);
    }

    function resetDiver() {
      if (!jumped || busy || !dvw || !sp) return;
      jumped = false;
      dvw.style.cssText = "";
      dvw.classList.remove("fly");
      dvw.style.opacity = "0";
      dvw.style.display = "";
      sp.appendChild(dvw);
      gsap.set(dvw, { clearProps: "transform,x,y,scale,rotation" });
      for (const k in P) {
        if (P[k]) gsap.set(P[k]!, { rotation: 0 });
      }
      gsap.to(dvw, {
        opacity: 1,
        duration: 0.6,
        onComplete: () => {
          if (dvw) dvw.style.opacity = "";
          startIdle();
        },
      });
    }

    const onScroll = () => {
      const y = window.scrollY;
      if (!jumped) {
        if (y > window.innerHeight * 1.2) {
          jumped = true;
          if (dvw) dvw.style.visibility = "hidden";
        } else if (y > 14) {
          jump();
        }
      } else if (y < 2 && !busy) {
        setTimeout(() => {
          if (window.scrollY < 2) {
            if (dvw) dvw.style.visibility = "";
            resetDiver();
          }
        }, 900);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (window.scrollY > window.innerHeight * 1.2 && dvw) {
      jumped = true;
      dvw.style.visibility = "hidden";
    }

    // Hand wave idle
    let waveTween: gsap.core.Tween | null = null;
    const hi = () => {
      if (jumped || rm || waveTween || !P.al) return;
      waveTween = gsap.to(P.al, {
        rotation: 150,
        duration: 0.22,
        yoyo: true,
        repeat: 5,
        ease: "sine.inOut",
        onComplete: () => {
          waveTween = null;
          if (P.al) gsap.set(P.al, { rotation: 0 });
        },
      });
    };

    // ─── Tombol Interaksi (SBTN) ─────────────────────────────────────────
    const sbtns: HTMLButtonElement[] = [];
    const addSbtn = (l: number, t: number, w: number, h: number, label: string, fn: () => void) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sbtn";
      b.style.cssText = `left:${l}%;top:${t}%;width:${w}%;height:${h}%`;
      b.setAttribute("aria-label", label);
      b.addEventListener("click", fn);
      sp.appendChild(b);
      sbtns.push(b);
      return b;
    };

    // 1. Penyelam
    const bdBtn = addSbtn(4, 24, 10, 34, "Penyelam di kapal. Klik untuk melompat ke laut", () => jump());
    bdBtn.addEventListener("pointerenter", hi);
    bdBtn.addEventListener("focus", hi);

    // 2. Tiga nelayan
    const fishermen = [
      [104, "Nelayan"],
      [128, "Nelayan"],
      [154, "Nelayan"],
    ] as const;
    fishermen.forEach(([x, n], i) => {
      addSbtn((x - 7) / 2, 20, 7, 40, `${n}: klik untuk menarik ikan`, () => {
        if (rm) return;
        bite(i, 1);
        setTimeout(() => leap(Rd[i]), 260);
      });
    });

    // 3. Klakson Kapal
    addSbtn(8, 64, 84, 28, "Kapal: klik untuk membunyikan klakson", () => {
      document.dispatchEvent(new CustomEvent("ocean:horn"));
      if (rm) return;
      const l = sp.querySelector(".lamp") as HTMLElement | null;
      if (l) {
        gsap.fromTo(l, { opacity: 1 }, { opacity: 0, duration: 0.35, yoyo: true, repeat: 3, onComplete: () => { l.style.opacity = ""; } });
      }
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const r2 = sp.getBoundingClientRect();
          bub(r2.left + r2.width * (0.3 + rnd() * 0.4), r2.bottom - 8);
        }, i * 120);
      }
    });

    // ─── Auto-bite Timer ────────────────────────────────────────────────
    let autoBiteTimer: NodeJS.Timeout | null = null;
    function autoBite() {
      autoBiteTimer = setTimeout(() => {
        if (!document.hidden && !rm) {
          bite(Math.floor(rnd() * Rd.length), 0);
        }
        autoBite();
      }, 9000 + rnd() * 11000);
    }
    autoBiteTimer = setTimeout(autoBite, 5000 + rnd() * 6000);

    // ─── Kanvas Pantulan Cahaya di Air (.glt) ────────────────────────────
    const gltCv = document.createElement("canvas");
    const gltCtx = gltCv.getContext("2d");
    const PAD = 30;
    gltCv.className = "glt";
    gltCv.setAttribute("aria-hidden", "true");
    tide.appendChild(gltCv);

    let gW = 0;
    let gHc = 0;
    function sizeGlt() {
      if (!wv) return;
      gW = wv.clientWidth;
      gHc = wv.clientHeight + PAD + 130;
      gltCv.width = gW;
      gltCv.height = gHc;
      gltCv.style.height = gHc + "px";
    }
    sizeGlt();
    window.addEventListener("resize", sizeGlt);
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(sizeGlt).observe(wv);
    }

    const ss = (a: number, b: number, x: number) => {
      const t = cl((x - a) / (b - a), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ROWS = [0, 10, 22, 36, 52, 70, 92].map((d, i) => ({
      d,
      k: 0.16 - i * 0.012,
      w: 0.9 + i * 0.17,
      ph: i * 1.9,
      len: 1 + i * 0.28,
      th: 1 + i * 0.2,
    }));
    const curGlt = { iS: 0, iM: 0, iL: 0, r: 255, g: 244, b: 214, mr: 200, mg: 220, mb: 255 };

    function glow(cx: number, I: number, r: number, g: number, b: number, t: number, f: number) {
      if (!gltCtx || I < 0.02) return;
      const y0 = PAD + surfAt(cx, f) + 2;
      const rad = gW * 0.07;
      const sh = 0.9 + 0.1 * Math.sin(t * 0.8);
      gltCtx.save();
      gltCtx.translate(cx, y0);
      gltCtx.scale(1, 2.8);
      const gr = gltCtx.createRadialGradient(0, 0, 0, 0, 0, rad);
      gr.addColorStop(0, `rgba(${r},${g},${b},${(0.3 * I * sh).toFixed(3)})`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      gltCtx.fillStyle = gr;
      gltCtx.beginPath();
      gltCtx.arc(0, 0, rad, 0, 6.283);
      gltCtx.fill();
      gltCtx.restore();
    }

    function light(cx: number, sig: number, I: number, r: number, g: number, b: number, t: number, f: number, spRate: number) {
      if (!gltCtx || I < 0.01) return;
      gltCtx.lineCap = "round";
      const x0 = Math.max(2, cx - sig * 2.2);
      const x1 = Math.min(gW - 2, cx + sig * 2.2);
      for (const R of ROWS) {
        const spread = sig * (1 + (R.d / 92) * 0.9);
        const fall = I * (1 - (R.d / 92) * 0.55);
        for (let x = x0; x <= x1; x += spRate) {
          const u = (x - cx) / spread;
          if (u > 2.2 || u < -2.2) continue;
          const s = Math.sin(R.k * x - R.w * t + R.ph) + 0.3 * Math.sin(R.k * 2.3 * x + R.w * 1.7 * t + R.ph * 2.1);
          const target = cl(u * 0.55, -0.9, 0.9) * 0.6;
          const b0 = Math.exp(-Math.pow((s - target) / 0.3, 2));
          const a = fall * b0 * Math.exp(-u * u * 0.9);
          if (a < 0.04) continue;
          const yy = PAD + surfAt(x, f) + 3 + R.d + Math.sin(R.k * x * 0.5 + t * 0.7 + R.ph) * 1.5;
          const hw = ((3 + 9 * b0) * R.len) / 2;
          gltCtx.strokeStyle = `rgba(${r},${g},${b},${(a * 0.22).toFixed(3)})`;
          gltCtx.lineWidth = 4.2 * R.th;
          gltCtx.beginPath();
          gltCtx.moveTo(x - hw, yy);
          gltCtx.lineTo(x + hw, yy);
          gltCtx.stroke();
          gltCtx.strokeStyle = `rgba(${r},${g},${b},${Math.min(1, a * 1.15).toFixed(3)})`;
          gltCtx.lineWidth = 1.5 * R.th;
          gltCtx.beginPath();
          gltCtx.moveTo(x - hw, yy);
          gltCtx.lineTo(x + hw, yy);
          gltCtx.stroke();
        }
      }
    }

    const tickGlt = (t: number, dtms?: number) => {
      if (!gltCtx || rm) return;
      const dt = Math.min(0.1, (dtms || 16) / 1000);
      const k = 1 - Math.exp(-dt * 3);
      const s = oc.st();
      const f = frac(t);
      const todR = document.getElementById("todR") as HTMLInputElement | null;
      const h = (todR ? Number(todR.value) : 720) / 60;
      const aS = ((h - 6) / 24) * 2 * Math.PI;
      const aM = ((h - 18) / 24) * 2 * Math.PI;
      const sunE = Math.max(0, Math.sin(aS));
      const moonE = Math.max(0, Math.sin(aM));
      const night = h >= 12 ? ss(17.5, 20.5, h) : 1 - ss(4.5, 7, h);
      const wm = cl(Math.max(Math.exp(-Math.pow((h - 6.3) / 0.9, 2)), Math.exp(-Math.pow((h - 17.9) / 0.9, 2))) * 1.2, 0, 1);
      const mo = (window as unknown as { __moon?: { k?: number; red?: number } }).__moon || { k: 0.5, red: 0 };
      const rd = cl(mo.red || 0, 0, 1);

      curGlt.iS = lerp(curGlt.iS, ss(0, 0.12, sunE) * (0.4 + 0.6 * (1 - sunE)), k);
      curGlt.iM = lerp(curGlt.iM, moonE * night * (0.25 + 0.75 * (mo.k == null ? 0.5 : mo.k)) * (1 - 0.75 * rd), k);
      curGlt.iL = lerp(curGlt.iL, night * night, k);
      curGlt.r = lerp(curGlt.r, 255, k);
      curGlt.g = lerp(curGlt.g, lerp(244, 170, wm), k);
      curGlt.b = lerp(curGlt.b, lerp(214, 100, wm), k);
      curGlt.mr = lerp(curGlt.mr, lerp(200, 255, rd), k);
      curGlt.mg = lerp(curGlt.mg, lerp(220, 110, rd), k);
      curGlt.mb = lerp(curGlt.mb, lerp(255, 70, rd), k);

      gltCtx.clearRect(0, 0, gW, gHc);
      if (curGlt.iS < 0.01 && curGlt.iM < 0.01 && curGlt.iL < 0.01) return;

      gltCtx.globalCompositeOperation = "lighter";
      const spRate = Math.max(5, gW / 220);
      const xs = ((50 - 38 * Math.cos(aS)) / 100) * gW;
      const xm = ((50 - 38 * Math.cos(aM)) / 100) * gW;
      const sr = Math.round(curGlt.r);
      const sg = Math.round(curGlt.g);
      const sb = Math.round(curGlt.b);
      const mr = Math.round(curGlt.mr);
      const mg = Math.round(curGlt.mg);
      const mb = Math.round(curGlt.mb);

      glow(xs, curGlt.iS, sr, sg, sb, t, f);
      light(xs, gW * 0.08, curGlt.iS, sr, sg, sb, t, f, spRate);
      glow(xm, curGlt.iM, mr, mg, mb, t, f);
      light(xm, gW * 0.05, curGlt.iM, mr, mg, mb, t, f, spRate);

      // Pantulan lentera kapal
      if (curGlt.iL > 0.02) {
        const kk = s.sh / 110;
        const xo = (s.spw - 200 * kk) / 2;
        const lx0 = s.spx - s.spw / 2 + xo + 73.5 * kk;
        const ly0 = -0.88 * s.sh + 12 * kk;
        const an = (s.ca * Math.PI) / 180;
        const lx = s.spx + (lx0 - s.spx) * Math.cos(an) - ly0 * Math.sin(an);

        const gl = gltCtx.createRadialGradient(lx, PAD + s.cy + 6, 0, lx, PAD + s.cy + 6, 40);
        gl.addColorStop(0, `rgba(255,217,160,${(0.3 * curGlt.iL).toFixed(3)})`);
        gl.addColorStop(1, "rgba(255,217,160,0)");
        gltCtx.fillStyle = gl;
        gltCtx.fillRect(lx - 40, PAD + s.cy - 34, 80, 80);

        gltCtx.lineCap = "round";
        for (let j = 0; j < 14; j++) {
          const y2 = PAD + s.cy + 4 + j * 6;
          const x2 = lx + Math.sin(t * 1.8 + j * 0.9) * (2 + j * 0.7);
          const w2 = 15 - j * 0.9;
          const al = curGlt.iL * (1 - j / 14) * (0.7 + 0.3 * Math.sin(t * 2.2 + j * 1.1)) * 1.05;
          gltCtx.strokeStyle = `rgba(255,217,160,${(al * 0.25).toFixed(3)})`;
          gltCtx.lineWidth = 4.5;
          gltCtx.beginPath();
          gltCtx.moveTo(x2 - w2 / 2, y2 + 1);
          gltCtx.lineTo(x2 + w2 / 2, y2 + 1);
          gltCtx.stroke();
          gltCtx.strokeStyle = `rgba(255,217,160,${al.toFixed(3)})`;
          gltCtx.lineWidth = 2;
          gltCtx.beginPath();
          gltCtx.moveTo(x2 - w2 / 2, y2 + 1);
          gltCtx.lineTo(x2 + w2 / 2, y2 + 1);
          gltCtx.stroke();
        }
      }
      gltCtx.globalCompositeOperation = "source-over";
    };

    if (!rm) gsap.ticker.add(tickGlt);

    // ─── Kanvas Cipratan Air Realistis (.spl) ───────────────────────────
    const splCv = document.createElement("canvas");
    const splCtx = splCv.getContext("2d");
    const SPL_PAD = 170;
    splCv.className = "spl";
    splCv.setAttribute("aria-hidden", "true");
    tide.appendChild(splCv);

    let sW = 0;
    let sHc = 0;
    function sizeSpl() {
      if (!wv) return;
      sW = wv.clientWidth;
      sHc = wv.clientHeight + SPL_PAD + 60;
      splCv.width = sW;
      splCv.height = sHc;
      splCv.style.top = -SPL_PAD + "px";
      splCv.style.height = sHc + "px";
    }
    sizeSpl();
    window.addEventListener("resize", sizeSpl);
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(sizeSpl).observe(wv);
    }

    interface SplashEvent {
      x: number;
      t: number;
      sc: number;
      big: boolean;
      dr: { x: number; y: number; vx: number; vy: number; w: number; l: number; dead?: boolean }[];
      crown: { a: number; h: number; lean: number }[];
      rings: number[];
    }
    const splashList: SplashEvent[] = [];
    let splLt = 0;
    let splRunning = false;

    const tickSpl = () => {
      if (!splCtx) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - splLt) / 1000);
      splLt = now;
      splCtx.clearRect(0, 0, sW, sHc);

      for (let i = splashList.length - 1; i >= 0; i--) {
        const e = splashList[i];
        e.t += dt;
        const t = e.t;
        const sc = e.sc;
        if (t > 1.6) {
          splashList.splice(i, 1);
          continue;
        }
        const ox = e.x;
        const oy = SPL_PAD + surfAt(e.x, frac(now / 1000));

        // Buih permukaan
        const fa = Math.max(0, 1 - t / 1.1) * 0.5;
        const fr = (8 + 60 * (1 - Math.exp(-t * 3))) * sc * (e.big ? 1 : 0.7);
        const gf = splCtx.createRadialGradient(ox, oy, 0, ox, oy, fr);
        gf.addColorStop(0, `rgba(240,250,255,${fa})`);
        gf.addColorStop(0.6, `rgba(225,243,252,${fa * 0.5})`);
        gf.addColorStop(1, "rgba(225,243,252,0)");
        splCtx.save();
        splCtx.translate(ox, oy);
        splCtx.scale(1, 0.26);
        splCtx.translate(-ox, -oy);
        splCtx.fillStyle = gf;
        splCtx.beginPath();
        splCtx.arc(ox, oy, fr, 0, 6.283);
        splCtx.fill();
        splCtx.restore();

        // Semburan tengah runcing
        if (t < 0.55) {
          const u = t / 0.55;
          const h = (e.big ? 92 : 48) * sc * Math.sin(u * Math.PI * 0.5) * (1 - Math.pow(u, 2.2) * 0.9);
          const wb = (e.big ? 9 : 5) * sc * (1 - u * 0.5);
          if (h > 1) {
            const gj = splCtx.createLinearGradient(0, oy, 0, oy - h);
            gj.addColorStop(0, "rgba(232,247,255,.85)");
            gj.addColorStop(0.6, "rgba(232,247,255,.5)");
            gj.addColorStop(1, "rgba(232,247,255,0)");
            splCtx.fillStyle = gj;
            splCtx.beginPath();
            splCtx.moveTo(ox - wb, oy);
            splCtx.quadraticCurveTo(ox - wb * 0.4, oy - h * 0.55, ox + wb * 0.15 * Math.sin(t * 9), oy - h);
            splCtx.quadraticCurveTo(ox + wb * 0.4, oy - h * 0.55, ox + wb, oy);
            splCtx.closePath();
            splCtx.fill();
          }
        }

        // Mahkota air di sekeliling
        if (t < 0.5) {
          const u = t / 0.5;
          e.crown.forEach((c) => {
            const hh = c.h * Math.pow(Math.sin(u * Math.PI), 0.8);
            const rx = (14 + 26 * u) * sc * (e.big ? 1 : 0.7);
            const bx = ox + Math.cos(c.a) * rx;
            const by = oy + Math.sin(c.a) * rx * 0.26;
            splCtx.strokeStyle = `rgba(236,248,255,${0.5 * (1 - u)})`;
            splCtx.lineWidth = 1.6 * sc;
            splCtx.lineCap = "round";
            splCtx.beginPath();
            splCtx.moveTo(bx, by);
            splCtx.lineTo(bx + Math.cos(c.a) * hh * 0.4 + c.lean * hh * 0.4, by - hh);
            splCtx.stroke();
          });
        }

        // Tetesan memanjang
        e.dr.forEach((d) => {
          if (d.dead || t > d.l + 0.5) return;
          d.vy += 900 * sc * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          if (d.y > 0 && d.vy > 0) {
            d.dead = true;
            return;
          }
          const px = ox + d.x;
          const py = oy + d.y;
          const a = Math.max(0, 1 - t / (d.l + 0.5)) * 0.9;
          splCtx.strokeStyle = `rgba(236,248,255,${a})`;
          splCtx.lineWidth = d.w;
          splCtx.lineCap = "round";
          splCtx.beginPath();
          splCtx.moveTo(px - d.vx * 0.014, py - d.vy * 0.014);
          splCtx.lineTo(px, py);
          splCtx.stroke();
        });

        // Cincin riak elips
        e.rings.forEach((dl) => {
          const u = (t - dl) / 1.2;
          if (u <= 0 || u >= 1) return;
          const r = (e.big ? 78 : 40) * sc * (1 - Math.pow(1 - u, 2.2));
          splCtx.strokeStyle = `rgba(240,250,255,${(0.55 * (1 - u)).toFixed(3)})`;
          splCtx.lineWidth = Math.max(0.4, 1.7 * (1 - u));
          splCtx.beginPath();
          splCtx.ellipse(ox, oy, r, r * 0.26, 0, 0, 6.283);
          splCtx.stroke();
        });
      }

      if (!splashList.length) {
        gsap.ticker.remove(tickSpl);
        splRunning = false;
      }
    };

    // Override splash function dengan simulasi kanvas realistis
    oc.splash = (x: number, y: number, big?: boolean, silent?: boolean) => {
      if (!silent) document.dispatchEvent(new CustomEvent("ocean:splash"));
      const sc = Math.max(0.7, oc.st().sh / 110) * (big ? 1 : 0.55);
      const n = big ? 30 : 12;
      const ev: SplashEvent = {
        x,
        t: 0,
        sc,
        big: !!big,
        dr: [],
        crown: [],
        rings: big ? [0, 0.12, 0.26] : [0, 0.14],
      };
      for (let i = 0; i < n; i++) {
        const a = (-90 + (rnd() - 0.5) * (big ? 110 : 90)) * (Math.PI / 180);
        const sp2 = (120 + rnd() * 260) * sc;
        ev.dr.push({ x: 0, y: 0, vx: Math.cos(a) * sp2, vy: Math.sin(a) * sp2, w: 0.8 + rnd() * 1.6 * sc, l: 0.35 + rnd() * 0.35 });
      }
      const nc = big ? 18 : 8;
      for (let i = 0; i < nc; i++) {
        ev.crown.push({ a: (i / nc) * Math.PI * 2, h: (0.5 + rnd() * 0.5) * 34 * sc, lean: (rnd() - 0.5) * 0.5 });
      }
      splashList.push(ev);
      if (!splRunning) {
        splRunning = true;
        splLt = performance.now();
        gsap.ticker.add(tickSpl);
      }
    };

    // ─── Cleanup ────────────────────────────────────────────────────────
    return () => {
      gsap.ticker.remove(tickShip);
      gsap.ticker.remove(stepRods);
      gsap.ticker.remove(patchStep);
      gsap.ticker.remove(tickGlt);
      gsap.ticker.remove(tickSpl);
      window.removeEventListener("resize", lay);
      window.removeEventListener("resize", sizeGlt);
      window.removeEventListener("resize", sizeSpl);
      window.removeEventListener("scroll", onScroll);
      clearInterval(layTimer);
      if (autoBiteTimer) clearTimeout(autoBiteTimer);
      if (ro) ro.disconnect();
      if (idleTween) idleTween.kill();
      if (waveTween) waveTween.kill();
      foam.remove();
      lnSvg.remove();
      gltCv.remove();
      splCv.remove();
      sbtns.forEach((b) => b.remove());
      setOceanContext(null);
    };
  }, [reducedMotion]);

  // Warna autentik dari referensi HTML 7: lambung navy pekat (#0b2a4a) & jaket (#174676)
  const H = "#0b2a4a";
  const Jk = "#174676";

  return (
    <div ref={containerRef} className="sp" aria-hidden="true">
      {/* Hull SVG */}
      <svg className="hl" viewBox="0 0 200 110" aria-hidden="true">
        <defs>
          <clipPath id="hullMask">
            <path d="M8 62H186Q176 92 154 98H38Q16 92 8 62Z" />
          </clipPath>
        </defs>
        <g fill={H}>
          <path d="M8 62H186Q176 92 154 98H38Q16 92 8 62Z" />
          <path d="M52 38h36q3 0 3 3v21H49V41q0-3 3-3z" />
          <rect x="72" y="16" width="3" height="24" />
          <path d="M75 10l13 4-13 4z" />
        </g>
        <g clipPath="url(#hullMask)">
          <path d="M12 66H182" stroke="#ffd9a0" strokeOpacity=".45" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M15 73Q100 75 181 73" stroke="#ff9f43" strokeOpacity=".85" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="52" r="5" fill="none" stroke="#ff9f43" strokeWidth="2" />
        <rect className="win" x="66" y="43" width="8" height="8" rx="1.5" fill="#ffd9a0" />
        <rect className="win" x="77" y="43" width="8" height="8" rx="1.5" fill="#ffd9a0" />
        <g className="lamp">
          <circle cx="73.5" cy="12" r="10" fill="#ffd9a0" opacity=".3" />
          <circle cx="73.5" cy="12" r="3.2" fill="#ffe9b0" />
        </g>

        {/* Nelayan 1 (berdiri, topi kuning) */}
        <g>
          <path d="M101.6 50v12M106.4 50v12" stroke={H} strokeWidth="3.6" strokeLinecap="round" fill="none" />
          <path d="M99 37q0-3.5 5-3.5t5 3.5v14h-10z" fill={Jk} />
          <path d="M106 39L112 45" stroke={Jk} strokeWidth="3" strokeLinecap="round" />
          <circle cx="104" cy="30" r="4.8" fill="#e2b48b" />
          <path d="M97.5 28.5h13" stroke="#ffd27a" strokeWidth="2" strokeLinecap="round" />
          <path d="M99.4 28.5a4.6 4.2 0 0 1 9.2 0z" fill="#ffd27a" />
          <circle cx="112" cy="45" r="1.7" fill="#ffd9a0" />
        </g>

        {/* Nelayan 2 (duduk di bangku, topi oranye) */}
        <g>
          <rect x="121" y="57" width="14" height="6" rx="1" fill="#16406b" />
          <path d="M125.6 59l9 3M130.4 59l9 6" stroke={H} strokeWidth="3.6" strokeLinecap="round" fill="none" />
          <path d="M123 46q0-3.5 5-3.5t5 3.5v14h-10z" fill={Jk} />
          <path d="M130 48L136 54" stroke={Jk} strokeWidth="3" strokeLinecap="round" />
          <circle cx="128" cy="39" r="4.8" fill="#e2b48b" />
          <path d="M121.5 37.5h13" stroke="#ff9f43" strokeWidth="2" strokeLinecap="round" />
          <path d="M123.4 37.5a4.6 4.2 0 0 1 9.2 0z" fill="#ff9f43" />
          <circle cx="136" cy="54" r="1.7" fill="#ffd9a0" />
        </g>

        {/* Nelayan 3 (berdiri, topi merah) */}
        <g>
          <path d="M151.6 50v12M156.4 50v12" stroke={H} strokeWidth="3.6" strokeLinecap="round" fill="none" />
          <path d="M149 37q0-3.5 5-3.5t5 3.5v14h-10z" fill={Jk} />
          <path d="M156 39L162 45" stroke={Jk} strokeWidth="3" strokeLinecap="round" />
          <circle cx="154" cy="30" r="4.8" fill="#e2b48b" />
          <path d="M147.5 28.5h13" stroke="#e85d5d" strokeWidth="2" strokeLinecap="round" />
          <path d="M149.4 28.5a4.6 4.2 0 0 1 9.2 0z" fill="#e85d5d" />
          <circle cx="162" cy="45" r="1.7" fill="#ffd9a0" />
        </g>
      </svg>

      {/* Penyelam Bersendi (Diver dvw) */}
      <div className="dvw">
        <svg viewBox="0 0 60 100" aria-hidden="true">
          <g className="l2">
            <path d="M30 56v18" stroke="#0c3153" strokeWidth="7" strokeLinecap="round" />
            <g className="s2">
              <path d="M30 74v18" stroke="#0c3153" strokeWidth="6.4" strokeLinecap="round" />
              <path d="M30 92l-10 4 10 3z" fill="#e08a2e" />
            </g>
          </g>
          <g className="to">
            <rect x="36" y="35" width="6" height="16" rx="3" fill="#9fb6c8" />
            <g className="ar">
              <path d="M30 38v11" stroke="#0c3153" strokeWidth="5" strokeLinecap="round" />
              <g className="fr">
                <path d="M30 49v10" stroke="#0c3153" strokeWidth="4.6" strokeLinecap="round" />
              </g>
            </g>
            <rect x="23" y="34" width="14" height="24" rx="5" fill="#0f3b63" />
            <path d="M28 35v22" stroke="#ff9f43" strokeWidth="2" />
            <circle cx="28" cy="25" r="6.2" fill="#f2c9a0" />
            <path d="M22 24q2-8 11-5" stroke="#3a2a22" strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="21.2" y="23" width="6.2" height="4.6" rx="2" fill="#9fe3ff" stroke="#0a2a4a" strokeWidth="1.4" />
            <g className="al">
              <path d="M30 38v11" stroke="#14456f" strokeWidth="5" strokeLinecap="round" />
              <g className="fl">
                <path d="M30 49v10" stroke="#14456f" strokeWidth="4.6" strokeLinecap="round" />
                <circle cx="30" cy="60" r="2.6" fill="#f2c9a0" />
              </g>
            </g>
          </g>
          <g className="l1">
            <path d="M30 56v18" stroke="#14456f" strokeWidth="7" strokeLinecap="round" />
            <g className="s1">
              <path d="M30 74v18" stroke="#14456f" strokeWidth="6.4" strokeLinecap="round" />
              <path d="M30 92l-11 4 11 3z" fill="#ffd27a" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
