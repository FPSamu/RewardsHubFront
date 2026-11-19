import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import iconPlus from '../../assets/landing/icon-plus.svg';
import { Watermark } from './Watermark';

const EASE = [0.22, 1, 0.36, 1];

const FAQS = [
  {
    q: '¿Necesito hardware especial para escanear?',
    a: 'No. Escaneas el QR de tus clientes con la cámara de cualquier celular desde la app o desde la página de RewardsHub. Sin terminales ni lectores.',
  },
  {
    q: '¿Mis clientes tienen que descargar una app?',
    a: 'Tus clientes crean su cuenta gratis en RewardsHub para tener su QR y ver sus puntos. Pueden ver su tarjeta en la página o en la app, y también puede vivir en Apple Wallet o Google Wallet.',
  },
  {
    q: '¿Cómo funciona el mes gratis?',
    a: 'Eliges el plan mensual o el anual y los primeros 30 días no pagas nada. Al terminar la prueba se cobra el plan que elegiste, a menos que canceles antes.',
  },
  {
    q: '¿Puedo manejar varias sucursales?',
    a: '¡Sí! Puedes agregar tantas sucursales como tenga tu negocio, controlas cada sucursal desde el mismo dashboard y ves en cuál se escaneó cada compra.',
  },
  {
    q: '¿Qué pasa con los puntos si cancelo?',
    a: 'Tu plan sigue activo hasta el final del periodo que ya pagaste. Los puntos que juntaron tus clientes se quedan guardados en sus cuentas.',
  },
];

function FaqItem({ item, open, onToggle, index }) {
  const reduce = useReducedMotion();
  const id = useId();

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: EASE }}
      className="border-b border-rh-on-light"
    >
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rh-brand-400 md:gap-6 md:py-[26px] lg:py-7"
        >
          <span
            className={`flex-1 font-rh-display text-lg font-bold leading-[1.15] tracking-[-0.01em] transition-[color,transform] duration-300 md:text-[22px] md:leading-[1.1] ${
              open ? 'text-rh-brand-800' : 'text-rh-on-light group-hover:translate-x-1'
            }`}
          >
            {item.q}
          </span>
          {/* El "+" gira hasta volverse "×" y se rellena de ámbar al abrir */}
          <motion.span
            animate={{ rotate: open ? 135 : 0 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 22 }}
            className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
              open ? 'bg-rh-brand-400' : 'group-hover:bg-rh-brand-100'
            }`}
          >
            <img src={iconPlus} alt="" width={40} height={40} className="size-10" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-a`}
            role="region"
            aria-labelledby={`${id}-q`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <motion.p
              initial={reduce ? false : { y: -8 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="max-w-[640px] pb-6 pr-14 font-rh-sans text-base leading-[1.55] text-rh-on-light-muted md:pb-7 md:text-lg md:leading-[1.5]"
            >
              {item.a}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/** 08 · Preguntas: acordeón de preguntas frecuentes (una abierta a la vez). */
export function FaqSection() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(null);

  return (
    <section id="preguntas" className="relative isolate scroll-mt-6 overflow-hidden bg-rh-paper-50">
      {/* Palabra gigante de fondo */}
      <Watermark className="top-[34px] text-[66px] md:top-[50px] md:text-[167px] lg:top-[68px] lg:text-[289px]">
        PREGUNTAS
      </Watermark>

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-20 md:gap-12 md:px-12 md:py-[104px] lg:flex-row lg:items-start lg:gap-20 lg:px-20 lg:py-[136px]">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-rh-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-rh-on-light md:text-[56px] md:leading-none md:tracking-[-0.025em] lg:sticky lg:top-28 lg:w-[400px] lg:shrink-0 lg:text-[72px] lg:leading-[0.98] lg:tracking-[-0.03em]"
        >
          Lo que todos{' '}
          <em className="block font-rh-serif text-[42px] font-normal italic tracking-[-0.02em] text-rh-brand-800 md:inline lg:block lg:text-[76px] md:text-[59px]">
            preguntan.
          </em>
        </motion.h2>

        <ul className="flex min-w-0 flex-1 flex-col">
          {FAQS.map((item, i) => (
            <FaqItem
              key={item.q}
              item={item}
              index={i}
              open={open === i}
              onToggle={() => setOpen((cur) => (cur === i ? null : i))}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
