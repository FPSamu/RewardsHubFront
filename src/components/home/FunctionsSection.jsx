import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import posterDashboard from '../../assets/landing/feature-dashboard.webp';
import { Watermark } from './Watermark';
import { supportsWebGL } from './webgl';

const EASE = [0.22, 1, 0.36, 1];

// three.js se carga aparte, solo cuando la sección se acerca a la pantalla
const DashboardScene3D = lazy(() => import('./DashboardScene3D'));

const KPIS = [
  { label: 'Visitas recurrentes', value: '▲ 18%' },
  { label: 'Puntos otorgados', labelShort: 'Puntos', value: '12,480' },
  { label: 'Canjes', value: '▲ 9%' },
];

const FEATURES = [
  {
    title: 'Mapa de negocios cercanos',
    body: 'Los clientes te encuentran, ven tus recompensas y trazan ruta hasta tu local.',
    bodyShort: 'Los clientes te encuentran y trazan ruta hasta tu local.',
  },
  {
    title: 'Reportes por periodo',
    body: 'Exporta reportes en PDF y compara ventas contra puntos otorgados.',
    bodyShort: 'Reportes en PDF: ventas contra puntos otorgados.',
  },
  {
    title: 'Sucursales y turnos',
    body: 'Controla cada sucursal y qué empleado escaneó cada compra.',
    bodyShort: 'Controla cada sucursal y quién escaneó cada compra.',
  },
  {
    title: 'Notificaciones push',
    body: 'Avisos automáticos cuando un cliente está cerca de su recompensa.',
    bodyShort: 'Avisos cuando un cliente está cerca de su recompensa.',
  },
  {
    title: 'Pase en el Wallet',
    body: 'Tu tarjeta de lealtad vive en Apple Wallet y Google Wallet.',
    bodyShort: 'Tu tarjeta de lealtad en Apple y Google Wallet.',
  },
  {
    title: 'Códigos de canje',
    body: 'Canjes seguros con códigos únicos de un solo uso.',
    bodyShort: 'Canjes seguros con códigos de un solo uso.',
  },
];

const SLOT_GLOW =
  'radial-gradient(50% 50% at 50% 50%, rgba(255,183,51,0.3) 0%, rgba(255,212,138,0.1) 60%, rgba(255,212,138,0) 100%)';

/** Texto corto en móvil y completo desde tablet. */
function Responsive({ short, children }) {
  if (!short) return children;
  return (
    <>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{children}</span>
    </>
  );
}

/**
 * Slot 3D del dashboard. La escena se monta antes de llegar (para que ya esté
 * cargada) y la animación de armado arranca cuando el slot entra a la pantalla.
 * Sin WebGL o con "reducir movimiento" se muestra el render fijo.
 */
function DashboardVisual() {
  const reduce = useReducedMotion();
  const box = useRef(null);
  const [use3D, setUse3D] = useState(null); // null = aún no sabemos
  const [mounted, setMounted] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [play, setPlay] = useState(false);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

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
    // Arranca cuando ya se ve buena parte del slot (una sola vez)
    const seen = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlay(true);
          seen.disconnect();
        }
      },
      { threshold: 0.45 },
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
      className="relative h-[240px] w-full shrink-0 rounded-[32px] md:h-[360px] lg:h-[420px] lg:w-[560px]"
      style={{ background: SLOT_GLOW }}
    >
      {use3D === false && (
        <img
          src={posterDashboard}
          alt="Dashboard de RewardsHub con KPIs, gráfica de barras y dona de canjes"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full rounded-[32px] object-contain"
        />
      )}
      {use3D && mounted && (
        <div
          role="img"
          aria-label="Dashboard de RewardsHub con KPIs, gráfica de barras y dona de canjes"
          className={`absolute inset-0 transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
        >
          <Suspense fallback={null}>
            <DashboardScene3D play={play && ready} running={onScreen} onReady={handleReady} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

/** 04 · Funciones: spotlight del dashboard + lista de funciones. */
export function FunctionsSection() {
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
    <section id="funciones" className="relative isolate scroll-mt-6 overflow-hidden bg-rh-ink-950">
      {/* Palabra gigante de fondo */}
      <Watermark tone="dark" className="top-[31px] text-[79px] md:top-[48px] md:text-[172px] lg:top-[70px] lg:text-[299px]">
        FUNCIONES
      </Watermark>

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-12 px-5 py-20 md:gap-14 md:px-12 md:py-[104px] lg:gap-16 lg:px-20 lg:py-[136px]">
        <motion.h2
          {...enter()}
          className="font-rh-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-rh-on-dark md:text-[56px] md:leading-none md:tracking-[-0.025em] lg:max-w-[900px] lg:text-[72px] lg:leading-[0.98] lg:tracking-[-0.03em]"
        >
          Todo tu programa de lealtad,{' '}
          <em className="font-rh-serif text-[42px] font-normal italic tracking-[-0.02em] text-rh-brand-400 md:text-[59px] lg:text-[76px]">
            en un solo lugar.
          </em>
        </motion.h2>

        {/* Spotlight del dashboard */}
        <motion.div
          {...enter(0.05)}
          className="flex flex-col gap-6 overflow-hidden rounded-[32px] border border-rh-on-dark bg-rh-ink-800 px-5 py-6 md:gap-8 md:rounded-[48px] md:p-9 lg:flex-row lg:items-center lg:gap-14 lg:p-10"
        >
          <div className="flex min-w-0 flex-col gap-4 md:gap-[18px] lg:flex-1 lg:gap-5">
            <p className="font-rh-mono text-xs font-medium leading-[1.2] tracking-[0.08em] text-rh-brand-400">
              DASHBOARD EN TIEMPO REAL
            </p>
            <h3 className="font-rh-display text-2xl font-bold leading-[1.12] tracking-[-0.005em] text-rh-on-dark md:text-[30px] md:leading-[1.1] md:tracking-[-0.01em]">
              Mira quién vuelve, cuánto gasta y qué recompensas funcionan.
            </h3>
            <p className="font-rh-sans text-base leading-[1.55] text-rh-on-dark-muted">
              <Responsive short="KPIs con tendencia, clientes frecuentes y puntos por sucursal.">
                KPIs con tendencia, clientes frecuentes y puntos otorgados por sucursal. Decide con datos, no con
                corazonadas.
              </Responsive>
            </p>
            <ul className="flex flex-wrap gap-2 md:flex-nowrap md:gap-3 lg:flex-wrap">
              {KPIS.map((k) => (
                <li
                  key={k.label}
                  className="flex flex-col gap-1 whitespace-nowrap rounded-xl bg-rh-ink-700 px-3.5 py-2.5 md:px-4 md:py-3"
                >
                  <span className="font-rh-sans text-sm leading-[1.5] text-rh-on-dark-muted">
                    <Responsive short={k.labelShort}>{k.label}</Responsive>
                  </span>
                  <span className="font-rh-sans text-lg font-semibold leading-none tracking-[-0.001em] text-rh-on-dark md:text-xl">
                    {k.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <DashboardVisual />
        </motion.div>

        {/* Lista de funciones */}
        <ul className="flex flex-col md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.title}
              {...enter((i % 3) * 0.06)}
              className="flex gap-4 border-t border-rh-on-dark py-5 md:flex-col md:gap-3 md:pb-0 md:pt-6"
            >
              <span className="font-rh-mono text-xs font-medium leading-[1.2] tracking-[0.08em] text-rh-brand-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 md:gap-3">
                <h3 className="font-rh-display text-xl font-bold leading-[1.12] tracking-[-0.005em] text-rh-on-dark md:text-2xl md:leading-[1.1] md:tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p className="font-rh-sans text-sm leading-[1.5] text-rh-on-dark-muted md:text-base md:leading-[1.55]">
                  <Responsive short={f.bodyShort}>{f.body}</Responsive>
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
