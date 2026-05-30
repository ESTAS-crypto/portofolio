'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isMobile, setIsMobile] = useState(true); // default hidden (safe for SSR)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const outlineX = useSpring(cursorX, { stiffness: 150, damping: 15 });
  const outlineY = useSpring(cursorY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    // Check if mobile/touch device
    const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    check();
    window.addEventListener('resize', check);

    // Track mouse position
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', move);

    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('mousemove', move);
    };
  }, [cursorX, cursorY]);

  // Don't render on mobile or during SSR
  if (isMobile) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 99999,
          width: 6, height: 6, borderRadius: '50%',
          background: '#c084fc', pointerEvents: 'none',
          x: cursorX, y: cursorY,
          translateX: '-50%', translateY: '-50%',
          boxShadow: '0 0 10px rgba(192,132,252,0.5)',
        }}
        className="custom-cursor-dot"
      />
      {/* Outline */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 99998,
          width: 36, height: 36, borderRadius: '50%',
          border: '1.5px solid rgba(139,92,246,0.4)',
          pointerEvents: 'none', mixBlendMode: 'difference',
          x: outlineX, y: outlineY,
          translateX: '-50%', translateY: '-50%',
        }}
        className="custom-cursor-outline"
      />
    </>
  );
}
