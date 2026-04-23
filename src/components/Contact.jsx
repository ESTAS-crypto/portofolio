import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const socials = [
  { name: 'GitHub', url: '#', icon: '⬡' },
  { name: 'LinkedIn', url: '#', icon: '◆' },
  { name: 'Twitter', url: '#', icon: '◈' },
  { name: 'Dribbble', url: '#', icon: '◎' },
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

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="contact" style={{
      position: 'relative', padding: '100px 20px', overflow: 'hidden',
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
              padding: '16px 40px', borderRadius: 9999, fontWeight: 600,
              fontSize: '0.95rem', alignSelf: 'center', position: 'relative',
              overflow: 'hidden',
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

        {/* Socials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          style={{
            display: 'flex', justifyContent: 'center', gap: 10, marginTop: 40,
          }}
        >
          {socials.map((s) => (
            <motion.a
              key={s.name}
              href={s.url}
              whileHover={{ scale: 1.15, y: -3 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', color: 'var(--text-secondary)',
                transition: 'border-color 0.3s, color 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                e.currentTarget.style.color = '#c084fc';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title={s.name}
            >{s.icon}</motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
