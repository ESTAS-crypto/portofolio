"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { oceanStore } from "@/lib/oceanStore";

export interface DexItem {
  id: string;
  name: string;
  hint: string;
}

export const DEX_ITEMS: DexItem[] = [
  { id: "ikan", name: "Ikan tangkapan", hint: "Klik nelayan di kapal" },
  { id: "horn", name: "Klakson kapal", hint: "Klik badan kapal" },
  { id: "lompat", name: "Lompatan penyelam", hint: "Gulir sedikit dari paling atas" },
  { id: "paus", name: "Paus", hint: "Menyelam lebih dari 150 m" },
  { id: "mega", name: "Megalodon", hint: "Sangat jarang, di laut dalam" },
  { id: "ubur", name: "Ubur-ubur tersengat", hint: "Klik ubur-ubur" },
  { id: "harta", name: "Harta karun", hint: "Buka peti di bagian kontak" },
  { id: "gerhana", name: "Gerhana bulan", hint: "Purnama, dini hari" },
  { id: "kilat", name: "Kilat", hint: "Musim hujan, ketuk langit" },
  { id: "kemarau", name: "Musim kemarau", hint: "Pilih di panel waktu" },
  { id: "hujan", name: "Musim hujan", hint: "Pilih di panel waktu" },
  { id: "salju", name: "Musim salju", hint: "Pilih di panel waktu" },
  { id: "gugur", name: "Musim gugur", hint: "Pilih di panel waktu" },
  { id: "semi", name: "Musim semi", hint: "Pilih di panel waktu" },
  { id: "senja", name: "Zona senja", hint: "Menyelam lebih dari 200 m" },
  { id: "dasar", name: "Dasar laut", hint: "Menyelam sampai dasar" },
];

interface ExplorerDexModalProps {
  isOpen: boolean;
  onClose: () => void;
  openerElement?: HTMLElement | null;
  onDiscoveryChange?: (count: number, hasNew: boolean) => void;
}

export default function ExplorerDexModal({
  isOpen,
  onClose,
  openerElement,
  onDiscoveryChange,
}: ExplorerDexModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLElement>(null);

  const [discovered, setDiscovered] = useState<string[]>([]);
  const hasNewRef = useRef(false);

  // Sync with localStorage on client mount
  useEffect(() => {
    let saved: string[] = [];
    try {
      saved = JSON.parse(localStorage.getItem("dex") || "[]");
    } catch (_) {}
    setDiscovered(saved);
    onDiscoveryChange?.(saved.length, false);
  }, [onDiscoveryChange]);

  const addDiscovery = useCallback(
    (id: string) => {
      setDiscovered((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        try {
          localStorage.setItem("dex", JSON.stringify(next));
        } catch (_) {}
        if (!isOpen) {
          hasNewRef.current = true;
        }
        onDiscoveryChange?.(next.length, hasNewRef.current);
        return next;
      });
    },
    [isOpen, onDiscoveryChange]
  );

  // Global listeners for oceanic discoveries
  useEffect(() => {
    if (typeof window === "undefined") return;

    (window as unknown as { __dex: { add: (id: string) => void } }).__dex = {
      add: addDiscovery,
    };

    const handleCatch = () => addDiscovery("ikan");
    const handleHorn = () => addDiscovery("horn");
    const handleSplash = () => addDiscovery("lompat");
    const handleCreature = (e: Event) => {
      const type = (e as CustomEvent<string>).detail;
      addDiscovery(type === "mega" ? "mega" : "paus");
    };
    const handleZap = () => addDiscovery("ubur");
    const handleChest = (e: Event) => {
      const detail = (e as CustomEvent<{ open?: boolean }>).detail;
      if (detail && detail.open) addDiscovery("harta");
    };
    const handleEclipse = () => addDiscovery("gerhana");
    const handleThunder = () => addDiscovery("kilat");
    const handleSeason = (e: Event) => {
      const s = (e as CustomEvent<string>).detail;
      if (["kemarau", "hujan", "salju", "gugur", "semi"].includes(s)) {
        addDiscovery(s);
      }
    };

    window.addEventListener("ocean:catch", handleCatch);
    window.addEventListener("ocean:horn", handleHorn);
    window.addEventListener("ocean:splash", handleSplash);
    window.addEventListener("ocean:creature", handleCreature);
    window.addEventListener("ocean:zap", handleZap);
    window.addEventListener("ocean:chest", handleChest);
    window.addEventListener("ocean:eclipse", handleEclipse);
    window.addEventListener("ocean:thunder", handleThunder);
    window.addEventListener("ocean:season", handleSeason);

    // Depth polling check (senja > 200m, dasar >= 930m)
    const interval = setInterval(() => {
      const depth = oceanStore.getUnderwaterDepth();
      if (depth > 200) addDiscovery("senja");
      if (depth >= 930) addDiscovery("dasar");
    }, 1200);

    return () => {
      window.removeEventListener("ocean:catch", handleCatch);
      window.removeEventListener("ocean:horn", handleHorn);
      window.removeEventListener("ocean:splash", handleSplash);
      window.removeEventListener("ocean:creature", handleCreature);
      window.removeEventListener("ocean:zap", handleZap);
      window.removeEventListener("ocean:chest", handleChest);
      window.removeEventListener("ocean:eclipse", handleEclipse);
      window.removeEventListener("ocean:thunder", handleThunder);
      window.removeEventListener("ocean:season", handleSeason);
      clearInterval(interval);
    };
  }, [addDiscovery]);

  useEffect(() => {
    if (!isOpen) return;

    hasNewRef.current = false;
    onDiscoveryChange?.(discovered.length, false);

    const el = dialogRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.classList.add("on");
      closeBtnRef.current?.focus();

      // Animate progress bar fill
      if (barRef.current) {
        barRef.current.style.width = "0%";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (barRef.current) {
              barRef.current.style.width = `${(discovered.length / DEX_ITEMS.length) * 100}%`;
            }
          });
        });
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      openerElement?.focus?.();
    };
  }, [isOpen, onClose, openerElement, discovered.length, onDiscoveryChange]);

  if (!isOpen) return null;

  const count = discovered.length;
  const total = DEX_ITEMS.length;

  return (
    <div
      ref={dialogRef}
      id="dexOv"
      className="ovl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dexT"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="ovp" data-lenis-prevent tabIndex={-1}>
        <div className="ovh" style={{ "--i": 0 } as React.CSSProperties}>
          <div>
            <h2 id="dexT">Koleksi Penjelajah</h2>
            <p id="dexP">
              {count === total
                ? "Semua ditemukan. Kamu penjelajah sejati."
                : `${count} dari ${total} ditemukan. Jelajahi situs ini untuk menemukan sisanya.`}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            className="ovx"
            type="button"
            aria-label="Tutup koleksi"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="dbar" style={{ "--i": 1 } as React.CSSProperties}>
          <i ref={barRef} id="dexB" style={{ width: `${(count / total) * 100}%` }} />
        </div>

        <ul className="dl" id="dexL">
          {DEX_ITEMS.map((item, idx) => {
            const isFound = discovered.includes(item.id);
            return (
              <li
                key={item.id}
                style={{ "--i": idx + 2 } as React.CSSProperties}
                className={isFound ? "ok" : ""}
              >
                <span className="ck">{isFound ? "✓" : ""}</span>
                <div>
                  <b>{isFound ? item.name : "???"}</b>
                  <small>{isFound ? "Ditemukan" : item.hint}</small>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
