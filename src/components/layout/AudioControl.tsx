"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { audioEngine } from "@/lib/audioEngine";
import { oceanStore } from "@/lib/oceanStore";
import { useCalm } from "@/hooks/useOceanStore";
import { skyEngine } from "@/lib/skyTimeEngine";

export default function AudioControl({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [isCalm, toggleCalm] = useCalm();
  const [mixerOpen, setMixerOpen] = useState(false);
  const [mix, setMix] = useState({ amb: 100, mus: 100, sfx: 100 });
  const lastDecRef = useRef(6);
  const lastHovRef = useRef(0);

  // Load saved mixer values
  useEffect(() => {
    try {
      const saved = localStorage.getItem("audioMix");
      if (saved) {
        const parsed = JSON.parse(saved);
        const amb = Math.round((parsed.amb ?? 1) * 100);
        const mus = Math.round((parsed.mus ?? 1) * 100);
        const sfx = Math.round((parsed.sfx ?? 1) * 100);
        setMix({ amb, mus, sfx });
        audioEngine.setMix("amb", amb / 100);
        audioEngine.setMix("mus", mus / 100);
        audioEngine.setMix("sfx", sfx / 100);
      }
    } catch (_) { /* ignore */ }
  }, []);

  // Matikan audio otomatis jika Mode Tenang diaktifkan
  useEffect(() => {
    if (isCalm && isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    }
  }, [isCalm, isPlaying]);

  // Global Interactive Audio Handlers (persis HTML referensi v4)
  useEffect(() => {
    const idx = (el: Element, sel: string) =>
      Array.from(document.querySelectorAll(sel)).indexOf(el);

    const MAP: [string, (el: HTMLElement) => void][] = [
      ["#links a", (el) => audioEngine.sf.bloop(idx(el, "#links a"))],
      ["#nav .brand, a.brand", () => audioEngine.sf.blub()],
      ["#burger", () => {
        const b = document.getElementById("burger");
        const exp = b?.getAttribute("aria-expanded") === "true";
        if (exp) audioEngine.sf.open(); else audioEngine.sf.close();
      }],
      ["#nav .cta, a.cta", () => audioEngine.sf.sonar()],
      [".tod-orb", () => {
        const tx = document.getElementById("todx");
        if (tx && tx.classList.contains("min")) audioEngine.sf.close(); else audioEngine.sf.open();
      }],
      [".tod-c", (el) => audioEngine.sf.chime(el.textContent?.trim() || "")],
      [".tod-play", () => audioEngine.sf.tick()],
      ["#todA", () => audioEngine.sf.ting()],
      [".tod-x", () => audioEngine.sf.close()],
      [".g-sec", (el) => audioEngine.sf.bloop(2 + idx(el, ".g-sec"))],
      [".up, #up", () => audioEngine.sf.rise()],
      [".row span, .marq span[role='button']", (el) => audioEngine.sf.blip(idx(el, ".row span, .marq span[role='button']"))],
      [".fish, .card", () => audioEngine.sf.glug()],
      ["#px, .p-close", () => audioEngine.sf.close()],
      ["#pp, .p-prev", () => audioEngine.sf.swish(-1)],
      ["#pn, .p-next", () => audioEngine.sf.swish(1)],
      ["#pl, .p-link", () => audioEngine.sf.ting()],
      ["#cpy, #copyEmail", () => audioEngine.sf.kaching()],
      ["#contact .links a, .contact-link", (el) => audioEngine.sf.pluckS(idx(el, "#contact .links a, .contact-link"))],
      ["#chest, .chest-wrap", () => audioEngine.sf.chest()],
      ["#mixBtn", () => audioEngine.sf.blip(3)],
      ["#bdHit, .bd-hit", () => audioEngine.sf.giggle()],
      [".btn.mag", () => audioEngine.sf.ting()],
    ];

    const handleClick = (e: MouseEvent) => {
      if (!audioEngine.getActive()) return;
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("#audBtn")) return;

      // Cek pemetaan selector spesifik
      for (const [selector, handler] of MAP) {
        const match = target.closest(selector);
        if (match) {
          handler(match as HTMLElement);
          return;
        }
      }

      // Fallback: tombol atau tautan umum apapun yang diklik berbunyi pop
      const generalBtn = target.closest("a, button, [role='button']");
      if (generalBtn) {
        audioEngine.pop(480 + Math.random() * 160);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (!audioEngine.getActive() || !window.matchMedia("(pointer:fine)").matches) return;
      const target = e.target as HTMLElement | null;
      const fish = target?.closest(".fish");
      const now = performance.now();
      if (fish && now - lastHovRef.current > 80 && fish !== e.relatedTarget) {
        lastHovRef.current = now;
        audioEngine.sf.plip();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!audioEngine.getActive()) return;
      const target = e.target as HTMLElement | null;
      const depth = oceanStore.getState().m;
      const isUi = target?.closest(
        "a, button, input, textarea, select, label, #portal, #nav, #menu, .gauge, .aud, .up, .todx"
      );
      if (depth >= 40 && !isUi) {
        audioEngine.sf.plip();
      }
    };

    const handleInput = (e: Event) => {
      if (!audioEngine.getActive()) return;
      const target = e.target as HTMLInputElement | null;
      if (!target) return;
      if (target.id === "todR" && performance.now() - lastHovRef.current > 60) {
        lastHovRef.current = performance.now();
        const hr = skyEngine.sky.hour;
        audioEngine.tone(300 + hr * 25, 300 + hr * 25, 0.04, "square", 0.03);
      }
      if (target.id === "vol") {
        const dec = Math.round(Number(target.value) / 10);
        if (dec !== lastDecRef.current) {
          lastDecRef.current = dec;
          audioEngine.sf.tick();
        }
      }
    };

    const handleSplash = () => audioEngine.plunge();
    const handleHorn = () => audioEngine.sf.horn();
    const handleCatch = () => audioEngine.sf.catch();

    // Pintasan keyboard 'N' untuk toggle musik generatif
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;

      if (e.key === "n" || e.key === "N") {
        const musOn = audioEngine.toggleMusic();
        oceanStore.showToast(musOn ? "Musik nyala" : "Musik mati");
      }
    };

    // Observasi toast untuk suara pip/eclipse
    const toastEl = document.querySelector(".toast");
    let observer: MutationObserver | null = null;
    if (toastEl) {
      observer = new MutationObserver(() => {
        if (!audioEngine.getActive()) return;
        if (/Gerhana/.test(toastEl.textContent || "")) {
          audioEngine.sf.eclipse();
        } else {
          audioEngine.sf.pip();
        }
      });
      observer.observe(toastEl, { childList: true, characterData: true, subtree: true });
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("input", handleInput);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("ocean:splash", handleSplash);
    document.addEventListener("ocean:horn", handleHorn);
    document.addEventListener("ocean:catch", handleCatch);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("input", handleInput);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("ocean:splash", handleSplash);
      document.removeEventListener("ocean:horn", handleHorn);
      document.removeEventListener("ocean:catch", handleCatch);
      if (observer) observer.disconnect();
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (isCalm) {
      oceanStore.showToast("Matikan mode tenang terlebih dahulu untuk menyalakan suara");
      return;
    }
    const newState = audioEngine.toggle();
    setIsPlaying(newState);
  }, [isCalm]);

  const handleCalmToggle = useCallback(() => {
    toggleCalm();
  }, [toggleCalm]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val / 100);
  };

  const handleMixChange = useCallback(
    (key: "amb" | "mus" | "sfx", value: number) => {
      setMix((prev) => {
        const next = { ...prev, [key]: value };
        audioEngine.setMix(key, value / 100);
        try {
          localStorage.setItem(
            "audioMix",
            JSON.stringify({ amb: next.amb / 100, mus: next.mus / 100, sfx: next.sfx / 100 })
          );
        } catch (_) { /* ignore */ }
        return next;
      });
    },
    []
  );

  return (
    <div className="aud" id="aud">
      {/* Mixer popup */}
      {mixerOpen && (
        <div className="mix-pop" id="mixPop">
          <label>
            Suasana
            <input
              type="range"
              min="0"
              max="100"
              value={mix.amb}
              onChange={(e) => handleMixChange("amb", Number(e.target.value))}
            />
          </label>
          <label>
            Musik
            <input
              type="range"
              min="0"
              max="100"
              value={mix.mus}
              onChange={(e) => handleMixChange("mus", Number(e.target.value))}
            />
          </label>
          <label>
            Efek
            <input
              type="range"
              min="0"
              max="100"
              value={mix.sfx}
              onChange={(e) => handleMixChange("sfx", Number(e.target.value))}
            />
          </label>
        </div>
      )}

      <button
        id="mixBtn"
        type="button"
        aria-label="Mixer suara"
        aria-expanded={mixerOpen}
        onClick={() => setMixerOpen((v) => !v)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
        </svg>
      </button>

      <button
        id="calmBtn"
        type="button"
        aria-pressed={isCalm}
        aria-label="Mode tenang"
        title="Mode tenang: matikan ikan, paus, penyelam, dan suara"
        onClick={handleCalmToggle}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 10c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
          <path d="M3 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity="0.6" />
        </svg>
      </button>

      <button
        id="audBtn"
        type="button"
        aria-pressed={isPlaying}
        aria-label="Suara latar laut"
        onClick={handleToggle}
      >
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="lbl">{isPlaying ? "Suara nyala" : "Suara"}</span>
      </button>

      <input
        id="vol"
        type="range"
        min="0"
        max="100"
        value={volume}
        aria-label="Volume"
        onChange={handleVolumeChange}
      />
    </div>
  );
}
