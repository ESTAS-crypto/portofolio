/**
 * Ocean Surface — utilitas sampling permukaan gelombang.
 *
 * Menyediakan fungsi surf(x, frac) yang mengembalikan ketinggian Y
 * di titik X pada permukaan ombak. Dipakai oleh Ship untuk mengikuti
 * gelombang, dan oleh shimmer/splash untuk efek air.
 *
 * frac = progres animasi gelombang (0..1 dalam siklus 12 detik).
 */

// Lookup table: Y pada kurva "M0 60C150 24 300 96 450 60S750 24 900 60S1050 96 1200 60"
// Dibangun sekali saat modul dimuat.
const YT = new Float32Array(1202);

function buildLUT() {
  if (typeof document === "undefined") return;

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText = "position:absolute;pointer-events:none";
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", "M0 60C150 24 300 96 450 60S750 24 900 60S1050 96 1200 60");
  svg.appendChild(path);
  document.body.appendChild(svg);

  const LN = path.getTotalLength();
  let xi = 0;
  for (let s = 0; s <= 3000; s++) {
    const p = path.getPointAtLength((LN * s) / 3000);
    const x = Math.round(p.x);
    while (xi <= x && xi <= 1200) {
      YT[xi] = p.y;
      xi++;
    }
  }
  YT[1201] = YT[1200];
  document.body.removeChild(svg);
}

let built = false;

function ensureLUT() {
  if (!built && typeof document !== "undefined") {
    buildLUT();
    built = true;
  }
}

/**
 * Mengembalikan ketinggian Y permukaan ombak di posisi x (piksel absolut),
 * mempertimbangkan lebar wv dan frac (progres animasi gelombang).
 */
export function surf(x: number, frac: number, wvWidth: number, wvHeight: number): number {
  ensureLUT();
  const u = wvWidth / 1200;
  const xu = ((((x + frac * wvWidth) / u) % 1200) + 1200) % 1200;
  const i = Math.floor(xu);
  const yy = YT[i] + (YT[i + 1] - YT[i]) * (xu - i);
  return yy * (wvHeight / 120) - 1;
}

/**
 * Mengembalikan frac berdasarkan animasi CSS yang sedang berjalan pada SVG ombak pertama.
 * Fallback: berdasarkan waktu absolut.
 */
export function getWaveFrac(wvSvg: SVGSVGElement | null, t: number): number {
  if (wvSvg && wvSvg.getAnimations) {
    const anims = wvSvg.getAnimations();
    const anim = anims.find((a) => (a as CSSAnimation).animationName === "sway") || anims[0];
    if (anim && anim.currentTime != null) {
      const ms = Number(anim.currentTime);
      return (((ms % 12000) + 12000) % 12000) / 12000;
    }
  }
  return (((t * 1000) % 12000) + 12000) % 12000 / 12000;
}

/**
 * Konteks laut yang bisa dipakai komponen lain (ship, shimmer, splash).
 * Diatur oleh Tide component saat mounting.
 */
export interface OceanContext {
  tide: HTMLDivElement;
  wv: HTMLDivElement;
  wvSvg: SVGSVGElement;
  surf: (x: number, frac: number) => number;
  frac: (t: number) => number;
  splash: (x: number, y: number, big?: boolean, silent?: boolean) => void;
  bub: (x: number, y: number) => void;
  st: () => { cy: number; ca: number; spx: number; spw: number; sh: number };
}

let _oc: OceanContext | null = null;

export function setOceanContext(oc: OceanContext | null) {
  _oc = oc;
}

export function getOceanContext(): OceanContext | null {
  return _oc;
}
