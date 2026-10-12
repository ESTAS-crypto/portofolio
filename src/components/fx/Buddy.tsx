"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { oceanStore } from "@/lib/oceanStore";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

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

    if (!bd || !pet || !say || !body || !lA || !sA || !lB || !sB || !aA || !fA || !aB || !fB || !head || !eye || !pup || !scarf || !mouth) {
      return;
    }

    const setRotate = (el: SVGElement, deg: number, ox: number, oy: number) => {
      el.setAttribute("transform", `rotate(${deg.toFixed(1)} ${ox} ${oy})`);
    };

    const spinState = { spin: 0 };
    let lastScroll = window.scrollY;
    let activity = 0;
    let direction = 1;
    let curY = window.innerHeight * 0.4;
    let rotation = 6;
    let opacity = 0;
    let phase = 0;
    let lastTime = 0;
    let wave = 0;
    let isHover = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let petX = 100;
    let petY = 300;
    let petDir = 1;
    let nextBlink = 2;
    let blinkEnd = 0;
    let lastKey = "";
    let lastSpeakTime = -9;
    let speakTimer: NodeJS.Timeout | null = null;
    let frameCount = 0;
    let lampVal = 0;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const speak = (msg: string, durationMs = 3400) => {
      say.textContent = msg;
      gsap.killTweensOf(say);
      gsap.fromTo(
        say,
        { opacity: 0, y: 10, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2)" }
      );
      if (speakTimer) clearTimeout(speakTimer);
      speakTimer = setTimeout(() => {
        gsap.to(say, { opacity: 0, y: -6, duration: 0.3 });
      }, durationMs);
    };

    const spawnBubble = () => {
      const m = mouth.getBoundingClientRect();
      const b = document.createElement("i");
      const size = 4 + Math.random() * 7;
      b.className = "tb";
      b.style.cssText = `left:${m.left + m.width / 2}px;top:${m.top + m.height / 2}px;width:${size}px;height:${size}px;z-index:24`;
      document.body.appendChild(b);

      gsap.to(b, {
        y: -70 - Math.random() * 90,
        x: (Math.random() - 0.5) * 30,
        opacity: 0,
        scale: 1.5,
        duration: 1.3 + Math.random() * 0.8,
        ease: "power1.out",
        onComplete: () => b.remove(),
      });
    };

    const handleHit = () => {
      gsap.to(spinState, {
        spin: spinState.spin + 360,
        duration: 0.9,
        ease: "back.inOut(1.3)",
      });
      for (let i = 0; i < 9; i++) {
        setTimeout(spawnBubble, i * 60);
      }
      const quote = FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)];
      speak(quote);
      lastSpeakTime = lastTime;
    };

    const onTick = (t: number) => {
      const dt = Math.min(0.05, t - lastTime);
      lastTime = t;
      frameCount++;

      const H = window.innerHeight;
      const sy = window.scrollY;
      const dy = sy - lastScroll;
      lastScroll = sy;

      const v = oceanStore.getDepth();
      const calm = oceanStore.isCalm();

      opacity += (clamp(-v / 120, 0, 1) - opacity) * 0.1;
      const visible = opacity > 0.01 && !calm;

      bd.style.opacity = opacity.toFixed(3);
      pet.style.opacity = opacity.toFixed(3);
      bd.style.visibility = visible ? "visible" : "hidden";
      pet.style.visibility = visible ? "visible" : "hidden";

      if (!visible) return;

      if (Math.abs(dy) > 0.4) direction = dy > 0 ? 1 : -1;
      activity += (Math.min(1, Math.abs(dy) / 7) - activity) * 0.12;

      const depthRatio = clamp(-v / 1000, 0, 1);
      const targetY = H * (0.36 + 0.26 * depthRatio) + clamp(dy / 12, -1, 1) * H * 0.14;
      const targetRot = direction * 68 * activity + (1 - activity) * 6;

      curY += (targetY - curY) * 0.07;
      rotation += (targetRot - rotation) * 0.08;

      bd.style.transform = `translate3d(${Math.sin(t * 0.8) * 10 * (1 - activity * 0.6)}px,${curY - bd.offsetHeight / 2}px,0)`;

      phase += dt * (2.4 + 10 * activity);
      wave += (isHover - wave) * 0.12;

      setRotate(body, rotation + spinState.spin, 85, 55);
      setRotate(lA, 16 * Math.sin(phase), 70, 60);
      setRotate(sA, 24 * Math.sin(phase - 0.9), 44, 66);
      setRotate(lB, 16 * Math.sin(phase + Math.PI), 70, 56);
      setRotate(sB, 24 * Math.sin(phase + Math.PI - 0.9), 44, 60);

      setRotate(
        aA,
        (-8 * activity + 6 * Math.sin(phase) * (1 - activity)) * (1 - wave) + (-70 + 8 * Math.sin(t * 9)) * wave,
        108,
        54
      );
      setRotate(
        fA,
        wave * (-20 + 30 * Math.sin(t * 9)) + (1 - wave) * 10 * Math.sin(phase - 0.5),
        128,
        64
      );
      setRotate(aB, -4 * activity + 6 * Math.sin(phase + 1), 104, 52);
      setRotate(fB, 8 * Math.sin(phase), 124, 60);

      // Rotasi kepala & pergeseran pupil melacak posisi mouse
      const headRect = head.getBoundingClientRect();
      const headX = headRect.left + headRect.width / 2;
      const headY = headRect.top + headRect.height / 2;

      let rel = Math.atan2(mouseY - headY, mouseX - headX) - ((rotation + spinState.spin) * Math.PI) / 180;
      rel = Math.atan2(Math.sin(rel), Math.cos(rel));

      setRotate(head, clamp(rel * 57.3 * 0.3, -28, 28), 122, 46);
      pup.setAttribute("cx", (150 + Math.cos(rel) * 1.6).toFixed(2));
      pup.setAttribute("cy", (38 + Math.sin(rel) * 1.6).toFixed(2));

      // Kedipan mata
      if (t > nextBlink) {
        blinkEnd = t + 0.12;
        nextBlink = t + 2.5 + Math.random() * 3;
      }
      eye.setAttribute("transform", `translate(0 38) scale(1 ${t < blinkEnd ? 0.1 : 1}) translate(0 -38)`);

      // Kibasan syal
      const amp = 4 + 8 * activity;
      const w = t * 3;
      scarf.setAttribute(
        "d",
        `M120 46Q98 ${(44 + Math.sin(w) * amp).toFixed(1)} 76 ${(52 + Math.sin(w + 1) * amp).toFixed(1)}Q58 ${(58 + Math.sin(w + 2) * amp).toFixed(1)} 40 ${(52 + Math.sin(w + 3) * amp).toFixed(1)}`
      );

      // Senter menyala di kedalaman (-120m s.d. -520m)
      const lampTarget = clamp((-v - 120) / 400, 0, 1);
      if (Math.abs(lampTarget - lampVal) > 0.01) {
        lampVal = lampTarget;
        bd.style.setProperty("--lamp", lampVal.toFixed(2));
      }

      // Gelembung saat berenang aktif
      if (activity > 0.3 && t - blinkEnd > 0.16 && frameCount % 10 === 0) {
        spawnBubble();
      }

      // Ikan peliharaan mengorbit kepala
      const targetPetX = headX - 90 + Math.cos(t * 0.9) * 80;
      const targetPetY = headY + 40 + Math.sin(t * 1.3) * 50;
      if (Math.abs(targetPetX - petX) > 2) {
        petDir = targetPetX > petX ? 1 : -1;
      }
      petX += (targetPetX - petX) * 0.05;
      petY += (targetPetY - petY) * 0.05;
      pet.style.transform = `translate3d(${petX}px,${petY}px,0) scaleX(${petDir})`;

      // Balon ucapan kontekstual
      if (frameCount % 15 === 0) {
        let activeSection = "";
        ["about", "work", "deep", "contact"].forEach((id) => {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= H * 0.45) {
            activeSection = id;
          }
        });

        const key = activeSection || (v > -5 ? "" : v > -200 ? "sun" : "twi");
        const finalKey = key || (v <= 0 ? "surf" : "");

        if (finalKey && finalKey !== lastKey && t - lastSpeakTime > 4) {
          lastKey = finalKey;
          lastSpeakTime = t;
          if (MESSAGES[finalKey]) {
            speak(MESSAGES[finalKey]);
          }
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
      window.removeEventListener("pointermove", handlePointerMove);
      gsap.ticker.remove(onTick);
      if (speakTimer) clearTimeout(speakTimer);
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

      <svg className="bd-pet" id="bdPet" ref={petRef} viewBox="0 0 120 60" aria-hidden="true">
        <use href="#fish" />
      </svg>
    </>
  );
}
