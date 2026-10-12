export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function formatNumberId(num: number): string {
  return Math.abs(Math.round(num)).toLocaleString("id-ID");
}
