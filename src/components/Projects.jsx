import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const GITHUB_USERNAME = 'ESTAS-crypto';

const langMeta = {
  JavaScript: { color: '#f7df1e', icon: '⚡' },
  TypeScript: { color: '#3178c6', icon: '🔷' },
  Python: { color: '#3572A5', icon: '🐍' },
  HTML: { color: '#e34c26', icon: '🌐' },
  CSS: { color: '#563d7c', icon: '🎨' },
  PHP: { color: '#777BB4', icon: '🐘' },
  Java: { color: '#b07219', icon: '☕' },
  default: { color: '#8b5cf6', icon: '📦' },
};

/* ─── Animated gradient border component ─── */
function AnimatedBorder({ active, color }) {
  return (
    <div style={{
      position: 'absolute', inset: -1, borderRadius: 21, zIndex: 0,
      opacity: active ? 1 : 0, transition: 'opacity 0.5s',
      background: `conic-gradient(from var(--angle, 0deg), transparent 40%, ${color}66 50%, transparent 60%)`,
      animation: active ? 'borderRotate 3s linear infinite' : 'none',
    }} />
  );
}

/* ─── Project Card ─── */
function ProjectCard({ repo, index, hoveredIndex, setHoveredIndex, totalCards }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const meta = langMeta[repo.language] || langMeta.default;
  const isHovered = hoveredIndex === index;
  const isBlurred = hoveredIndex !== null && hoveredIndex !== index;

  const prettyName = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Time ago
  const pushed = new Date(repo.pushed_at);
  const daysAgo = Math.floor((Date.now() - pushed) / 86400000);
  const timeAgo = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{
        position: 'relative',
        filter: isBlurred ? 'blur(3px) brightness(0.5)' : 'blur(0px) brightness(1)',
        transform: isHovered ? 'scale(1.02)' : isBlurred ? 'scale(0.97)' : 'scale(1)',
        transition: 'filter 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        zIndex: isHovered ? 10 : 1,
      }}
    >
      {/* Animated gradient border */}
      <AnimatedBorder active={isHovered} color={meta.color} />

      {/* Card body */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: 0, borderRadius: 20, overflow: 'hidden',
        background: 'rgba(12,11,20,0.95)',
        border: `1px solid ${isHovered ? meta.color + '33' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.4s',
      }}>
        {/* Top visual / Preview area */}
        <div style={{
          position: 'relative', height: 160, overflow: 'hidden',
          background: `linear-gradient(135deg, ${meta.color}08 0%, ${meta.color}03 50%, rgba(6,5,11,0.8) 100%)`,
          borderBottom: `1px solid ${isHovered ? meta.color + '22' : 'rgba(255,255,255,0.04)'}`,
          transition: 'border-color 0.4s',
        }}>
          {/* Grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(${meta.color}08 1px, transparent 1px), linear-gradient(90deg, ${meta.color}08 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: isHovered ? 0.6 : 0.2,
            transition: 'opacity 0.4s',
          }} />

          {/* Floating code-like decoration */}
          <div style={{
            position: 'absolute', inset: 16,
            display: 'flex', flexDirection: 'column', gap: 6,
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
            color: meta.color, opacity: isHovered ? 0.5 : 0.15,
            transition: 'opacity 0.4s',
          }}>
            <span>{'const'} <span style={{ color: '#f0f0f5' }}>{repo.name}</span> = {'{'}</span>
            <span style={{ paddingLeft: 16 }}>language: <span style={{ color: '#10b981' }}>"{repo.language || 'unknown'}"</span>,</span>
            <span style={{ paddingLeft: 16 }}>stars: <span style={{ color: '#f59e0b' }}>{repo.stargazers_count}</span>,</span>
            <span style={{ paddingLeft: 16 }}>forks: <span style={{ color: '#06b6d4' }}>{repo.forks_count}</span>,</span>
            <span>{'}'}</span>
          </div>

          {/* Glow orb */}
          <motion.div
            animate={isHovered ? { scale: 1.3, opacity: 0.4 } : { scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute', bottom: -40, right: -20,
              width: 140, height: 140, borderRadius: '50%',
              background: `radial-gradient(circle, ${meta.color} 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
          />

          {/* Language badge top-right */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: meta.color,
              boxShadow: `0 0 8px ${meta.color}66`,
            }} />
            <span style={{ color: meta.color }}>{repo.language || '—'}</span>
          </div>

          {/* Big emoji */}
          <div style={{
            position: 'absolute', bottom: 12, left: 16,
            fontSize: '2rem',
            filter: isHovered ? `drop-shadow(0 0 12px ${meta.color}66)` : 'none',
            transition: 'filter 0.4s, transform 0.4s',
            transform: isHovered ? 'translateY(-4px) scale(1.1)' : 'translateY(0) scale(1)',
          }}>{meta.icon}</div>
        </div>

        {/* Content area */}
        <div style={{ padding: '18px 20px 20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 8,
          }}>
            <h3 style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem',
              fontWeight: 700, color: '#f0f0f5',
            }}>{prettyName}</h3>
            <span style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--text-tertiary)',
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(255,255,255,0.03)',
            }}>📌 {timeAgo}</span>
          </div>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55,
            marginBottom: 16, minHeight: 36,
          }}>{repo.description || 'No description available.'}</p>

          {/* Bottom row: stats + actions */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {repo.stargazers_count > 0 && (
                <span style={{
                  fontSize: '0.7rem', color: 'var(--text-tertiary)',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>⭐ {repo.stargazers_count}</span>
              )}
              {repo.forks_count > 0 && (
                <span style={{
                  fontSize: '0.7rem', color: 'var(--text-tertiary)',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>🔱 {repo.forks_count}</span>
              )}
              <span style={{
                fontSize: '0.7rem', color: 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>📁 {(repo.size / 1024).toFixed(1)}MB</span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {repo.homepage && (
                <motion.a
                  href={repo.homepage}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: `${meta.color}15`,
                    border: `1px solid ${meta.color}25`,
                    fontSize: '0.7rem', fontWeight: 600, color: meta.color,
                    fontFamily: 'JetBrains Mono, monospace',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <span>◉</span> Live
                </motion.a>
              )}
              <motion.a
                href={repo.html_url}
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.7rem', fontWeight: 600, color: '#8b8b9e',
                  fontFamily: 'JetBrains Mono, monospace',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <span>↗</span> Code
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRepos, setTotalRepos] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const profileRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        const profile = await profileRes.json();
        setTotalRepos(profile.public_repos || 0);

        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=8&direction=desc`
        );
        const data = await res.json();
        const filtered = data
          .filter(r => r.name !== 'portofolio' && r.name !== GITHUB_USERNAME && r.size > 0)
          .slice(0, 6);
        setRepos(filtered);
      } catch (err) {
        console.error('Failed to fetch repos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  return (
    <section id="projects" style={{ position: 'relative', padding: '100px 20px' }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.04) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
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
            Fetched live from GitHub — {totalRepos} repositories and counting.
            <br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Hover to focus • Click to explore
            </span>
          </p>
        </motion.div>

        {loading ? (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: 300, gap: 8,
          }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6',
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: 20,
          }}>
            {repos.map((repo, i) => (
              <ProjectCard
                key={repo.id} repo={repo} index={i}
                hoveredIndex={hoveredIndex}
                setHoveredIndex={setHoveredIndex}
                totalCards={repos.length}
              />
            ))}
          </div>
        )}

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginTop: 40 }}
        >
          <motion.a
            href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}
            target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.2)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 30px', borderRadius: 12,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.15)',
              color: '#c084fc', fontWeight: 600, fontSize: '0.88rem',
              transition: 'box-shadow 0.3s',
            }}
          >
            Explore all {totalRepos} repos
            <span>→</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
