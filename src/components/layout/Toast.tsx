"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { oceanStore } from "@/lib/oceanStore";

export function showToast(message: string) {
  oceanStore.showToast(message);
}

export default function Toast() {
  const toastRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const trigger = (msg: string) => {
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
            gsap.to(el, { opacity: 0, y: 10, delay: 2.2, duration: 0.4 });
          },
        }
      );
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      trigger(customEvent.detail);
    };

    window.addEventListener("app:toast", handleCustomEvent);
    const unsub = oceanStore.onToast(trigger);

    return () => {
      window.removeEventListener("app:toast", handleCustomEvent);
      unsub();
    };
  }, []);

  return (
    <div ref={toastRef} className="toast" role="status" aria-live="polite">
      {text}
    </div>
  );
}
