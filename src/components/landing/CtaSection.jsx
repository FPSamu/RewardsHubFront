import { Link } from 'react-router-dom';
import { Reveal3D, OrganicBlob } from './motionPrimitives';

export function CtaSection() {
  return (
    <section className="py-24 px-5">
      <div className="max-w-3xl mx-auto">
        <Reveal3D
          className="relative overflow-hidden p-12 text-center"
          y={70}
          rotate={20}
          style={{
            borderRadius: '3rem 3rem 3rem 1rem',
            background: 'linear-gradient(135deg, #FF5FA2 0%, #8B5CF6 55%, #38BDF8 100%)',
          }}
        >
          {/* Extra-saturated corner glows for depth */}
          <OrganicBlob color="#FFFFFF" size={260} opacity={0.18} radius="50%" blur={90} duration={13} className="-top-24 -left-24" />
          <OrganicBlob color="#EBA626" size={240} opacity={0.3} radius="50%" blur={90} duration={16} delay={2} className="-bottom-24 -right-20" />

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto bg-white/20 backdrop-blur-md border border-white/40">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className="relative font-display text-white text-[clamp(28px,5vw,46px)] font-extrabold leading-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
            ¿Listo para empezar?
          </h2>
          <p className="relative text-white/80 text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
            Únete a más de 500 negocios que ya fidelizan a sus clientes con RewardsHub. Configura tu programa en minutos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-[15px] transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[.98]"
              style={{ background: '#FFFFFF', color: '#6D28D9', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Crear cuenta negocio
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm text-white font-bold text-[15px] hover:bg-white/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Quiero puntos gratis
            </Link>
          </div>

          <p className="relative text-white/65 text-[12px] mt-6">
            Sin tarjeta de crédito · Configura en menos de 5 minutos
          </p>
        </Reveal3D>
      </div>
    </section>
  );
}
