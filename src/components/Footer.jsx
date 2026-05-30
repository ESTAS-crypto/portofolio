'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { PROFILE, SOCIAL_LINKS, NAV_ITEMS, GITHUB_USERNAME } from '../constants';
import { SOCIAL_ICON_MAP } from './Icons';

/* ─── Floating 3D Card with mouse tilt ─── */
function TiltCard({ children, style, className }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -12,
      y: (x - 0.5) * 12,
    });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.12 });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        ...style,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glare overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
        transition: 'opacity 0.2s',
        borderRadius: 'inherit',
      }} />
      {children}
    </div>
  );
}

/* ─── Animated grid background ─── */
function GridBackground() {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
    }}>
      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        mask: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, transparent 100%)',
        WebkitMask: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, transparent 100%)',
      }} />

      {/* Aurora glow */}
      <motion.div
        animate={{
          x: ['-20%', '20%', '-20%'],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: -100, left: '20%',
          width: 500, height: 300,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        animate={{
          x: ['20%', '-20%', '20%'],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: -80, right: '15%',
          width: 400, height: 250,
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const year = new Date().getFullYear();

  const socialLinks = SOCIAL_LINKS.map(s => ({
    ...s,
    Icon: SOCIAL_ICON_MAP[s.name],
  }));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer ref={ref} style={{
      position: 'relative',
      padding: '80px 24px 40px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <GridBackground />

      {/* Gradient top border */}
      <div style={{
        position: 'absolute', top: -1, left: '5%', right: '5%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(236,72,153,0.3), transparent)',
      }} />

      <div style={{
        maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1,
      }}>
        {/* Top section: 3 columns */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 40,
            marginBottom: 60,
          }}
        >
          {/* Column 1: Brand */}
          <TiltCard style={{
            padding: 28, borderRadius: 20,
            background: 'rgba(12,11,20,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ position: 'relative', zIndex: 3 }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.05 }}
                  style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 800, color: '#fff',
                    boxShadow: '0 0 30px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  {PROFILE.initials}
                </motion.div>
                <div>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                    fontSize: '1.15rem', color: '#f0f0f5',
                  }}>
                    {PROFILE.firstName}{' '}
                    <span style={{ color: '#8b5cf6' }}>{PROFILE.lastName}</span>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    color: 'var(--text-tertiary)', marginTop: 2,
                  }}>
                    {t.profile.tagline}
                  </div>
                </div>
              </div>

              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.82rem',
                color: 'var(--text-secondary)', lineHeight: 1.6,
                marginBottom: 20,
              }}>
                {t.profile.bio}
              </p>

              {/* Status indicator */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 999,
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
              }}>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 10px rgba(16,185,129,0.5)',
                  }}
                />
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
                  color: '#10b981', fontWeight: 600,
                }}>
                  {t.hero.available}
                </span>
              </div>
            </div>
          </TiltCard>

          {/* Column 2: Quick Links */}
          <TiltCard style={{
            padding: 28, borderRadius: 20,
            background: 'rgba(12,11,20,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ position: 'relative', zIndex: 3 }}>
              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                fontSize: '1rem', color: '#f0f0f5', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ color: '#8b5cf6' }}>◈</span>
                {t.footer.quickLinks}
              </h3>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
              }}>
                {NAV_ITEMS.map((item, i) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    whileHover={{ x: 4, color: '#c084fc' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.06 + 0.3, duration: 0.4 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 0', border: 'none', background: 'transparent',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.82rem',
                      textAlign: 'left', transition: 'color 0.2s',
                    }}
                  >
                    <span style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: '#8b5cf666', flexShrink: 0,
                    }} />
                    {t.nav[item.id]}
                  </motion.button>
                ))}
              </div>

              {/* Back to top */}
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: 20, width: '100%',
                  padding: '10px 0', borderRadius: 10,
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  color: '#c084fc', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem',
                  fontWeight: 600, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                }}
              >
                <span style={{ transform: 'rotate(-90deg)', display: 'inline-block' }}>→</span>
                {t.footer.backToTop}
              </motion.button>
            </div>
          </TiltCard>

          {/* Column 3: Connect */}
          <TiltCard style={{
            padding: 28, borderRadius: 20,
            background: 'rgba(12,11,20,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ position: 'relative', zIndex: 3 }}>
              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                fontSize: '1rem', color: '#f0f0f5', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ color: '#06b6d4' }}>◉</span>
                {t.footer.connect}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {socialLinks.map((social, i) => {
                  const SocialIcon = social.Icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: i * 0.08 + 0.4, duration: 0.4 }}
                      whileHover={{ x: 4, backgroundColor: social.hoverBg }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        transition: 'all 0.3s',
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${social.hoverColor}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: social.hoverColor || '#f0f0f5',
                      }}>
                        {SocialIcon && <SocialIcon size={16} />}
                      </div>
                      <div>
                        <div style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                          fontWeight: 600, color: '#f0f0f5',
                        }}>{social.name}</div>
                        <div style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                          color: 'var(--text-tertiary)',
                        }}>{social.label}</div>
                      </div>
                      <span style={{
                        marginLeft: 'auto', fontSize: '0.8rem',
                        color: 'var(--text-tertiary)', opacity: 0.4,
                      }}>↗</span>
                    </motion.a>
                  );
                })}

                {/* Email link */}
                <motion.a
                  href="mailto:evanatharasya@gmail.com"
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(236,72,153,0.08)' }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.3s',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(236,72,153,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}>✉️</div>
                  <div>
                    <div style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                      fontWeight: 600, color: '#f0f0f5',
                    }}>{t.footer.email}</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                      color: 'var(--text-tertiary)',
                    }}>evanatharasya@gmail.com</div>
                  </div>
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.8rem',
                    color: 'var(--text-tertiary)', opacity: 0.4,
                  }}>↗</span>
                </motion.a>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Divider with animated gradient */}
        <div style={{
          height: 1, margin: '0 0 30px',
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), rgba(6,182,212,0.2), transparent)',
        }} />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}
        >
          {/* Left: Credit */}
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}>
            {t.footer.madeWith}{' '}
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ display: 'inline-block' }}
            >❤️</motion.span>
            {' '}{t.footer.designed.toLowerCase().includes('by') ? 'by' : 'oleh'}{' '}
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                color: '#c084fc', fontWeight: 700, textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >{PROFILE.fullName}</a>
          </div>

          {/* Right: Copyright */}
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              display: 'inline-flex', padding: '3px 8px', borderRadius: 6,
              background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.12)',
              fontSize: '0.6rem', color: '#8b5cf6', fontWeight: 600,
            }}>v2.0</span>
            © {year} {PROFILE.fullName} — {t.footer.rights}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
