"use client";

/**
 * TimePanel — F2: Panel waktu interaktif di hero section.
 * Bisa diperkecil jadi bola (orb), preset fase hari, putar hari.
 * Berpadanan langsung dengan .todx di v4 HTML.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { skyEngine } from "@/lib/skyTimeEngine";

interface TimePanelProps {
  reducedMotion?: boolean;
}

const PRESETS: [string, number][] = [
  ["Subuh", 5],
  ["Pagi", 8],
  ["Siang", 12],
  ["Sore", 16.5],
  ["Senja", 18.3],
  ["Malam", 22],
];

export default function TimePanel({ reducedMotion = false }: TimePanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const moonLabelRef = useRef<HTMLSpanElement>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const twRef = useRef<gsap.core.Timeline | null>(null);

  const [min, setMin] = useState(false);
  const [auto, setAuto] = useState(true);
  const [playing, setPlaying] = useState(false);
  const driveRef = useRef<gsap.core.Tween | null>(null);
  const touchedRef = useRef(false);

  // ─── Sinkron awal ────────────────────────────────────
  useEffect(() => {
    skyEngine.startAutoSync();
    return () => skyEngine.stopAutoSync();
  }, []);

  // ─── Render per-frame (tanpa setState) ────────────────
  useEffect(() => {
    const label = labelRef.current;
    const moonLabel = moonLabelRef.current;
    const slider = sliderRef.current;
    if (!label || !slider) return;

    const unsub = skyEngine.subscribe(() => {
      label.textContent = skyEngine.sky.label;
      slider.value = String(Math.round(skyEngine.sky.hour * 60));
      if (moonLabel) {
        moonLabel.textContent =
          skyEngine.moon.phaseName +
          (skyEngine.moon.eclipse ? " · Gerhana" : "");
      }
    });
    // Initial render
    label.textContent = skyEngine.sky.label;
    slider.value = String(Math.round(skyEngine.sky.hour * 60));
    if (moonLabel) {
      moonLabel.textContent =
        skyEngine.moon.phaseName +
        (skyEngine.moon.eclipse ? " · Gerhana" : "");
    }

    return unsub;
  }, []);

  // ─── Minimize / Maximize ──────────────────────────────
  const doSetMin = useCallback(
    (v: boolean, instant?: boolean, save?: boolean) => {
      setMin(v);
      const T = ref.current;
      const main = mainRef.current;
      const orb = orbRef.current;
      if (!T || !main || !orb) return;

      if (twRef.current) twRef.current.kill();

      T.classList.toggle("min", v);
      orb.setAttribute("aria-expanded", String(!v));
      orb.setAttribute(
        "aria-label",
        v ? "Buka panel waktu" : "Kecilkan panel waktu"
      );

      if (instant || !gsap || reducedMotion) {
        T.style.width = v ? "56px" : "";
        T.style.height = v ? "56px" : "";
        T.style.borderRadius = v ? "28px" : "26px";
        main.style.opacity = v ? "0" : "1";
        main.style.visibility = v ? "hidden" : "visible";
      } else if (v) {
        const tw = gsap.timeline({ defaults: { ease: "power3.inOut" } });
        tw.to(main, { opacity: 0, x: -12, duration: 0.22, ease: "power2.in" }, 0);
        tw.to(T, { width: 56, height: 56, borderRadius: 28, duration: 0.55 }, 0.05);
        tw.add(() => { main.style.visibility = "hidden"; }, 0.3);
        tw.fromTo(orb, { scale: 1 }, { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.45);
        twRef.current = tw;
      } else {
        main.style.visibility = "visible";
        const tw = gsap.timeline({ defaults: { ease: "power3.inOut" } });
        // Take snapshot of desired dimensions
        const dims = { w: main.offsetWidth + 72, h: main.offsetHeight + 18 };
        tw.to(T, { width: dims.w, height: dims.h, borderRadius: 26, duration: 0.55 }, 0);
        tw.fromTo(main, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }, 0.18);
        tw.from(main.children, { y: 8, opacity: 0, stagger: 0.06, duration: 0.35, ease: "power2.out" }, 0.22);
        twRef.current = tw;
      }

      if (save) {
        try { localStorage.setItem("todMin", v ? "1" : "0"); } catch { /* ignore */ }
      }
    },
    [reducedMotion]
  );

  // ─── Auto-minimize setelah 6.5 detik ──────────────────
  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem("todMin"); } catch { /* ignore */ }

    if (stored === "1" || matchMedia("(max-width:760px),(max-height:520px)").matches) {
      doSetMin(true, true, false);
    } else if (stored === null) {
      const timer = setTimeout(() => {
        if (!touchedRef.current) doSetMin(true, false, false);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [doSetMin]);

  // ─── Fade saat scroll ─────────────────────────────────
  useEffect(() => {
    const T = ref.current;
    if (!T) return;
    const fade = () => {
      const o = Math.max(0, 1 - scrollY / (window.innerHeight * 0.3));
      T.style.opacity = o.toFixed(3);
      T.style.pointerEvents = o < 0.1 ? "none" : "auto";
    };
    window.addEventListener("scroll", fade, { passive: true });
    fade();
    return () => window.removeEventListener("scroll", fade);
  }, []);

  // ─── Handler slider ───────────────────────────────────
  const handleSliderInput = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    stopDrive();
    setAuto(false);
    skyEngine.setAuto(false);
    skyEngine.setHour(Number(slider.value) / 60);
  }, []);

  // ─── Preset chip klik ─────────────────────────────────
  const handleChipClick = useCallback(
    (h: number) => {
      stopDrive();
      setAuto(false);
      skyEngine.setAuto(false);
      if (gsap && !reducedMotion) {
        const o = { v: skyEngine.sky.hour };
        const d = ((h - o.v + 36) % 24) - 12;
        const tween = gsap.to(o, {
          v: o.v + d,
          duration: 1.8,
          ease: "sine.inOut",
          onUpdate: () => skyEngine.setHour(o.v),
          onComplete: () => { driveRef.current = null; },
        });
        driveRef.current = tween;
      } else {
        skyEngine.setHour(h);
      }
    },
    [reducedMotion]
  );

  // ─── Otomatis ─────────────────────────────────────────
  const handleAuto = useCallback(() => {
    stopDrive();
    setAuto(true);
    skyEngine.setAuto(true);
    if (gsap && !reducedMotion) {
      const target = skyEngine.realHour();
      const o = { v: skyEngine.sky.hour };
      gsap.to(o, {
        v: target,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => skyEngine.setHour(o.v),
      });
    } else {
      skyEngine.setHour(skyEngine.realHour());
    }
  }, [reducedMotion]);

  // ─── Putar hari ───────────────────────────────────────
  const handlePlay = useCallback(() => {
    if (playing) {
      stopDrive();
      return;
    }
    stopDrive();
    setPlaying(true);
    setAuto(false);
    skyEngine.setAuto(false);
    const o = { v: skyEngine.sky.hour };
    driveRef.current = gsap.to(o, {
      v: o.v + 24,
      duration: 24,
      ease: "none",
      repeat: -1,
      onUpdate: () => skyEngine.setHour(o.v),
    });
  }, [playing]);

  function stopDrive() {
    if (driveRef.current) {
      driveRef.current.kill();
      driveRef.current = null;
    }
    setPlaying(false);
  }

  // ─── Fase bulan ────────────────────────────────────────
  const handleMoonPrev = useCallback(() => skyEngine.stepMoonPhase(-1), []);
  const handleMoonNext = useCallback(() => skyEngine.stepMoonPhase(1), []);

  // ─── Keyboard T ────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.matches?.("input,textarea,select")) return;
      const portal = document.getElementById("portal");
      if (portal && !portal.hidden) return;
      if (e.key === "t" || e.key === "T") {
        doSetMin(!min, false, true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [min, doSetMin]);

  return (
    <div
      ref={ref}
      className="todx"
      id="todx"
      style={{ willChange: "width,height" }}
    >
      <button
        ref={orbRef}
        type="button"
        className="tod-orb"
        aria-expanded="true"
        aria-label="Kecilkan panel waktu"
        onClick={() => {
          touchedRef.current = true;
          doSetMin(!min, false, true);
        }}
      >
        <span className="tod-ic" id="todIc" aria-hidden="true" suppressHydrationWarning>
          ☀
        </span>
      </button>

      <div ref={mainRef} className="tod-main">
        {/* Header */}
        <div className="tod-hd">
          <span ref={labelRef} className="tod-l" id="todL" suppressHydrationWarning>
            &nbsp;
          </span>
          <button
            type="button"
            className="tod-x"
            onClick={() => doSetMin(true, false, true)}
          >
            −
          </button>
        </div>

        {/* Slider */}
        <div className="tod-body">
          <input
            ref={sliderRef}
            id="todR"
            type="range"
            min="0"
            max="1439"
            step="1"
            defaultValue="720"
            aria-label="Waktu di langit"
            suppressHydrationWarning
            onInput={handleSliderInput}
            onPointerDown={() => {
              touchedRef.current = true;
              stopDrive();
            }}
          />
        </div>

        {/* Chip preset */}
        <div className="tod-chips" role="group" aria-label="Pilih waktu">
          {PRESETS.map(([name, h]) => (
            <button
              key={name}
              type="button"
              className="tod-c"
              data-n={name}
              data-h={h}
              onClick={() => handleChipClick(h)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Moon phase row */}
        <div className="tod-moon">
          <button
            type="button"
            className="tod-c"
            aria-label="Fase bulan sebelumnya"
            onClick={handleMoonPrev}
          >
            ‹
          </button>
          <span ref={moonLabelRef} id="mLbl" suppressHydrationWarning>
            &nbsp;
          </span>
          <button
            type="button"
            className="tod-c"
            aria-label="Fase bulan berikutnya"
            onClick={handleMoonNext}
          >
            ›
          </button>
        </div>

        {/* Controls row */}
        <div className="tod-ctl">
          <button
            type="button"
            className={`tod-a${auto ? " on" : ""}`}
            id="todA"
            aria-pressed={auto}
            onClick={handleAuto}
          >
            Otomatis
          </button>
          <button
            type="button"
            className="tod-a tod-play"
            aria-pressed={playing}
            onClick={handlePlay}
          >
            {playing ? "⏸ Jeda" : "▶ Putar hari"}
          </button>
        </div>
      </div>
    </div>
  );
}
