import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

const GITHUB_USERNAME = 'ESTAS-crypto';

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

/* ─── Bento Card with spotlight ─── */
function BentoCard({ children, span = 1, delay = 0, inView, color = '#8b5cf6' }) {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const [hovered, setHovered] = useState(false);

  const handleMouse = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: span > 1 ? undefined : undefined,
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        background: 'rgba(12,11,20,0.9)',
        border: `1px solid ${hovered ? color + '33' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.4s, box-shadow 0.4s, transform 0.3s',
        boxShadow: hovered ? `0 10px 40px ${color}10` : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Spotlight overlay */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s',
          background: `radial-gradient(500px circle at ${mouseX.get() * 100}% ${mouseY.get() * 100}%, ${color}08, transparent 50%)`,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Animated Counter ─── */
function Counter({ value, suffix = '', inView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);
  return <>{count}{suffix}</>;
}

/* ─── Circular Skill Ring ─── */
function SkillRing({ name, level, color, icon, delay, inView }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        cursor: 'default',
      }}
    >
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle cx="40" cy="40" r={radius} fill="none"
            stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
          {/* Progress ring */}
          <motion.circle
            cx="40" cy="40" r={radius} fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={inView ? {
              strokeDashoffset: circumference - (circumference * level) / 100,
            } : {}}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              filter: hovered ? `drop-shadow(0 0 6px ${color}66)` : 'none',
              transition: 'filter 0.3s',
            }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: hovered ? '0.85rem' : '1.4rem',
          transition: 'font-size 0.3s',
          fontWeight: 700, color: hovered ? color : '#f0f0f5',
        }}>
          {hovered ? `${level}%` : icon}
        </div>
      </div>
      <span style={{
        fontSize: '0.72rem', fontWeight: 600,
        color: hovered ? color : 'var(--text-secondary)',
        transition: 'color 0.3s', fontFamily: 'JetBrains Mono, monospace',
      }}>{name}</span>
    </motion.div>
  );
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [ghStats, setGhStats] = useState({ repos: 0, followers: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
      .then(r => r.json())
      .then(d => setGhStats({ repos: d.public_repos || 0, followers: d.followers || 0 }))
      .catch(() => {});
  }, []);

  const skills = [
    { name: 'React', level: 92, color: '#61dafb', icon: '⚛️' },
    { name: 'JavaScript', level: 95, color: '#f7df1e', icon: '⚡' },
    { name: 'Python', level: 82, color: '#3572A5', icon: '🐍' },
    { name: 'Node.js', level: 85, color: '#68a063', icon: '🟢' },
    { name: 'TypeScript', level: 78, color: '#3178c6', icon: '🔷' },
    { name: 'Figma', level: 75, color: '#f24e1e', icon: '🎨' },
  ];

  const stats = [
    { value: ghStats.repos, suffix: '', label: 'GitHub Repos', color: '#8b5cf6', icon: '📦' },
    { value: ghStats.followers, suffix: '', label: 'Followers', color: '#06b6d4', icon: '👥' },
    { value: 2, suffix: '+', label: 'Years Coding', color: '#10b981', icon: '⏳' },
    { value: 99, suffix: '%', label: 'Passion', color: '#ec4899', icon: '🔥' },
  ];

  return (
    <section id="about" style={{ position: 'relative', padding: '100px 20px', overflow: 'hidden' }}>
      {/* Background lamp */}
      <div style={{
        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 200, pointerEvents: 'none',
        background: 'conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(139,92,246,0.06) 50%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <div ref={ref} style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div className="section-label">✦ About Me</div>
          <h2 className="section-title">
            Passionate About <span className="text-gradient">Building</span>
          </h2>
        </motion.div>

        {/* ─── Bento Grid ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 16,
        }}>
          {/* Card 1: Bio */}
          <BentoCard span={1} delay={0.1} inView={inView} color="#8b5cf6">
            <div style={{ padding: '24px 22px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', fontWeight: 800, color: '#fff',
                  boxShadow: '0 0 25px rgba(139,92,246,0.3)',
                }}>EA</div>
                <div>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                    fontSize: '1rem',
                  }}>Evan Atharasya</div>
                  <div style={{
                    fontSize: '0.72rem', color: '#10b981',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#10b981',
                      boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                    }} />
                    Available for work
                  </div>
                </div>
              </div>
              <p style={{
                color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6,
              }}>
                I'm a creative developer who blends design with code.
                Building modern web experiences that are fast, accessible, and visually stunning.
              </p>
              {/* Terminal decoration */}
              <div style={{
                marginTop: 16, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
              }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <span style={{ color: '#8b5cf6' }}>~</span> <span style={{ color: '#10b981' }}>evan</span>
                <span style={{ color: 'var(--text-tertiary)' }}> $ </span>
                <span style={{ color: '#f0f0f5' }}>passion</span>
                <span style={{ color: '#f59e0b' }}> --level</span>
                <span style={{ color: '#10b981' }}> maximum</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ color: '#8b5cf6' }}
                > █</motion.span>
              </div>
            </div>
          </BentoCard>

          {/* Card 2: Stats */}
          <BentoCard span={1} delay={0.2} inView={inView} color="#06b6d4">
            <div style={{ padding: '24px 22px' }}>
              <div style={{
                fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--text-tertiary)', marginBottom: 16,
                textTransform: 'uppercase', letterSpacing: '0.15em',
              }}>📊 Stats (Live from GitHub)</div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              }}>
                {stats.map((s, i) => (
                  <div key={s.label} style={{
                    padding: '14px 12px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s.icon}</div>
                    <div style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '1.4rem', fontWeight: 800, color: s.color,
                    }}>
                      <Counter value={s.value} suffix={s.suffix} inView={inView} />
                    </div>
                    <div style={{
                      fontSize: '0.62rem', color: 'var(--text-tertiary)',
                      marginTop: 2,
                    }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Card 3: Skills Rings — full width */}
          {/* Card 3: Skills Rings — full width on desktop */}
          <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
          <BentoCard span={1} delay={0.3} inView={inView} color="#ec4899">
            {/* Always full width via wrapper div */}
            <div style={{ padding: '24px 22px' }}>
              <div style={{
                fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--text-tertiary)', marginBottom: 20,
                textTransform: 'uppercase', letterSpacing: '0.15em',
              }}>🎯 Tech Stack</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
                gap: isMobile ? 12 : 20,
                justifyItems: 'center',
              }}>
                {skills.map((s, i) => (
                  <SkillRing key={s.name} {...s} delay={0.4 + i * 0.08} inView={inView} />
                ))}
              </div>
            </div>
          </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
}
