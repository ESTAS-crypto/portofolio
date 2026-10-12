"use client";

import { useEffect, useState } from "react";

export function useNightMode(): boolean {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    // Check local time on client after mounting to avoid hydration mismatch
    const hour = new Date().getHours();
    setIsNight(hour >= 19 || hour < 5);
  }, []);

  return isNight;
}
