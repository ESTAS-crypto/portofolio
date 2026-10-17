/**
 * Sky Time Engine
 * 
 * Mesin pusat untuk waktu langit, posisi matahari/bulan, fase bulan, gerhana,
 * gradien langit, dan pencahayaan. Semua kalkulasi per-frame tanpa re-render React.
 * 
 * Berpadanan dengan blok v4 HTML:
 * - F1: Waktu di Langit (sky gradient, sun/moon orbit)
 * - F3: Fase Bulan + Gerhana
 * - F4: Pencahayaan v2 (depth-based lighting layers)
 */

import { clamp, lerp } from "./math";

// ─── Smoothstep ──────────────────────────────────────────
export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

// ─── Sky gradient key-frames (dari v4 HTML) ──────────────
interface GradientKey { h: number; colors: string[] }

const SKY_KEYS: { h: number; t: number[]; b: number[] }[] = [
  { h: 0, t: [7, 13, 36], b: [26, 42, 90] },
  { h: 4.5, t: [11, 18, 54], b: [58, 63, 122] },
  { h: 5.5, t: [43, 58, 122], b: [240, 165, 140] },
  { h: 6.5, t: [93, 143, 214], b: [255, 210, 161] },
  { h: 8, t: [79, 159, 216], b: [191, 230, 251] },
  { h: 12, t: [59, 131, 201], b: [207, 234, 255] },
  { h: 16, t: [79, 159, 216], b: [205, 232, 247] },
  { h: 17.5, t: [90, 143, 208], b: [255, 209, 154] },
  { h: 18.3, t: [106, 95, 174], b: [255, 143, 107] },
  { h: 19.2, t: [42, 47, 110], b: [138, 79, 126] },
  { h: 20.5, t: [15, 23, 64], b: [53, 64, 127] },
  { h: 24, t: [7, 13, 36], b: [26, 42, 90] },
];

const CLOUD_KEYS: { h: number; c: number[] }[] = [
  { h: 0, c: [143, 163, 214] },
  { h: 5.5, c: [255, 201, 191] },
  { h: 6.5, c: [255, 241, 224] },
  { h: 8, c: [255, 255, 255] },
  { h: 17.5, c: [255, 240, 224] },
  { h: 18.3, c: [255, 192, 160] },
  { h: 19.2, c: [201, 160, 208] },
  { h: 20.5, c: [143, 163, 214] },
  { h: 24, c: [143, 163, 214] },
];

const SUN_KEYS: { h: number; c: number[] }[] = [
  { h: 5, c: [255, 138, 80] },
  { h: 6.5, c: [255, 207, 138] },
  { h: 8, c: [255, 233, 176] },
  { h: 16, c: [255, 233, 176] },
  { h: 17.5, c: [255, 217, 160] },
  { h: 18.3, c: [255, 138, 90] },
  { h: 19, c: [255, 122, 80] },
];

function hexToRgb(hex: string): number[] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function mixKeys<T extends { h: number }>(
  keys: T[],
  h: number,
  getColor: (k: T) => number[]
): number[] {
  let a = keys[0], b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (h >= keys[i].h && h <= keys[i + 1].h) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const f = (h - a.h) / ((b.h - a.h) || 1);
  const ca = getColor(a), cb = getColor(b);
  return ca.map((v, i) => Math.round(v + (cb[i] - v) * f));
}

function rgb(a: number[]): string {
  return `rgb(${a[0]},${a[1]},${a[2]})`;
}

// ─── Fase bulan ──────────────────────────────────────────
const SYNODIC = 29.530588;
const MOON_PHASES = [
  "Bulan baru", "Sabit awal", "Perempat pertama", "Cembung awal",
  "Purnama", "Cembung akhir", "Perempat akhir", "Sabit akhir",
];

function realMoonAge(): number {
  return (((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % SYNODIC + SYNODIC) % SYNODIC;
}

// ─── Tipe Fase ───────────────────────────────────────────
const PHASE_NAMES = ["Subuh", "Pagi", "Siang", "Sore", "Senja", "Malam"] as const;

function phaseName(h: number): typeof PHASE_NAMES[number] {
  if (h >= 4 && h < 6) return "Subuh";
  if (h >= 6 && h < 10) return "Pagi";
  if (h >= 10 && h < 15) return "Siang";
  if (h >= 15 && h < 17.5) return "Sore";
  if (h >= 17.5 && h < 19) return "Senja";
  return "Malam";
}

// ─── Interface ekspor ────────────────────────────────────
export interface SkyState {
  hour: number;           // 0..23.99 jam
  auto: boolean;          // otomatis ikut waktu nyata
  phase: string;          // "Subuh" | "Pagi" | etc.
  icon: string;           // emoji ☀ / ☾
  label: string;          // "Siang 12.00"
  isNight: boolean;
  nightFactor: number;    // 0..1 smoothstepped
  warmFactor: number;     // faktor hangat senja/fajar
  sunElevation: number;   // 0..1
  moonElevation: number;  // 0..1
  sunX: number;           // 0..100 persen posisi X
  sunY: number;           // 0..100 persen posisi Y
  moonX: number;
  moonY: number;
  skyTop: string;         // warna gradient CSS
  skyBottom: string;
  cloudColor: string;
  cloudColorRgb: [number, number, number];
  sunColor: string;
  heroTextColor: string;
  birdColor: string;
  cloudOpacity: number;
  starOpacity: number;
}

export interface MoonState {
  age: number;            // hari dalam siklus sinodis
  fraction: number;       // 0..1 fase
  illumination: number;   // 0..1 area terang
  phaseName: string;
  eclipse: boolean;       // gerhana aktif
  eclipseEnabled: boolean; // dadu 50%
  eclipseRed: number;     // 0..1 faktor merah
}

export interface LightState {
  warmAlpha: number;      // tint senja overlay
  nightAlpha: number;     // overlay malam
  shaftOpacity: number;   // berkas cahaya
  shaftX: number;         // posisi X berkas (%)
  shaftColor: string;     // warna berkas (r,g,b)
  shaftAngle: number;     // derajat berkas
  darkAlpha: number;      // gelap kedalaman
  tintAlpha: number;      // tint kedalaman
  torchAlpha: number;     // senter kursor
  causticsGl: number;     // kaustik brightness
}

type SkyListener = () => void;

// ─── Mesin ───────────────────────────────────────────────
class SkyTimeEngine {
  public sky: SkyState;
  public moon: MoonState;
  public light: LightState;

  private listeners = new Set<SkyListener>();
  private autoInterval: ReturnType<typeof setInterval> | null = null;

  // Smooth cache untuk lighting
  private C = {
    wA: 0, nA: 0, lo: 0, lx: 50, lr: 255, lg: 244, lb: 214, gl: 0.5,
    dA: 0, ta: 0, sa: 0,
  };
  private mx = -999;
  private my = -999;
  private tx = -999;
  private ty = -999;
  private flash = 0;
  private lastTickT = 0;
  private kp = "";

  constructor() {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;

    this.sky = {
      hour: h,
      auto: true,
      phase: phaseName(h),
      icon: h >= 5 && h < 19 ? "☀" : "☾",
      label: "",
      isNight: false,
      nightFactor: 0,
      warmFactor: 0,
      sunElevation: 0,
      moonElevation: 0,
      sunX: 50, sunY: 50,
      moonX: 50, moonY: 50,
      skyTop: "", skyBottom: "",
      cloudColor: "",
      cloudColorRgb: [255, 255, 255],
      sunColor: "#ffe9b0",
      heroTextColor: "",
      birdColor: "",
      cloudOpacity: 0.93,
      starOpacity: 0,
    };

    this.moon = {
      age: realMoonAge(),
      fraction: 0,
      illumination: 0.5,
      phaseName: "Purnama",
      eclipse: false,
      eclipseEnabled: Math.random() < 0.5,
      eclipseRed: 0,
    };

    this.light = {
      warmAlpha: 0,
      nightAlpha: 0,
      shaftOpacity: 0,
      shaftX: 50,
      shaftColor: "255,244,214",
      shaftAngle: 0,
      darkAlpha: 0,
      tintAlpha: 0,
      torchAlpha: 0,
      causticsGl: 0.5,
    };

    this.computeSky(h);
    this.computeMoon();
  }

  // ─── Waktu ─────────────────────────────────────────────
  public setHour(h: number) {
    h = ((h % 24) + 24) % 24;
    this.sky.hour = h;
    this.computeSky(h);
    this.notify();
  }

  public setAuto(auto: boolean) {
    this.sky.auto = auto;
    if (auto) this.setHour(this.realHour());
  }

  public realHour(): number {
    const d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  }

  public startAutoSync() {
    if (this.autoInterval) return;
    this.autoInterval = setInterval(() => {
      if (this.sky.auto) this.setHour(this.realHour());
    }, 30000);
  }

  public stopAutoSync() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  }

  // ─── Fase bulan ────────────────────────────────────────
  public setMoonAge(age: number) {
    this.moon.age = age;
    this.computeMoon();
    this.notify();
  }

  public stepMoonPhase(direction: 1 | -1) {
    const q = SYNODIC / 8;
    const p = this.moon.age / q;
    const next = direction > 0 ? Math.floor(p + 1e-6) + 1 : Math.ceil(p - 1e-6) - 1;
    this.setMoonAge(next * q);
    this.moon.eclipseEnabled = Math.random() < 0.5;
    this.moon.eclipse = false;
  }

  public resetMoonToToday() {
    const target = this.moon.age + (((realMoonAge() - this.moon.age + SYNODIC * 1.5) % SYNODIC) - SYNODIC / 2);
    this.setMoonAge(target);
    this.moon.eclipseEnabled = Math.random() < 0.5;
    this.moon.eclipse = false;
  }

  // ─── Event pointer (untuk senter/berkas cahaya) ────────
  public setPointer(x: number, y: number) {
    this.mx = x;
    this.my = y;
    if (this.tx < -900) { this.tx = x; this.ty = y; }
  }

  public triggerFlash() {
    this.flash = 1;
  }

  // ─── Pencahayaan per frame (dipanggil dari gsap ticker) ─
  public updateLighting(depth: number, t: number, dt: number, rm: boolean) {
    const h = this.sky.hour;
    const aS = ((h - 6) / 24) * 2 * Math.PI;
    const aM = ((h - 18) / 24) * 2 * Math.PI;
    const sunE = Math.max(0, Math.sin(aS));
    const moonE = Math.max(0, Math.sin(aM));
    const night = h >= 12 ? smoothstep(17.5, 20.5, h) : 1 - smoothstep(4.5, 7, h);
    const wm = Math.max(
      Math.exp(-Math.pow((h - 6.3) / 0.9, 2)),
      Math.exp(-Math.pow((h - 17.9) / 0.9, 2))
    );
    const mo = this.moon;
    const moonL = moonE * night * (0.25 + 0.75 * mo.illumination) * (1 - 0.75 * mo.eclipseRed);
    const sunL = sunE;
    const surf = clamp(depth / 40, 0, 1);
    const sub = 1 - clamp(depth / 450, 0, 1);
    const Lz = clamp(sunL + moonL * 0.35 + 0.08, 0, 1);
    const tot = sunL + moonL;
    const sxp = 50 - 38 * Math.cos(aS);
    const mxp = 50 - 38 * Math.cos(aM);

    const dayC = [255, 244, 214].map((c, i) =>
      lerp(c, [255, 170, 100][i], clamp(wm * 1.2, 0, 1))
    );
    const moC = [170, 200, 255].map((c, i) =>
      lerp(c, [255, 110, 70][i], mo.eclipseRed)
    );
    const wmn = tot > 0.001 ? moonL / tot : 0;

    const Tg = {
      wA: 0.16 * wm * (1 - night) * (1 - clamp(depth / 500, 0, 1) * 0.85),
      nA: night * (0.22 + 0.14 * (1 - mo.illumination)),
      lo: clamp(surf * sub * (sunL * 0.85 + moonL * 0.5), 0, 0.9),
      lx: tot > 0.001 ? (sunL * sxp + moonL * mxp) / tot : 50,
      lr: lerp(dayC[0], moC[0], wmn),
      lg: lerp(dayC[1], moC[1], wmn),
      lb: lerp(dayC[2], moC[2], wmn),
      gl: clamp(0.15 + 0.6 * sunL * sub + 0.3 * moonL, 0, 0.75),
      dA: 0.72 * smoothstep(140, 800, depth) * (0.6 + 0.4 * (1 - Lz)),
      ta: smoothstep(120, 400, depth) * (0.25 + 0.75 * (1 - Lz)),
    };

    const k = rm ? 1 : 1 - Math.exp(-dt * 5);
    const kc = rm ? 1 : 1 - Math.exp(-dt * 2.5);
    const slow: Record<string, boolean> = { lr: true, lg: true, lb: true };

    for (const key in Tg) {
      const K = key as keyof typeof Tg;
      this.C[K] += (Tg[K] - this.C[K]) * (slow[K] ? kc : k);
    }

    if (this.mx > -900) {
      const kk = rm ? 1 : 1 - Math.exp(-dt * 9);
      this.tx += (this.mx - this.tx) * kk;
      this.ty += (this.my - this.ty) * kk;
    }
    this.flash *= Math.exp(-dt * 3.2);

    const sa = rm ? 0 : Math.sin(t * 0.6) * 1.6 + (this.mx > -900 ? (this.mx / (typeof window !== "undefined" ? window.innerWidth : 1920) - 0.5) * 4 : 0);
    this.C.sa += (sa - this.C.sa) * k;

    // Update light state
    this.light.warmAlpha = this.C.wA;
    this.light.nightAlpha = this.C.nA;
    this.light.shaftOpacity = this.C.lo;
    this.light.shaftX = this.C.lx;
    this.light.shaftColor = `${Math.round(this.C.lr)},${Math.round(this.C.lg)},${Math.round(this.C.lb)}`;
    this.light.shaftAngle = this.C.sa;
    this.light.darkAlpha = this.C.dA;
    this.light.tintAlpha = this.C.lo * 0.55;
    this.light.torchAlpha = this.mx > -900 ? Math.min(1, this.C.ta * (0.55 + this.flash * 0.9)) : 0;
    this.light.causticsGl = this.C.gl;
  }

  // ─── Komputasi langit ──────────────────────────────────
  private computeSky(h: number) {
    const aS = ((h - 6) / 24) * 2 * Math.PI;
    const aM = ((h - 18) / 24) * 2 * Math.PI;
    const isSun = h >= 5 && h < 19;

    // Posisi orbit
    const sunX = 50 - 38 * Math.cos(aS);
    const sunY = 78 - 66 * Math.sin(aS);
    const moonX = 50 - 38 * Math.cos(aM);
    const moonY = 78 - 60 * Math.sin(aM);

    // Gradien langit
    const [t, b] = [
      mixKeys(SKY_KEYS, h, (k) => k.t),
      mixKeys(SKY_KEYS, h, (k) => k.b),
    ];
    const cc = mixKeys(CLOUD_KEYS, h, (k) => k.c);

    // Siang/malam
    const night = h >= 12 ? smoothstep(17.5, 20.5, h) : 1 - smoothstep(4.5, 7, h);
    const warm = Math.max(
      Math.exp(-Math.pow((h - 6.3) / 0.9, 2)),
      Math.exp(-Math.pow((h - 17.9) / 0.9, 2))
    );

    // Teks hero berubah warna
    const hcDay = [10, 42, 74];
    const hcNight = [234, 246, 255];
    const heroText = hcDay.map((v, i) => Math.round(lerp(v, hcNight[i], night)));
    const birdDay = [10, 42, 74];
    const birdNight = [207, 224, 255];
    const bird = birdDay.map((v, i) => Math.round(lerp(v, birdNight[i], night)));

    // Sun color
    let sunColor = [255, 233, 176];
    if (isSun) {
      sunColor = mixKeys(SUN_KEYS, h, (k) => k.c);
    }

    const brightness = (0.2126 * (t[0] + b[0]) + 0.7152 * (t[1] + b[1]) + 0.0722 * (t[2] + b[2])) / 510;
    const isNight = brightness < 0.42;

    const hh = Math.floor(h);
    const mm = Math.floor((h - hh) * 60);
    const phase = phaseName(h);

    this.sky.hour = h;
    this.sky.phase = phase;
    this.sky.icon = isSun ? "☀" : "☾";
    this.sky.label = `${phase} ${String(hh).padStart(2, "0")}.${String(mm).padStart(2, "0")}`;
    this.sky.isNight = isNight;
    this.sky.nightFactor = night;
    this.sky.warmFactor = warm;
    this.sky.sunElevation = Math.max(0, Math.sin(aS));
    this.sky.moonElevation = Math.max(0, Math.sin(aM));
    this.sky.sunX = sunX;
    this.sky.sunY = sunY;
    this.sky.moonX = moonX;
    this.sky.moonY = moonY;
    this.sky.skyTop = rgb(t);
    this.sky.skyBottom = rgb(b);
    this.sky.cloudColorRgb = [Math.round(cc[0]), Math.round(cc[1]), Math.round(cc[2])];
    this.sky.cloudColor = rgb(cc);
    this.sky.sunColor = rgb(sunColor);
    this.sky.heroTextColor = rgb(heroText);
    this.sky.birdColor = rgb(bird);
    this.sky.cloudOpacity = lerp(0.93, 0.28, night);
    this.sky.starOpacity = night * night;
  }

  // ─── Komputasi bulan ───────────────────────────────────
  private computeMoon() {
    const f = ((this.moon.age / SYNODIC) % 1 + 1) % 1;
    this.moon.fraction = f;
    this.moon.illumination = (1 - Math.cos(f * 2 * Math.PI)) / 2;
    this.moon.phaseName = MOON_PHASES[Math.round(f * 8) % 8];

    // Gerhana: hanya saat purnama + eclipseEnabled + jam tepat
    const full = Math.abs(((this.moon.age % SYNODIC) + SYNODIC) % SYNODIC - SYNODIC / 2) < 1;
    const h = this.sky.hour;
    const u = (h >= 22 || h < 2) ? (h >= 22 ? h - 22 : h + 2) / 4 : -1;
    const active = this.moon.eclipseEnabled && full && u >= 0;
    this.moon.eclipse = active;

    if (active) {
      const cx = (u * 2 - 1) * 145;
      this.moon.eclipseRed = 1 - smoothstep(0.4, 2.4, Math.abs(cx) / 50);
    } else {
      this.moon.eclipseRed = 0;
    }
  }

  // ─── Berlangganan ──────────────────────────────────────
  public subscribe(fn: SkyListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const skyEngine = new SkyTimeEngine();
