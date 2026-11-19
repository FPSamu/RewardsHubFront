import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import posterGear from '../../assets/landing/step-gear.webp';
import posterPhone from '../../assets/landing/step-phone.webp';
import posterGift from '../../assets/landing/step-gift.webp';
import { Watermark } from './Watermark';
import { supportsWebGL } from './webgl';

const EASE = [0.22, 1, 0.36, 1];

// three.js se carga aparte y solo cuando la sección se acerca a la pantalla
const StepScene3D = lazy(() => import('./StepScene3D'));

const STEPS = [
  {
    kind: 'gear',
    poster: posterGear,
    title: 'Configura tus recompensas',
    body: 'Define cuántos puntos vale cada compra y qué premios desbloquean. Café gratis, descuentos, lo que quieras.',
    bodyShort: 'Define cuántos puntos vale cada compra y qué premios desbloquean.',
  },
  {
    kind: 'phone',
    poster: posterPhone,
    title: 'Escanea y suma',
    body: 'Captura el monto del ticket, escanea el QR del cliente y los puntos llegan al instante a su app.',
    bodyShort: 'Captura el monto, escanea el QR del cliente y los puntos llegan al instante.',
  },
  {
    kind: 'gift',
    poster: posterGift,
    title: 'Ellos regresan',
    body: 'Les avisamos cuando tienen una recompensa lista y apareces en su mapa de negocios cercanos.',
    bodyShort: 'Les avisamos cuando tienen una recompensa lista y apareces en su mapa.',
  },
];

const SLOT_GLOW =
  'radial-gradient(50% 50% at 50% 50%, rgba(255,183,51,0.3) 0%, rgba(255,212,138,0.1) 60%, rgba(255,212,138,0) 100%)';

/** true si el dispositivo tiene un puntero con hover real (mouse/trackpad). */
function useCanHover() {
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return canHover;
}

/** Render 3D de la tarjeta: póster mientras carga (o siempre, sin WebGL / con "reducir movimiento"). */
function StepVisual({ kind, poster, active, className }) {
  const reduce = useReducedMotion();
  const box = useRef(null);
  const [use3D, setUse3D] = useState(false);
  const [mounted, setMounted] = useState(false); // la escena se monta al acercarse y ya no se desmonta
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    setUse3D(!reduce && supportsWebGL());
  }, [reduce]);

  useEffect(() => {
    if (!use3D || !box.current) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        setOnScreen(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [use3D]);

  return (
    <div ref={box} aria-hidden className={`relative shrink-0 rounded-[32px] ${className}`} style={{ background: SLOT_GLOW }}>
      <img
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 size-full rounded-[32px] object-contain transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      {use3D && mounted && (
        <div className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <Suspense fallback={null}>
            <StepScene3D kind={kind} active={active} running={onScreen} onReady={handleReady} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

/**
 * Tarjeta de un paso. La animación 3D se activa con hover; en pantallas táctiles
 * (sin hover) se activa cuando la tarjeta pasa por el centro de la pantalla.
 */
function StepCard({ step, index, canHover }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [centered, setCentered] = useState(false);

  useEffect(() => {
    if (canHover || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => setCentered(e.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [canHover]);

  const active = canHover ? hovered : centered;
  // Tablet: el visual alterna de lado (derecha, izquierda, derecha)
  const tabletDir = index % 2 === 1 ? 'md:flex-row' : 'md:flex-row-reverse';

  return (
    <motion.article
      ref={ref}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
      className={`flex flex-col gap-5 overflow-hidden rounded-[32px] border border-rh-ink-950 bg-rh-paper-50 p-5 md:items-center md:gap-7 md:p-6 ${tabletDir} lg:flex-1 lg:flex-col lg:items-stretch lg:gap-6 lg:p-7`}
    >
      <StepVisual
        kind={step.kind}
        poster={step.poster}
        active={active}
        className="h-[200px] w-full md:h-[220px] md:w-[280px] lg:h-[280px] lg:w-full"
      />
      <div className="flex min-w-0 flex-col gap-2.5 md:flex-1 md:gap-3 lg:flex-none">
        <span className="font-rh-display text-[40px] font-extrabold leading-[0.9] tracking-[-0.04em] text-rh-brand-800 md:text-5xl lg:text-[56px]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-rh-display text-2xl font-bold leading-[1.12] tracking-[-0.005em] text-rh-on-light md:text-[30px] md:leading-[1.1] md:tracking-[-0.01em]">
          {step.title}
        </h3>
        <p className="font-rh-sans text-base leading-[1.55] text-rh-on-light-muted">
          <span className="md:hidden">{step.bodyShort}</span>
          <span className="hidden md:inline">{step.body}</span>
        </p>
      </div>
    </motion.article>
  );
}

/** 03 · Cómo funciona: tres pasos con su objeto 3D animado. */
export function StepsSection() {
  const reduce = useReducedMotion();
  const canHover = useCanHover();
  const enter = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.7, ease: EASE },
      };

  return (
    <section id="como-funciona" className="relative isolate scroll-mt-6 overflow-hidden bg-rh-paper-100">
      {/* Palabra gigante de fondo */}
      <Watermark className="top-[39px] text-[137px] md:top-[66px] md:text-[297px] lg:top-[100px] lg:text-[515px]">
        PASOS
      </Watermark>

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-12 px-5 py-20 md:gap-14 md:px-12 md:py-[104px] lg:gap-16 lg:px-20 lg:py-[136px]">
        <motion.header {...enter} className="flex flex-col gap-5">
          <h2 className="font-rh-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-rh-on-light md:text-[56px] md:leading-none md:tracking-[-0.025em] lg:max-w-[900px] lg:text-[72px] lg:leading-[0.98] lg:tracking-[-0.03em]">
            Tres pasos.{' '}
            <em className="font-rh-serif text-[42px] font-normal italic tracking-[-0.02em] text-rh-brand-800 md:text-[59px] lg:text-[76px]">
              Cero
            </em>{' '}
            fricción.
          </h2>
          <p className="font-rh-sans text-base leading-[1.55] text-rh-on-light-muted md:max-w-[580px] md:text-xl md:leading-[1.5] md:tracking-[-0.01em] lg:max-w-[620px]">
            Sin terminales ni tarjetas de plástico. Solo tu celular y el QR de tu cliente.
          </p>
        </motion.header>

        <div className="flex flex-col gap-4 md:gap-5 lg:flex-row lg:gap-6">
          {STEPS.map((step, i) => (
            <StepCard key={step.kind} step={step} index={i} canHover={canHover} />
          ))}
        </div>
      </div>
    </section>
  );
}
