import { useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

const projects = [
  {
    title: 'AI Dashboard', description: 'Real-time analytics platform with ML-powered predictive insights and dynamic visualizations.',
    tags: ['React', 'Python', 'TensorFlow'], color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #1a1035, #0d1b2a)', emoji: '🤖',
    link: '#',
  },
  {
    title: 'E-Commerce Platform', description: 'Full-stack marketplace with seamless payments, real-time inventory, and mobile-first UX.',
    tags: ['Next.js', 'Stripe', 'PostgreSQL'], color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0a192f, #0d2137)', emoji: '🛒',
    link: '#',
  },
  {
    title: 'Social Media App', description: 'Social platform with real-time chat, stories, and AI content moderation.',
    tags: ['React Native', 'Firebase', 'Socket.io'], color: '#ec4899',
    gradient: 'linear-gradient(135deg, #1a0a1e, #2d1230)', emoji: '💬',
    link: '#',
  },
  {
    title: 'Design System', description: '100+ accessible, animated components with thorough documentation and Storybook.',
    tags: ['TypeScript', 'Storybook', 'Figma'], color: '#10b981',
    gradient: 'linear-gradient(135deg, #0a1f15, #0d2a1a)', emoji: '🎨',
    link: '#',
  },
  {
    title: 'Crypto Tracker', description: 'Real-time crypto tracking with WebSocket feeds, portfolio analytics, and alerts.',
    tags: ['Vue.js', 'WebSocket', 'Chart.js'], color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #1a1508, #2a2010)', emoji: '📈',
    link: '#',
  },
  {
    title: 'Task Management', description: 'Collaborative PM tool with drag-and-drop boards, timelines, and team chat.',
    tags: ['React', 'GraphQL', 'MongoDB'], color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #0a1528, #0d1f3a)', emoji: '✅',
    link: '#',
  },
];

function ProjectCard({ project, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  const glowX = useTransform(mx, [0, 1], [0, 100]);
  const glowY = useTransform(my, [0, 1], [0, 100]);

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const reset = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { reset(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        <div style={{
          position: 'relative', padding: '28px 24px', borderRadius: 20,
          background: project.gradient, overflow: 'hidden',
          border: `1px solid ${hovered ? project.color + '44' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: hovered ? `0 20px 60px ${project.color}15` : 'none',
          transition: 'border-color 0.4s, box-shadow 0.4s',
        }}>
          {/* Spotlight glow that follows cursor */}
          <motion.div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            opacity: hovered ? 0.15 : 0,
            transition: 'opacity 0.3s',
            background: useTransform(
              [glowX, glowY],
              ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, ${project.color}, transparent 60%)`
            ),
          }} />

          {/* Top row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16,
          }}>
            <div style={{
              fontSize: '2.2rem', transform: 'translateZ(30px)',
              filter: hovered ? `drop-shadow(0 0 8px ${project.color}66)` : 'none',
              transition: 'filter 0.3s',
            }}>{project.emoji}</div>
            <motion.a
              href={project.link}
              whileHover={{ scale: 1.1, rotate: 45 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `${project.color}15`, border: `1px solid ${project.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: project.color, fontSize: '0.9rem',
                transform: 'translateZ(20px)',
              }}
            >↗</motion.a>
          </div>

          <h3 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.25rem',
            fontWeight: 700, marginBottom: 8, transform: 'translateZ(25px)',
          }}>{project.title}</h3>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6,
            marginBottom: 18, transform: 'translateZ(15px)',
          }}>{project.description}</p>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            transform: 'translateZ(10px)',
          }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                padding: '4px 12px', borderRadius: 9999, fontSize: '0.72rem',
                fontFamily: 'JetBrains Mono, monospace',
                background: `${project.color}10`, color: project.color,
                border: `1px solid ${project.color}20`,
              }}>{tag}</span>
            ))}
          </div>

          {/* Bottom highlight line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2,
              background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
              transformOrigin: 'center',
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="projects" style={{
      position: 'relative', padding: '100px 20px',
    }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 50 }}
        >
          <div className="section-label">◫ Projects</div>
          <h2 className="section-title">
            Featured <span className="text-gradient">Work</span>
          </h2>
          <p className="section-description" style={{ margin: '0 auto' }}>
            A selection of projects showcasing my passion for building exceptional digital products.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))',
          gap: 20,
        }}>
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
