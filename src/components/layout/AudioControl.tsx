"use client";

import { useEffect, useState, useCallback } from "react";
import { audioEngine } from "@/lib/audioEngine";
import { oceanStore } from "@/lib/oceanStore";
import { useCalm } from "@/hooks/useOceanStore";

export default function AudioControl({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [isCalm, toggleCalm] = useCalm();
  const [mixerOpen, setMixerOpen] = useState(false);
  const [mix, setMix] = useState({ amb: 100, mus: 100, sfx: 100 });

  // Load saved mixer values
  useEffect(() => {
    try {
      const saved = localStorage.getItem("audioMix");
      if (saved) {
        const parsed = JSON.parse(saved);
        setMix({
          amb: Math.round((parsed.amb ?? 1) * 100),
          mus: Math.round((parsed.mus ?? 1) * 100),
          sfx: Math.round((parsed.sfx ?? 1) * 100),
        });
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Efek sapuan saat membuka ikan / kartu proyek
      if (target.closest(".fish, .card")) {
        audioEngine.sweepCard();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (isCalm) {
      // Jika mode tenang aktif, beri tahu pengguna
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
        try {
          localStorage.setItem(
            "audioMix",
            JSON.stringify({ amb: next.amb / 100, mus: next.mus / 100, sfx: next.sfx / 100 })
          );
        } catch (_) { /* ignore */ }
        // Apply to audio engine if it exposes bus controls
        const eng = audioEngine as unknown as Record<string, unknown>;
        if (typeof eng.setMix === "function") {
          (eng.setMix as (k: string, v: number) => void)(key, value / 100);
        }
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
