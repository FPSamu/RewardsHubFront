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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0D0A05]/90 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/RewardsHub.png"
            alt="RewardsHub"
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-[13px] font-semibold text-white/70 hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 rounded-full bg-[#EBA626] text-white text-[13px] font-bold hover:bg-[#d99520] transition-all shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50"
          >
            Crear cuenta
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl text-white/80 hover:bg-white/10 transition-colors"
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
        <div className="sm:hidden bg-[#0D0A05]/95 backdrop-blur-xl border-t border-white/10 px-5 py-4 space-y-3">
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-[14px] font-semibold text-white/70 hover:text-white transition-colors"
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
            className="block py-2.5 px-5 text-center rounded-full border border-white/20 text-white text-[14px] font-semibold"
          >
            Crear cuenta cliente
          </Link>
        </div>
      )}
    </header>
  );
}
