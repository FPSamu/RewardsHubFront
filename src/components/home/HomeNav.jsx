import { useEffect, useId, useState } from 'react';

import menu40 from '../../assets/landing/icon-menu-40.svg';
import menu44 from '../../assets/landing/icon-menu-44.svg';
import { Logo, RhButton, SIGNUP_BUSINESS, SIGNUP_CLIENT } from './primitives';

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#funciones', label: 'Funciones' },
  { href: '#precios', label: 'Precios' },
  { href: '#preguntas', label: 'Preguntas' },
];

/**
 * Barra pill del hero.
 * Desktop: logo · links · acciones. Tablet: logo · acciones + menú. Móvil: logo + menú.
 */
export function HomeNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="relative z-20 w-full">
      <nav
        aria-label="Principal"
        className="flex w-full items-center justify-between rounded-full border border-rh-on-dark bg-rh-ink-800 py-2 pl-4 pr-2 backdrop-blur-[12px] md:py-2.5 md:pl-5 md:pr-2.5 lg:px-5 lg:py-3"
      >
        <Logo className="shrink-0" />

        <ul className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-rh-sans text-[15px] font-medium leading-none text-rh-on-dark-muted transition-colors hover:text-rh-on-dark"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 lg:gap-4">
          <RhButton to="/login" variant="secondaryDark" compact className="hidden md:inline-flex">
            Soy cliente
          </RhButton>
          <RhButton to={SIGNUP_BUSINESS} className="hidden md:inline-flex">
            Empieza gratis
          </RhButton>
          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
            className="shrink-0 rounded-full transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rh-brand-400 lg:hidden"
          >
            <img src={menu40} alt="" width={40} height={40} className="size-10 md:hidden" />
            <img src={menu44} alt="" width={44} height={44} className="hidden size-11 md:block" />
          </button>
        </div>
      </nav>

      {open && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full mt-3 rounded-[28px] border border-rh-ink-700 bg-rh-ink-900/95 p-3 shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop-blur-[12px] lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3.5 font-rh-sans text-base font-medium text-rh-on-dark transition-colors hover:bg-rh-ink-800"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-col gap-2 border-t border-rh-ink-700 pt-3 md:hidden">
            <RhButton to="/login" variant="secondaryDark" compact>
              Soy cliente
            </RhButton>
            <RhButton to={SIGNUP_CLIENT}>Empieza gratis</RhButton>
          </div>
        </div>
      )}
    </header>
  );
}
