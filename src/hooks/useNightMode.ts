"use client";

import { useEffect, useState } from "react";
import { skyEngine } from "@/lib/skyTimeEngine";

export function getIsNight(): boolean {
  return skyEngine.sky.isNight;
}

export function useNightMode(): boolean {
  const [isNight, setIsNight] = useState<boolean>(getIsNight);

  useEffect(() => {
    // Sinkron dengan skyEngine
    const unsub = skyEngine.subscribe(() => {
      const n = skyEngine.sky.isNight;
      setIsNight(n);
      const tod = n ? "night" : "day";
      document.documentElement.dataset.tod = tod;
      const hero = document.getElementById("hero");
      if (hero) {
        hero.dataset.tod = tod;
      }
    });

    // Set awal
    const n = skyEngine.sky.isNight;
    setIsNight(n);
    const tod = n ? "night" : "day";
    document.documentElement.dataset.tod = tod;

    return unsub;
  }, []);

  return isNight;
}
