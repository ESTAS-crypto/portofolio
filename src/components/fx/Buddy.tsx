"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { oceanStore } from "@/lib/oceanStore";
import { audioEngine } from "@/lib/audioEngine";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const rnd = Math.random;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const MESSAGES: Record<string, string> = {
  surf: "Byur! Selamat datang di bawah laut.",
  sun: "Cahaya matahari masih sampai di sini.",
  twi: "Gelap sekali... untung bawa senter!",
  about: "Ini cerita tentang Evan.",
  work: "Gulir terus, proyeknya bergeser ke samping!",
  deep: "Klik ikan itu untuk masuk ke ceritanya!",
  contact: "Ayo ngobrol dengan Evan!",
};

const FUN_QUOTES = [
  "Hehe, geli!",
  "Aku Evan versi kartun!",
  "Lihat proyek-proyeknya ya!",
  "Glup glup glup...",
  "Mau jadi temanku?",
];

const LOOK_QUOTES = [
  "Wah, ikan itu lucu!",
  "Hmm, apa ini?",
  "Cantiknya!",
  "Ada ikan proyek di sini!",
];

const MOVE_SPEED: Record<string, number> = {
  wander: 90,
  explore: 110,
  curious: 100,
  flee: 190,
  play: 70,
  rest: 0,
};

export default function Buddy({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const buddyRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<SVGSVGElement>(null);
  const sayRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const legARef = useRef<SVGGElement>(null);
  const shinARef = useRef<SVGGElement>(null);
  const legBRef = useRef<SVGGElement>(null);
  const shinBRef = useRef<SVGGElement>(null);
  const armARef = useRef<SVGGElement>(null);
  const foreARef = useRef<SVGGElement>(null);
  const armBRef = useRef<SVGGElement>(null);
  const foreBRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const eyeRef = useRef<SVGGElement>(null);
  const pupRef = useRef<SVGCircleElement>(null);
  const scarfRef = useRef<SVGPathElement>(null);
  const mouthRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const bd = buddyRef.current;
    const pet = petRef.current;
    const say = sayRef.current;
    const body = bodyRef.current;
    const lA = legARef.current;
    const sA = shinARef.current;
    const lB = legBRef.current;
    const sB = shinBRef.current;
    const aA = armARef.current;
    const fA = foreARef.current;
    const aB = armBRef.current;
    const fB = foreBRef.current;
    const head = headRef.current;
    const eye = eyeRef.current;
    const pup = pupRef.current;
    const scarf = scarfRef.current;
    const mouth = mouthRef.current;

    if (
      !bd ||
      !pet ||
      !say ||
      !body ||
      !lA ||
      !sA ||
      !lB ||
      !sB ||
      !aA ||
      !fA ||
      !aB ||
      !fB ||
      !head ||
      !eye ||
      !pup ||
      !scarf ||
      !mouth
    ) {
      return;
    }

    const setRotate = (el: SVGElement, deg: number, ox: number, oy: number) => {
      el.setAttribute("transform", `rotate(${deg.toFixed(1)} ${ox} ${oy})`);
    };

    bd.style.left = "0";
    bd.style.right = "auto";
    bd.style.top = "0";

    let W = window.innerWidth;
    let H = window.innerHeight;
    let sw = 150;
    let sh = 100;
    let bounds = { l: 0, r: 0, t: 0, b: 0 };

    function updateSize() {
      W = window.innerWidth;
      H = window.innerHeight;
      sw = bd?.offsetWidth || 150;
      sh = bd?.offsetHeight || 100;
      const m = W > 760;
      bounds = {
        l: sw * 0.5 + 8,
        r: W - (m ? 132 : 8) - sw * 0.5,
        t: 96 + sh * 0.5,
        b: H - (m ? 96 : 140) - sh * 0.5,
      };
    }

    updateSize();
    window.addEventListener("resize", updateSize);

    const spinState = { spin: 0 };
    let scrollVel = 0;
    let speed = 0;
    let posX = W * 0.3;
    let posY = H * 0.5;
    let velX = 0;
    let velY = 0;
    let dir = 1;
    let scaleX = 1;
    let targetX = posX;
    let targetY = posY;
    let mode: "wander" | "explore" | "curious" | "flee" | "play" | "rest" = "rest";
    let modeTimer = 0;
    let isHover = 0;
    let wave = 0;
    let phase = 0;
    let lastTime = 0;
    let opacity = 0;
    let lastScroll = window.scrollY;
    let mouseX = -999;
    let mouseY = -999;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let cursorSpeed = 0;
    let slowHoverTimer = 0;
    let nextBlink = 2;
    let blinkEnd = 0;
    let lastSayTime = -9;
    let sayTimer: NodeJS.Timeout | null = null;
    let frameCount = 0;
    let lastKey = "";
    let petX = 100;
    let petY = 300;
    let petDir = 1;
    let lastBubbleTime = 0;
    let fishList: { x: number; y: number }[] = [];
    let fishScanTime = 0;
    let inspectTime = 0;
    let pitch = 0;
    let lampVal = 0;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const speak = (msg: string, durationMs = 3400) => {
      if (oceanStore.getDepth() >= 0 || oceanStore.isCalm()) return;
      if (lastTime - lastSayTime < 6 && msg !== "Awas!") return;
      lastSayTime = lastTime;

      bd.classList.toggle("sr", posX >= W * 0.55);
      bd.classList.toggle("sl", posX < W * 0.55);
      say.textContent = msg;
      gsap.killTweensOf(say);
      gsap.fromTo(
        say,
        { opacity: 0, y: 10, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2)" }
      );
      if (sayTimer) clearTimeout(sayTimer);
      sayTimer = setTimeout(() => {
        gsap.to(say, { opacity: 0, y: -6, duration: 0.3 });
      }, durationMs);
    };

    const spawnBubble = () => {
      const b = document.createElement("i");
      const size = 4 + rnd() * 7;
      b.className = "tb";
      b.style.cssText = `left:${posX + dir * sw * 0.3}px;top:${posY + sh * 0.05}px;width:${size}px;height:${size}px;z-index:24`;
      document.body.appendChild(b);

      gsap.to(b, {
        y: -70 - rnd() * 90,
        x: (rnd() - 0.5) * 30,
        opacity: 0,
        scale: 1.5,
        duration: 1.3 + rnd() * 0.8,
        ease: "power1.out",
        onComplete: () => b.remove(),
      });
    };

    const handleHit = () => {
      audioEngine.pop(350);
      audioEngine.sf.giggle();
      gsap.to(spinState, {
        spin: spinState.spin + 360,
        duration: 0.9,
        ease: "back.inOut(1.3)",
      });
      for (let i = 0; i < 9; i++) {
        setTimeout(spawnBubble, i * 60);
      }
      lastSayTime = -9;
      speak(FUN_QUOTES[Math.floor(rnd() * FUN_QUOTES.length)]);
    };

    const pickMode = (t: number) => {
      const r = rnd();
      inspectTime = 0;
      if (r < 0.5) {
        mode = "wander";
        targetX = lerp(bounds.l, bounds.r, rnd());
        targetY = lerp(bounds.t, bounds.b, rnd());
        modeTimer = t + 2.5 + rnd() * 4.5;
      } else if (r < 0.74 && fishList.length > 0) {
        mode = "explore";
        const f = fishList[Math.floor(rnd() * fishList.length)];
        targetX = clamp(f.x + (f.x > posX ? -1 : 1) * sw * 0.55, bounds.l, bounds.r);
        targetY = clamp(f.y, bounds.t, bounds.b);
        modeTimer = t + 9;
      } else if (r < 0.88) {
        mode = "rest";
        modeTimer = t + 2 + rnd() * 2;
      } else if (r < 0.96) {
        mode = "play";
        modeTimer = t + 2.4;
        targetX = lerp(bounds.l, bounds.r, rnd());
        targetY = lerp(bounds.t, bounds.b, rnd());
        gsap.to(spinState, { spin: spinState.spin + 360, duration: 1, ease: "back.inOut(1.3)" });
        for (let i = 0; i < 8; i++) {
          setTimeout(spawnBubble, i * 70);
        }
      } else {
        mode = "wander";
        targetX = pet ? petX : lerp(bounds.l, bounds.r, rnd());
        targetY = pet ? petY : lerp(bounds.t, bounds.b, rnd());
        modeTimer = t + 4;
      }
    };

    const onTick = (t: number) => {
      const dt = Math.min(0.05, t - lastTime);
      lastTime = t;
      frameCount++;

      const H0 = window.innerHeight;
      const sy = window.scrollY;
      const dyS = sy - lastScroll;
      lastScroll = sy;

      const v = oceanStore.getDepth();
      const calm = oceanStore.isCalm();

      // Jika di daratan / angkasa (v >= 0) atau mode tenang:
      // Penyelam, pet, dan balon bicara langsung disembunyikan seketika
      if (v >= 0 || calm) {
        if (opacity > 0) {
          opacity = 0;
          bd.style.opacity = "0";
          pet.style.opacity = "0";
          bd.style.visibility = "hidden";
          pet.style.visibility = "hidden";
          if (sayTimer) {
            clearTimeout(sayTimer);
            sayTimer = null;
          }
          gsap.killTweensOf(say);
          gsap.set(say, { opacity: 0, y: -6 });
        }
        return;
      }

      // Fade-in halus saat di bawah laut
      opacity += (clamp(-v / 120, 0, 1) - opacity) * 0.1;
      const visible = opacity > 0.01 && !calm;
      bd.style.opacity = opacity.toFixed(3);
      pet.style.opacity = opacity.toFixed(3);
      bd.style.visibility = visible ? "visible" : "hidden";
      pet.style.visibility = visible ? "visible" : "hidden";
      if (!visible) return;

      if (frameCount % 30 === 0) updateSize();

      // Scan ikan terdekat di DOM secara periodik
      if (t - fishScanTime > 0.5) {
        fishScanTime = t;
        fishList = Array.from(document.querySelectorAll(".fish"))
          .map((f) => {
            const r = f.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          })
          .filter((p) => p.x > 0 && p.x < W && p.y > 0 && p.y < H0);
      }

      // Deteksi kecepatan kursor
      cursorSpeed += (Math.min(60, Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY)) - cursorSpeed) * 0.3;
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      // Logika perilaku otonom
      const threat =
        oceanStore.getThreat() ||
        (window as unknown as { __threat?: { x: number; y: number; r: number } }).__threat;
      const screenScale = clamp(Math.min(W, H0) / 800, 0.7, 1.6);

      if (threat && Math.hypot(threat.x - posX, threat.y - posY) < threat.r * 1.2) {
        if (mode !== "flee") {
          speak("Awas!");
        }
        mode = "flee";
        const ax = posX - threat.x;
        const ay = posY - threat.y;
        const al = Math.hypot(ax, ay) || 1;
        targetX = clamp(posX + (ax / al) * 400, bounds.l, bounds.r);
        targetY = clamp(posY + (ay / al) * 300, bounds.t, bounds.b);
        modeTimer = t + 0.6;
      } else if (mode !== "flee" && mouseX > -900 && Math.hypot(mouseX - posX, mouseY - posY) < 320 && cursorSpeed < 0.8) {
        slowHoverTimer += dt;
        if (slowHoverTimer > 0.8 && mode !== "curious") {
          mode = "curious";
          modeTimer = t + 2.6;
        }
        if (mode === "curious") {
          targetX = clamp(mouseX - dir * 150, bounds.l, bounds.r);
          targetY = clamp(mouseY, bounds.t, bounds.b);
        }
      } else {
        slowHoverTimer = 0;
      }

      const dx = targetX - posX;
      const dy = targetY - posY;
      const dist = Math.hypot(dx, dy) || 1;

      if (mode === "explore" && !inspectTime && dist < sw * 0.7) {
        inspectTime = t;
        modeTimer = t + 2 + rnd() * 1.5;
        if (rnd() < 0.5) speak(LOOK_QUOTES[Math.floor(rnd() * LOOK_QUOTES.length)]);
      }

      if (t > modeTimer) pickMode(t);

      const inspecting = mode === "explore" && inspectTime > 0;
      const maxSpd = ((inspecting ? 0 : MOVE_SPEED[mode]) || 0) * screenScale;
      const arrival = clamp(dist / 140, 0.12, 1);
      let dvx = (dx / dist) * maxSpd * arrival;
      let dvy = (dy / dist) * maxSpd * arrival;
      if (mode === "rest" || inspecting) {
        dvx = 0;
        dvy = Math.sin(t * 1.2) * 8;
      }

      const accel = 1 - Math.exp(-dt * 2.4);
      velX += (dvx - velX) * accel;
      velY += (dvy - velY) * accel;
      scrollVel += (dyS - scrollVel) * 0.12;
      velY += scrollVel * 0.45;

      posX = clamp(posX + velX * dt, bounds.l - 20, bounds.r + 20);
      posY = clamp(posY + velY * dt, bounds.t - 20, bounds.b + 20);

      if (Math.abs(velX) > 35) dir = velX > 0 ? 1 : -1;
      scaleX += (dir - scaleX) * (1 - Math.exp(-dt * 7));

      speed += (clamp(Math.hypot(velX, velY) / (150 * screenScale), 0, 1) - speed) * (1 - Math.exp(-dt * 5));
      phase += dt * (1.8 + 7 * speed);

      const shouldWave = isHover || (mode === "curious" && dist < sw * 1.2) || inspecting ? 1 : 0;
      wave += (shouldWave - wave) * 0.12;

      pitch += (clamp(Math.atan2(velY, Math.abs(velX) + 40) * 57.3, -50, 50) - pitch) * clamp(dt * 6, 0, 1);

      // Posisi container di layar penuh
      bd.style.transform = `translate3d(${(posX - sw / 2).toFixed(1)}px,${(posY - sh / 2).toFixed(1)}px,0)`;
      body.setAttribute(
        "transform",
        `translate(85 0) scale(${scaleX.toFixed(2)} 1) translate(-85 0) rotate(${(pitch + spinState.spin + 2.5 * speed * Math.sin(phase)).toFixed(1)} 85 55)`
      );

      // Artikulasi tungkai & lengan
      setRotate(lA, 16 * Math.sin(phase), 70, 60);
      setRotate(sA, 24 * Math.sin(phase - 0.9), 44, 66);
      setRotate(lB, 16 * Math.sin(phase + Math.PI), 70, 56);
      setRotate(sB, 24 * Math.sin(phase + Math.PI - 0.9), 44, 60);
      setRotate(
        aA,
        (-8 * speed + 6 * Math.sin(phase) * (1 - speed)) * (1 - wave) + (-70 + 8 * Math.sin(t * 9)) * wave,
        108,
        54
      );
      setRotate(
        fA,
        wave * (-20 + 30 * Math.sin(t * 9)) + (1 - wave) * 10 * Math.sin(phase - 0.5),
        128,
        64
      );
      setRotate(aB, -4 * speed + 6 * Math.sin(phase + 1), 104, 52);
      setRotate(fB, 8 * Math.sin(phase), 124, 60);

      // Tatapan mata & rotasi kepala
      const lookX = mouseX > -900 && Math.hypot(mouseX - posX, mouseY - posY) < 520 ? mouseX : targetX;
      const lookY = mouseX > -900 && Math.hypot(mouseX - posX, mouseY - posY) < 520 ? mouseY : targetY;
      let relAngle = Math.atan2(lookY - posY, (lookX - posX) * dir) - (pitch * Math.PI) / 180;
      relAngle = Math.atan2(Math.sin(relAngle), Math.cos(relAngle));

      setRotate(head, clamp(relAngle * 57.3 * 0.3, -28, 28), 122, 46);
      pup.setAttribute("cx", (150 + Math.cos(relAngle) * 1.6).toFixed(2));
      pup.setAttribute("cy", (38 + Math.sin(relAngle) * 1.6).toFixed(2));

      // Kedipan mata
      if (t > nextBlink) {
        blinkEnd = t + 0.12;
        nextBlink = t + 2.5 + rnd() * 3;
      }
      eye.setAttribute("transform", `translate(0 38) scale(1 ${t < blinkEnd ? 0.1 : 1}) translate(0 -38)`);

      // Kibasan syal
      const amp = 4 + 8 * speed;
      const w = t * 3;
      scarf.setAttribute(
        "d",
        `M120 46Q98 ${(44 + Math.sin(w) * amp).toFixed(1)} 76 ${(52 + Math.sin(w + 1) * amp).toFixed(1)}Q58 ${(58 + Math.sin(w + 2) * amp).toFixed(1)} 40 ${(52 + Math.sin(w + 3) * amp).toFixed(1)}`
      );

      // Senter menyala otomatis di kedalaman
      const lampTarget = clamp((-v - 120) / 400, 0, 1);
      if (Math.abs(lampTarget - lampVal) > 0.01) {
        lampVal = lampTarget;
        bd.style.setProperty("--lamp", lampVal.toFixed(2));
      }

      // Gelembung saat bergerak lincah
      if (speed > 0.3 && t - lastBubbleTime > 0.28) {
        lastBubbleTime = t;
        spawnBubble();
      }

      // Ikan pendamping mengikuti penyelam
      const hx = posX + dir * sw * 0.22;
      const hy = posY - sh * 0.05;
      const ptx = hx - dir * sw * 0.45 + Math.cos(t * 0.9) * sw * 0.4;
      const pty = hy + Math.sin(t * 1.3) * sw * 0.3 + sh * 0.15;
      if (Math.abs(ptx - petX) > 2) petDir = ptx > petX ? 1 : -1;
      petX += (ptx - petX) * 0.05;
      petY += (pty - petY) * 0.05;
      pet.style.transform = `translate3d(${petX.toFixed(1)}px,${petY.toFixed(1)}px,0) scaleX(${petDir})`;

      // Balon ucapan kontekstual
      if (frameCount % 30 === 0) {
        let sec = "";
        ["about", "work", "deep", "contact"].forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= H0 * 0.45) sec = id;
        });
        const k = sec || (v > -5 ? "" : v > -200 ? "sun" : "twi");
        const kk = k || (v <= 0 ? "surf" : "");
        if (kk && kk !== lastKey && t - lastSayTime > 4) {
          lastKey = kk;
          speak(MESSAGES[kk]);
        }
      }
    };

    const hitEl = document.getElementById("bdHit");
    if (hitEl) {
      hitEl.addEventListener("pointerenter", () => { isHover = 1; });
      hitEl.addEventListener("pointerleave", () => { isHover = 0; });
      hitEl.addEventListener("focus", () => { isHover = 1; });
      hitEl.addEventListener("blur", () => { isHover = 0; });
      hitEl.addEventListener("click", handleHit);
    }

    gsap.ticker.add(onTick);

    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("pointermove", handlePointerMove);
      gsap.ticker.remove(onTick);
      if (sayTimer) clearTimeout(sayTimer);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      <div className="buddy" id="buddy" ref={buddyRef}>
        <div className="bd-say" id="bdSay" ref={sayRef} role="status" aria-live="polite" />
        <svg viewBox="-20 -14 240 150" aria-hidden="true">
          <defs>
            <linearGradient id="bdBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fffbe0" stopOpacity="0.8" />
              <stop offset="1" stopColor="#fffbe0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g id="bdBody" ref={bodyRef}>
            <polygon className="bd-beam" points="156,40 360,-30 360,110" fill="url(#bdBeam)" />
            <path id="bdScarf" ref={scarfRef} d="" fill="none" stroke="#ff9f43" strokeWidth="7" strokeLinecap="round" />
            
            {/* Kaki Belakang (B) */}
            <g id="bdLegB" ref={legBRef}>
              <line x1="70" y1="56" x2="44" y2="60" stroke="#0c3153" strokeWidth="11" strokeLinecap="round" />
              <g id="bdShinB" ref={shinBRef}>
                <line x1="44" y1="60" x2="18" y2="62" stroke="#0c3153" strokeWidth="10" strokeLinecap="round" />
                <path d="M18 62L-8 52L-6 74Z" fill="#e08a2e" />
              </g>
            </g>

            {/* Tangki Oksigen & Punggung */}
            <rect x="62" y="26" width="46" height="15" rx="7" fill="#9fb6c8" />
            <path d="M108 34Q130 22 138 42" stroke="#6a8499" strokeWidth="3" fill="none" />
            <path d="M62 44Q90 30 120 40Q128 58 118 68Q90 76 64 68Q54 56 62 44Z" fill="#0f3b63" />
            <path d="M82 36Q86 56 82 74" stroke="#ff9f43" strokeWidth="4" fill="none" />

            {/* Kaki Depan (A) */}
            <g id="bdLegA" ref={legARef}>
              <line x1="70" y1="60" x2="44" y2="66" stroke="#14456f" strokeWidth="11" strokeLinecap="round" />
              <g id="bdShinA" ref={shinARef}>
                <line x1="44" y1="66" x2="18" y2="70" stroke="#14456f" strokeWidth="10" strokeLinecap="round" />
                <path d="M18 70L-8 60L-6 82Z" fill="#ff9f43" />
              </g>
            </g>

            {/* Lengan Belakang (B) */}
            <g id="bdArmB" ref={armBRef}>
              <line x1="104" y1="52" x2="124" y2="60" stroke="#0c3153" strokeWidth="9" strokeLinecap="round" />
              <g id="bdForeB" ref={foreBRef}>
                <line x1="124" y1="60" x2="144" y2="56" stroke="#0c3153" strokeWidth="8" strokeLinecap="round" />
                <circle cx="147" cy="56" r="5" fill="#e2b48b" />
              </g>
            </g>

            {/* Kepala, Masker, Mata */}
            <g id="bdHead" ref={headRef}>
              <circle cx="136" cy="38" r="15" fill="#f2c9a0" />
              <path d="M121 40Q120 18 140 21Q154 24 151 36Q142 27 128 33Z" fill="#3a2a22" />
              <path d="M121 36Q130 30 140 32" stroke="#0a2a4a" strokeWidth="3" fill="none" />
              <circle cx="140" cy="47" r="3" fill="#ff9aa2" opacity="0.55" />
              <rect x="138" y="31" width="19" height="14" rx="6" fill="#9fe3ff" stroke="#0a2a4a" strokeWidth="3" />
              <g id="bdEye" ref={eyeRef}>
                <circle cx="149" cy="38" r="4.5" fill="#fff" />
                <circle id="bdPup" ref={pupRef} cx="150" cy="38" r="2.3" fill="#0a2a4a" />
              </g>
              <circle className="bd-mouth" ref={mouthRef} cx="154" cy="50" r="4" fill="#ff9f43" />
            </g>

            {/* Lengan Depan (A) */}
            <g id="bdArmA" ref={armARef}>
              <line x1="108" y1="54" x2="128" y2="64" stroke="#14456f" strokeWidth="9" strokeLinecap="round" />
              <g id="bdForeA" ref={foreARef}>
                <line x1="128" y1="64" x2="148" y2="60" stroke="#14456f" strokeWidth="8" strokeLinecap="round" />
                <circle cx="151" cy="60" r="5.5" fill="#f2c9a0" />
              </g>
            </g>
          </g>
        </svg>

        <button
          className="bd-hit"
          id="bdHit"
          type="button"
          aria-label="Sapa penyelam"
        />
      </div>

      <svg
        className="bd-pet"
        id="bdPet"
        ref={petRef}
        viewBox="0 0 120 60"
        aria-hidden="true"
        style={{ cursor: "pointer", pointerEvents: "auto" }}
        onPointerEnter={() => audioEngine.pop(340)}
        onClick={() => {
          audioEngine.pop(420);
          audioEngine.whoosh(0.6);
        }}
      >
        <use href="#fish" />
      </svg>
    </>
  );
}
