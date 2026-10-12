"use client";

import { useEffect, useState, useCallback } from "react";
import { audioEngine } from "@/lib/audioEngine";
import { oceanStore } from "@/lib/oceanStore";
import { useCalm } from "@/hooks/useOceanStore";

export default function AudioControl({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [isCalm, toggleCalm] = useCalm();

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

  return (
    <div className="aud" id="aud">
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
