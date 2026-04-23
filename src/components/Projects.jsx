import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

const GITHUB_USERNAME = 'ESTAS-crypto';

// Color & emoji mapping based on language
const langMeta = {
  JavaScript: { color: '#f7df1e', emoji: '⚡' },
  TypeScript: { color: '#3178c6', emoji: '🔷' },
  Python: { color: '#3572A5', emoji: '🐍' },
  HTML: { color: '#e34c26', emoji: '🌐' },
  CSS: { color: '#563d7c', emoji: '🎨' },
  PHP: { color: '#777BB4', emoji: '🐘' },
  Java: { color: '#b07219', emoji: '☕' },
  default: { color: '#8b5cf6', emoji: '📦' },
};

const gradients = [
  'linear-gradient(135deg, #1a1035, #0d1b2a)',
  'linear-gradient(135deg, #0a192f, #0d2137)',
  'linear-gradient(135deg, #1a0a1e, #2d1230)',
  'linear-gradient(135deg, #0a1f15, #0d2a1a)',
  'linear-gradient(135deg, #1a1508, #2a2010)',
  'linear-gradient(135deg, #0a1528, #0d1f3a)',
];

function ProjectCard({ repo, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [hovered, setHovered] = useState(false);

  const meta = langMeta[repo.language] || langMeta.default;
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const reset = () => { mx.set(0.5); my.set(0.5); };

  // Pretty name from repo name
  const prettyName = repo.name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { reset(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        <div style={{
          position: 'relative', padding: '28px 24px', borderRadius: 20,
          background: gradients[index % gradients.length], overflow: 'hidden',
          border: `1px solid ${hovered ? meta.color + '44' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: hovered ? `0 20px 60px ${meta.color}15` : 'none',
          transition: 'border-color 0.4s, box-shadow 0.4s',
          minHeight: 200,
        }}>
          {/* Top row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 14,
          }}>
            <div style={{
              fontSize: '2rem',
              filter: hovered ? `drop-shadow(0 0 8px ${meta.color}66)` : 'none',
              transition: 'filter 0.3s',
            }}>{meta.emoji}</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {repo.homepage && (
                <motion.a
                  href={repo.homepage}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `${meta.color}15`, border: `1px solid ${meta.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: meta.color, fontSize: '0.75rem',
                  }}
                  title="Live Demo"
                >🔗</motion.a>
              )}
              <motion.a
                href={repo.html_url}
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 45 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `${meta.color}15`, border: `1px solid ${meta.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: meta.color, fontSize: '0.8rem',
                }}
                title="View on GitHub"
              >↗</motion.a>
            </div>
          </div>

          <h3 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.15rem',
            fontWeight: 700, marginBottom: 6,
          }}>{prettyName}</h3>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6,
            marginBottom: 16, minHeight: 40,
          }}>{repo.description || 'No description yet.'}</p>

          {/* Meta tags */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          }}>
            {repo.language && (
              <span style={{
                padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem',
                fontFamily: 'JetBrains Mono, monospace',
                background: `${meta.color}15`, color: meta.color,
                border: `1px solid ${meta.color}25`,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: meta.color,
                }} />
                {repo.language}
              </span>
            )}
            {repo.stargazers_count > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem',
                fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>⭐ {repo.stargazers_count}</span>
            )}
            {repo.forks_count > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem',
                fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>🔱 {repo.forks_count}</span>
            )}
          </div>

          {/* Bottom highlight */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2,
              background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
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
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRepos, setTotalRepos] = useState(0);

  useEffect(() => {
    async function fetchRepos() {
      try {
        // Fetch profile for total count
        const profileRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        const profile = await profileRes.json();
        setTotalRepos(profile.public_repos || 0);

        // Fetch repos sorted by most recently pushed
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=6&direction=desc`
        );
        const data = await res.json();
        // Filter out the portfolio repo itself and empty repos
        const filtered = data
          .filter(r => r.name !== 'portofolio' && r.name !== `${GITHUB_USERNAME}`)
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
            Fetched live from my GitHub — {totalRepos} public repositories and counting.
          </p>
        </motion.div>

        {loading ? (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: 200, gap: 12,
          }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                style={{
                  width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6',
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))',
            gap: 20,
          }}>
            {repos.map((repo, i) => (
              <ProjectCard key={repo.id} repo={repo} index={i} />
            ))}
          </div>
        )}

        {/* View all on GitHub */}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 9999,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0f5', fontWeight: 500, fontSize: '0.9rem',
            }}
          >
            View all {totalRepos} repos on GitHub
            <span style={{ fontSize: '1.1rem' }}>→</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
