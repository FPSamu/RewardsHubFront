import { Link } from 'react-router-dom';

import rMark from '../../assets/landing/r-mark.svg';
import iconQr from '../../assets/landing/icon-qr.svg';
import arrowInk from '../../assets/landing/icon-arrow-right-ink.svg';
import arrowLight from '../../assets/landing/icon-arrow-right-light.svg';
import arrowAmber from '../../assets/landing/icon-arrow-right-amber.svg';

/** Rutas de registro según el tipo de cuenta (AuthPage lee ?tipo=). */
export const SIGNUP_CLIENT = '/signup?tipo=cliente';
export const SIGNUP_BUSINESS = '/signup?tipo=negocio';

/** Logotipo oficial: la R con estrella sustituye la primera letra. */
export function Logo({ className = '' }) {
  return (
    <Link to="/" aria-label="RewardsHub, inicio" className={`flex items-end gap-px ${className}`}>
      <img src={rMark} alt="" width={31} height={28} className="h-7 w-[31px]" />
      <span className="font-rh-logo text-2xl font-bold leading-[26px] tracking-[-0.01em] text-rh-brand-400">
        ewardsHub
      </span>
    </Link>
  );
}

const BUTTON_VARIANTS = {
  primary: { box: 'bg-rh-brand-400 text-rh-ink-950 hover:shadow-[0_0_24px_rgba(255,183,51,0.45)]', arrow: arrowInk },
  secondaryDark: { box: 'border-[1.5px] border-rh-on-dark text-rh-on-dark hover:bg-rh-on-dark/10', arrow: arrowLight },
  dark: { box: 'bg-rh-ink-950 text-rh-paper-50 hover:shadow-[0_0_24px_rgba(19,17,10,0.35)]', arrow: arrowLight },
  ghostLight: { box: 'border-[1.5px] border-rh-on-light text-rh-on-light hover:bg-rh-on-light/5', arrow: arrowInk },
};

/**
 * Botón pill de la landing. Hover: escala 1.03 + glow; press: 0.97.
 * `compact` usa el padding vertical de 16px de la barra de navegación.
 */
export function RhButton({ to, children, variant = 'primary', arrow = false, compact = false, className = '', ...rest }) {
  const v = BUTTON_VARIANTS[variant];
  // Anclas y enlaces externos van con <a>; rutas de la app con <Link>.
  const external = /^https?:/.test(to);
  const Tag = to.startsWith('#') || external ? 'a' : Link;
  const target = to.startsWith('#') ? { href: to } : external ? { href: to, target: '_blank', rel: 'noopener noreferrer' } : { to };
  return (
    <Tag
      {...target}
      className={`group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-[26px] ${compact ? 'py-4' : 'py-[18px]'} font-rh-sans text-base font-semibold leading-none tracking-[-0.006em] transition-[transform,box-shadow,background-color] duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rh-brand-400 ${v.box} ${className}`}
      {...rest}
    >
      {children}
      {arrow && (
        <img src={v.arrow} alt="" width={20} height={20} className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </Tag>
  );
}

/**
 * Acceso rápido para clientes finales, arriba del H1.
 * Default (tablet/desktop): texto largo + botón con texto. Compact (móvil): botón solo con flecha.
 */
export function ClientAccess({ className = '' }) {
  return (
    <Link
      to={SIGNUP_CLIENT}
      className={`group flex items-center gap-3.5 rounded-full border-2 border-rh-brand-400 bg-rh-brand-200 p-2 drop-shadow-[0_0_16px_rgba(255,184,51,0.35)] transition-[filter] duration-300 hover:drop-shadow-[0_0_26px_rgba(255,184,51,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rh-brand-400 ${className}`}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rh-ink-950">
        <img src={iconQr} alt="" width={22} height={22} className="size-[22px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 md:flex-none">
        <span className="font-rh-mono text-xs font-medium leading-[1.2] tracking-[0.06em] text-rh-brand-800">
          ¿ERES CLIENTE?
        </span>
        <span className="font-rh-sans text-base font-semibold leading-none tracking-[-0.001em] text-rh-on-light">
          <span className="md:hidden">Crea tu cuenta gratis</span>
          <span className="hidden whitespace-nowrap md:inline">Junta puntos en tus lugares favoritos</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 rounded-full bg-rh-ink-950 p-[13px] md:py-[13px] md:pl-5 md:pr-[18px]">
        <span className="hidden whitespace-nowrap font-rh-sans text-base font-semibold leading-none tracking-[-0.001em] text-rh-brand-400 md:inline">
          Crear cuenta gratis
        </span>
        <img src={arrowAmber} alt="" width={18} height={18} className="size-[18px] transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
