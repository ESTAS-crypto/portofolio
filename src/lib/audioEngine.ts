/**
 * AudioEngine v2
 *
 * Mesin audio sintetis Web Audio berbasis suasana kedalaman laut.
 * - Pink noise 6 detik (Paul Kellet filter)
 * - 4 layer atmosfer: angin (air), ombak (wave), bawah air (under), drone
 * - Transisi plunge (-8m) dan emerge (+8m)
 * - Efek sapuan (sweep) saat membuka kartu proyek atau mengklik ikan
 * - Efek nyanyian paus dan geraman megalodon
 * - AudioContext dibuat HANYA saat gestur klik pertama pengguna
 */

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lpMaster: BiquadFilterNode | null = null;

  // Layer Gain Nodes
  private gAir: GainNode | null = null;
  private gWave: GainNode | null = null;
  private gUnder: GainNode | null = null;
  private gDrone: GainNode | null = null;

  private pinkBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private volume = 0.6;
  private inWater = false;
  private frameCount = 0;
  private lastDepth = 3200;

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
   * Menghasilkan pink noise buffer berkualitas tinggi (6 detik)
   * menggunakan algoritma filter Paul Kellet.
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

  private createLFO(frequency: number, amount: number, target: AudioParam) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.value = amount;
    osc.connect(gain);
    gain.connect(target);
    osc.start();
  }

  private createNoiseLayer(type: BiquadFilterType, frequency: number, q: number): BiquadFilterNode {
    if (!this.ctx || !this.pinkBuffer) throw new Error("AudioContext or buffer missing");
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    src.buffer = this.pinkBuffer;
    src.loop = true;
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    src.connect(filter);
    src.start(0, Math.random() * 4);
    return filter;
  }

  private buildGraph() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.pinkBuffer = this.generatePinkNoise();

    // Rantai Utama: Master -> Lowpass Master -> DynamicsCompressor -> Destination
    const compressor = this.ctx.createDynamicsCompressor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;

    this.lpMaster = this.ctx.createBiquadFilter();
    this.lpMaster.type = "lowpass";
    this.lpMaster.frequency.value = 9000;
    this.lpMaster.Q.value = 0.3;

    this.master.connect(this.lpMaster);
    this.lpMaster.connect(compressor);
    compressor.connect(this.ctx.destination);

    // 1. Lapisan Udara / Angin (Bandpass 650Hz, Q0.6, LFO 0.05Hz)
    const windMod = this.ctx.createGain();
    windMod.gain.value = 0.6;
    this.createLFO(0.05, 0.3, windMod.gain);
    this.gAir = this.ctx.createGain();
    this.gAir.gain.value = 0;
    this.createNoiseLayer("bandpass", 650, 0.6).connect(windMod);
    windMod.connect(this.gAir);
    this.gAir.connect(this.master);

    // 2. Lapisan Ombak (Lowpass 1000Hz, Q0.4, dual LFO swell 0.09Hz + 0.13Hz)
    const swellMod = this.ctx.createGain();
    swellMod.gain.value = 0.55;
    this.createLFO(0.09, 0.4, swellMod.gain);
    this.createLFO(0.13, 0.12, swellMod.gain);
    this.gWave = this.ctx.createGain();
    this.gWave.gain.value = 0;
    this.createNoiseLayer("lowpass", 1000, 0.4).connect(swellMod);
    swellMod.connect(this.gWave);
    this.gWave.connect(this.master);

    // 3. Lapisan Bawah Air (Lowpass 260Hz, Q0.7)
    this.gUnder = this.ctx.createGain();
    this.gUnder.gain.value = 0;
    this.createNoiseLayer("lowpass", 260, 0.7).connect(this.gUnder);
    this.gUnder.connect(this.master);

    // 4. Lapisan Drone Dasar Laut (Sinus 55, 82.5, 110.4Hz, LFO 0.07Hz)
    this.gDrone = this.ctx.createGain();
    this.gDrone.gain.value = 0;
    const droneMod = this.ctx.createGain();
    droneMod.gain.value = 0.5;
    this.createLFO(0.07, 0.3, droneMod.gain);

    const freqs = [55, 82.5, 110.4];
    const gains = [0.5, 0.3, 0.14];
    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      g.gain.value = gains[i];
      osc.connect(g);
      g.connect(droneMod);
      osc.start();
    });

    droneMod.connect(this.gDrone);
    this.gDrone.connect(this.master);
  }

  public sweep(f0: number, f1: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.pinkBuffer || !this.master) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    const bp = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();

    src.buffer = this.pinkBuffer;
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f1, t + duration);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gainVal, t + duration * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    src.connect(bp);
    bp.connect(g);
    g.connect(this.master);

    src.start(t, Math.random() * 4);
    src.stop(t + duration + 0.05);
  }

  private blip(freq: number, delay: number, gainVal: number) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, t + 0.09);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gainVal, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Efek masuk menyelam ke bawah permukaan air (-8m).
   */
  public plunge() {
    this.sweep(2200, 260, 0.9, 0.6);
    for (let i = 0; i < 6; i++) {
      this.blip(420 + Math.random() * 500, 0.1 + i * 0.09 + Math.random() * 0.05, 0.05);
    }
  }

  /**
   * Efek naik keluar dari permukaan air (+8m).
   */
  public emerge() {
    this.sweep(300, 1800, 0.8, 0.4);
  }

  public ensureContext(): AudioContext | null {
    if (!this.ctx) {
      this.buildGraph();
    }
    return this.ctx;
  }

  /**
   * Sound effect gelembung 'pop / bloop' (sine wave exponential ramp up).
   * Suara khas dan lucu saat mengarahkan kursor / mau klik ikan (pop 300Hz)
   * atau klik elemen interaktif dari referensi portofolio asli.
   */
  public pop(freq = 300, gainMultiplier = 1) {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("calm")) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 2.2, t + 0.08);

    const peakGain = 0.3 * this.volume * gainMultiplier;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain), t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Sound effect whoosh air saat klik ikan atau kartu proyek.
   */
  public whoosh(gainMultiplier = 1) {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("calm")) return;
    this.ensureContext();
    if (!this.ctx || !this.pinkBuffer) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    const bp = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();

    src.buffer = this.pinkBuffer;
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(250, t);
    bp.frequency.exponentialRampToValueAtTime(2400, t + 0.7);

    const peakGain = 0.45 * this.volume * gainMultiplier;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain), t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

    src.connect(bp);
    bp.connect(g);
    g.connect(this.ctx.destination);

    src.start(t);
    src.stop(t + 1);
  }

  /**
   * Efek sapuan saat membuka kartu proyek atau saat ikan diklik.
   * Tetap dipertahankan sesuai instruksi pengguna.
   */
  public sweepCard() {
    this.whoosh();
    this.pop(350);
  }

  /**
   * Nyanyian misterius paus biru (6 detik dual-sine glider).
   */
  public singWhale() {
    if (!this.isPlaying || !this.ctx || !this.master) return;
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
    lp.connect(this.master);

    [osc1, osc2].forEach((osc) => {
      osc.start(t);
      osc.stop(t + 6.2);
    });
  }

  /**
   * Geraman dalam Megalodon purba (2.2 detik sawtooth).
   */
  public rumbleMegalodon() {
    if (!this.isPlaying || !this.ctx || !this.master) return;
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
    lp.connect(this.master);

    osc.start(t);
    osc.stop(t + 2.5);
  }

  /**
   * Pemetaan kedalaman multi-filter real-time.
   */
  public applyDepth(v: number) {
    if (!this.ctx || !this.gAir || !this.gWave || !this.gUnder || !this.gDrone || !this.lpMaster) return;

    const t = this.ctx.currentTime;
    const d = Math.max(0, -v);
    const alt = Math.max(0, v);
    const timeConstant = 0.45;

    // Deteksi menembus batas permukaan laut (+- 8m)
    if (!this.inWater && v < -8) {
      this.inWater = true;
      if (this.isPlaying) this.plunge();
    } else if (this.inWater && v > 8) {
      this.inWater = false;
      if (this.isPlaying) this.emerge();
    }

    const air = v > 0 ? 0.15 + 0.5 * clamp(alt / 1800) : 0.15 * clamp(1 - d / 15);
    const wave = v > 0 ? 0.25 + 0.65 * (1 - clamp(alt / 2500)) : 0.9 * clamp(1 - d / 60);
    const under = v > 0 ? 0 : 0.9 * clamp(d / 50);
    const drone = v > 0 ? 0 : 0.55 * clamp(d / 150);
    const masterCutoff = v > 0 ? 9000 : Math.max(450, 4500 * Math.pow(0.1, clamp(d / 500)));

    this.gAir.gain.setTargetAtTime(air, t, timeConstant);
    this.gWave.gain.setTargetAtTime(wave, t, timeConstant);
    this.gUnder.gain.setTargetAtTime(under, t, timeConstant);
    this.gDrone.gain.setTargetAtTime(drone, t, timeConstant);
    this.lpMaster.frequency.setTargetAtTime(masterCutoff, t, timeConstant);
  }

  /**
   * Update frame-by-frame dari ticker GSAP terpusat (throttled tiap 6 frame).
   */
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

    // Fade 0.9 detik saat nyala, 0.3 detik saat mati
    const targetGain = this.isPlaying ? 0.45 * this.volume : 0;
    const fadeDuration = this.isPlaying ? 0.9 : 0.3;
    this.master.gain.setTargetAtTime(targetGain, this.ctx.currentTime, fadeDuration);

    if (this.isPlaying) {
      this.inWater = this.lastDepth < -8;
      this.applyDepth(this.lastDepth);
    }

    return this.isPlaying;
  }

  public setVolume(vol: number) {
    this.volume = clamp(vol);
    if (this.ctx && this.master && this.isPlaying) {
      this.master.gain.setTargetAtTime(0.45 * this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (this.ctx && this.master && this.isPlaying) {
      this.isPlaying = false;
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    }
  }

  public getActive(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const audioEngine = new AudioEngine();
