import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

const stats = [
  { value: 3, suffix: '+', label: 'Years Experience', color: '#8b5cf6' },
  { value: 50, suffix: '+', label: 'Projects Completed', color: '#06b6d4' },
  { value: 30, suffix: '+', label: 'Happy Clients', color: '#ec4899' },
  { value: 99, suffix: '%', label: 'Satisfaction', color: '#10b981' },
];

const skills = [
  { icon: '⚛️', name: 'React', color: '#61dafb', level: 95 },
  { icon: '▲', name: 'Next.js', color: '#ffffff', level: 90 },
  { icon: '🔷', name: 'TypeScript', color: '#3178c6', level: 88 },
  { icon: '🟢', name: 'Node.js', color: '#68a063', level: 85 },
  { icon: '🎨', name: 'Figma', color: '#f24e1e', level: 80 },
  { icon: '🐘', name: 'PostgreSQL', color: '#336791', level: 82 },
];

function Counter({ value, suffix, inView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);
  return <>{count}{suffix}</>;
}

function SkillCard({ skill, index, inView }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', padding: '24px 20px',
        background: hovered ? 'rgba(255,255,255,0.05)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? skill.color + '44' : 'var(--glass-border)'}`,
        borderRadius: 16, cursor: 'default', overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: hovered ? `0 0 40px ${skill.color}15` : 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Spotlight effect on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
          background: `radial-gradient(circle at 50% 0%, ${skill.color}08 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ fontSize: '2rem', marginBottom: 10, position: 'relative' }}>{skill.icon}</div>
      <div style={{
        fontSize: '0.9rem', fontWeight: 600, color: hovered ? skill.color : '#f0f0f5',
        transition: 'color 0.3s', marginBottom: 12, position: 'relative',
      }}>{skill.name}</div>
      {/* Skill bar */}
      <div style={{
        width: '100%', height: 3, borderRadius: 2,
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
        position: 'relative',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{ delay: 0.5 + index * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%', borderRadius: 2,
            background: `linear-gradient(90deg, ${skill.color}88, ${skill.color})`,
            boxShadow: `0 0 8px ${skill.color}44`,
          }}
        />
      </div>
    </motion.div>
  );
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" style={{
      position: 'relative', padding: '100px 20px', overflow: 'hidden',
    }}>
      {/* Lamp Effect */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 600, height: 250, pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 2, height: 60,
          background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.5))',
        }} />
        <div style={{
          position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
          width: 350, height: 180,
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(139,92,246,0.1) 50%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
        <div style={{
          position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
          width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6',
          boxShadow: '0 0 30px 10px rgba(139,92,246,0.4)',
        }} />
      </div>

      <div ref={ref} style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 50, paddingTop: 70 }}
        >
          <div className="section-label">✦ About Me</div>
          <h2 className="section-title">
            Passionate About <span className="text-gradient">Building</span>
          </h2>
          <p className="section-description" style={{ margin: '0 auto' }}>
            I'm a creative developer who blends design aesthetics with technical expertise.
            I build modern web experiences that are fast, accessible, and visually stunning.
          </p>
        </motion.div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 16, marginBottom: 50, padding: '28px 20px',
          background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
          borderRadius: 20,
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              style={{ textAlign: 'center', padding: '8px 0' }}
            >
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800,
                color: s.color,
              }}>
                <Counter value={s.value} suffix={s.suffix} inView={inView} />
              </div>
              <div style={{
                color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4,
              }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Skills Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 14,
        }}>
          {skills.map((skill, i) => (
            <SkillCard key={skill.name} skill={skill} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
