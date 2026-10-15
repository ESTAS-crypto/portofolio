"use client";

/**
 * CelestialBodies — F1/F3: Mengelola posisi orbit matahari & bulan + render bulan SVG fasa.
 * Posisi diupdate via skyEngine setiap notify tanpa React re-render.
 */

import { useRef, useEffect } from "react";
import { skyEngine } from "@/lib/skyTimeEngine";

export default function CelestialBodies({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const celRef = useRef<HTMLDivElement>(null);   // sun orbit wrapper
  const moonRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<SVGPathElement>(null);
  const shRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const cel = celRef.current;
    const moon = moonRef.current;
    const lit = litRef.current;
    const sh = shRef.current;
    const hero = cel?.closest("#hero") as HTMLElement | null;
    if (!cel || !moon || !hero) return;

    function render() {
      const { sunX, sunY, moonX, moonY, starOpacity, cloudOpacity, heroTextColor, birdColor } = skyEngine.sky;
      const W = hero!.clientWidth;
      const H = hero!.clientHeight;

      cel!.style.transform = `translate3d(${(sunX * W / 100).toFixed(1)}px,${(sunY * H / 100).toFixed(1)}px,0)`;
      moon!.style.transform = `translate3d(${(moonX * W / 100).toFixed(1)}px,${(moonY * H / 100).toFixed(1)}px,0)`;

      hero!.style.setProperty("--stars", starOpacity.toFixed(3));
      hero!.style.setProperty("--clo", cloudOpacity.toFixed(3));
      hero!.style.setProperty("--hc", heroTextColor);
      hero!.style.setProperty("--bc", birdColor);

      // Moon phase SVG
      if (lit && sh) {
        const mo = skyEngine.moon;
        const f = mo.fraction;
        const th = f * 2 * Math.PI;
        const wax = f < 0.5;
        const c = Math.cos(wax ? th : 2 * Math.PI - th);
        const rx = Math.max(Math.abs(c) * 50, 0.01);

        lit.setAttribute(
          "d",
          `M0 -50A50 50 0 0 1 0 50A${rx.toFixed(2)} 50 0 0 ${c >= 0 ? 0 : 1} 0 -50Z`
        );
        lit.setAttribute("transform", wax ? "" : "scale(-1 1)");

        // Eclipse shadow
        const h = skyEngine.sky.hour;
        const u = (h >= 22 || h < 2) ? (h >= 22 ? h - 22 : h + 2) / 4 : -1;
        const full = Math.abs(((mo.age % 29.530588) + 29.530588) % 29.530588 - 29.530588 / 2) < 1;
        const active = mo.eclipseEnabled && full && u >= 0;
        if (active) {
          sh.setAttribute("cx", ((u * 2 - 1) * 145).toFixed(1));
        } else {
          sh.setAttribute("cx", "-999");
        }

        // Moon glow
        const k = mo.illumination;
        const red = mo.eclipseRed;
        moon!.style.filter = `drop-shadow(0 0 ${(10 + 30 * k * (1 - red * 0.6)).toFixed(1)}px rgba(${Math.round(190 + 65 * red)},${Math.round(210 - 100 * red)},${Math.round(255 - 185 * red)},${(0.15 + 0.5 * k * (1 - red * 0.5)).toFixed(2)}))`;
      }
    }

    const unsub = skyEngine.subscribe(render);
    render();

    const ro = new ResizeObserver(render);
    ro.observe(hero);

    return () => {
      unsub();
      ro.disconnect();
    };
  }, []);

  return (
    <>
      {/* Sun orbit wrapper — wraps the existing .sun div */}
      <div ref={celRef} className="cel" aria-hidden="true" />

      {/* Moon */}
      <div ref={moonRef} className="moon mx" aria-hidden="true">
        <svg viewBox="-62 -62 124 124" aria-hidden="true">
          <defs>
            <radialGradient id="mlit" cx=".38" cy=".35" r=".8">
              <stop offset="0" stopColor="#fff" />
              <stop offset=".55" stopColor="#eaf0ff" />
              <stop offset="1" stopColor="#b9c8ee" />
            </radialGradient>
            <radialGradient id="mumb">
              <stop offset="0" stopColor="#962d14" stopOpacity=".92" />
              <stop offset=".72" stopColor="#782310" stopOpacity=".9" />
              <stop offset=".92" stopColor="#3c140c" stopOpacity=".72" />
              <stop offset="1" stopColor="#140808" stopOpacity="0" />
            </radialGradient>
            <clipPath id="mclip">
              <circle r="50" />
            </clipPath>
          </defs>
          <circle r="50" fill="#8296c8" fillOpacity=".16" />
          <path ref={litRef} id="mLit" fill="url(#mlit)" />
          <g clipPath="url(#mclip)">
            <circle ref={shRef} id="mSh" r="95" cx="-999" fill="url(#mumb)" />
          </g>
        </svg>
      </div>
    </>
  );
}
