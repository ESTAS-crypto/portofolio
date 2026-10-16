"use client";

import { useEffect, useRef, useState } from "react";
import { oceanStore, ToastOptions } from "@/lib/oceanStore";

export function showToast(message: string, options?: ToastOptions) {
  oceanStore.toast(message, options);
}

export function toast(message: string, options?: ToastOptions) {
  oceanStore.toast(message, options);
}

export default function Toast() {
  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleTrigger = (msg: string, duration: number) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      setText(msg);
      setIsOpen(true);

      hideTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, duration);
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string | { message: string; p?: number }>;
      if (typeof customEvent.detail === "string") {
        oceanStore.toast(customEvent.detail);
      } else if (customEvent.detail && typeof customEvent.detail.message === "string") {
        oceanStore.toast(customEvent.detail.message, { p: customEvent.detail.p });
      }
    };

    window.addEventListener("app:toast", handleCustomEvent);
    const unsub = oceanStore.onToast(handleTrigger);

    return () => {
      window.removeEventListener("app:toast", handleCustomEvent);
      unsub();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // F5: Pengingat mode tenang aktif (p: 1, sekali saat muat dan sekali saat melewati ~120m)
  useEffect(() => {
    let said = 0;
    const say = () => {
      if (!document.documentElement.classList.contains("calm")) return;
      oceanStore.toast("Mode tenang aktif: makhluk laut disembunyikan", { p: 1 });
    };

    const timer = setTimeout(() => {
      if (!said) {
        said = 1;
        say();
      }
    }, 1600);

    const onScroll = () => {
      if (said < 2 && oceanStore.getUnderwaterDepth() > 120) {
        said = 2;
        say();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`toast ${isOpen ? "on" : ""}`}
      role="status"
      aria-live="polite"
    >
      {text}
    </div>
  );
}

export { Toast as ToastHost };
