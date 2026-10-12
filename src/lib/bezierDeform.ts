/**
 * Bezier Deformation & Creature Geometry
 *
 * Mengonversi titik-titik kontur Catmull-Rom Paus & Megalodon menjadi
 * kurva cubic Bezier tertutup real-time dengan deformasi gelombang renang.
 */

export interface CreatureData {
  body: [number, number, number?][];
  fin: [number, number, number?][];
  eye: [number, number];
}

export const WHALE_DATA: CreatureData = {
  body: [
    [10, 110], [30, 80], [70, 58], [120, 46], [180, 42], [250, 44], [320, 52], [390, 64],
    [450, 76], [500, 88], [540, 92], [566, 90], [582, 72], [596, 52, 1], [588, 98, 1],
    [598, 150, 1], [580, 134], [566, 114], [540, 134], [500, 148], [440, 162], [380, 182],
    [310, 198], [240, 204], [170, 200], [110, 188], [60, 166], [28, 142], [12, 124]
  ],
  fin: [
    [200, 160, 1], [230, 200], [270, 208, 1], [240, 175], [236, 158, 1]
  ],
  eye: [82, 112]
};

export const MEGALODON_DATA: CreatureData = {
  body: [
    [8, 124], [40, 104], [90, 80], [150, 66], [220, 60], [262, 58], [300, 32], [340, 12],
    [352, 8, 1], [352, 34], [366, 56], [384, 62], [440, 68], [500, 82], [530, 88], [552, 86],
    [575, 52], [598, 26, 1], [590, 70], [582, 112, 1], [600, 198, 1], [580, 165], [556, 128],
    [530, 134], [500, 140], [440, 158], [380, 176], [300, 190], [220, 188], [180, 178],
    [120, 172], [70, 158], [30, 142]
  ],
  fin: [
    [180, 152, 1], [210, 192], [250, 212], [292, 210, 1], [262, 182], [242, 162], [234, 150, 1]
  ],
  eye: [64, 108]
};

export function calcWaveOffset(x: number, t: number, A: number, w: number): number {
  const u = x / 610;
  return A * (0.1 + Math.pow(u, 1.9)) * (Math.sin(u * 6.2 - t * w) + 0.3 * Math.sin(u * 12.4 - t * w * 1.7));
}

export function buildDeformedPath(points: [number, number, number?][], t: number, A: number, w: number): string {
  const Q = points.map((p) => [p[0], p[1] + calcWaveOffset(p[0], t, A, w), p[2]] as [number, number, number?]);
  const n = Q.length;
  let d = `M${Q[0][0]} ${Q[0][1].toFixed(1)}`;

  for (let i = 0; i < n; i++) {
    const p0 = Q[(i - 1 + n) % n];
    const p1 = Q[i];
    const p2 = Q[(i + 1) % n];
    const p3 = Q[(i + 2) % n];

    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];

    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1].toFixed(1)}`;
  }

  return d + "Z";
}
