import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// Degradado vertical como en Figma: visible arriba y se desvanece al 85 %.
// Con mask-image (en lugar de background-clip: text) se ve igual en todos los navegadores.
const FADE = 'linear-gradient(to bottom, #000 0%, transparent 85%)';

const TONES = {
  light: 'text-[rgba(19,17,10,0.08)]', // sobre fondo claro (paper)
  dark: 'text-[rgba(245,240,224,0.07)]', // sobre fondo oscuro (ink)
  amber: 'text-[rgba(168,102,10,0.16)]', // sobre fondo ámbar (brand-200)
};

/**
 * Palabra gigante de fondo de una sección ("PASOS", "FUNCIONES"...).
 * Se desliza en horizontal mientras la sección cruza la pantalla.
 * `className` lleva el tamaño de letra y la posición vertical por breakpoint.
 */
export function Watermark({ children, tone = 'light', className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-x-0 flex select-none justify-center ${className}`}>
      <motion.p
        style={{ x: reduce ? 0 : x, WebkitMaskImage: FADE, maskImage: FADE }}
        className={`shrink-0 whitespace-nowrap text-center font-rh-display font-extrabold leading-[0.78] tracking-[-0.05em] ${TONES[tone]}`}
      >
        {children}
      </motion.p>
    </div>
  );
}
