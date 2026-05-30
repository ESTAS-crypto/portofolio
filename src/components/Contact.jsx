'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';
import { useLanguage } from '../hooks/useLanguage';
import { SOCIAL_ICON_MAP } from './Icons';
import { SOCIAL_LINKS } from '../constants';

const WEB3FORMS_KEY = 'df25c117-8be7-4469-ba8e-4cbab91cdc4b';

/* Build socials with Icon components from the map */
const socials = SOCIAL_LINKS.map(s => ({ ...s, Icon: SOCIAL_ICON_MAP[s.name] }));

function AnimatedInput({ label, name, type = 'text', isTextarea = false, delay = 0, value, onChange }) {
  const [focused, setFocused] = useState(false);
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
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
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

/* ── Status toast ── */
function StatusToast({ status, t }) {
  const config = {
    sending: { icon: '⏳', text: t.contact.sendingMsg, bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', color: '#c084fc' },
    success: { icon: '✅', text: t.contact.successMsg, bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
    error: { icon: '❌', text: t.contact.errorMsg, bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#ef4444' },
  };
  const c = config[status];
  if (!c) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px', borderRadius: 14,
        background: c.bg, border: `1px solid ${c.border}`,
        color: c.color, fontSize: '0.85rem', fontWeight: 500,
        marginTop: 12,
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
      {c.text}
    </motion.div>
  );
}

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Portfolio Contact — ${form.name}`,
          from_name: form.name,
          ...form,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(null), 5000);
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 5000);
    }
  };

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
          <div className="section-label">{t.contact.label}</div>
          <h2 className="section-title">
            {t.contact.title1} <span className="text-gradient">{t.contact.title2}</span>
          </h2>
          <p className="section-description" style={{ margin: '0 auto' }}>
            {t.contact.subtitle}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 18,
          }}>
            <AnimatedInput label={t.contact.name} name="name" delay={0.1} value={form.name} onChange={handleChange} />
            <AnimatedInput label={t.contact.email} name="email" type="email" delay={0.15} value={form.email} onChange={handleChange} />
          </div>
          <AnimatedInput label={t.contact.message} name="message" isTextarea delay={0.2} value={form.message} onChange={handleChange} />

          <motion.button
            type="submit"
            disabled={status === 'sending'}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={status !== 'sending' ? { scale: 1.03 } : {}}
            whileTap={status !== 'sending' ? { scale: 0.97 } : {}}
            style={{
              padding: isMobile ? '14px 30px' : '16px 40px', borderRadius: 9999, fontWeight: 600,
              fontSize: isMobile ? '0.88rem' : '0.95rem', alignSelf: 'center', position: 'relative',
              overflow: 'hidden', width: isMobile ? '100%' : 'auto',
              background: status === 'sending'
                ? 'linear-gradient(135deg, #6d28d9, #4c1d95)'
                : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#fff',
              boxShadow: '0 0 30px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
              marginTop: 8,
              opacity: status === 'sending' ? 0.7 : 1,
              cursor: status === 'sending' ? 'not-allowed' : 'pointer',
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
            <span style={{ position: 'relative', zIndex: 1 }}>
              {status === 'sending' ? t.contact.sending : t.contact.send}
            </span>
          </motion.button>

          {/* Status Toast */}
          <AnimatePresence>
            {status && <StatusToast status={status} t={t} />}
          </AnimatePresence>
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
            {t.contact.findMe}
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
