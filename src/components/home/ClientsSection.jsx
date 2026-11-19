import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import posterHand from '../../assets/landing/clients-hand.webp';
import { RhButton, SIGNUP_CLIENT } from './primitives';
import { Watermark } from './Watermark';
import { supportsWebGL } from './webgl';

const EASE = [0.22, 1, 0.36, 1];
const APP_STORE_URL = 'https://apps.apple.com/mx/app/rewardshub/id6768108963';

// three.js se carga aparte, solo cuando la sección se acerca a la pantalla
const ClientsScene3D = lazy(() => import('./ClientsScene3D'));

const SLOT_GLOW =
  'radial-gradient(50% 50% at 50% 50%, rgba(255,183,51,0.3) 0%, rgba(255,212,138,0.1) 60%, rgba(255,212,138,0) 100%)';
const ALT = 'Mano sosteniendo un celular que muestra el QR de RewardsHub, con monedas flotando';

/**
 * Slot 3D: la escena se monta antes de llegar y la mano entra cuando el slot ya
 * se ve. Pasar el mouse (o tocar) repite el toque del pulgar. Sin WebGL o con
 * "reducir movimiento" se muestra el render fijo.
 */
function HandVisual() {
  const reduce = useReducedMotion();
  const box = useRef(null);
  const [use3D, setUse3D] = useState(null); // null = aún no sabemos
  const [mounted, setMounted] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [play, setPlay] = useState(false);
  const [ready, setReady] = useState(false);
  const [replay, setReplay] = useState(0);
  const handleReady = useCallback(() => setReady(true), []);
  const again = useCallback(() => setReplay((n) => n + 1), []);

  useEffect(() => {
    setUse3D(!reduce && supportsWebGL());
  }, [reduce]);

  useEffect(() => {
    if (!use3D || !box.current) return undefined;
    const near = new IntersectionObserver(
      ([e]) => {
        setOnScreen(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: '600px 0px' },
    );
    const seen = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlay(true);
          seen.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    near.observe(box.current);
    seen.observe(box.current);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, [use3D]);

  return (
    <div
      ref={box}
      onPointerEnter={(e) => e.pointerType === 'mouse' && again()}
      onClick={again}
      className="relative h-[360px] w-full max-w-[560px] shrink-0 self-center rounded-[32px] md:h-[440px] lg:h-[520px] lg:w-[560px]"
      style={{ background: SLOT_GLOW }}
    >
      {use3D === false && (
        <img
          src={posterHand}
          alt={ALT}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full rounded-[32px] object-contain"
        />
      )}
      {use3D && mounted && (
        <div
          role="img"
          aria-label={ALT}
          className={`absolute inset-0 transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
        >
          <Suspense fallback={null}>
            <ClientsScene3D play={play && ready} replay={replay} running={onScreen} onReady={handleReady} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

/** 06 · Para clientes: invitación a crear cuenta, con la mano que muestra el QR. */
export function ClientsSection() {
  const reduce = useReducedMotion();
  const enter = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section id="clientes" className="relative isolate scroll-mt-6 overflow-hidden bg-rh-brand-200">
      {/* Palabra gigante de fondo */}
      <Watermark tone="amber" className="top-[30px] text-[95px] md:top-[50px] md:text-[213px] lg:top-[80px] lg:text-[370px]">
        CLIENTES
      </Watermark>

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-20 md:gap-12 md:px-12 md:py-[104px] lg:flex-row lg:items-center lg:gap-16 lg:px-20 lg:py-[136px]">
        <div className="flex min-w-0 flex-col gap-5 md:gap-6 lg:flex-1">
          <motion.h2
            {...enter()}
            className="font-rh-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-rh-on-light md:text-[56px] md:leading-none md:tracking-[-0.025em] lg:text-[72px] lg:leading-[0.98] lg:tracking-[-0.03em]"
          >
            Tus puntos,{' '}
            <em className="font-rh-serif text-[42px] font-normal italic tracking-[-0.02em] text-rh-ink-950 md:text-[59px] lg:text-[76px]">
              en todos lados.
            </em>
          </motion.h2>
          <motion.p
            {...enter(0.05)}
            className="font-rh-sans text-base leading-[1.55] text-rh-on-light-muted md:max-w-[580px] md:text-xl md:leading-[1.5] md:tracking-[-0.01em] lg:max-w-none"
          >
            Crea tu cuenta gratis y usa un solo QR para juntar puntos en todos los negocios RewardsHub.
            <span className="hidden md:inline"> Descubre lugares cerca de ti y canjea recompensas al instante.</span>
          </motion.p>
          <motion.div {...enter(0.1)} className="flex flex-col gap-3 pt-1 md:flex-row">
            <RhButton to={SIGNUP_CLIENT} variant="dark" arrow className="w-full md:w-auto">
              Crear mi cuenta gratis
            </RhButton>
            <RhButton to={APP_STORE_URL} variant="ghostLight" className="w-full md:w-auto">
              Descargar la app
            </RhButton>
          </motion.div>
        </div>
        <HandVisual />
      </div>
    </section>
  );
}
