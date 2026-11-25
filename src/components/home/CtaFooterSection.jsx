import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import posterCoin from '../../assets/landing/cta-coin.webp';
import glow from '../../assets/landing/glow-cta.svg';
import rMark from '../../assets/landing/r-mark.svg';
import { RhButton, SIGNUP_BUSINESS, SIGNUP_CLIENT } from './primitives';
import { supportsWebGL } from './webgl';

const EASE = [0.22, 1, 0.36, 1];
const APP_STORE_URL = 'https://apps.apple.com/mx/app/rewardshub/id6768108963';
const YEAR = new Date().getFullYear();

// three.js se carga aparte, solo cuando la sección se acerca a la pantalla
const CoinScene3D = lazy(() => import('./CoinScene3D'));

const SLOT_GLOW =
  'radial-gradient(50% 50% at 50% 50%, rgba(255,183,51,0.3) 0%, rgba(255,212,138,0.1) 60%, rgba(255,212,138,0) 100%)';

// "Contacto" queda como texto hasta tener un correo o página de contacto
const FOOTER_COLUMNS = [
  {
    title: 'PRODUCTO',
    links: [
      { label: 'Cómo funciona', to: '#como-funciona' },
      { label: 'Funciones', to: '#funciones' },
      { label: 'Precios', to: '#precios' },
    ],
  },
  {
    title: 'CLIENTES',
    links: [
      { label: 'Crear cuenta', to: SIGNUP_CLIENT },
      { label: 'Descargar app', to: APP_STORE_URL },
      { label: 'Negocios cerca', to: '/client/dashboard/map' },
    ],
  },
  {
    title: 'EMPRESA',
    links: [
      { label: 'Contacto', to: null },
      { label: 'Términos', to: '/terminos' },
      { label: 'Privacidad', to: '/privacidad' },
    ],
  },
];

const LINK = 'font-rh-sans text-sm leading-[1.5] text-rh-on-dark-muted';

function FooterLink({ label, to }) {
  const cls = `${LINK} transition-colors duration-200 hover:text-rh-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rh-brand-400`;
  if (!to) return <span className={LINK}>{label}</span>;
  if (to.startsWith('#')) return <a href={to} className={cls}>{label}</a>;
  if (/^https?:/.test(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
      </a>
    );
  }
  return (
    <Link to={to} className={cls}>
      {label}
    </Link>
  );
}

/** Slot de la moneda 3D: gira siempre y acelera con el hover. */
function CoinVisual() {
  const reduce = useReducedMotion();
  const box = useRef(null);
  const [use3D, setUse3D] = useState(null); // null = aún no sabemos
  const [mounted, setMounted] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [fast, setFast] = useState(false);
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
      { rootMargin: '400px 0px' },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [use3D]);

  return (
    <div
      ref={box}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setFast(true)}
      onPointerLeave={() => setFast(false)}
      className="relative h-[260px] w-full max-w-[440px] shrink-0 self-center rounded-[32px] md:h-[320px] lg:h-[420px] lg:w-[440px]"
      style={{ background: SLOT_GLOW }}
    >
      {use3D !== true && (
        <img
          src={posterCoin}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 size-full rounded-[32px] object-contain ${use3D === null ? 'opacity-0' : ''}`}
        />
      )}
      {use3D && mounted && (
        <div aria-hidden className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <Suspense fallback={null}>
            <CoinScene3D fast={fast} running={onScreen} onReady={handleReady} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

/** 09 · CTA final + footer. */
export function CtaFooterSection() {
  const reduce = useReducedMotion();
  const enter = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <footer className="relative isolate overflow-hidden bg-rh-ink-950">
      {/* Resplandor ámbar arriba */}
      <img
        src={glow}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-560px] w-[1060px] max-w-none -translate-x-1/2 md:top-[-520px] lg:left-[calc(50%-350px)] lg:top-[-380px] lg:translate-x-[-180px]"
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-16 px-5 pb-10 pt-20 md:gap-20 md:px-12 md:pt-[104px] lg:gap-24 lg:px-20 lg:pt-[136px]">
        {/* CTA */}
        <section aria-label="Empieza hoy" className="flex flex-col gap-8 md:gap-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex min-w-0 flex-col gap-7 lg:flex-1">
            <motion.h2
              {...enter()}
              className="font-rh-display text-[44px] font-extrabold leading-[1.0] tracking-[-0.03em] text-rh-on-dark md:text-[72px] md:leading-[0.95] lg:text-[96px] lg:leading-[0.92] lg:tracking-[-0.04em]"
            >
              Tu próximo cliente fiel{' '}
              <em className="font-rh-serif text-[46px] font-normal italic tracking-[-0.02em] text-rh-brand-400 md:block md:text-[78px] lg:inline lg:text-[104px]">
                ya va en camino.
              </em>
            </motion.h2>
            <motion.div {...enter(0.08)} className="flex flex-col gap-3 md:flex-row">
              <RhButton to={SIGNUP_BUSINESS} arrow className="w-full md:w-auto">
                Prueba 1 mes gratis
              </RhButton>
              <RhButton to={SIGNUP_CLIENT} variant="secondaryDark" className="w-full md:w-auto">
                Soy cliente, crear cuenta
              </RhButton>
            </motion.div>
          </div>
          <CoinVisual />
        </section>

        {/* Footer */}
        <div className="flex flex-col gap-10 border-t border-rh-on-dark pt-10">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-6">
            <div className="flex flex-col gap-4 md:w-[220px] lg:w-[320px]">
              <Link to="/" aria-label="RewardsHub, inicio" className="flex items-end gap-px">
                <img src={rMark} alt="" width={31} height={28} className="h-7 w-[31px]" />
                <span className="font-rh-logo text-2xl font-bold leading-[26px] tracking-[-0.01em] text-rh-brand-400">
                  ewardsHub
                </span>
              </Link>
              <p className="font-rh-sans text-sm leading-[1.5] text-rh-on-dark-muted">
                La plataforma de lealtad para negocios locales.
              </p>
            </div>
            <nav aria-label="Enlaces del sitio" className="grid grid-cols-2 gap-x-6 gap-y-8 md:contents">
              {FOOTER_COLUMNS.map((col) => (
                <div key={col.title} className="flex flex-col gap-3 whitespace-nowrap">
                  <p className="font-rh-mono text-xs font-medium leading-[1.2] tracking-[0.08em] text-rh-on-dark">{col.title}</p>
                  {col.links.map((l) => (
                    <FooterLink key={l.label} {...l} />
                  ))}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap justify-between gap-x-1 font-rh-sans text-sm leading-[1.5] text-rh-on-dark-muted">
            <p>
              © {YEAR} RewardsHub<span className="md:hidden"> · Hecho para negocios locales&nbsp;✦</span>
            </p>
            <p className="hidden md:block">Hecho para negocios locales ✦</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
