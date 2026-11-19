import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

import imgStore from '../../assets/landing/numbers-store.svg';
import imgLineA from '../../assets/landing/numbers-line-a.svg';
import imgLineB from '../../assets/landing/numbers-line-b.svg';
import imgLineC from '../../assets/landing/numbers-line-c.svg';
import imgLineD from '../../assets/landing/numbers-line-d.svg';
import imgDotAmber from '../../assets/landing/numbers-dot-amber.svg';
import imgDotInk from '../../assets/landing/numbers-dot-ink.svg';
import imgDotAmber2 from '../../assets/landing/numbers-dot-amber-2.svg';
import imgDotLight from '../../assets/landing/numbers-dot-light.svg';
import { Watermark } from './Watermark';

const EASE = [0.22, 1, 0.36, 1];

/*
 * Las ilustraciones se dibujan en el sistema de coordenadas del diseño móvil
 * (262.8 × 148.92) y se escalan para llenar la franja de cada tarjeta.
 */
const ART_W = 262.8;
const ART_H = 148.92;
const ART_MAX_SCALE = 1.2127; // tamaño del diseño de escritorio

/** Escala la ilustración al tamaño de su franja (90 % del ancho, 86 % del alto). */
function useFitScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      setScale(Math.min(ART_MAX_SCALE, (width * 0.9) / ART_W, (height * 0.86) / ART_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, scale];
}

/** Transición o nada (sin movimiento: todo aparece en su estado final). */
const tr = (still, transition) => (still ? { duration: 0 } : transition);
const pos = (left, top, extra) => ({ left, top, ...extra });

/* ───────────────────────── 1 · Un QR para todos ───────────────────────── */

const QR_CENTER = { x: 131.4, y: 74.46 };
const STORES = [
  { x: 19.27, y: 10.51 },
  { x: 204.98, y: 10.51 },
  { x: 19.27, y: 99.86 },
  { x: 204.98, y: 99.86 },
];
const STORE_SIZE = 38.544;
// Líneas punteadas: el extremo izquierdo de cada una toca el QR y el derecho la tienda
const LINES = [
  { img: imgLineA, left: 38.54, top: 29.78, rotate: -154.31 },
  { img: imgLineB, left: 131.4, top: 29.78, rotate: -25.69 },
  { img: imgLineC, left: 38.54, top: 74.46, rotate: 154.31 },
  { img: imgLineD, left: 131.4, top: 74.46, rotate: 25.69 },
];
const QR_MODULES = [
  [127.84, 38.19], [136.01, 46.37], [127.84, 54.55], [136.01, 54.55], [111.49, 62.72], [144.19, 62.72],
  [103.31, 70.9], [144.19, 70.9], [103.31, 79.07], [111.49, 79.07], [160.54, 79.07], [136.01, 87.25],
  [144.19, 87.25], [119.66, 95.43], [144.19, 95.43], [119.66, 103.6], [152.37, 103.6],
];
const QR_FINDERS = [
  [94.61, 37.67],
  [143.66, 37.67],
  [94.61, 86.72],
];
// Orden "aleatorio" fijo en que se encienden los módulos
const moduleDelay = (i) => ((i * 7) % QR_MODULES.length) * 0.03;

const POINT_TRIP = 0.9; // s que tarda un punto del QR a la tienda
const POINT_REST = 1.8; // s entre viajes

function QrArt({ play, still }) {
  const on = play || still;
  const loop = play && !still;
  return (
    <>
      {/* Líneas: se dibujan del QR hacia cada tienda */}
      {LINES.map((l, i) => (
        <div
          key={l.img}
          className="absolute flex h-[44.676px] w-[92.856px] items-center justify-center"
          style={pos(l.left, l.top)}
        >
          <div className="h-0 w-[103.045px] flex-none" style={{ transform: `rotate(${l.rotate}deg)` }}>
            <motion.div
              className="absolute inset-[-1.75px_0_0_0]"
              initial={false}
              animate={{ clipPath: on ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
              transition={tr(still, { duration: 0.5, delay: 0.75 + i * 0.08, ease: 'easeOut' })}
            >
              <img alt="" className="block size-full max-w-none" src={l.img} />
            </motion.div>
          </div>
        </div>
      ))}

      {/* Puntos que viajan del QR a cada negocio */}
      {loop &&
        STORES.map((s, i) => (
          <motion.span
            key={`pt-${s.x}-${s.y}`}
            className="absolute size-[7px] rounded-full bg-rh-brand-400 shadow-[0_0_0_2px_#FDF3DC]"
            style={{ marginLeft: -3.5, marginTop: -3.5 }}
            initial={{ left: QR_CENTER.x, top: QR_CENTER.y, opacity: 0 }}
            animate={{
              left: [QR_CENTER.x, s.x + STORE_SIZE / 2],
              top: [QR_CENTER.y, s.y + STORE_SIZE / 2],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: POINT_TRIP,
              delay: 1.5 + i * 0.45,
              repeat: Infinity,
              repeatDelay: POINT_REST,
              ease: 'easeInOut',
              opacity: { times: [0, 0.15, 0.8, 1] },
            }}
          />
        ))}

      {/* Negocios: aparecen y brincan cada vez que les llega un punto */}
      {STORES.map((s, i) => (
        <motion.div
          key={`store-${s.x}-${s.y}`}
          className="absolute size-[38.544px]"
          style={pos(s.x, s.y)}
          initial={false}
          animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={tr(still, { type: 'spring', stiffness: 380, damping: 16, delay: 0.15 + i * 0.08 })}
        >
          <motion.div
            className="relative size-full"
            animate={loop ? { scale: [1, 1, 1.16, 1], y: [0, 0, -3, 0] } : { scale: 1, y: 0 }}
            transition={
              loop
                ? {
                    duration: POINT_TRIP + 0.35,
                    times: [0, 0.68, 0.82, 1],
                    delay: 1.5 + i * 0.45,
                    repeat: Infinity,
                    repeatDelay: POINT_REST - 0.35,
                  }
                : { duration: 0 }
            }
          >
            <img alt="" className="absolute inset-0 block size-full max-w-none" src={imgStore} />
            <div className="absolute h-[6.132px] w-[19.272px] rounded-[1.752px] bg-rh-brand-400" style={pos(9.64, 11.39)} />
            <div className="absolute h-[10.512px] w-[15.768px] rounded-[1.752px] bg-rh-paper-50" style={pos(11.39, 17.52)} />
            <div className="absolute h-[7.008px] w-[5.256px] rounded-[0.876px] bg-rh-ink-900" style={pos(16.65, 21.03)} />
          </motion.div>
        </motion.div>
      ))}

      {/* El QR */}
      <motion.div
        className="absolute size-[84.096px] rounded-[15.768px] border-[1.752px] border-rh-ink-900 bg-rh-paper-50 shadow-[0px_7.008px_15.768px_0px_rgba(20,15,5,0.16)]"
        style={pos(89.35, 32.41)}
        initial={false}
        animate={{ scale: on ? 1 : 0.5, opacity: on ? 1 : 0, rotate: on ? 0 : -12 }}
        transition={tr(still, { type: 'spring', stiffness: 260, damping: 18 })}
      />
      {QR_FINDERS.map(([x, y], i) => (
        <motion.div
          key={`f-${x}-${y}`}
          className="absolute"
          style={pos(x, y)}
          initial={false}
          animate={{ scale: on ? 1 : 0 }}
          transition={tr(still, { type: 'spring', stiffness: 420, damping: 18, delay: 0.2 + i * 0.06 })}
        >
          <div className="size-[24.528px] rounded-[4.38px] border-[6.132px] border-rh-ink-950" />
          <div className="absolute size-[8.176px] rounded-[1.752px] bg-rh-ink-950" style={pos(8.17, 8.17)} />
        </motion.div>
      ))}
      {QR_MODULES.map(([x, y], i) => (
        <motion.div
          key={`m-${x}-${y}`}
          className="absolute size-[7.125px] rounded-[1.314px] bg-rh-ink-950"
          style={pos(x, y)}
          initial={false}
          animate={{ scale: on ? 1 : 0 }}
          transition={tr(still, { type: 'spring', stiffness: 500, damping: 20, delay: 0.3 + moduleDelay(i) })}
        />
      ))}
      <motion.div
        className="absolute size-[21.024px] rounded-[5.256px] bg-rh-brand-400"
        style={pos(120.89, 63.95)}
        initial={false}
        animate={
          loop
            ? { scale: [0, 1.25, 1, 1, 1.15, 1], opacity: 1 }
            : { scale: on ? 1 : 0, opacity: on ? 1 : 0 }
        }
        transition={
          loop
            ? { duration: 1.4, delay: 0.8, times: [0, 0.2, 0.32, 0.7, 0.85, 1] }
            : tr(still, { duration: 0.3 })
        }
      />

      {/* +10 PTS: salta y se queda flotando */}
      <div className="absolute flex h-[28.699px] w-[69.425px] items-center justify-center" style={pos(194.47, 50.77)}>
        <motion.div
          initial={false}
          animate={{ scale: on ? 1 : 0, rotate: on ? -6 : -40 }}
          transition={tr(still, { type: 'spring', stiffness: 420, damping: 13, delay: 1.15 })}
        >
          <motion.div
            className="flex rounded-full bg-rh-brand-400 px-[8.76px] py-[4.38px]"
            animate={loop ? { y: [0, -4, 0] } : { y: 0 }}
            transition={loop ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.6 } : { duration: 0 }}
          >
            <span className="whitespace-nowrap font-rh-mono text-[10.512px] font-medium leading-[1.2] tracking-[0.841px] text-rh-ink-950">
              +10 PTS
            </span>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

/* ───────────────────────── 2 · Recompensas sin límite ───────────────────────── */

const REWARDS = [
  {
    label: 'Café gratis',
    dot: imgDotAmber,
    box: { left: 14.95, top: 10.51, width: 116.053, height: 44.122 },
    rotate: 4,
    pill: 'bg-rh-ink-900 text-rh-on-dark',
  },
  {
    label: '20% de descuento',
    dot: imgDotInk,
    box: { left: 103.37, top: 35.41, width: 162.478, height: 44.638 },
    rotate: -3,
    pill: 'bg-rh-brand-400 text-rh-ink-950',
  },
  {
    label: '2×1 en postres',
    dot: imgDotAmber2,
    box: { left: 10.98, top: 78.84, width: 135.984, height: 40.954 },
    rotate: 2,
    pill: 'bg-rh-paper-50 text-rh-ink-950',
  },
];
// La pastilla punteada "escribe" ideas de recompensas nuevas, una tras otra
const IDEAS = ['Nueva recompensa', 'Corte gratis', 'Doble puntos', 'Bebida extra', 'Envío gratis'];

const PILL =
  'flex items-center gap-[7.008px] rounded-full py-[9.636px] pl-[12.264px] pr-[15.768px] font-rh-sans text-[13.14px] font-semibold leading-normal whitespace-nowrap';

function useTypewriter(words, running) {
  const [text, setText] = useState(words[0]);
  useEffect(() => {
    if (!running) {
      setText(words[0]);
      return undefined;
    }
    let word = 0;
    let chars = words[0].length;
    let deleting = false;
    let timer;
    const tick = () => {
      const target = words[word];
      if (!deleting && chars === target.length) {
        deleting = true;
        timer = setTimeout(tick, 1700); // se queda leyendo
        return;
      }
      if (deleting && chars === 0) {
        deleting = false;
        word = (word + 1) % words.length;
        timer = setTimeout(tick, 250);
        return;
      }
      chars += deleting ? -1 : 1;
      setText(words[word].slice(0, chars));
      timer = setTimeout(tick, deleting ? 32 : 65);
    };
    timer = setTimeout(tick, 2200);
    return () => clearTimeout(timer);
  }, [words, running]);
  return text;
}

function RewardsArt({ play, still }) {
  const on = play || still;
  const loop = play && !still;
  const idea = useTypewriter(IDEAS, loop);
  return (
    <>
      {REWARDS.map((r, i) => (
        <div key={r.label} className="absolute flex items-center justify-center" style={r.box}>
          {/* Cae desde arriba con rebote y se acomoda en su ángulo */}
          <motion.div
            initial={false}
            animate={on ? { y: 0, opacity: 1, rotate: r.rotate } : { y: -140, opacity: 0, rotate: r.rotate * -5 }}
            transition={tr(still, { type: 'spring', stiffness: 240, damping: 14, mass: 0.9, delay: 0.1 + i * 0.16 })}
          >
            <motion.div
              className={`${PILL} ${r.pill} shadow-[0px_5.256px_12.264px_0px_rgba(20,15,5,0.12)]`}
              animate={loop ? { y: [0, -3, 0] } : { y: 0 }}
              transition={
                loop ? { duration: 2.6 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: 1 + i * 0.3 } : { duration: 0 }
              }
            >
              <img alt="" className="block size-[8.76px] max-w-none" src={r.dot} />
              {r.label}
            </motion.div>
          </motion.div>
        </div>
      ))}

      <motion.div
        className={`${PILL} absolute border-[1.314px] border-dashed border-rh-brand-600 text-rh-brand-800`}
        style={pos(103.37, 110.38)}
        initial={false}
        animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.85 }}
        transition={tr(still, { duration: 0.4, delay: 0.65, ease: EASE })}
      >
        <motion.img
          alt=""
          className="block size-[8.76px] max-w-none"
          src={imgDotLight}
          animate={loop ? { scale: [1, 1.5, 1] } : { scale: 1 }}
          transition={loop ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
        />
        <span>
          {idea}
          {loop && (
            <motion.span
              aria-hidden
              className="ml-px inline-block h-[13px] w-[1.3px] translate-y-[2px] bg-rh-brand-800"
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
            />
          )}
        </span>
      </motion.div>
    </>
  );
}

/* ───────────────────────── 3 · 30 días gratis ───────────────────────── */

const CELL_X = [51.68, 69.73, 87.78, 105.82, 123.87, 141.91, 159.96];
const CELL_Y = [43.8, 61.85, 79.89, 97.94, 115.98];
const FREE_DAYS = 30;
const FILL_START = 0.45;
const FILL_GAP = 0.028;
const STAMP_AT = FILL_START + FREE_DAYS * FILL_GAP + 0.1;

function CalendarArt({ play, still }) {
  const on = play || still;
  const loop = play && !still;
  return (
    <>
      {/* Calendario: aparece y se sacude cuando cae el sello */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={
          loop
            ? { y: [24, 0, 0, 2.5, -1, 0], opacity: [0, 1, 1, 1, 1, 1], rotate: [0, 0, 0, -1.2, 0.6, 0] }
            : { y: on ? 0 : 24, opacity: on ? 1 : 0, rotate: 0 }
        }
        transition={
          loop
            ? { duration: STAMP_AT + 0.45, times: [0, 0.4 / (STAMP_AT + 0.45), STAMP_AT / (STAMP_AT + 0.45), (STAMP_AT + 0.12) / (STAMP_AT + 0.45), (STAMP_AT + 0.28) / (STAMP_AT + 0.45), 1] }
            : tr(still, { duration: 0.4 })
        }
      >
        <div
          className="absolute h-[131.4px] w-[148.92px] rounded-[15.768px] border-[1.752px] border-rh-ink-900 bg-rh-paper-50 shadow-[0px_7.008px_15.768px_0px_rgba(20,15,5,0.14)]"
          style={pos(41.17, 8.76)}
        />
        <div className="absolute h-[24.528px] w-[145.416px] rounded-t-[14.016px] bg-rh-ink-900" style={pos(42.92, 10.51)} />
        <p
          className="absolute whitespace-nowrap font-rh-mono text-[10.512px] font-medium leading-[1.2] tracking-[0.841px] text-rh-brand-400"
          style={pos(53.44, 16.64)}
        >
          MES 1
        </p>
        <div className="absolute h-[14.016px] w-[7.008px] rounded-[3.504px] bg-rh-brand-600" style={pos(76.21, 3.5)} />
        <div className="absolute h-[14.016px] w-[7.008px] rounded-[3.504px] bg-rh-brand-600" style={pos(148.04, 3.5)} />

        {/* Días: se van marcando uno a uno hasta completar los 30 */}
        {CELL_Y.flatMap((y, r) =>
          CELL_X.map((x, c) => {
            const day = r * 7 + c;
            const free = day < FREE_DAYS;
            const today = day === FREE_DAYS - 1;
            const color = today ? '#FFB733' : free ? '#FFD48A' : '#EDE3C8';
            return (
              <motion.div
                key={day}
                className="absolute size-[14.016px] rounded-[3.504px]"
                style={pos(x, y)}
                initial={false}
                animate={{
                  backgroundColor: on || !free ? color : '#EDE3C8',
                  scale: on && free ? [1, 1.3, 1] : 1,
                }}
                transition={
                  free
                    ? tr(still, { duration: 0.35, delay: FILL_START + day * FILL_GAP, ease: 'easeOut' })
                    : { duration: 0 }
                }
              >
                {today && loop && (
                  <motion.span
                    className="absolute inset-0 rounded-[3.504px] border-[1.5px] border-rh-brand-600"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: [0.9, 0], scale: [1, 1.9] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: STAMP_AT + 0.4, ease: 'easeOut' }}
                  />
                )}
              </motion.div>
            );
          }),
        )}
      </motion.div>

      {/* GRATIS: cae como un sello */}
      <div className="absolute flex h-[49.079px] w-[95.263px] items-center justify-center" style={pos(165.56, 76.67)}>
        <motion.div
          className="flex rounded-full bg-rh-brand-400 px-[14.016px] py-[7.884px] shadow-[0px_5.256px_12.264px_0px_rgba(20,15,5,0.18)]"
          initial={false}
          animate={on ? { scale: 1, opacity: 1, rotate: -8 } : { scale: 2.6, opacity: 0, rotate: -24 }}
          transition={tr(still, { type: 'spring', stiffness: 520, damping: 20, delay: STAMP_AT })}
        >
          <span className="whitespace-nowrap font-rh-display text-[17.52px] font-extrabold leading-normal text-rh-ink-950">
            GRATIS
          </span>
        </motion.div>
      </div>
    </>
  );
}

/** Cuenta de 0 a `to` al mismo ritmo con que se llenan los días del calendario. */
function CountUp({ to, play, still }) {
  const value = useMotionValue(still ? to : 0);
  const text = useTransform(value, (v) => Math.round(v));
  useEffect(() => {
    if (still) {
      value.set(to);
      return undefined;
    }
    if (!play) return undefined;
    const controls = animate(value, to, { duration: FREE_DAYS * FILL_GAP + 0.3, delay: FILL_START, ease: 'easeOut' });
    return () => controls.stop();
  }, [play, still, to, value]);
  return <motion.span>{text}</motion.span>;
}

/* ───────────────────────── Tarjetas ───────────────────────── */

const BENEFITS = [
  {
    id: 'qr',
    Art: QrArt,
    label: 'PARA TUS CLIENTES',
    stat: '1 QR',
    title: 'Un código para todos los negocios',
    body: 'Tus clientes muestran el mismo QR en cualquier negocio RewardsHub y juntan puntos en cada uno. Sin tarjetas ni apps extra.',
    bodyTablet: 'El mismo QR suma puntos en cualquier negocio RewardsHub.',
  },
  {
    id: 'rewards',
    Art: RewardsArt,
    label: 'PARA TU NEGOCIO',
    stat: 'Sin límite',
    title: 'Recompensas a tu manera',
    body: 'Crea todas las recompensas y reglas de puntos que quieras: café gratis, descuentos, 2×1 o lo que se te ocurra.',
    bodyTablet: 'Crea las recompensas y reglas de puntos que quieras.',
  },
  {
    id: 'trial',
    Art: CalendarArt,
    label: 'SIN RIESGO',
    stat: '30 días',
    count: 30,
    title: 'Gratis para empezar',
    body: 'Pruébalo un mes completo con tus clientes reales, en el plan mensual o anual. Sin permanencia.',
    bodyTablet: 'Un mes completo gratis en cualquier plan. Sin permanencia.',
  },
];

function BenefitCard({ benefit, index }) {
  const reduce = useReducedMotion();
  const still = Boolean(reduce);
  const [graphic, scale] = useFitScale();
  // La ilustración se anima cuando se ve casi completa (en móvil, al deslizar el carrusel)
  const play = useInView(graphic, { once: true, amount: 0.6 });
  const { Art } = benefit;

  return (
    <motion.article
      data-benefit-card
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.3, ease: EASE } }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
      className="flex w-[292px] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] border border-rh-paper-200 bg-rh-paper-50 transition-shadow duration-300 md:w-auto lg:rounded-[28px] hover:shadow-[0_18px_40px_rgba(20,15,5,0.10)]"
    >
      <div ref={graphic} aria-hidden className="relative h-[190px] w-full shrink-0 overflow-hidden bg-rh-brand-100 md:h-[150px] lg:h-[210px]">
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: ART_W, height: ART_H, transform: `translate(calc(-50% + 1px), -50%) scale(${scale})` }}
        >
          <Art play={play} still={still} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-6 pb-[30px] pt-6 md:px-5 md:pb-6 md:pt-5 lg:px-7 lg:pb-[34px] lg:pt-7">
        <p className="font-rh-mono text-xs font-medium leading-[1.2] tracking-[0.08em] text-rh-brand-800 md:text-[11px] lg:text-xs">
          {benefit.label}
        </p>
        <p className="font-rh-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-rh-on-light md:text-[30px] lg:text-[40px]">
          {benefit.count ? (
            <>
              <span className="sr-only">{benefit.stat}</span>
              <span aria-hidden>
                <CountUp to={benefit.count} play={play} still={still} /> días
              </span>
            </>
          ) : (
            benefit.stat
          )}
        </p>
        <h3 className="font-rh-sans text-lg font-semibold leading-[1.5] tracking-[-0.002em] text-rh-on-light md:text-base md:leading-[1.45] lg:text-2xl lg:font-bold lg:leading-[1.25]">
          {benefit.title}
        </h3>
        <p className="font-rh-sans text-base leading-[1.55] text-rh-on-light-muted md:text-sm md:leading-[1.5] lg:text-base lg:leading-[1.55]">
          <span className="md:hidden lg:inline">{benefit.body}</span>
          <span className="hidden md:inline lg:hidden">{benefit.bodyTablet}</span>
        </p>
      </div>
    </motion.article>
  );
}

/** Puntos del carrusel móvil: siguen el scroll y llevan a cada tarjeta. */
function CarouselDots({ track, count }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    // Tarjeta más cercana al borde izquierdo del carrusel (son solo tres: se calcula directo)
    const onScroll = () => {
      const cards = [...el.querySelectorAll('[data-benefit-card]')];
      const offset = (card) => Math.abs(card.offsetLeft - el.offsetLeft - 20 - el.scrollLeft);
      let best = 0;
      cards.forEach((card, i) => {
        if (offset(card) < offset(cards[best])) best = i;
      });
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) best = cards.length - 1; // al final, la última
      setActive(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [track]);

  const goTo = useCallback(
    (i) => {
      const el = track.current;
      const card = el?.querySelectorAll('[data-benefit-card]')[i];
      if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 20, behavior: 'smooth' });
    },
    [track],
  );

  return (
    <div className="flex items-center gap-1.5 pl-5 md:hidden">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Ver ventaja ${i + 1}`}
          aria-current={active === i}
          onClick={() => goTo(i)}
          className="flex h-6 items-center"
        >
          <span
            className={`block h-2 rounded-[4px] transition-all duration-300 ${active === i ? 'w-6 bg-rh-ink-900' : 'w-2 bg-rh-paper-200'}`}
          />
        </button>
      ))}
    </div>
  );
}

/** 05 · En números / Ventajas: tres razones para empezar, con ilustraciones animadas. */
export function BenefitsSection() {
  const reduce = useReducedMotion();
  const track = useRef(null);
  const enter = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.7, ease: EASE },
      };

  return (
    <section id="ventajas" className="relative isolate scroll-mt-6 overflow-hidden bg-rh-paper-100">
      {/* Palabra gigante de fondo */}
      <Watermark className="top-[39px] text-[92px] md:top-[66px] md:text-[200px] lg:top-[100px] lg:text-[347px]">
        VENTAJAS
      </Watermark>

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-8 py-20 md:gap-9 md:px-12 md:py-[104px] lg:gap-10 lg:px-20 lg:py-[136px]">
        <motion.header {...enter} className="flex flex-col gap-5 px-5 md:px-0">
          <h2 className="font-rh-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-rh-on-light md:max-w-[680px] md:text-[56px] md:leading-none md:tracking-[-0.025em] lg:max-w-[900px] lg:text-[72px] lg:leading-[0.98] lg:tracking-[-0.03em]">
            Todo lo que necesitas,{' '}
            <em className="font-rh-serif text-[42px] font-normal italic tracking-[-0.02em] text-rh-brand-800 md:text-[59px] lg:text-[76px]">
              nada que sobre.
            </em>
          </h2>
          <p className="font-rh-sans text-base leading-[1.55] text-rh-on-light-muted md:max-w-[580px] md:text-xl md:leading-[1.5] md:tracking-[-0.01em] lg:max-w-[620px]">
            Tres razones para empezar hoy: tus clientes, tus reglas y cero riesgo.
          </p>
        </motion.header>

        <div className="flex flex-col gap-[18px]">
          {/* Móvil: carrusel horizontal con snap · tablet y escritorio: tres columnas */}
          <div
            ref={track}
            className="flex snap-x snap-mandatory scroll-px-5 items-stretch gap-3.5 overflow-x-auto px-5 [scrollbar-width:none] md:grid md:snap-none md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {BENEFITS.map((b, i) => (
              <BenefitCard key={b.id} benefit={b} index={i} />
            ))}
          </div>
          <CarouselDots track={track} count={BENEFITS.length} />
        </div>
      </div>
    </section>
  );
}
