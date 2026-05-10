import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'Home', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10' },
  { id: 'about', label: 'About', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'projects', label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { id: 'skills', label: 'Skills', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'experience', label: 'Experience', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

/* ── SVG Icon component ── */
function NavIcon({ path, size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

/* ── Social icon SVGs ── */
function GitHubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/ESTAS-crypto', Icon: GitHubIcon, color: '#f0f0f5', hoverColor: '#c084fc' },
  { name: 'Instagram', url: 'https://instagram.com/evan_atharasya', Icon: InstagramIcon, color: '#f0f0f5', hoverColor: '#e1306c' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/evan-atharasya', Icon: LinkedInIcon, color: '#f0f0f5', hoverColor: '#0a66c2' },
];

export default function Navbar() {
  const [active, setActive] = useState('home');
  const [hovering, setHovering] = useState(null);
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const clickedRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);

    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (clickedRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -65% 0px' }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const scrollTo = (id) => {
    setActive(id);
    clickedRef.current = id;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    const checkDone = () => {
      const rect = el?.getBoundingClientRect();
      if (rect && Math.abs(rect.top) < 5) {
        clickedRef.current = null;
      } else {
        requestAnimationFrame(checkDone);
      }
    };
    setTimeout(() => requestAnimationFrame(checkDone), 300);
    setTimeout(() => { clickedRef.current = null; }, 2000);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ─── Desktop Top Nav ─── */}
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            className="nav-desktop"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
              padding: scrolled ? '10px 40px' : '18px 40px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'padding 0.4s, background 0.4s, backdrop-filter 0.4s',
              background: scrolled ? 'rgba(6,5,11,0.88)' : 'transparent',
              backdropFilter: scrolled ? 'blur(24px) saturate(1.5)' : 'none',
              WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.5)' : 'none',
              borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            }}
          >
            {/* Scroll progress bar */}
            <motion.div
              style={{
                position: 'absolute', bottom: 0, left: 0, height: 2,
                width: `${scrollProgress}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899)',
                borderRadius: '0 2px 2px 0',
                opacity: scrolled ? 1 : 0,
                transition: 'opacity 0.4s',
              }}
            />

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                fontSize: '1.3rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 10,
              }}
              onClick={() => scrollTo('home')}
            >
              <motion.div
                whileHover={{ rotate: 8 }}
                style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 800, color: '#fff',
                  boxShadow: '0 0 25px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Shimmer effect on logo */}
                <motion.div
                  animate={{ x: ['-120%', '220%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    pointerEvents: 'none',
                  }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>EA</span>
              </motion.div>
              <span style={{ color: '#f0f0f5' }}>
                Evan<span style={{ color: '#8b5cf6' }}>.</span>
              </span>
            </motion.div>

            {/* Desktop Links */}
            <nav style={{
              display: 'flex', alignItems: 'center', gap: 2,
              padding: '5px 6px', borderRadius: 9999,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  onMouseEnter={() => setHovering(item.id)}
                  onMouseLeave={() => setHovering(null)}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    position: 'relative', padding: '8px 16px', borderRadius: 9999,
                    fontSize: '0.84rem', fontWeight: 500, cursor: 'pointer',
                    color: active === item.id ? '#f0f0f5' : '#8b8b9e',
                    transition: 'color 0.3s',
                    background: 'transparent',
                    zIndex: 1,
                  }}
                >
                  {(active === item.id || hovering === item.id) && (
                    <motion.div
                      layoutId="navPill"
                      style={{
                        position: 'absolute', inset: 0, borderRadius: 9999,
                        background: active === item.id
                          ? 'rgba(139,92,246,0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: active === item.id
                          ? '1px solid rgba(139,92,246,0.25)'
                          : '1px solid rgba(255,255,255,0.05)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Social Icons + CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  title={social.name}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'color 0.3s, border-color 0.3s, box-shadow 0.3s, background 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = social.hoverColor;
                    e.currentTarget.style.borderColor = social.hoverColor + '44';
                    e.currentTarget.style.boxShadow = `0 0 20px ${social.hoverColor}22`;
                    e.currentTarget.style.background = social.hoverColor + '0a';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <social.Icon size={16} />
                </motion.a>
              ))}

              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 6px' }} />

              <motion.a
                href="#contact"
                onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '9px 22px', borderRadius: 9999,
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: '#fff', fontWeight: 600, fontSize: '0.82rem',
                  boxShadow: '0 0 20px rgba(139,92,246,0.25)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{ x: ['-100%', '250%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    pointerEvents: 'none',
                  }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>Let's Talk</span>
                <span style={{ position: 'relative', zIndex: 1, fontSize: '0.85rem' }}>→</span>
              </motion.a>
            </div>
          </motion.header>

          {/* ─── Mobile Bottom Bar ─── */}
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.3 }}
            className="nav-mobile"
            style={{
              position: 'fixed', bottom: 16, left: 12, right: 12, zIndex: 1000,
              display: 'none', /* shown via CSS media query */
              padding: '6px 4px', borderRadius: 22,
              background: 'rgba(10,9,18,0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.05)',
              justifyContent: 'space-around', alignItems: 'center',
            }}
          >
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                whileTap={{ scale: 0.8 }}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3, padding: '8px 4px',
                  borderRadius: 14, cursor: 'pointer',
                  color: active === item.id ? '#c084fc' : '#55556a',
                  transition: 'color 0.3s',
                  background: active === item.id ? 'rgba(139,92,246,0.12)' : 'transparent',
                  flex: '1 1 0',
                }}
              >
                {active === item.id && (
                  <motion.div
                    layoutId="mobileActive"
                    style={{
                      position: 'absolute', top: 0, width: 24, height: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                      boxShadow: '0 0 12px rgba(139,92,246,0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <NavIcon path={item.icon} size={active === item.id ? 18 : 16} />
                <span style={{
                  fontSize: '0.52rem', fontWeight: active === item.id ? 600 : 500,
                  letterSpacing: active === item.id ? '0.02em' : '0',
                }}>{item.label}</span>
              </motion.button>
            ))}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
