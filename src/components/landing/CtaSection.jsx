import { Link } from 'react-router-dom';

export function CtaSection() {
  return (
    <section className="py-24 px-5" data-aos="fade-up">
      <div className="max-w-3xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(235,166,38,0.12) 0%, rgba(235,166,38,0.04) 50%, rgba(20,14,4,0.8) 100%)',
            border: '1px solid rgba(235,166,38,0.25)',
          }}
        >
          {/* Corner glows */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: '#EBA626' }} />
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: '#EBA626' }} />

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
            style={{ background: 'rgba(235,166,38,0.12)', border: '1px solid rgba(235,166,38,0.25)' }}>
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className="text-white text-[clamp(24px,4vw,38px)] font-extrabold leading-tight mb-4">
            Listo para empezar?
          </h2>
          <p className="text-white/45 text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
            Únete a más de 500 negocios que ya fidelizan a sus clientes con RewardsHub. Configura tu programa en minutos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-[15px] text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[.98]"
              style={{ background: 'linear-gradient(135deg, #EBA626, #d99520)', boxShadow: '0 8px 32px rgba(235,166,38,0.35)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Crear cuenta negocio
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white font-bold text-[15px] hover:bg-white/8 hover:border-white/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Quiero puntos gratis
            </Link>
          </div>

          <p className="text-white/25 text-[12px] mt-6">
            Sin tarjeta de crédito · Configura en menos de 5 minutos
          </p>
        </div>
      </div>
    </section>
  );
}
