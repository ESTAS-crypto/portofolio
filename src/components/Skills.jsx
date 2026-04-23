import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const techStack = [
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'JavaScript', color: '#f7df1e' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Python', color: '#3776ab' },
  { name: 'Tailwind', color: '#38bdf8' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'MongoDB', color: '#47a248' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'AWS', color: '#ff9900' },
  { name: 'Figma', color: '#f24e1e' },
  { name: 'GraphQL', color: '#e10098' },
  { name: 'Redis', color: '#dc382d' },
  { name: 'Git', color: '#f05032' },
  { name: 'Firebase', color: '#ffca28' },
];

function MarqueeRow({ items, direction = 'left', speed = 30 }) {
  const doubled = [...items, ...items];
  return (
    <div style={{
      overflow: 'hidden', width: '100%', position: 'relative',
      maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
    }}>
      <motion.div
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', gap: 16, width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <div key={`${item.name}-${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 24px', borderRadius: 9999,
            background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
            whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = `${item.color}44`;
            e.currentTarget.style.boxShadow = `0 0 20px ${item.color}15`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: item.color, boxShadow: `0 0 8px ${item.color}66`,
            }} />
            <span style={{
              fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)',
            }}>{item.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const row1 = techStack.slice(0, 8);
  const row2 = techStack.slice(8);

  return (
    <section id="skills" style={{ position: 'relative', padding: '120px 0', overflow: 'hidden' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <div className="section-label">⬡ Tech Stack</div>
          <h2 className="section-title">
            Tools I <span className="text-gradient">Master</span>
          </h2>
          <p className="section-description" style={{ margin: '0 auto' }}>
            Technologies and frameworks I use to bring ideas to life.
          </p>
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MarqueeRow items={row1} direction="left" speed={35} />
        <MarqueeRow items={row2} direction="right" speed={40} />
      </div>
    </section>
  );
}
