"use client";

import { useEffect } from "react";
import { oceanStore } from "@/lib/oceanStore";
import { audioEngine } from "@/lib/audioEngine";

interface ShortcutOptions {
  onNavigate: (id: string) => void;
  isPortalOpen?: boolean;
}

export function useKeyboardShortcuts({ onNavigate, isPortalOpen = false }: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (target && target.matches && target.matches("input, textarea, select")) {
        return;
      }

      // Jangan jalankan jika modal portal sedang terbuka
      if (isPortalOpen) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === "c") {
        oceanStore.toggleCalm();
      } else if (key === "m") {
        if (oceanStore.isCalm()) {
          oceanStore.showToast("Matikan mode tenang terlebih dahulu untuk menyalakan suara");
        } else {
          audioEngine.toggle();
        }
      } else if (key === "1") {
        onNavigate("about");
      } else if (key === "2") {
        onNavigate("work");
      } else if (key === "3") {
        onNavigate("deep");
      } else if (key === "4") {
        onNavigate("contact");
      } else if (key === "?") {
        oceanStore.showToast("C: mode tenang. M: suara. 1 sampai 4: lompat bagian. Esc: tutup.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigate, isPortalOpen]);
}
