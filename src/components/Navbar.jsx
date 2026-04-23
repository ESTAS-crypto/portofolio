import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [active, setActive] = useState('home');
  const [hovering, setHovering] = useState(null);
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);

    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      const sections = navItems.map(n => document.getElementById(n.id));
      const scrollPos = window.scrollY + window.innerHeight / 3;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i] && sections[i].offsetTop <= scrollPos) {
          setActive(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
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
              padding: scrolled ? '12px 40px' : '20px 40px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'padding 0.4s, background 0.4s, backdrop-filter 0.4s',
              background: scrolled ? 'rgba(6,5,11,0.85)' : 'transparent',
              backdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
              WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
              borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            }}
          >
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                fontSize: '1.3rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 10,
              }}
              onClick={() => scrollTo('home')}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 800, color: '#fff',
                boxShadow: '0 0 20px rgba(139,92,246,0.3)',
              }}>EA</div>
              <span style={{ color: '#f0f0f5' }}>
                Evan<span style={{ color: '#8b5cf6' }}>.</span>
              </span>
            </motion.div>

            {/* Desktop Links */}
            <nav style={{
              display: 'flex', alignItems: 'center', gap: 4,
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
                  style={{
                    position: 'relative', padding: '8px 18px', borderRadius: 9999,
                    fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
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

            {/* CTA Button */}
            <motion.a
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 24px', borderRadius: 9999,
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                boxShadow: '0 0 20px rgba(139,92,246,0.25)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              Let's Talk
              <span style={{ fontSize: '0.9rem' }}>→</span>
            </motion.a>
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
              padding: '8px 10px', borderRadius: 20,
              background: 'rgba(14,13,21,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              justifyContent: 'space-around', alignItems: 'center',
            }}
          >
            {navItems.slice(0, 5).map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                whileTap={{ scale: 0.85 }}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3, padding: '6px 10px',
                  borderRadius: 12, cursor: 'pointer',
                  color: active === item.id ? '#c084fc' : '#55556a',
                  transition: 'color 0.3s',
                  background: active === item.id ? 'rgba(139,92,246,0.1)' : 'transparent',
                }}
              >
                {active === item.id && (
                  <motion.div
                    layoutId="mobileActive"
                    style={{
                      position: 'absolute', top: -2, width: 20, height: 3,
                      borderRadius: 2, background: '#8b5cf6',
                      boxShadow: '0 0 10px rgba(139,92,246,0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>{item.label}</span>
              </motion.button>
            ))}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
