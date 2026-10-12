"use client";

import { useEffect, useState } from "react";

export function getIsNight(): boolean {
  if (typeof window !== "undefined") {
    const docTod = document.documentElement.dataset.tod;
    if (docTod === "night") return true;
    if (docTod === "day") return false;
  }
  const hour = new Date().getHours();
  // Jam 19.00 malam sampai 05.00 pagi = malam (night mode)
  return hour >= 19 || hour < 5;
}

export function useNightMode(): boolean {
  const [isNight, setIsNight] = useState<boolean>(getIsNight);

  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();
      const n = hour >= 19 || hour < 5;
      setIsNight(n);
      const tod = n ? "night" : "day";
      document.documentElement.dataset.tod = tod;
      const hero = document.getElementById("hero");
      if (hero) {
        hero.dataset.tod = tod;
      }
    };

    update();
    const timer = setInterval(update, 10_000);
    return () => clearInterval(timer);
  }, []);

  return isNight;
}
