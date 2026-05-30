'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';
import { useLanguage } from '../hooks/useLanguage';
import { EXPERIENCES } from '../constants';

const experiences = EXPERIENCES;

function TimelineCard({ exp, index, activeIndex, setActiveIndex, isMobile, t }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const isActive = activeIndex === index;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', gap: 0, position: 'relative' }}
    >
      {/* ─── Timeline spine ─── */}
      <div style={{
        position: 'relative', width: isMobile ? 24 : 36, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Vertical beam */}
        <motion.div
          initial={{ height: 0 }}
          animate={inView ? { height: '100%' } : {}}
          transition={{ delay: index * 0.12 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute', top: 0, width: 2,
            background: `linear-gradient(to bottom, ${exp.color}44, ${index < experiences.length - 1 ? 'rgba(255,255,255,0.04)' : 'transparent'})`,
          }}
        />

        {/* Dot node */}
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.12 + 0.3, type: 'spring', stiffness: 400, damping: 15 }}
          onClick={() => setActiveIndex(isActive ? null : index)}
          style={{
            position: 'relative', zIndex: 2, marginTop: 24,
            width: isActive || hovered ? 18 : 14,
            height: isActive || hovered ? 18 : 14,
            borderRadius: '50%',
            background: isActive ? exp.color : 'var(--bg-primary)',
            border: `2.5px solid ${exp.color}`,
            boxShadow: isActive || hovered ? `0 0 20px ${exp.color}55, 0 0 40px ${exp.color}22` : 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>

      {/* ─── Card ─── */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setActiveIndex(isActive ? null : index)}
        style={{
          flex: 1, marginBottom: 16, position: 'relative',
          borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
          background: isActive || hovered ? 'rgba(12,11,20,0.95)' : 'rgba(12,11,20,0.6)',
          border: `1px solid ${isActive ? exp.color + '33' : hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: isActive ? `0 10px 40px ${exp.color}10` : 'none',
          transform: hovered && !isActive ? 'translateX(4px)' : 'translateX(0)',
        }}
      >
        {/* Top color bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive || hovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: 2, transformOrigin: 'left',
            background: `linear-gradient(90deg, ${exp.color}, transparent)`,
          }}
        />

        {/* Main content */}
        <div style={{ padding: isMobile ? '12px 12px' : '16px 16px' }}>
          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: 12, marginBottom: 10, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
              }}>
                <span style={{ fontSize: '1.2rem' }}>{exp.icon}</span>
                <h3 style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                  fontWeight: 700, color: '#f0f0f5',
                }}>{exp.role}</h3>
              </div>
              <div style={{
                fontSize: '0.82rem', color: exp.color, fontWeight: 500,
              }}>{exp.company}</div>
            </div>
            <div style={{
              padding: '4px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
              color: 'var(--text-tertiary)', whiteSpace: 'nowrap',
            }}>{exp.year}</div>
          </div>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6,
            marginBottom: 14,
          }}>{exp.description}</p>

          {/* Tech tags */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: isActive ? 16 : 0,
          }}>
            {exp.tech.map(t => (
              <span key={t} style={{
                padding: '3px 10px', borderRadius: 6, fontSize: '0.65rem',
                fontFamily: 'JetBrains Mono, monospace',
                background: `${exp.color}08`, color: `${exp.color}cc`,
                border: `1px solid ${exp.color}18`,
              }}>{t}</span>
            ))}
          </div>

          {/* Expandable highlights */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                    color: 'var(--text-tertiary)', marginBottom: 8,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>{ t.experience.keyHighlights}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {exp.highlights.map((h, i) => (
                      <motion.div
                        key={h}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: '0.78rem', color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: exp.color, flexShrink: 0,
                          boxShadow: `0 0 6px ${exp.color}44`,
                        }} />
                        {h}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Expand indicator */}
        <div style={{
          position: 'absolute', bottom: 8, right: 14,
          fontSize: '0.6rem', color: 'var(--text-tertiary)',
          fontFamily: 'JetBrains Mono, monospace',
          opacity: hovered && !isActive ? 0.6 : 0,
          transition: 'opacity 0.3s',
        }}>{t.experience.clickExpand}</div>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(null);
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  return (
    <section id="experience" style={{ position: 'relative', padding: isMobile ? '60px 16px' : '100px 20px' }}>
      {/* Background */}
      <div style={{
        position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)',
        width: 300, height: 500, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.03) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <div ref={ref} style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 50 }}
        >
          <div className="section-label">{t.experience.label}</div>
          <h2 className="section-title">
            {t.experience.title1} <span className="text-gradient">{t.experience.title2}</span>
          </h2>
          <p className="section-description" style={{ margin: '0 auto' }}>
            {t.experience.subtitle}
          </p>
        </motion.div>

        <div>
          {experiences.map((exp, i) => {
            // Merge static data (tech, color, icon) with translated text
            const translated = t.experience.items?.[i] || {};
            const merged = {
              ...exp,
              year: translated.year || exp.year,
              role: translated.role || exp.role,
              company: translated.company || exp.company,
              description: translated.description || exp.description,
              highlights: translated.highlights || exp.highlights,
            };
            return (
              <TimelineCard
                key={i} exp={merged} index={i}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                isMobile={isMobile}
                t={t}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
