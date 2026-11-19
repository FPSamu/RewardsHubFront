import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useVelocity,
} from 'framer-motion';

const ITEMS = ['Cafeterías', 'Barberías', 'Restaurantes', 'Gimnasios', 'Boutiques', 'Panaderías', 'Estéticas', 'Bares'];

const LOOP_SECONDS = 40; // una vuelta completa a velocidad base (spec de Motion en Figma)
const COPIES = 3; // copias del texto para cubrir pantallas anchas sin huecos

const TEXT =
  'font-rh-display text-2xl font-bold uppercase leading-[1.1] tracking-[-0.01em] text-rh-ink-950 md:text-[32px] lg:text-[40px]';

function Strip() {
  return (
    <span className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center whitespace-nowrap">
          {item}
          <span className="px-[0.3em]">✦</span>
        </span>
      ))}
    </span>
  );
}

/**
 * 02 · Marquesina: los giros de negocio corren sin fin hacia la izquierda.
 * Al hacer scroll se acelera según la velocidad del scroll y luego vuelve a su ritmo.
 */
export function Marquee() {
  const reduce = useReducedMotion();
  const box = useRef(null);
  const strip = useRef(null);
  const inView = useInView(box, { margin: '100px 0px' });
  const x = useMotionValue(0);

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });

  useAnimationFrame((_, delta) => {
    if (reduce || !inView || !strip.current) return;
    const width = strip.current.offsetWidth; // ancho de una copia
    if (!width) return;
    const boost = 1 + Math.min(Math.abs(velocity.get()) / 400, 6);
    let next = x.get() - (width / LOOP_SECONDS) * (delta / 1000) * boost;
    if (next <= -width) next += width; // al recorrer una copia, regresa sin que se note
    x.set(next);
  });

  if (reduce) {
    // Sin movimiento: el texto completo, en varias líneas si hace falta
    return (
      <section aria-label="Giros de negocio" className="bg-rh-brand-400 px-5 py-[18px] md:py-[22px] lg:py-7">
        <p className={`${TEXT} flex flex-wrap justify-center`}>
          <Strip />
        </p>
      </section>
    );
  }

  return (
    <section ref={box} aria-label="Giros de negocio" className="overflow-hidden bg-rh-brand-400 py-[18px] md:py-[22px] lg:py-7">
      <p className="sr-only">{ITEMS.join(', ')}</p>
      <motion.div aria-hidden style={{ x }} className={`${TEXT} flex w-max will-change-transform`}>
        {Array.from({ length: COPIES }, (_, i) => (
          <span key={i} ref={i === 0 ? strip : undefined} className="flex shrink-0">
            <Strip />
          </span>
        ))}
      </motion.div>
    </section>
  );
}
