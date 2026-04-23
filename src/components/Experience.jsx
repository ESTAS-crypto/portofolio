import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const experiences = [
  {
    year: '2024 — Present', role: 'Senior Full-Stack Developer', company: 'Tech Innovators Inc.',
    description: 'Leading development of AI-powered SaaS products. Building scalable architectures serving 100K+ users with 99.9% uptime.',
    tech: ['React', 'Node.js', 'AWS', 'Python'],
    color: '#8b5cf6', icon: '🚀',
    highlights: ['Led team of 5 engineers', 'Reduced load time by 60%', 'Architected microservices'],
  },
  {
    year: '2023 — 2024', role: 'Frontend Developer', company: 'Digital Agency Co.',
    description: 'Crafted award-winning web experiences for Fortune 500 clients. Implemented complex animations and micro-interactions.',
    tech: ['Next.js', 'Framer Motion', 'TypeScript'],
    color: '#06b6d4', icon: '✨',
    highlights: ['10+ client projects delivered', 'Awwwards Honorable Mention', '45% engagement increase'],
  },
  {
    year: '2022 — 2023', role: 'UI/UX Designer & Developer', company: 'StartupHub',
    description: 'Designed and developed user interfaces for 10+ startup products. Bridged design and engineering.',
    tech: ['Figma', 'React', 'Tailwind CSS'],
    color: '#ec4899', icon: '🎨',
    highlights: ['Designed 10+ products', 'Created design system', 'User research & testing'],
  },
  {
    year: '2021 — 2022', role: 'Junior Developer', company: 'WebCraft Studios',
    description: 'Built responsive websites and web applications. Learned modern frameworks and best practices in agile teams.',
    tech: ['HTML/CSS', 'JavaScript', 'Vue.js'],
    color: '#10b981', icon: '🌱',
    highlights: ['20+ websites built', 'Learned agile workflow', 'First open source PR'],
  },
];

function TimelineCard({ exp, index, activeIndex, setActiveIndex }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const isActive = activeIndex === index;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', gap: 0, position: 'relative' }}
    >
      {/* ─── Timeline spine ─── */}
      <div style={{
        position: 'relative', width: 36, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Vertical beam */}
        <motion.div
          initial={{ height: 0 }}
          animate={inView ? { height: '100%' } : {}}
          transition={{ delay: index * 0.12 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute', top: 0, width: 2,
            background: `linear-gradient(to bottom, ${exp.color}44, ${index < experiences.length - 1 ? 'rgba(255,255,255,0.04)' : 'transparent'})`,
          }}
        />

        {/* Dot node */}
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.12 + 0.3, type: 'spring', stiffness: 400, damping: 15 }}
          onClick={() => setActiveIndex(isActive ? null : index)}
          style={{
            position: 'relative', zIndex: 2, marginTop: 24,
            width: isActive || hovered ? 18 : 14,
            height: isActive || hovered ? 18 : 14,
            borderRadius: '50%',
            background: isActive ? exp.color : 'var(--bg-primary)',
            border: `2.5px solid ${exp.color}`,
            boxShadow: isActive || hovered ? `0 0 20px ${exp.color}55, 0 0 40px ${exp.color}22` : 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>

      {/* ─── Card ─── */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setActiveIndex(isActive ? null : index)}
        style={{
          flex: 1, marginBottom: 16, position: 'relative',
          borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
          background: isActive || hovered ? 'rgba(12,11,20,0.95)' : 'rgba(12,11,20,0.6)',
          border: `1px solid ${isActive ? exp.color + '33' : hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: isActive ? `0 10px 40px ${exp.color}10` : 'none',
          transform: hovered && !isActive ? 'translateX(4px)' : 'translateX(0)',
        }}
      >
        {/* Top color bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive || hovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: 2, transformOrigin: 'left',
            background: `linear-gradient(90deg, ${exp.color}, transparent)`,
          }}
        />

        {/* Main content */}
        <div style={{ padding: '16px 16px' }}>
          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: 12, marginBottom: 10, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
              }}>
                <span style={{ fontSize: '1.2rem' }}>{exp.icon}</span>
                <h3 style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                  fontWeight: 700, color: '#f0f0f5',
                }}>{exp.role}</h3>
              </div>
              <div style={{
                fontSize: '0.82rem', color: exp.color, fontWeight: 500,
              }}>{exp.company}</div>
            </div>
            <div style={{
              padding: '4px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
              color: 'var(--text-tertiary)', whiteSpace: 'nowrap',
            }}>{exp.year}</div>
          </div>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6,
            marginBottom: 14,
          }}>{exp.description}</p>

          {/* Tech tags */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: isActive ? 16 : 0,
          }}>
            {exp.tech.map(t => (
              <span key={t} style={{
                padding: '3px 10px', borderRadius: 6, fontSize: '0.65rem',
                fontFamily: 'JetBrains Mono, monospace',
                background: `${exp.color}08`, color: `${exp.color}cc`,
                border: `1px solid ${exp.color}18`,
              }}>{t}</span>
            ))}
          </div>

          {/* Expandable highlights */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                    color: 'var(--text-tertiary)', marginBottom: 8,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>Key Highlights</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {exp.highlights.map((h, i) => (
                      <motion.div
                        key={h}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: '0.78rem', color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: exp.color, flexShrink: 0,
                          boxShadow: `0 0 6px ${exp.color}44`,
                        }} />
                        {h}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Expand indicator */}
        <div style={{
          position: 'absolute', bottom: 8, right: 14,
          fontSize: '0.6rem', color: 'var(--text-tertiary)',
          fontFamily: 'JetBrains Mono, monospace',
          opacity: hovered && !isActive ? 0.6 : 0,
          transition: 'opacity 0.3s',
        }}>click to expand ↓</div>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <section id="experience" style={{ position: 'relative', padding: '100px 20px' }}>
      {/* Background */}
      <div style={{
        position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)',
        width: 300, height: 500, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.03) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <div ref={ref} style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 50 }}
        >
          <div className="section-label">◷ Experience</div>
          <h2 className="section-title">
            My <span className="text-gradient">Journey</span>
          </h2>
          <p className="section-description" style={{ margin: '0 auto' }}>
            A timeline of growth — click any card to reveal highlights.
          </p>
        </motion.div>

        <div>
          {experiences.map((exp, i) => (
            <TimelineCard
              key={i} exp={exp} index={i}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
