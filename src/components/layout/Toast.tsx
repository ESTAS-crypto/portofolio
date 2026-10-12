"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export function showToast(message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:toast", { detail: message }));
  }
}

export default function Toast() {
  const toastRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const msg = customEvent.detail;
      setText(msg);

      const el = toastRef.current;
      if (!el) return;

      gsap.killTweensOf(el);
      gsap.fromTo(
        el,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          onComplete: () => {
            gsap.to(el, { opacity: 0, y: 10, delay: 1.6, duration: 0.4 });
          },
        }
      );
    };

    window.addEventListener("app:toast", handleToast);
    return () => window.removeEventListener("app:toast", handleToast);
  }, []);

  return (
    <div ref={toastRef} className="toast" role="status" aria-live="polite">
      {text}
    </div>
  );
}
