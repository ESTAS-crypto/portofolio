import { useState, useEffect } from 'react';

/**
 * Detects if the viewport is below a given breakpoint.
 * @param {number} breakpoint — px width threshold (default: 768)
 * @returns {boolean} true when viewport width < breakpoint
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}
