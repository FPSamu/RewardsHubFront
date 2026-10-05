import { Link } from 'react-router-dom';
import { Reveal3D, StaggerGroup, StaggerItem, OrganicBlob } from './motionPrimitives';

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
    <section className="py-24 px-5 relative overflow-hidden">
      <OrganicBlob color="#FF5FA2" size={600} opacity={0.14} radius="50%" blur={130} duration={20} className="-bottom-52 left-1/2 -translate-x-1/2" />

      <div className="max-w-5xl mx-auto relative">
        <Reveal3D className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#D6368F' }}>Precios</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 text-[12px] font-bold tracking-wide">30 días gratis · $0 hoy</span>
          </div>
          <h2 className="font-display text-slate-900 text-[clamp(32px,5.5vw,48px)] font-extrabold leading-tight mb-3" style={{ letterSpacing: '-0.03em' }}>
            Planes para tu negocio
          </h2>
          <p className="text-slate-500 text-[15px]">Primer mes gratis. Sin contratos ocultos. Cancela cuando quieras.</p>
        </Reveal3D>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto" stagger={0.16}>

          {/* Monthly */}
          <StaggerItem
            className="relative border border-white bg-white/70 backdrop-blur-xl p-8 flex flex-col shadow-[0_20px_60px_-25px_rgba(91,45,160,0.25)]"
            style={{ borderRadius: '2.5rem 2.5rem 2.5rem 0.75rem' }}
            axis="y"
            rotate={-14}
          >
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1">Mensual</p>
            <p className="text-slate-400 text-[13px] mb-5">Empieza sin compromiso</p>

            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-5"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <span className="text-[18px] flex-shrink-0">🎁</span>
              <div className="min-w-0">
                <p className="text-emerald-700 text-[12.5px] font-extrabold leading-tight">Gratis tu primer mes</p>
                <p className="text-emerald-600/70 text-[11px] leading-tight">$0.00 hoy — cancela cuando quieras</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-display text-slate-900 text-[44px] font-extrabold leading-none tabular-nums">$399</span>
              <span className="text-slate-400 text-[14px]">.00 / mes</span>
            </div>
            <p className="text-slate-400 text-[11px] mb-7">A partir del segundo mes</p>

            <ul className="space-y-3 mb-8 flex-1">
              {MONTHLY_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-slate-600">
                  <CheckIcon color="#94a3b8" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="w-full py-3 rounded-full border border-slate-200 text-slate-700 text-[14px] font-bold text-center hover:bg-slate-50 transition-all"
            >
              Empezar mes gratis
            </Link>
          </StaggerItem>

          {/* Annual — highlighted */}
          <StaggerItem
            className="relative border border-white p-8 flex flex-col shadow-[0_24px_70px_-20px_rgba(91,45,160,0.35)]"
            style={{ borderRadius: '2.5rem 2.5rem 0.75rem 2.5rem', background: 'linear-gradient(165deg, rgba(255,95,162,0.1), rgba(139,92,246,0.1))' }}
            axis="y"
            rotate={14}
          >
            {/* Best value badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                style={{ background: 'linear-gradient(135deg, #FF5FA2, #8B5CF6)' }}>
                Mejor valor
              </span>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9333EA' }}>Anual</p>
            <p className="text-slate-500 text-[13px] mb-5">El más popular entre negocios</p>

            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-5"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <span className="text-[18px] flex-shrink-0">🎁</span>
              <div className="min-w-0">
                <p className="text-emerald-700 text-[12.5px] font-extrabold leading-tight">Gratis tu primer mes</p>
                <p className="text-emerald-600/70 text-[11px] leading-tight">$0.00 hoy — cancela cuando quieras</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-display text-slate-900 text-[44px] font-extrabold leading-none tabular-nums">$299</span>
              <span className="text-slate-500 text-[14px]">.99 / mes</span>
            </div>
            <p className="text-[11px] mb-7" style={{ color: '#9333EA' }}>A partir del segundo mes · ≈ $3,599.88 / año</p>

            <ul className="space-y-3 mb-8 flex-1">
              {ANNUAL_EXTRAS.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-slate-700">
                  <CheckIcon color="#8B5CF6" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="w-full py-3 rounded-full text-white text-[14px] font-bold text-center transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FF5FA2, #8B5CF6)' }}
            >
              Empezar mes gratis
            </Link>
          </StaggerItem>
        </StaggerGroup>

        {/* Free client note */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-[13px]">
            ¿Solo quieres acumular puntos?{' '}
            <Link to="/signup" className="font-semibold transition-colors" style={{ color: '#9333EA' }}>
              La cuenta de cliente es completamente gratis →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
