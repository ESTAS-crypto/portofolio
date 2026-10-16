"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { showToast } from "@/components/layout/Toast";
import { audioEngine } from "@/lib/audioEngine";

interface MessageBottleProps {
  reducedMotion?: boolean;
}

export default function MessageBottle({ reducedMotion = false }: MessageBottleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDrifting, setIsDrifting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setStatus("idle");
    setErrorMessage("");
    audioEngine.sfx("warm");
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    openBtnRef.current?.focus();
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!senderName.trim() || senderName.length < 2) {
      setErrorMessage("Silakan isi nama Anda (minimal 2 huruf).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!senderEmail.trim() || !emailRegex.test(senderEmail)) {
      setErrorMessage("Silakan isi alamat email yang valid.");
      return;
    }

    if (!message.trim() || message.length < 5) {
      setErrorMessage("Pesan Anda terlalu singkat (minimal 5 karakter).");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: senderName,
          email: senderEmail,
          message,
          hp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Gagal mengirim pesan. Silakan coba lagi.");
        showToast(data.error || "Gagal mengirim pesan", { p: 0 });
        return;
      }

      // Success
      setStatus("sent");
      audioEngine.sfx("bell");
      setIsDrifting(true);
      showToast("Botol berlayar! Pesanmu sedang hanyut menuju Evan.", { p: 1 });

      // Trigger dex discovery if applicable
      if (typeof window !== "undefined") {
        (window as unknown as { __dex?: { add: (id: string) => void } }).__dex?.add("harta");
      }

      // Auto close and reset
      setTimeout(() => {
        handleClose();
        setSenderName("");
        setSenderEmail("");
        setMessage("");
        setStatus("idle");
        setIsDrifting(false);
      }, 2500);
    } catch {
      setStatus("error");
      setErrorMessage("Terjadi gangguan koneksi. Silakan periksa jaringan Anda.");
      showToast("Gangguan koneksi", { p: 0 });
    }
  };

  return (
    <div className="msg-bottle-wrap">
      {/* Floating Bottle Trigger */}
      <button
        ref={openBtnRef}
        type="button"
        className={`msg-bottle-trigger ${isDrifting ? "drifting" : ""}`}
        onClick={handleOpen}
        aria-label="Kirim Pesan dalam Botol ke Evan"
      >
        <div className="bottle-float-art" aria-hidden="true">
          <svg viewBox="0 0 80 120" className="bottle-svg">
            <defs>
              <linearGradient id="bGlass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#48cae4" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#0077b6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#023e8a" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="bScroll" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffe6a7" />
                <stop offset="100%" stopColor="#d4a373" />
              </linearGradient>
            </defs>
            {/* Cork */}
            <path d="M 33 8 L 47 8 L 45 18 L 35 18 Z" fill="#9c6644" stroke="#7f4f24" strokeWidth="1" />
            {/* Neck */}
            <path d="M 32 18 L 48 18 L 48 32 L 32 32 Z" fill="url(#bGlass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
            {/* Body */}
            <path
              d="M 32 32 C 20 40 14 55 14 80 C 14 105 24 114 40 114 C 56 114 66 105 66 80 C 66 55 60 40 48 32 Z"
              fill="url(#bGlass)"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />
            {/* Rolled parchment inside */}
            <path
              d="M 28 65 Q 40 60 52 65 L 50 95 Q 38 100 28 95 Z"
              fill="url(#bScroll)"
              opacity="0.85"
            />
            {/* Ribbon on parchment */}
            <line x1="30" y1="78" x2="50" y2="80" stroke="#b91c1c" strokeWidth="2.5" />
            {/* Glass shine */}
            <path d="M 22 55 Q 20 80 25 100" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
          <span className="bottle-bubble b1" />
          <span className="bottle-bubble b2" />
          <span className="bottle-bubble b3" />
        </div>
        <div className="bottle-btn-label">
          <span className="btn-icon">📜</span>
          <span className="btn-text">Pesan dalam Botol</span>
          <span className="btn-hint">Hanyutkan pesan ke laut</span>
        </div>
      </button>

      {/* Message in a Bottle Modal */}
      {isOpen && (
        <div
          className="msg-bottle-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="btl-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="msg-bottle-modal" ref={dialogRef}>
            <button
              type="button"
              className="msg-bottle-close"
              onClick={handleClose}
              aria-label="Tutup formulir pesan botol"
            >
              ✕
            </button>

            <header className="msg-bottle-header">
              <span className="parchment-badge">🌊 Surat dari Palung Laut</span>
              <h3 id="btl-title">Pesan dalam Botol</h3>
              <p>
                Tulis pesanmu di gulungan surat ini. Surat akan disegel dalam botol kaca dan dihanyutkan langsung ke kotak masuk Evan.
              </p>
            </header>

            {status === "sent" ? (
              <div className="msg-bottle-success">
                <div className="success-anim">🌊 🍾 ✉️</div>
                <h4>Botol Berhasil Berlayar!</h4>
                <p>
                  Pesanmu telah dimasukkan ke dalam botol dan meluncur melintasi arus laut menuju Evan. Terima kasih atas sapaanmu!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="msg-bottle-form">
                {/* Honeypot field for bot trapping */}
                <input
                  type="text"
                  name="_hp"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="form-group">
                  <label htmlFor="btl-name">Nama Pengirim</label>
                  <input
                    id="btl-name"
                    type="text"
                    placeholder="Contoh: Budi Santoso / Recruiter Tech"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    maxLength={80}
                    disabled={status === "submitting"}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="btl-email">Alamat Email</label>
                  <input
                    id="btl-email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                    disabled={status === "submitting"}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="btl-msg">Isi Pesan</label>
                  <textarea
                    id="btl-msg"
                    rows={4}
                    placeholder="Tulis tawaran proyek, peluang magang, kolaborasi, atau sekadar salam santai..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={5}
                    maxLength={3000}
                    disabled={status === "submitting"}
                  />
                </div>

                {errorMessage && (
                  <div className="msg-bottle-err" role="alert">
                    {errorMessage}
                  </div>
                )}

                <footer className="msg-bottle-footer">
                  <button
                    type="submit"
                    className="msg-bottle-submit-btn"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        Menyegel Botol...
                      </>
                    ) : (
                      <>
                        <span>Hanyutkan ke Lautan</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </>
                    )}
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
