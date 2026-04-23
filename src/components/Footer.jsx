import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative', padding: '40px 24px', textAlign: 'center',
      borderTop: '1px solid var(--glass-border)',
    }}>
      {/* Gradient line */}
      <div style={{
        position: 'absolute', top: -1, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(6,182,212,0.5), transparent)',
      }} />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
          fontSize: '0.9rem', marginBottom: 8,
        }}>
          Designed & Built with{' '}
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ display: 'inline-block' }}
          >❤️</motion.span>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
        }}>
          © {new Date().getFullYear()} — All rights reserved
        </div>
      </motion.div>
    </footer>
  );
}
