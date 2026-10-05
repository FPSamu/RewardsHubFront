import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-5">
      <nav
        className={`max-w-4xl mx-auto h-14 px-4 sm:px-5 flex items-center justify-between rounded-full border transition-all duration-300 ${
          scrolled ? 'bg-white/85 backdrop-blur-xl border-white shadow-[0_12px_40px_-12px_rgba(91,45,160,0.25)]' : 'bg-white/55 backdrop-blur-md border-white/70'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/RewardsHub.png"
            alt="RewardsHub"
            className="h-7 w-auto object-contain"
          />
        </Link>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 rounded-full bg-[#EBA626] text-white text-[13px] font-bold hover:bg-[#d99520] transition-all shadow-md shadow-amber-500/25"
          >
            Crear cuenta →
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-900/5 transition-colors"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden max-w-4xl mx-auto mt-2 bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-[0_12px_40px_-12px_rgba(91,45,160,0.25)] px-5 py-4 space-y-3">
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-[14px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 px-5 text-center rounded-full bg-[#EBA626] text-white text-[14px] font-bold"
          >
            Crear cuenta negocio
          </Link>
          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 px-5 text-center rounded-full border border-slate-200 text-slate-700 text-[14px] font-semibold"
          >
            Crear cuenta cliente
          </Link>
        </div>
      )}
    </header>
  );
}
