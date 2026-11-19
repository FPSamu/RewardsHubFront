import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import heroWebp from '../../assets/landing/hero-3d.webp';
import heroPng from '../../assets/landing/hero-3d.png';
import glowDesktopA from '../../assets/landing/glow-hero-desktop-a.svg';
import glowDesktopB from '../../assets/landing/glow-hero-desktop-b.svg';
import glowTabletA from '../../assets/landing/glow-hero-tablet-a.svg';
import glowTabletB from '../../assets/landing/glow-hero-tablet-b.svg';
import glowMobileA from '../../assets/landing/glow-hero-mobile-a.svg';
import glowMobileB from '../../assets/landing/glow-hero-mobile-b.svg';
import dotAmber from '../../assets/landing/chip-dot-amber.svg';
import dotBrown from '../../assets/landing/chip-dot-brown.svg';
import dotAmber28 from '../../assets/landing/chip-dot-amber-28.svg';
import dotBrown28 from '../../assets/landing/chip-dot-brown-28.svg';

import { HomeNav } from './HomeNav';
import { ClientAccess, RhButton, SIGNUP_BUSINESS, SIGNUP_CLIENT } from './primitives';
import { supportsWebGL } from './webgl';

const EASE = [0.22, 1, 0.36, 1];

// La escena 3D (three.js) se carga aparte para no inflar el bundle inicial
const HeroScene3D = lazy(() => import('./HeroScene3D'));

/** Brillos ámbar desenfocados detrás del hero (uno por breakpoint, como en Figma). */
function Glows() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* móvil */}
      <img src={glowMobileA} alt="" width={600} height={600} className="absolute right-[-226px] top-[-260px] w-[600px] max-w-none md:hidden" />
      <img src={glowMobileB} alt="" width={580} height={580} className="absolute left-[-340px] top-[760px] w-[580px] max-w-none md:hidden" />
      {/* tablet */}
      <img src={glowTabletA} alt="" width={760} height={760} className="absolute right-[-206px] top-[-300px] hidden w-[760px] max-w-none md:block lg:hidden" />
      <img src={glowTabletB} alt="" width={700} height={700} className="absolute left-[-380px] top-[600px] hidden w-[700px] max-w-none md:block lg:hidden" />
      {/* desktop */}
      <img src={glowDesktopA} alt="" width={880} height={880} className="absolute right-[-172px] top-[-320px] hidden w-[880px] max-w-none lg:block" />
      <img src={glowDesktopB} alt="" width={760} height={760} className="absolute left-[-420px] top-[560px] hidden w-[760px] max-w-none lg:block" />
    </div>
  );
}

/** Tarjetita flotante sobre el render (notificaciones de ejemplo). */
function FloatChip({ dot, dot28, title, subtitle, subtitleShort, className, delay = 0, drift = -8 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={reduce ? undefined : { opacity: 1, y: [0, drift, 0], scale: 1 }}
      transition={{
        opacity: { duration: 0.6, delay, ease: EASE },
        scale: { duration: 0.6, delay, ease: EASE },
        y: { duration: 5, delay: delay + 0.6, repeat: Infinity, ease: 'easeInOut' },
      }}
      className={`absolute flex items-center gap-2.5 whitespace-nowrap rounded-[20px] bg-rh-paper-50 px-3 py-2.5 shadow-[0_16px_32px_rgba(0,0,0,0.35)] md:gap-3 md:px-4 md:py-3 md:shadow-[0_20px_40px_rgba(0,0,0,0.35)] ${className}`}
    >
      <img src={dot28} alt="" width={28} height={28} className="size-7 md:hidden" />
      <img src={dot} alt="" width={36} height={36} className="hidden size-9 md:block" />
      <span className="flex flex-col gap-0.5">
        <span className="font-rh-sans text-base font-semibold leading-none tracking-[-0.001em] text-rh-on-light">{title}</span>
        <span className="font-rh-sans text-sm leading-[1.5] text-rh-on-light-muted">
          {subtitleShort ? (
            <>
              <span className="md:hidden">{subtitleShort}</span>
              <span className="hidden md:inline">{subtitle}</span>
            </>
          ) : (
            subtitle
          )}
        </span>
      </span>
    </motion.div>
  );
}

function HeroVisual() {
  const reduce = useReducedMotion();
  const box = useRef(null);
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const handleReady = useCallback(() => setReady(true), []);

  // 3D solo con WebGL y sin "reducir movimiento"; si no, se queda el render PNG
  useEffect(() => {
    setUse3D(!reduce && supportsWebGL());
  }, [reduce]);

  // Pausa la animación cuando el hero sale de pantalla
  useEffect(() => {
    if (!use3D || !box.current) return undefined;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '100px' });
    io.observe(box.current);
    return () => io.disconnect();
  }, [use3D]);

  return (
    <div ref={box} className="relative h-[360px] w-full shrink-0 md:h-[500px] lg:h-[600px] lg:w-[580px]">
      {/* 3D Slot: render del teléfono + monedas sobre un brillo radial */}
      <div
        className="absolute inset-0 rounded-[32px]"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(255,183,51,0.3) 0%, rgba(255,212,138,0.1) 60%, rgba(255,212,138,0) 100%)',
        }}
      >
        {/* Póster: se ve mientras carga la escena 3D (o siempre, si no hay 3D) */}
        <motion.picture
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={reduce ? undefined : { opacity: ready ? 0 : 1, scale: 1 }}
          transition={{ duration: ready ? 0.5 : 0.9, delay: ready ? 0 : 0.15, ease: EASE }}
          className="block size-full"
          aria-hidden={ready || undefined}
        >
          <source srcSet={heroWebp} type="image/webp" />
          <img
            src={heroPng}
            alt="Teléfono con el QR de RewardsHub rodeado de monedas de puntos"
            width={1600}
            height={1600}
            className="size-full rounded-[32px] object-contain"
          />
        </motion.picture>

        {use3D && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <Suspense fallback={null}>
              <HeroScene3D active={onScreen} onReady={handleReady} />
            </Suspense>
          </motion.div>
        )}
      </div>

      <FloatChip
        dot={dotAmber}
        dot28={dotAmber28}
        title="+120 puntos"
        subtitle="Café Luna · hace 2 s"
        delay={0.7}
        className="left-[14px] top-[200px] md:left-[28px] md:top-[380px] lg:left-[-24px] lg:top-[372px]"
      />
      <FloatChip
        dot={dotBrown}
        dot28={dotBrown28}
        title="Recompensa lista"
        subtitle="Postre gratis desbloqueado"
        subtitleShort="Postre gratis"
        delay={0.95}
        drift={-10}
        className="left-[143px] top-[58px] md:left-[63.4%] md:top-[64px] lg:left-[330px] lg:top-[60px]"
      />
    </div>
  );
}

export function HeroSection() {
  const reduce = useReducedMotion();
  const enter = (delay) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: EASE } };

  return (
    <section className="relative isolate overflow-hidden bg-rh-ink-950">
      <Glows />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-start gap-10 px-5 pb-10 pt-4 md:gap-14 md:px-12 md:pb-12 md:pt-6 lg:gap-[72px] lg:px-20 lg:pb-16">
        <HomeNav />

        <div className="flex w-full flex-col items-start gap-10 md:gap-14 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex w-full min-w-0 flex-col items-start gap-6 md:gap-7 lg:flex-1">
            <motion.div {...enter(0)} className="w-full md:w-auto">
              <ClientAccess className="w-full md:w-auto" />
            </motion.div>

            <motion.h1
              {...enter(0.08)}
              className="w-full font-rh-display text-[54px] font-extrabold leading-[0.96] tracking-[-0.025em] text-rh-on-dark md:text-[88px] md:leading-[0.94] md:tracking-[-0.035em] lg:text-[128px] lg:leading-[0.92] lg:tracking-[-0.04em]"
            >
              Clientes que{' '}
              <em className="font-rh-serif text-[59px] font-normal italic tracking-[-0.02em] text-rh-brand-400 md:text-[97px] lg:text-[141px]">
                vuelven
              </em>{' '}
              solos.
            </motion.h1>

            <motion.p
              {...enter(0.16)}
              className="w-full font-rh-sans text-base leading-[1.55] text-rh-on-dark-muted md:max-w-[600px] md:text-xl md:leading-[1.5] md:tracking-[-0.01em] lg:max-w-none"
            >
              RewardsHub convierte cada compra en puntos y recompensas. Tu cliente muestra su QR, tú lo escaneas y ves
              crecer la lealtad en tiempo real.
            </motion.p>

            <motion.div {...enter(0.24)} className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <RhButton to={SIGNUP_CLIENT} arrow className="w-full md:w-auto">
                Prueba 1 mes gratis
              </RhButton>
              <RhButton to="#como-funciona" variant="secondaryDark" className="w-full md:w-auto">
                Ver cómo funciona
              </RhButton>
            </motion.div>

            <motion.p
              {...enter(0.3)}
              className="w-full text-center font-rh-mono text-xs font-medium leading-[1.2] tracking-[0.02em] text-rh-on-dark-muted md:text-left"
            >
              Sin permanencia · Cancela cuando quieras<span className="hidden md:inline"> · Configura en minutos</span>
            </motion.p>
          </div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
