import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const roles = ['Full-Stack Developer', 'UI/UX Designer', 'Creative Coder', 'Problem Solver'];

function FloatingOrb({ color, size, top, left, delay, duration }) {
  return (
    <motion.div
      animate={{
        x: [0, 30, -20, 15, 0],
        y: [0, -40, 20, -30, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{
        position: 'absolute', top, left, width: size, height: size,
        borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
    />
  );
}

function Sparkle({ delay }) {
  const top = useMemo(() => `${Math.random() * 100}%`, []);
  const left = useMemo(() => `${Math.random() * 100}%`, []);
  const size = useMemo(() => 2 + Math.random() * 3, []);
  return (
    <motion.div
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay, ease: 'easeInOut' }}
      style={{
        position: 'absolute', top, left, width: size, height: size,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 0 6px 2px rgba(139,92,246,0.5)', pointerEvents: 'none',
      }}
    />
  );
}

function MagneticButton({ children, href, primary }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref} href={href}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
      }}
      onMouseMove={handleMouse} onMouseLeave={reset} whileTap={{ scale: 0.95 }}
      style={{
        x: springX, y: springY,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '15px 36px', borderRadius: 9999,
        fontWeight: 600, fontSize: '0.95rem',
        position: 'relative', overflow: 'hidden',
        ...(primary ? {
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff',
          boxShadow: '0 0 30px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
        } : {
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#f0f0f5', backdropFilter: 'blur(10px)',
        }),
      }}
    >
      {primary && (
        <motion.div
          animate={{ x: ['-100%', '250%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </motion.a>
  );
}

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bgX = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 50, damping: 20 });
  const bgY = useSpring(useTransform(mouseY, [0, 1], [-8, 8]), { stiffness: 50, damping: 20 });

  useEffect(() => {
    const current = roles[roleIndex];
    let timeout;
    if (!isDeleting && displayText.length < current.length) {
      timeout = setTimeout(() => setDisplayText(current.slice(0, displayText.length + 1)), 80);
    } else if (!isDeleting && displayText.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 40);
    } else {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, roleIndex]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const sparkles = useMemo(() => Array.from({ length: 25 }, (_, i) => i), []);

  const firstName = "Evan";
  const lastName = "Atharasya";

  return (
    <section
      id="home" ref={containerRef} onMouseMove={handleMouseMove}
      style={{
        position: 'relative', minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        padding: '100px 20px 60px',
      }}
    >
      <motion.div style={{ position: 'absolute', inset: 0, x: bgX, y: bgY }}>
        <FloatingOrb color="rgba(139,92,246,0.15)" size="600px" top="5%" left="10%" delay={0} duration={20} />
        <FloatingOrb color="rgba(6,182,212,0.1)" size="500px" top="60%" left="65%" delay={2} duration={25} />
        <FloatingOrb color="rgba(236,72,153,0.07)" size="400px" top="40%" left="40%" delay={4} duration={18} />
      </motion.div>

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent)',
      }} />

      {sparkles.map(i => <Sparkle key={i} delay={i * 0.3} />)}

      <div style={{
        position: 'relative', zIndex: 2, textAlign: 'center',
        maxWidth: 900, width: '100%',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 9999,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            marginBottom: 32, fontSize: '0.85rem', color: '#10b981',
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#10b981',
            boxShadow: '0 0 12px rgba(16,185,129,0.6)',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }} />
          Available for work
        </motion.div>

        {/* Name with reveal */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem',
            color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '0.1em',
          }}
        >
          Hi, I'm <span style={{ color: '#c084fc', fontWeight: 600 }}>Evan Atharasya</span>
        </motion.p>

        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800,
          fontSize: 'clamp(2.2rem, 7vw, 5rem)', lineHeight: 1.05,
          marginBottom: 20, letterSpacing: '-0.03em',
        }}>
          <span style={{ display: 'block', overflow: 'hidden' }}>
            {"Crafting Digital".split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.025, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
              >{char}</motion.span>
            ))}
          </span>
          <span style={{ display: 'block', overflow: 'hidden' }}>
            {"Experiences".split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{
                  delay: 0.5 + 16 * 0.025 + i * 0.025,
                  duration: 0.5, ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #c084fc, #38bdf8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >{char}</motion.span>
            ))}
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
            color: 'var(--text-secondary)', marginBottom: 36,
            height: 28, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 4,
          }}
        >
          <span style={{ color: '#8b5cf6' }}>&gt;</span>
          <span>{displayText}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            style={{ color: '#8b5cf6', fontWeight: 700 }}
          >|</motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.8 }}
          style={{
            display: 'flex', gap: 14, justifyContent: 'center',
            flexWrap: 'wrap', padding: '0 16px',
          }}
        >
          <MagneticButton href="#projects" primary>
            View My Work <span>→</span>
          </MagneticButton>
          <MagneticButton href="#contact">
            Get In Touch
          </MagneticButton>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        style={{
          position: 'absolute', bottom: 30, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}
      >
        <span style={{
          fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-tertiary)', letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 18, height: 28, borderRadius: 9,
            border: '1.5px solid rgba(255,255,255,0.12)',
            display: 'flex', justifyContent: 'center', paddingTop: 5,
          }}
        >
          <motion.div
            animate={{ y: [0, 7, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 2.5, height: 7, borderRadius: 2, background: '#8b5cf6' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
