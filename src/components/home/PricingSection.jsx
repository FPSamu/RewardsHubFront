import { useEffect, useRef, useState } from 'react';
import { animate, LayoutGroup, motion, useInView, useReducedMotion } from 'framer-motion';

import iconCheck from '../../assets/landing/icon-check-amber.svg';
import { RhButton, SIGNUP_BUSINESS } from './primitives';
import { Watermark } from './Watermark';

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 380, damping: 34 };

const INCLUDES = [
  { label: 'Clientes y puntos ilimitados' },
  { label: 'Dashboard y reportes' },
  { label: 'Sucursales y empleados' },
  { label: 'Aparición en el mapa de la app', short: 'Aparición en el mapa' },
];

const PLANS = [
  {
    id: 'mensual',
    name: 'MENSUAL',
    toggle: 'Mensual',
    price: 399,
    unit: 'MXN /mes',
    note: 'Paga mes a mes, sin compromiso. Cancela cuando quieras.',
  },
  {
    id: 'anual',
    name: 'ANUAL',
    toggle: 'Anual · ahorra 25%',
    toggleShort: 'Anual · -25%',
    price: 3599,
    unit: 'MXN /año',
    note: 'Menos de $300 al mes. Ahorras $1,189 frente al plan mensual.',
    badge: 'MÁS POPULAR',
  },
];

const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

/** Precio que cuenta desde cero la primera vez que se ve. */
function Price({ value, className }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.8 });
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      return undefined;
    }
    if (!seen) return undefined;
    const controls = animate(0, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: setShown });
    return () => controls.stop();
  }, [seen, value, reduce]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{money(value)}</span>
      <span aria-hidden className="tabular-nums">
        {money(shown)}
      </span>
    </span>
  );
}

/** Selector Mensual / Anual: la pastilla oscura se desliza a la opción elegida. */
function BillingToggle({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Plan de pago"
      className="flex w-full gap-1 rounded-full bg-rh-paper-200 p-1 md:w-auto"
    >
      {PLANS.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p.id)}
            className={`relative flex-1 whitespace-nowrap rounded-full px-5 py-3 font-rh-sans text-[15px] font-medium leading-none transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rh-brand-400 md:flex-none ${
              active ? 'text-rh-on-dark' : 'text-rh-on-light hover:text-rh-brand-800'
            }`}
          >
            {active && <motion.span layoutId="billing-pill" transition={SPRING} className="absolute inset-0 rounded-full bg-rh-ink-950" />}
            <span className="relative">
              {p.toggleShort ? (
                <>
                  <span className="md:hidden">{p.toggleShort}</span>
                  <span className="hidden md:inline">{p.toggle}</span>
                </>
              ) : (
                p.toggle
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tarjeta de plan. La elegida en el selector se pinta oscura: el fondo oscuro es
 * un solo elemento compartido que viaja de una tarjeta a la otra.
 */
function PlanCard({ plan, selected, onSelect, index }) {
  const reduce = useReducedMotion();
  const dark = selected;
  const muted = dark ? 'text-rh-on-dark-muted' : 'text-rh-on-light-muted';

  return (
    <motion.article
      layout={reduce ? false : 'position'}
      transition={SPRING}
      onClick={() => onSelect(plan.id)}
      className={`relative flex cursor-pointer flex-col overflow-hidden rounded-[32px] border border-rh-ink-950 md:flex-1 ${
        dark ? 'order-first md:order-none' : ''
      }`}
    >
      {/* Fondo de la tarjeta elegida */}
      <span className="absolute inset-0 bg-rh-paper-50" />
      {dark && (
        <motion.span
          layoutId="plan-spotlight"
          transition={reduce ? { duration: 0 } : SPRING}
          className="absolute inset-0 rounded-[31px] bg-rh-ink-950"
        />
      )}

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
        className="relative flex flex-1 flex-col gap-5 px-6 py-8 md:gap-5 md:px-[26px] md:py-8 lg:gap-6 lg:px-9 lg:py-10"
      >
        <div className="flex h-7 items-center justify-between">
          <p
            className={`font-rh-mono text-xs font-medium leading-[1.2] tracking-[0.08em] transition-colors duration-300 ${
              dark ? 'text-rh-brand-400' : 'text-rh-on-light-muted'
            }`}
          >
            {plan.name}
          </p>
          {plan.badge && (
            <span className="rounded-full bg-rh-brand-800 px-2.5 py-1.5 font-rh-mono text-xs font-medium leading-[1.2] tracking-[0.08em] text-rh-paper-50">
              {plan.badge}
            </span>
          )}
        </div>

        <div className="flex items-end gap-1.5 whitespace-nowrap">
          <Price
            value={plan.price}
            className={`font-rh-display text-5xl font-extrabold leading-[0.9] tracking-[-0.04em] transition-colors duration-300 lg:text-6xl ${
              dark ? 'text-rh-on-dark' : 'text-rh-on-light'
            }`}
          />
          <span className={`font-rh-sans text-base leading-[1.55] transition-colors duration-300 ${muted}`}>{plan.unit}</span>
        </div>

        <p className={`font-rh-sans text-base leading-[1.55] transition-colors duration-300 ${muted}`}>{plan.note}</p>

        <span
          className={`hidden h-px w-full transition-colors duration-300 lg:block ${dark ? 'bg-rh-on-dark' : 'bg-rh-ink-950'}`}
        />

        <ul className="flex flex-1 flex-col gap-3.5">
          {INCLUDES.map((item, i) => (
            <motion.li
              key={item.label}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: 0.25 + index * 0.1 + i * 0.07, ease: EASE }}
              className="flex items-center gap-3"
            >
              <img src={iconCheck} alt="" width={22} height={22} className="size-[22px] shrink-0" />
              <span
                className={`font-rh-sans text-base leading-[1.55] transition-colors duration-300 ${
                  dark ? 'text-rh-on-dark' : 'text-rh-on-light'
                }`}
              >
                {item.short ? (
                  <>
                    <span className="lg:hidden">{item.short}</span>
                    <span className="hidden lg:inline">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </span>
            </motion.li>
          ))}
        </ul>

        <RhButton
          to={SIGNUP_BUSINESS}
          variant={dark ? 'primary' : 'dark'}
          arrow
          className="mt-1 w-full lg:mt-0"
          onClick={(e) => e.stopPropagation()}
        >
          Empezar 1 mes gratis
        </RhButton>
      </motion.div>
    </motion.article>
  );
}

/** 07 · Precios: selector mensual/anual y las dos tarjetas de plan. */
export function PricingSection() {
  const reduce = useReducedMotion();
  const [plan, setPlan] = useState('anual');
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
    <section id="precios" className="relative isolate scroll-mt-6 overflow-hidden bg-rh-paper-100">
      {/* Palabra gigante de fondo */}
      <Watermark className="top-[34px] text-[100px] md:top-[56px] md:text-[233px] lg:top-[85px] lg:text-[404px]">
        PRECIOS
      </Watermark>

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-20 md:gap-10 md:px-12 md:py-[104px] lg:items-center lg:gap-16 lg:px-20 lg:py-[136px]">
        <motion.header {...enter()} className="flex flex-col gap-5 lg:items-center lg:text-center">
          <h2 className="font-rh-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-rh-on-light md:max-w-[640px] md:text-[56px] md:leading-none md:tracking-[-0.025em] lg:max-w-[980px] lg:text-[72px] lg:leading-[0.98] lg:tracking-[-0.03em]">
            Un precio claro.{' '}
            <em className="block font-rh-serif text-[42px] font-normal italic tracking-[-0.02em] text-rh-brand-800 md:inline md:text-[59px] lg:text-[76px]">
              Primer mes gratis.
            </em>
          </h2>
          <p className="font-rh-sans text-base leading-[1.55] text-rh-on-light-muted md:max-w-[580px] md:text-xl md:leading-[1.5] md:tracking-[-0.01em] lg:max-w-[620px]">
            Todas las funciones en ambos planes. Tu primer mes es gratis en cualquiera de los dos.
          </p>
        </motion.header>

        <LayoutGroup id="pricing">
          <motion.div {...enter(0.05)} className="flex lg:justify-center">
            <BillingToggle value={plan} onChange={setPlan} />
          </motion.div>

          <div className="flex w-full flex-col gap-4 md:flex-row md:gap-5 lg:max-w-[1000px] lg:gap-6">
            {PLANS.map((p, i) => (
              <PlanCard key={p.id} plan={p} index={i} selected={plan === p.id} onSelect={setPlan} />
            ))}
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
