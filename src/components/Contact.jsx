import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

/* ── Social SVG Icons ── */
function GitHubIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

const socials = [
  {
    name: 'GitHub', url: 'https://github.com/ESTAS-crypto',
    Icon: GitHubIcon, color: '#f0f0f5', hoverBg: 'rgba(240,240,245,0.08)',
    label: '@ESTAS-crypto',
  },
  {
    name: 'Instagram', url: 'https://instagram.com/evan_atharasya',
    Icon: InstagramIcon, color: '#e1306c', hoverBg: 'rgba(225,48,108,0.08)',
    label: '@evan_atharasya',
  },
  {
    name: 'LinkedIn', url: 'https://linkedin.com/in/evan-atharasya',
    Icon: LinkedInIcon, color: '#0a66c2', hoverBg: 'rgba(10,102,194,0.08)',
    label: 'Evan Atharasya',
  },
];

function AnimatedInput({ label, type = 'text', isTextarea = false, delay = 0 }) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const Tag = isTextarea ? 'textarea' : 'input';
  const active = focused || value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      style={{ position: 'relative' }}
    >
      <label style={{
        position: 'absolute', left: 16, top: active ? 8 : 18,
        fontSize: active ? '0.65rem' : '0.88rem',
        color: focused ? '#8b5cf6' : 'var(--text-tertiary)',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: active ? '0.1em' : '0',
        textTransform: active ? 'uppercase' : 'none',
      }}>{label}</label>
      <Tag
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', paddingTop: 24, paddingBottom: 12,
          paddingLeft: 16, paddingRight: 16,
          borderRadius: 14, fontSize: '0.95rem',
          background: focused ? 'rgba(139,92,246,0.04)' : 'var(--bg-card)',
          border: `1.5px solid ${focused ? 'rgba(139,92,246,0.4)' : 'var(--glass-border)'}`,
          color: 'var(--text-primary)', resize: isTextarea ? 'vertical' : 'none',
          minHeight: isTextarea ? 130 : 'auto',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: focused ? '0 0 30px rgba(139,92,246,0.08), inset 0 0 0 1px rgba(139,92,246,0.1)' : 'none',
        }}
      />
    </motion.div>
  );
}

/* ── Social Card with hover effect ── */
function SocialCard({ social, delay, isMobile }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: isMobile ? '14px 16px' : '16px 20px',
        borderRadius: 16,
        background: hovered ? social.hoverBg : 'var(--bg-card)',
        border: `1px solid ${hovered ? social.color + '33' : 'var(--glass-border)'}`,
        color: hovered ? social.color : 'var(--text-secondary)',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        flex: 1, minWidth: 0,
        boxShadow: hovered ? `0 8px 30px ${social.color}15` : 'none',
        textDecoration: 'none',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: hovered ? social.color + '15' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? social.color + '30' : 'rgba(255,255,255,0.06)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.35s',
        flexShrink: 0,
      }}>
        <social.Icon size={20} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
          fontSize: '0.88rem', color: hovered ? '#f0f0f5' : 'var(--text-primary)',
          transition: 'color 0.3s',
        }}>{social.name}</div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
          color: 'var(--text-tertiary)', marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{social.label}</div>
      </div>
      <motion.span
        animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.3 }}
        transition={{ duration: 0.25 }}
        style={{
          marginLeft: 'auto', fontSize: '0.9rem', color: social.color,
          flexShrink: 0,
        }}
      >→</motion.span>
    </motion.a>
  );
}

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isMobile = useIsMobile();

  return (
    <section id="contact" style={{
      position: 'relative', padding: isMobile ? '60px 16px 100px' : '100px 20px', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(139,92,246,0.05) 0%, transparent 60%)',
      }} />

      <div ref={ref} style={{
        maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div className="section-label">✉ Contact</div>
          <h2 className="section-title">
            Let's <span className="text-gradient">Connect</span>
          </h2>
          <p className="section-description" style={{ margin: '0 auto' }}>
            Have a project in mind? I'd love to hear from you.
          </p>
        </motion.div>

        <form onSubmit={e => e.preventDefault()} style={{
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 18,
          }}>
            <AnimatedInput label="Your Name" delay={0.1} />
            <AnimatedInput label="Your Email" type="email" delay={0.15} />
          </div>
          <AnimatedInput label="Your Message" isTextarea delay={0.2} />

          <motion.button
            type="submit"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: isMobile ? '14px 30px' : '16px 40px', borderRadius: 9999, fontWeight: 600,
              fontSize: isMobile ? '0.88rem' : '0.95rem', alignSelf: 'center', position: 'relative',
              overflow: 'hidden', width: isMobile ? '100%' : 'auto',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#fff',
              boxShadow: '0 0 30px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
              marginTop: 8,
            }}
          >
            <motion.div
              animate={{ x: ['-100%', '250%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: 0, left: 0, width: '35%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                pointerEvents: 'none',
              }}
            />
            <span style={{ position: 'relative', zIndex: 1 }}>Send Message →</span>
          </motion.button>
        </form>

        {/* ── Social Cards ── */}
        <div style={{ marginTop: 48 }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              textAlign: 'center', marginBottom: 20,
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
              color: 'var(--text-tertiary)', textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Or find me on
          </motion.div>

          <div style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            gap: 12,
          }}>
            {socials.map((social, i) => (
              <SocialCard key={social.name} social={social} delay={0.3 + i * 0.1} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
