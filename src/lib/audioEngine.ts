/**
 * AudioEngine v3
 *
 * Mesin audio sintetis Web Audio berbasis suasana kedalaman laut dan musik generatif,
 * sepenuhnya sinkron dengan referensi HTML v4.
 *
 * Fitur:
 * - 3 Sub-Bus terpisah: Ambience (bAmb), Generative Music (bMus), Sound Effects (bSfx)
 * - Pink noise 6 detik (Paul Kellet filter)
 * - 3 Lapisan atmosfer: Angin (Air), Ombak (Wave), Drone dasar laut (Drone)
 * - Reverb konvolusi sintetis (Convolver) untuk musik & SFX
 * - Musik generatif berbasis waktu langit (Subuh, Pagi, Siang, Sore, Senja, Malam)
 * - Koleksi lengkap SFX interaktif: bloop, blub, open, close, ting, sonar, glug,
 *   swish, chime, tick, blip, kaching, pluckS, plip, pip, chest, giggle, rise,
 *   sunrise, sunset, eclipse, arpU, arpD, plunge, emerge, horn, catch
 * - Dukungan mixer Suasana / Musik / Efek
 */

import { skyEngine } from "./skyTimeEngine";
import { oceanStore } from "./oceanStore";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const PENT = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];

export interface AudioMix {
  amb: number;
  mus: number;
  sfx: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lpMaster: BiquadFilterNode | null = null;
  private comp: DynamicsCompressorNode | null = null;

  // Sub-buses
  private bAmb: GainNode | null = null;
  private bMus: GainNode | null = null;
  private bSfx: GainNode | null = null;
  private verb: ConvolverNode | null = null;

  // Layer Gain Nodes
  private gAir: GainNode | null = null;
  private gWave: GainNode | null = null;
  private gDrone: GainNode | null = null;

  private pinkBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private isEnding = false;
  private musOn = true;
  private volume = 0.6;
  private mix: AudioMix = { amb: 1, mus: 1, sfx: 1 };
  private inWater = false;
  private frameCount = 0;
  private lastDepth = 3200;
  private currentUnderwaterDepth = 0;

  // Music state
  private musicIntervalId: number | null = null;
  private nextPad = 0;
  private nextPing = 0;
  private nextN = 0;
  private deg = 0;

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (!this.ctx) return;
        if (document.hidden) {
          this.ctx.suspend().catch(() => {});
        } else if (this.isPlaying) {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  /**
   * Menghasilkan pink noise buffer 6 detik (algoritma Paul Kellet).
   */
  private generatePinkNoise(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not ready");
    const len = this.ctx.sampleRate * 6;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    return buf;
  }

  private gn(value: number): GainNode {
    if (!this.ctx) throw new Error("AudioContext not ready");
    const g = this.ctx.createGain();
    g.gain.value = value;
    return g;
  }

  private lfo(freq: number, amt: number, target: AudioParam) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.gn(amt);
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(target);
    osc.start();
  }

  private noise(type: BiquadFilterType, freq: number, q: number): BiquadFilterNode {
    if (!this.ctx || !this.pinkBuffer) throw new Error("Buffer missing");
    const s = this.ctx.createBufferSource();
    const b = this.ctx.createBiquadFilter();
    s.buffer = this.pinkBuffer;
    s.loop = true;
    b.type = type;
    b.frequency.value = freq;
    b.Q.value = q;
    s.connect(b);
    s.start(0, Math.random() * 4);
    return b;
  }

  private isCalm(): boolean {
    return oceanStore.isCalm();
  }

  private buildGraph() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.pinkBuffer = this.generatePinkNoise();

    this.comp = this.ctx.createDynamicsCompressor();
    this.master = this.gn(0);

    this.lpMaster = this.ctx.createBiquadFilter();
    this.lpMaster.type = "lowpass";
    this.lpMaster.frequency.value = 9000;
    this.lpMaster.Q.value = 0.3;

    // Load saved mixer if available
    try {
      const saved = localStorage.getItem("audioMix");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.mix = {
          amb: Number(parsed.amb ?? 1),
          mus: Number(parsed.mus ?? 1),
          sfx: Number(parsed.sfx ?? 1),
        };
      }
    } catch (_) {}

    this.bAmb = this.gn(this.mix.amb);
    this.bMus = this.gn(this.mix.mus);
    this.bSfx = this.gn(this.mix.sfx);

    // Routing persis HTML v4:
    // bAmb -> lpMaster, bMus -> lpMaster, lpMaster -> master
    // bSfx -> master (efek jernih tanpa muffled kecuali diinginkan)
    // master -> comp -> destination
    this.bAmb.connect(this.lpMaster);
    this.bMus.connect(this.lpMaster);
    this.lpMaster.connect(this.master);
    this.bSfx.connect(this.master);
    this.master.connect(this.comp);
    this.comp.connect(this.ctx.destination);

    // Reverb sintetis (3 detik decaying noise)
    this.verb = this.ctx.createConvolver();
    const len = this.ctx.sampleRate * 3;
    const ib = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ib.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
    }
    this.verb.buffer = ib;
    const vg = this.gn(0.35);
    this.verb.connect(vg);
    vg.connect(this.bMus);

    // 1. Lapisan Ombak (lowpass 600Hz, Q0.4, LFO 0.09Hz)
    const sw = this.gn(0.5);
    this.lfo(0.09, 0.35, sw.gain);
    this.gWave = this.gn(0);
    this.noise("lowpass", 600, 0.4).connect(sw);
    sw.connect(this.gWave);
    this.gWave.connect(this.bAmb);

    // 2. Lapisan Angin (bandpass 700Hz, Q0.6, LFO 0.05Hz)
    const wm = this.gn(0.6);
    this.lfo(0.05, 0.25, wm.gain);
    this.gAir = this.gn(0);
    this.noise("bandpass", 700, 0.6).connect(wm);
    wm.connect(this.gAir);
    this.gAir.connect(this.bAmb);

    // 3. Lapisan Drone Dasar Laut (55Hz & 82.5Hz)
    this.gDrone = this.gn(0);
    const droneFreqs = [55, 82.5];
    const droneGains = [0.5, 0.3];
    droneFreqs.forEach((f, i) => {
      if (!this.ctx || !this.gDrone) return;
      const o = this.ctx.createOscillator();
      const g = this.gn(droneGains[i]);
      o.frequency.value = f;
      o.connect(g);
      g.connect(this.gDrone);
      o.start();
    });
    this.gDrone.connect(this.bAmb);

    // Mulai loop musik generatif
    if (this.musicIntervalId === null && typeof window !== "undefined") {
      this.musicIntervalId = window.setInterval(() => this.musicStep(), 120);
    }
  }

  // ─── Musik Generatif ──────────────────────────────────────────
  private readonly PH: [number, number, number, number[], number][] = [
    [4, 10, 261.63, [0, 2, 4, 7, 9], 72],     // Pagi ceria
    [10, 15, 261.63, [0, 2, 4, 7, 9], 84],    // Siang aktif
    [15, 19, 220, [0, 3, 5, 7, 10], 60],      // Sore hangat
    [19, 28, 146.83, [0, 3, 5, 7, 10], 48],   // Malam tenang
  ];

  private getPhase(h: number) {
    const hh = h < 4 ? h + 24 : h;
    return this.PH.find((p) => hh >= p[0] && hh < p[1]) || this.PH[3];
  }

  private pluck(f: number, v: number) {
    if (!this.ctx || !this.bMus || !this.verb) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const g2 = this.gn(0.25);
    o.type = "sine";
    o2.type = "triangle";
    o.frequency.value = f;
    o2.frequency.value = f * 2.01;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22 * v, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(this.bMus);
    g.connect(this.verb);
    o.start(t);
    o2.start(t);
    o.stop(t + 1.7);
    o2.stop(t + 1.7);
  }

  private bell(f: number) {
    if (!this.ctx || !this.bMus || !this.verb) return;
    const t = this.ctx.currentTime;
    [1, 2.76].forEach((m, i) => {
      if (!this.ctx || !this.bMus || !this.verb) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.frequency.value = f * m;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07 / (i + 1), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
      o.connect(g);
      g.connect(this.bMus);
      g.connect(this.verb);
      o.start(t);
      o.stop(t + 3.1);
    });
  }

  private pad(root: number, sc: number[]) {
    if (!this.ctx || !this.bMus || !this.verb) return;
    const t = this.ctx.currentTime;
    [0, 2].forEach((k) => {
      if (!this.ctx || !this.bMus || !this.verb) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "triangle";
      o.frequency.value = root * 0.5 * Math.pow(2, sc[k] / 12);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05, t + 3);
      g.gain.linearRampToValueAtTime(0.0001, t + 9);
      o.connect(g);
      g.connect(this.bMus);
      g.connect(this.verb);
      o.start(t);
      o.stop(t + 9.2);
    });
  }

  private musicStep() {
    if (!this.isPlaying || !this.musOn || !this.ctx || this.ctx.state !== "running" || this.isCalm()) {
      return;
    }
    const t = this.ctx.currentTime;
    const hourNow = skyEngine.sky.hour;
    const depth = this.currentUnderwaterDepth;

    if (t > this.nextPad && depth < 400) {
      const [, , root, sc] = this.getPhase(hourNow);
      this.pad(root, sc);
      this.nextPad = t + 14 + Math.random() * 8;
    }

    if (depth > 400 && t > this.nextPing && this.verb) {
      this.tone(1320, 1280, 0.9, "sine", 0.07, Math.random() * 1.2 - 0.6, 0, this.verb);
      this.nextPing = t + 12 + Math.random() * 13;
    }

    if (t < this.nextN) return;
    const [, , root, sc, bpm] = this.getPhase(hourNow);
    const beat = 60 / bpm;
    const pD = 1 - clamp(depth / 700) * 0.85;
    this.nextN = t + beat * (1 + Math.floor(Math.random() * 2));

    if (Math.random() > 0.55 * pD + 0.12) return;
    this.deg = clamp(this.deg + Math.round((Math.random() - 0.5) * 3), 0, sc.length * 2 - 1);
    const f = root * Math.pow(2, sc[this.deg % sc.length] / 12 + Math.floor(this.deg / sc.length));
    this.pluck(f, pD);
    if (Math.random() < 0.12 * pD) this.bell(f * 2);
  }

  // ─── Primitif SFX ─────────────────────────────────────────────
  public tone(
    f0: number,
    f1 = f0,
    dur = 0.2,
    type: OscillatorType = "sine",
    v = 0.2,
    pan = 0,
    delay = 0,
    send?: AudioNode
  ) {
    if (!this.ctx || (!this.isPlaying && !this.isEnding) || this.isCalm()) return;
    const t = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const k = 1 + (Math.random() - 0.5) * 0.08;

    o.type = type;
    o.frequency.setValueAtTime(f0 * k, t);
    if (f1 && f1 !== f0) {
      o.frequency.exponentialRampToValueAtTime(f1 * k, t + dur * 0.9);
    }

    const peakGain = v * this.volume * (0.92 + Math.random() * 0.16);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o.connect(g);
    let out: AudioNode = g;

    if (pan && "createStereoPanner" in this.ctx) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = clamp(pan, -0.7, 0.7);
      g.connect(p);
      out = p;
    }

    const targetBus = send ? this.bMus : this.bSfx;
    if (targetBus) out.connect(targetBus);
    if (send) out.connect(send);

    o.start(t);
    o.stop(t + dur + 0.03);
  }

  public sweep(f0: number, f1: number, dur = 0.7, v = 0.28, delay = 0) {
    if (!this.ctx || !this.pinkBuffer || (!this.isPlaying && !this.isEnding) || this.isCalm()) return;
    const t = this.ctx.currentTime + (delay || 0);
    const s = this.ctx.createBufferSource();
    const b = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();

    s.buffer = this.pinkBuffer;
    b.type = "bandpass";
    b.Q.value = 0.9;
    b.frequency.setValueAtTime(f0, t);
    b.frequency.exponentialRampToValueAtTime(f1, t + dur);

    const peakGain = v * this.volume;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain), t + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    s.connect(b);
    b.connect(g);
    if (this.bSfx) g.connect(this.bSfx);

    s.start(t, Math.random() * 4);
    s.stop(t + dur + 0.05);
  }

  public arpU() {
    [0, 2, 4].forEach((k, i) =>
      this.tone(PENT[k] * 2, PENT[k] * 2, 0.3, "sine", 0.14, 0, i * 0.09)
    );
  }

  public arpD() {
    [4, 2, 0].forEach((k, i) =>
      this.tone(PENT[k] * 2, PENT[k] * 2, 0.3, "sine", 0.12, 0, i * 0.09)
    );
  }

  public plunge(k = 1) {
    this.sweep(2200, 260, 0.9, 0.5 * k);
    for (let i = 0; i < 6; i++) {
      const f = 420 + Math.random() * 500;
      this.tone(f, f * 1.8, 0.16, "sine", 0.05 * k, 0, 0.1 + i * 0.09);
    }
  }

  public emerge() {
    this.sweep(300, 1800, 0.8, 0.35);
  }

  // ─── Perpustakaan SFX Lengkap (SF Dictionary) ───────────────────
  public readonly sf = {
    bloop: (i: number) => this.tone(300 + i * 70, 620 + i * 90, 0.14, "sine", 0.2),
    blub: () => {
      this.tone(240, 520, 0.12, "sine", 0.2);
      this.tone(300, 660, 0.12, "sine", 0.18, 0, 0.1);
    },
    open: () => {
      this.tone(260, 780, 0.22, "sine", 0.2);
      this.sweep(300, 1400, 0.25, 0.1);
    },
    close: () => {
      this.tone(700, 240, 0.2, "sine", 0.18);
      this.sweep(1200, 300, 0.2, 0.08);
    },
    ting: () => {
      this.tone(1760, 1760, 0.35, "triangle", 0.12);
      this.tone(2637, 2637, 0.28, "sine", 0.06, 0, 0.04);
    },
    sonar: () => {
      this.tone(1100, 1050, 0.5, "sine", 0.15);
      this.tone(2200, 2100, 0.35, "sine", 0.05, 0, 0.05);
    },
    glug: () => {
      this.sweep(320, 1500, 0.6, 0.3);
      this.tone(180, 90, 0.18, "sine", 0.2, 0, 0.05);
    },
    swish: (p: number) => this.sweep(p > 0 ? 500 : 1500, p > 0 ? 1500 : 500, 0.28, 0.2),
    chime: (n: string) => {
      const map: Record<string, number> = { Subuh: 5, Pagi: 2, Siang: 4, Sore: 3, Senja: 1, Malam: 0 };
      const m = map[n] ?? 3;
      this.tone(PENT[m] * 2, PENT[m] * 2, 0.5, "triangle", 0.14);
      this.tone(PENT[m || 0] * 4, PENT[m || 0] * 4, 0.4, "sine", 0.05, 0, 0.05);
    },
    tick: () => this.tone(900, 700, 0.05, "square", 0.04),
    blip: (i: number) => this.tone(PENT[i % 8] * 2, PENT[i % 8] * 2.2, 0.1, "square", 0.06),
    kaching: () => {
      this.tone(1568, 1568, 0.25, "triangle", 0.12);
      this.tone(2093, 2093, 0.35, "triangle", 0.1, 0, 0.08);
      this.sweep(3000, 6000, 0.2, 0.08, 0.04);
    },
    pluckS: (i: number) => this.tone(PENT[(i * 2) % 8], PENT[(i * 2) % 8] * 0.98, 0.3, "triangle", 0.13),
    plip: () => this.tone(700 + Math.random() * 200, 1200, 0.09, "sine", 0.1),
    pip: () => this.tone(1500, 1700, 0.08, "sine", 0.07),
    chest: () => {
      this.sweep(180, 420, 0.5, 0.12);
      this.tone(120, 260, 0.45, "sawtooth", 0.05);
      for (let i = 0; i < 6; i++) {
        this.tone(1800 + Math.random() * 1400, 1800 + Math.random() * 1400, 0.14, "triangle", 0.05, Math.random() - 0.5, 0.35 + i * 0.07);
      }
      [0, 2, 4].forEach((k, i) =>
        this.tone(PENT[k] * 2, PENT[k] * 2, 0.5, "triangle", 0.1, 0, 0.5 + i * 0.1)
      );
    },
    giggle: () => {
      this.tone(500, 900, 0.08, "sine", 0.12);
      this.tone(560, 1000, 0.08, "sine", 0.12, 0, 0.1);
      this.tone(300, 150, 0.2, "sine", 0.14, 0, 0.22);
    },
    rise: () => {
      [0, 1, 2, 3, 4].forEach((k, i) =>
        this.tone(PENT[k] * 2, PENT[k] * 2.3, 0.12, "sine", 0.1, 0, i * 0.07)
      );
      this.tone(700, 300, 0.12, "sine", 0.12, 0, 0.4);
    },
    sunrise: () => {
      [0, 1, 2, 3, 4, 5, 6].forEach((k, i) =>
        this.tone(PENT[k] * 2, PENT[k] * 2, 0.4, "triangle", 0.07, 0, i * 0.06)
      );
    },
    sunset: () => {
      [6, 5, 4, 3, 2, 1, 0].forEach((k, i) =>
        this.tone(PENT[k], PENT[k], 0.5, "triangle", 0.07, 0, i * 0.08)
      );
    },
    eclipse: () => {
      this.tone(70, 55, 1.6, "sawtooth", 0.06);
      this.tone(105, 80, 1.6, "sine", 0.05);
    },
    horn: () => {
      this.tone(110, 104, 0.9, "triangle", 0.14);
      this.tone(165, 156, 0.9, "triangle", 0.1);
    },
    catch: () => {
      this.sf.plip();
      setTimeout(() => this.sf.ting(), 350);
    },
    singWhale: () => {
      this.singWhale();
    },
    rumbleMegalodon: () => {
      this.rumbleMegalodon();
    },
  };

  public pop(freq = 480, gainMultiplier = 1) {
    this.tone(freq, freq * 2.2, 0.18, "sine", 0.2 * gainMultiplier);
  }

  public whoosh(gainMultiplier = 1) {
    this.sweep(250, 2400, 0.7, 0.35 * gainMultiplier);
  }

  public sweepCard() {
    this.sf.glug();
  }

  public singWhale() {
    if (!this.isPlaying || !this.ctx || !this.bAmb) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();

    lp.type = "lowpass";
    lp.frequency.value = 700;

    osc1.frequency.setValueAtTime(110, t);
    osc1.frequency.exponentialRampToValueAtTime(260, t + 2.2);
    osc1.frequency.exponentialRampToValueAtTime(90, t + 6);

    osc2.frequency.setValueAtTime(165, t);
    osc2.frequency.exponentialRampToValueAtTime(390, t + 2.2);
    osc2.frequency.exponentialRampToValueAtTime(135, t + 6);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22 * this.volume + 0.001, t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 6);

    osc1.connect(g);
    osc2.connect(g);
    g.connect(lp);
    lp.connect(this.bAmb);

    [osc1, osc2].forEach((osc) => {
      osc.start(t);
      osc.stop(t + 6.2);
    });
  }

  public rumbleMegalodon() {
    if (!this.isPlaying || !this.ctx || !this.bAmb) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    lp.type = "lowpass";
    lp.frequency.value = 160;

    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 2.2);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4 * this.volume + 0.001, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

    osc.connect(g);
    g.connect(lp);
    lp.connect(this.bAmb);

    osc.start(t);
    osc.stop(t + 2.5);
  }

  // ─── Ambience Menurut Kedalaman ────────────────────────────────
  public applyDepth(v: number) {
    if (!this.ctx || !this.gAir || !this.gWave || !this.gDrone || !this.lpMaster) return;

    const t = this.ctx.currentTime;
    const d = Math.max(0, -v);
    const alt = Math.max(0, v);
    const T = 0.5;
    this.currentUnderwaterDepth = d;

    if (!this.inWater && v < -8) {
      this.inWater = true;
      if (this.isPlaying) this.plunge(0.4);
    } else if (this.inWater && v > 8) {
      this.inWater = false;
      if (this.isPlaying) this.emerge();
    }

    const air = (v > 0 ? 0.15 + 0.5 * clamp(alt / 1800) : 0.15 * clamp(1 - d / 15)) * 0.08;
    const wave = (v > 0 ? 0.25 + 0.65 * (1 - clamp(alt / 2500)) : 0.9 * clamp(1 - d / 60)) * 0.12;
    const drone = v > 0 ? 0 : 0.05 * clamp((d - 100) / 100);
    const f = v > 0 ? 9000 : Math.max(450, 4500 * Math.pow(0.1, clamp(d / 500)));

    this.gAir.gain.setTargetAtTime(air, t, T);
    this.gWave.gain.setTargetAtTime(wave, t, T);
    this.gDrone.gain.setTargetAtTime(drone, t, T);
    this.lpMaster.frequency.setTargetAtTime(f, t, T);
  }

  public onFrame(v: number) {
    this.lastDepth = v;
    if (!this.ctx || !this.isPlaying) return;
    if (++this.frameCount % 6 !== 0) return;
    this.applyDepth(v);
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.buildGraph();
    }
    if (!this.ctx || !this.master) return false;

    this.isPlaying = !this.isPlaying;
    this.ctx.resume().catch(() => {});

    if (this.isPlaying) {
      this.isEnding = false;
      this.master.gain.setTargetAtTime(0.45 * this.volume, this.ctx.currentTime, 0.9);
      this.inWater = this.lastDepth < -8;
      this.applyDepth(this.lastDepth);
      this.arpU();
    } else {
      this.isEnding = true;
      this.arpD();
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime + 0.35, 0.3);
      setTimeout(() => {
        this.isEnding = false;
      }, 700);
    }

    return this.isPlaying;
  }

  public setVolume(vol: number) {
    this.volume = clamp(vol);
    if (this.ctx && this.master && this.isPlaying) {
      this.master.gain.setTargetAtTime(0.45 * this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public setMix(key: "amb" | "mus" | "sfx", val: number) {
    this.mix[key] = clamp(val);
    if (!this.ctx) return;
    const target = key === "amb" ? this.bAmb : key === "mus" ? this.bMus : this.bSfx;
    if (target) {
      target.gain.setTargetAtTime(this.mix[key], this.ctx.currentTime, 0.1);
    }
  }

  public toggleMusic(): boolean {
    this.musOn = !this.musOn;
    return this.musOn;
  }

  public stop() {
    if (this.ctx && this.master && this.isPlaying) {
      this.isPlaying = false;
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    }
  }

  public ensureContext(): AudioContext | null {
    if (!this.ctx) {
      this.buildGraph();
    }
    return this.ctx;
  }

  public getActive(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMix(): AudioMix {
    return { ...this.mix };
  }
}

export const audioEngine = new AudioEngine();
