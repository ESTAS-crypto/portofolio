class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private volume = 0.6;

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    // Generate brown noise buffer (4s)
    const len = this.ctx.sampleRate * 4;
    this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }

    const createNoiseSource = () => {
      if (!this.ctx || !this.noiseBuffer) return null;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;
      return src;
    };

    // Sea channel with LFO swell
    const sea = createNoiseSource();
    this.lowpass = this.ctx.createBiquadFilter();
    this.lowpass.type = "lowpass";
    this.lowpass.frequency.value = 1400;

    const seaGain = this.ctx.createGain();
    seaGain.gain.value = 0.55;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 0.4;
    lfo.connect(lfoGain);
    lfoGain.connect(seaGain.gain);

    if (sea) {
      sea.connect(this.lowpass);
      this.lowpass.connect(seaGain);
      seaGain.connect(this.master);
      sea.start();
    }
    lfo.start();

    // Wind channel
    const wind = createNoiseSource();
    const windBp = this.ctx.createBiquadFilter();
    windBp.type = "bandpass";
    windBp.frequency.value = 700;
    windBp.Q.value = 0.6;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.5;

    if (wind) {
      wind.connect(windBp);
      windBp.connect(this.windGain);
      this.windGain.connect(this.master);
      wind.start();
    }
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.initContext();
    }
    if (!this.ctx || !this.master) return false;

    this.isPlaying = !this.isPlaying;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const targetGain = this.isPlaying ? 0.5 * this.volume : 0;
    this.master.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.5);

    if (this.isPlaying) {
      this.pop(520);
    }
    return this.isPlaying;
  }

  public setVolume(volFraction: number) {
    this.volume = Math.max(0, Math.min(1, volFraction));
    if (this.ctx && this.master && this.isPlaying) {
      this.master.gain.setTargetAtTime(0.5 * this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public updateDepth(scrollY: number, innerHeight: number) {
    if (!this.ctx || !this.lowpass || !this.windGain) return;
    const t = Math.min(1, Math.max(0, (scrollY / innerHeight - 1.4) / 1.2));
    this.lowpass.frequency.setTargetAtTime(1400 - 1100 * t, this.ctx.currentTime, 0.4);
    this.windGain.gain.setTargetAtTime(0.5 * (1 - t), this.ctx.currentTime, 0.4);
  }

  public pop(frequency: number) {
    if (!this.isPlaying || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, t);
      osc.frequency.exponentialRampToValueAtTime(frequency * 2.2, t + 0.08);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3 * this.volume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      // ignore audio context transition errors
    }
  }

  public whoosh() {
    if (!this.isPlaying || !this.ctx || !this.noiseBuffer) return;
    try {
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 1.2;
      filter.frequency.setValueAtTime(250, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + 0.7);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(2.2 * this.volume, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(t);
      src.stop(t + 1);
    } catch {
      // ignore audio context transition errors
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public dispose() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const audioEngine = new AudioEngine();
