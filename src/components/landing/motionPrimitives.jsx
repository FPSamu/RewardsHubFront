import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

// Scroll-triggered 3D entrance: tilts up out of the page and settles flat,
// instead of a flat fade/zoom. `axis` flips the tilt direction so cards in a
// row can lean in from alternating sides.
export function Reveal3D({
  children,
  delay = 0,
  y = 56,
  rotate = 14,
  axis = 'x',
  className = '',
  style,
  as: Component = motion.div,
  viewportAmount = 0.25,
}) {
  const initial = { opacity: 0, y };
  if (axis === 'x') initial.rotateX = -rotate;
  if (axis === 'y') initial.rotateY = rotate;

  return (
    <Component
      className={className}
      style={{ transformPerspective: 1000, ...style }}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

// Wraps a grid/row of cards and staggers each direct motion child's entrance.
export function StaggerGroup({ children, className = '', stagger = 0.12, viewportAmount = 0.2 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: viewportAmount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Direct child of StaggerGroup — picks up the parent's stagger timing.
export function StaggerItem({ children, className = '', style, y = 48, rotate = 12, axis = 'x', scale = 0.94 }) {
  const hidden = { opacity: 0, y, scale };
  if (axis === 'x') hidden.rotateX = -rotate;
  if (axis === 'y') hidden.rotateY = rotate;

  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1000, ...style }}
      variants={{
        hidden,
        show: { opacity: 1, y: 0, scale: 1, rotateX: 0, rotateY: 0, transition: { duration: 0.7, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Soft irregular color blob for organic backgrounds — a deliberately uneven
// border-radius instead of a perfect circle, slowly drifting via the
// `blobFloat` keyframes (defined once in Landing.jsx alongside the other
// ambient loops like heroFloat/orbPulse).
export function OrganicBlob({
  color = '#EBA626',
  size = 420,
  opacity = 0.16,
  radius = '63% 37% 54% 46% / 43% 37% 63% 57%',
  blur = 90,
  duration = 16,
  delay = 0,
  className = '',
  style,
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        opacity,
        borderRadius: radius,
        filter: `blur(${blur}px)`,
        animation: `blobFloat ${duration}s ease-in-out infinite ${delay}s`,
        ...style,
      }}
    />
  );
}

// Parallax depth on scroll — content drifts slower/faster than the page,
// giving sections a sense of layered depth rather than flat stacking.
export function ParallaxLayer({ children, speed = 0.15, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      whileInView={{ y: [40 * speed * -1, 0] }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 1.2, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
