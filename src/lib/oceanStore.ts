/**
 * Ocean Store
 *
 * Store terpusat mutable untuk seluruh loop dan modul laut.
 * Menghitung kedalaman satu kali per frame dan membagikannya tanpa re-render React berlebihan.
 */

export interface Threat {
  x: number;
  y: number;
  r: number;
  mega?: boolean;
}

export interface OceanState {
  depth: number;       // v: >0 meter di udara, <0 meter di bawah laut
  depthMeters: number; // Nilai bulat |v|
  m: number;           // max(0, -v): kedalaman positif di bawah laut
  alt: number;         // max(0, v): ketinggian positif di atas laut
  calm: boolean;       // Mode tenang aktif
  activeSkill: string; // Filter teknologi yang sedang aktif
  threat: Threat | null; // Ancaman dari paus / megalodon
  volume: number;      // Volume audio (0..1)
  isMuted: boolean;    // Audio mute
  isLowSpec: boolean;  // Degradasi performa otomatis jika spek rendah
}

type Listener = (state: OceanState) => void;
type ToastListener = (message: string) => void;

class OceanStore {
  private state: OceanState = {
    depth: 3200,
    depthMeters: 3200,
    m: 0,
    alt: 3200,
    calm: false,
    activeSkill: "",
    threat: null,
    volume: 0.6,
    isMuted: false,
    isLowSpec: false,
  };

  private listeners = new Set<Listener>();
  private toastListeners = new Set<ToastListener>();

  constructor() {
    // Inisialisasi awal di client
    if (typeof window !== "undefined") {
      try {
        const savedCalm = localStorage.getItem("calm");
        if (savedCalm === "1") {
          this.state.calm = true;
          document.documentElement.classList.add("calm");
        }
      } catch {
        // Abaikan error localStorage (private browsing/keamanan)
      }
    }
  }

  public getState(): OceanState {
    return this.state;
  }

  public getDepth(): number {
    return this.state.depth;
  }

  public getUnderwaterDepth(): number {
    return this.state.m;
  }

  public getAltitude(): number {
    return this.state.alt;
  }

  public getThreat(): Threat | null {
    return this.state.threat;
  }

  public isCalm(): boolean {
    return this.state.calm;
  }

  public getActiveSkill(): string {
    return this.state.activeSkill;
  }

  /**
   * Menghitung nilai kedalaman v sekali per frame dari scroll state.
   * Rumus spesifikasi resmi:
   * he = hero.offsetHeight * 1.6;
   * maxScroll = scrollHeight - innerHeight;
   * v = scrollY < he ? 3200 * (1 - scrollY/he) : -(scrollY - he) / max(1, maxScroll - he) * 1000;
   */
  public updateDepth(scrollY: number, heroHeight: number, scrollHeight: number, innerHeight: number): number {
    const he = heroHeight * 1.6;
    const maxScroll = Math.max(1, scrollHeight - innerHeight);
    const v = scrollY < he
      ? 3200 * (1 - scrollY / he)
      : -((scrollY - he) / Math.max(1, maxScroll - he)) * 1000;

    this.state.depth = v;
    this.state.depthMeters = Math.abs(Math.round(v));
    this.state.m = Math.max(0, -v);
    this.state.alt = Math.max(0, v);

    return v;
  }

  public setThreat(threat: Threat | null) {
    this.state.threat = threat;
  }

  public setCalm(calm: boolean) {
    if (this.state.calm === calm) return;
    this.state.calm = calm;
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("calm", calm);
    }
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("calm", calm ? "1" : "0");
      } catch {
        // Abaikan
      }
    }
    this.notify();
    this.showToast(calm ? "Mode tenang aktif" : "Mode tenang mati");
  }

  public toggleCalm(): boolean {
    this.setCalm(!this.state.calm);
    return this.state.calm;
  }

  public setActiveSkill(skill: string) {
    const next = this.state.activeSkill === skill ? "" : skill;
    this.state.activeSkill = next;
    this.notify();
    return next;
  }

  public setVolume(vol: number) {
    const clamped = Math.min(1, Math.max(0, vol));
    this.state.volume = clamped;
    this.notify();
  }

  public setMuted(muted: boolean) {
    this.state.isMuted = muted;
    this.notify();
  }

  public setLowSpec(lowSpec: boolean) {
    if (this.state.isLowSpec === lowSpec) return;
    this.state.isLowSpec = lowSpec;
    this.notify();
  }

  public showToast(message: string) {
    this.toastListeners.forEach((fn) => fn(message));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onToast(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    return () => this.toastListeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }
}

export const oceanStore = new OceanStore();
