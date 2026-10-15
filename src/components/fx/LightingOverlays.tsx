"use client";

/**
 * LightingOverlays — F4: Pencahayaan mengikuti waktu v2.
 * Overlay senja, malam, berkas cahaya, gelap kedalaman, senter kursor.
 * Semua diupdate via gsap.ticker tanpa React re-render.
 */

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { skyEngine } from "@/lib/skyTimeEngine";
import { oceanStore } from "@/lib/oceanStore";

export default function LightingOverlays({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const wrRef = useRef<HTMLDivElement>(null);   // warm overlay (sunset tint)
  const ntRef = useRef<HTMLDivElement>(null);   // night overlay
  const shRef = useRef<HTMLDivElement>(null);   // light shafts
  const dkRef = useRef<HTMLDivElement>(null);   // deep dark overlay
  const tnRef = useRef<HTMLDivElement>(null);   // tint overlay
  const tcRef = useRef<HTMLDivElement>(null);   // torch cursor

  useEffect(() => {
    const wr = wrRef.current;
    const nt = ntRef.current;
    const sh = shRef.current;
    const dk = dkRef.current;
    const tn = tnRef.current;
    const tc = tcRef.current;
    if (!wr || !nt || !sh || !dk || !tn || !tc) return;

    // Pointer tracking for torch + flash
    const onPointer = (e: PointerEvent) => {
      skyEngine.setPointer(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => {
      const depth = oceanStore.getUnderwaterDepth();
      if (depth > 40) {
        const t = e.target as HTMLElement;
        if (t.closest?.("a,button,input,#portal,#nav,#menu,.gauge,.aud,.up,.todx")) return;
        skyEngine.triggerFlash();
      }
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown);

    // Caustics canvas reference
    const cv = document.querySelector("#bub .gl") as HTMLElement | null;

    let lastT = 0;
    const tick = (t: number) => {
      const dt = Math.min(0.05, t - lastT);
      lastT = t;

      const depth = oceanStore.getUnderwaterDepth();
      skyEngine.updateLighting(depth, t, dt, reducedMotion);

      const L = skyEngine.light;
      wr.style.opacity = L.warmAlpha.toFixed(3);
      nt.style.opacity = L.nightAlpha.toFixed(3);
      sh.style.opacity = L.shaftOpacity.toFixed(3);
      dk.style.opacity = L.darkAlpha.toFixed(3);
      tn.style.opacity = L.tintAlpha.toFixed(3);

      sh.style.setProperty("--lx", L.shaftX.toFixed(1) + "%");
      sh.style.setProperty("--lc", L.shaftColor);
      sh.style.setProperty("--sa", L.shaftAngle.toFixed(2) + "deg");
      tn.style.backgroundColor = `rgb(${L.shaftColor})`;

      tc.style.opacity = L.torchAlpha.toFixed(3);
      // torch position is updated from skyEngine internal tx/ty
      const sE = skyEngine as any;
      if (sE.tx > -900) {
        tc.style.transform = `translate3d(${(sE.tx - 320).toFixed(1)}px,${(sE.ty - 320).toFixed(1)}px,0) scale(${(1 + sE.flash * 0.7).toFixed(3)})`;
      }

      if (cv) cv.style.opacity = L.causticsGl.toFixed(3);
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [reducedMotion]);

  return (
    <>
      <div ref={wrRef} id="lgW" aria-hidden="true" />
      <div ref={ntRef} id="lgN" aria-hidden="true" />
      <div ref={shRef} id="shafts" aria-hidden="true" />
      <div ref={dkRef} id="lgD" aria-hidden="true" />
      <div ref={tnRef} id="lgT" aria-hidden="true" />
      <div ref={tcRef} id="torch" aria-hidden="true" />
    </>
  );
}
