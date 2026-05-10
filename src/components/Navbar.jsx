import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavIcon, SOCIAL_ICON_MAP } from './Icons';
import { NAV_ITEMS, SOCIAL_LINKS } from '../constants';
import { useLanguage } from '../hooks/useLanguage';

/* Build socialLinks with Icon components from the map */
const socialLinks = SOCIAL_LINKS.map(s => ({ ...s, Icon: SOCIAL_ICON_MAP[s.name] }));

export default function Navbar() {
  const [active, setActive] = useState('home');
  const [hovering, setHovering] = useState(null);
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const clickedRef = useRef(null);
  const { t, lang, toggleLang } = useLanguage();

  /* Map nav item IDs to translated labels */
  const navLabels = {
    home: t.nav.home, about: t.nav.about, projects: t.nav.projects,
    skills: t.nav.skills, experience: t.nav.experience, contact: t.nav.contact,
  };

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

    NAV_ITEMS.forEach((item) => {
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
                Evan <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Atharasya</span>
              </span>
            </motion.div>

            {/* Desktop Links — centered absolutely */}
            <nav style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: 2,
              padding: '5px 6px', borderRadius: 9999,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {NAV_ITEMS.map((item) => (
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
                  <span style={{ position: 'relative', zIndex: 1 }}>{navLabels[item.id] || item.label}</span>
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

              {/* Language Toggle */}
              <motion.button
                onClick={toggleLang}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={lang === 'en' ? 'Switch to Indonesian' : 'Ganti ke Inggris'}
                style={{
                  padding: '6px 12px', borderRadius: 9999,
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: '#c084fc', fontWeight: 700, fontSize: '0.72rem',
                  cursor: 'pointer', letterSpacing: '0.05em',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {lang === 'en' ? 'ID' : 'EN'}
              </motion.button>

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
                <span style={{ position: 'relative', zIndex: 1 }}>{t.nav.letsTalk}</span>
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
            {NAV_ITEMS.map((item) => (
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
                }}>{navLabels[item.id] || item.label}</span>
              </motion.button>
            ))}

            {/* Language Toggle on Mobile */}
            <motion.button
              onClick={toggleLang}
              whileTap={{ scale: 0.8 }}
              style={{
                position: 'relative', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3, padding: '8px 4px',
                borderRadius: 14, cursor: 'pointer',
                color: '#c084fc',
                background: 'rgba(139,92,246,0.08)',
                flex: '1 1 0',
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span style={{
                fontSize: '0.52rem', fontWeight: 700,
                letterSpacing: '0.05em',
              }}>{lang === 'en' ? 'ID' : 'EN'}</span>
            </motion.button>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
