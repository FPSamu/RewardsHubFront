import { Link } from 'react-router-dom';

const MONTHLY_FEATURES = [
  'Acceso completo a la plataforma',
  'Gestión ilimitada de clientes',
  'Creación de recompensas personalizadas',
  'Sistema de puntos y sellos',
  'Escaneo de códigos QR',
  'Reportes de ventas y puntos',
  'Soporte por email',
];

const ANNUAL_EXTRAS = [
  'Todo lo del plan mensual',
  'Ahorra $1,188 al año vs mensual',
  'Soporte prioritario 24/7',
  'Actualizaciones premium anticipadas',
];

function CheckIcon({ color }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.15" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PricingSection() {
  return (
    <section className="py-24 px-5 relative" data-aos="fade-up">
      {/* bg glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[120px] opacity-6"
        style={{ background: 'radial-gradient(circle, #EBA626 0%, transparent 70%)' }} />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-amber-400/70 text-[11px] font-bold uppercase tracking-widest mb-3">Precios</p>
          <h2 className="text-white text-[clamp(28px,5vw,42px)] font-extrabold leading-tight mb-3">
            Planes para tu negocio
          </h2>
          <p className="text-white/40 text-[15px]">Sin contratos ocultos. Cancela cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">

          {/* Monthly */}
          <div
            className="relative rounded-3xl border p-8 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-1">Mensual</p>
            <p className="text-white/35 text-[13px] mb-5">Empieza sin compromiso</p>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-white text-[44px] font-extrabold leading-none">$399</span>
              <span className="text-white/35 text-[14px]">.00 / mes</span>
            </div>
            <p className="text-white/25 text-[11px] mb-7">Facturado mensualmente</p>

            <ul className="space-y-3 mb-8 flex-1">
              {MONTHLY_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-white/60">
                  <CheckIcon color="#9ca3af" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="w-full py-3 rounded-full border border-white/20 text-white text-[14px] font-bold text-center hover:bg-white/8 transition-all"
            >
              Comenzar ahora
            </Link>
          </div>

          {/* Annual — highlighted */}
          <div
            className="relative rounded-3xl border p-8 flex flex-col"
            style={{ background: 'rgba(235,166,38,0.06)', borderColor: 'rgba(235,166,38,0.3)' }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {/* Best value badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                style={{ background: 'linear-gradient(135deg, #EBA626, #FFD876)' }}>
                Mejor valor
              </span>
            </div>

            {/* Corner glow */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: '#EBA626' }} />

            <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-1">Anual</p>
            <p className="text-white/35 text-[13px] mb-5">El más popular entre negocios</p>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-white text-[44px] font-extrabold leading-none">$299</span>
              <span className="text-white/35 text-[14px]">.99 / mes</span>
            </div>
            <p className="text-amber-400/60 text-[11px] mb-7">≈ $3,599.88 / año · ahorras $1,188</p>

            <ul className="space-y-3 mb-8 flex-1">
              {ANNUAL_EXTRAS.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-white/70">
                  <CheckIcon color="#EBA626" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="w-full py-3 rounded-full text-white text-[14px] font-bold text-center transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #EBA626, #d99520)' }}
            >
              Empezar plan anual
            </Link>
          </div>
        </div>

        {/* Free client note */}
        <div className="mt-10 text-center">
          <p className="text-white/30 text-[13px]">
            ¿Solo quieres acumular puntos?{' '}
            <Link to="/signup" className="text-amber-400/80 hover:text-amber-400 font-semibold transition-colors">
              La cuenta de cliente es completamente gratis →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
