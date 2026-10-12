"use client";

import { useEffect, useState } from "react";

export function getIsNight(): boolean {
  const hour = new Date().getHours();
  // Jam 19.00 malam sampai 05.00 pagi = malam (night mode)
  return hour >= 19 || hour < 5;
}

export function useNightMode(): boolean {
  const [isNight, setIsNight] = useState<boolean>(getIsNight);

  useEffect(() => {
    const update = () => {
      const n = getIsNight();
      setIsNight(n);
      const hero = document.getElementById("hero");
      if (hero) {
        hero.dataset.tod = n ? "night" : "day";
      }
    };

    update();
    const timer = setInterval(update, 10_000);
    return () => clearInterval(timer);
  }, []);

  return isNight;
}
