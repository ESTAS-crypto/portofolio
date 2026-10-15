"use client";

import { useEffect } from "react";
import { skyEngine } from "@/lib/skyTimeEngine";

/**
 * F13: Smart Favicon — favicon berubah warna sesuai waktu langit.
 *
 * Menggambar ikan SVG ke canvas 32×32, mengubah warna latar dan ikan
 * berdasarkan fase hari (pagi cerah, sore hangat, malam gelap).
 * Update setiap 60 detik.
 */
export default function SmartFavicon() {
  useEffect(() => {
    const link =
      (document.querySelector("link[rel='icon'][type='image/svg+xml']") as HTMLLinkElement) ||
      (document.querySelector("link[rel='icon']") as HTMLLinkElement);

    if (!link) return;

    const C = document.createElement("canvas");
    C.width = 32;
    C.height = 32;
    const ctx = C.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!ctx) return;
      const hr = skyEngine.sky.hour;

      // Background color berdasarkan waktu
      let bg: string;
      let fish: string;
      if (hr >= 6 && hr < 8) {
        // Sunrise
        bg = "#f0a060";
        fish = "#fff";
      } else if (hr >= 8 && hr < 17) {
        // Day
        bg = "#1b7fb3";
        fish = "#fff";
      } else if (hr >= 17 && hr < 19) {
        // Sunset
        bg = "#d46030";
        fish = "#ffe0b0";
      } else {
        // Night
        bg = "#0b1e3a";
        fish = "#6eb8e0";
      }

      // Clear and draw background
      ctx.clearRect(0, 0, 32, 32);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, 32, 32, 6);
      ctx.fill();

      // Draw simplified fish icon
      ctx.fillStyle = fish;
      ctx.beginPath();
      // Body ellipse
      ctx.ellipse(16, 16, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(25, 16);
      ctx.lineTo(30, 10);
      ctx.lineTo(30, 22);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(11, 15, 2, 0, Math.PI * 2);
      ctx.fill();

      link.href = C.toDataURL("image/png");
    }

    draw();
    const iv = setInterval(draw, 60_000);
    return () => clearInterval(iv);
  }, []);

  return null;
}
