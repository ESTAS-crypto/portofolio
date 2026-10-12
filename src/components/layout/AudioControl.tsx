"use client";

import { useEffect, useState } from "react";
import { audioEngine } from "@/lib/audioEngine";

export default function AudioControl({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);

  useEffect(() => {
    const handleScroll = () => {
      audioEngine.updateDepth(window.scrollY, window.innerHeight);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("#audBtn, #vol")) return;

      if (target.closest(".fish, .card")) {
        audioEngine.whoosh();
      } else if (target.closest("a, button")) {
        audioEngine.pop(480 + Math.random() * 160);
      }
    };

    let lastFish: HTMLElement | null = null;
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const fishEl = target?.closest(".fish") as HTMLElement | null;
      if (fishEl && fishEl !== lastFish) {
        audioEngine.pop(300);
      }
      lastFish = fishEl;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClick, true);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("mouseover", handleMouseOver);
      audioEngine.dispose();
    };
  }, []);

  const handleToggle = () => {
    const newState = audioEngine.toggle();
    setIsPlaying(newState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val / 100);
  };

  return (
    <div className="aud" id="aud">
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
