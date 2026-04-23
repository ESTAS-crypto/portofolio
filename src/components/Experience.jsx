import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const experiences = [
  {
    year: '2024 - Present', role: 'Senior Full-Stack Developer', company: 'Tech Innovators Inc.',
    description: 'Leading development of AI-powered SaaS products. Building scalable architectures serving 100K+ users with 99.9% uptime.',
    tech: ['React', 'Node.js', 'AWS', 'Python'], color: '#8b5cf6',
  },
  {
    year: '2023 - 2024', role: 'Frontend Developer', company: 'Digital Agency Co.',
    description: 'Crafted award-winning web experiences for Fortune 500 clients. Implemented complex animations and micro-interactions.',
    tech: ['Next.js', 'Framer Motion', 'TypeScript'], color: '#06b6d4',
  },
  {
    year: '2022 - 2023', role: 'UI/UX Designer & Developer', company: 'StartupHub',
    description: 'Designed and developed user interfaces for 10+ startup products. Increased user engagement by 45%.',
    tech: ['Figma', 'React', 'Tailwind CSS'], color: '#ec4899',
  },
  {
    year: '2021 - 2022', role: 'Junior Developer', company: 'WebCraft Studios',
    description: 'Built responsive websites and web applications. Learned modern frameworks and best practices in agile environment.',
    tech: ['HTML/CSS', 'JavaScript', 'Vue.js'], color: '#10b981',
  },
];

function TimelineCard({ exp, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex', gap: 20, alignItems: 'flex-start',
        position: 'relative', paddingLeft: 36, paddingBottom: 40,
      }}
    >
      {/* Line */}
      {index < experiences.length - 1 && (
        <div style={{
          position: 'absolute', left: 6, top: 20, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, ${exp.color}66, transparent)`,
        }} />
      )}

      {/* Dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.15 + 0.2, type: 'spring', stiffness: 300, damping: 15 }}
        style={{
          position: 'absolute', left: 0, top: 6,
          width: 14, height: 14, borderRadius: '50%',
          background: exp.color, border: '3px solid var(--bg-primary)',
          boxShadow: `0 0 15px ${exp.color}44`,
          flexShrink: 0, zIndex: 2,
        }}
      />

      {/* Card */}
      <div
        style={{
          flex: 1, padding: '20px 22px', borderRadius: 16,
          background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
          transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = `${exp.color}33`;
          e.currentTarget.style.boxShadow = `0 0 30px ${exp.color}10`;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
          color: exp.color, marginBottom: 6, letterSpacing: '0.05em',
        }}>{exp.year}</div>
        <h3 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
          fontWeight: 700, marginBottom: 3,
        }}>{exp.role}</h3>
        <div style={{
          color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 10,
        }}>{exp.company}</div>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 14,
        }}>{exp.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {exp.tech.map(t => (
            <span key={t} style={{
              padding: '3px 10px', borderRadius: 9999, fontSize: '0.68rem',
              fontFamily: 'JetBrains Mono, monospace',
              background: `${exp.color}10`, color: exp.color,
              border: `1px solid ${exp.color}20`,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: '-80px' });

  return (
    <section id="experience" ref={containerRef} style={{
      position: 'relative', padding: '100px 20px',
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <motion.div
          ref={headerRef}
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
            A timeline of my professional growth and milestones.
          </p>
        </motion.div>

        <div>
          {experiences.map((exp, i) => (
            <TimelineCard key={i} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
