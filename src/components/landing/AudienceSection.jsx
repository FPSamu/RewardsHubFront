import { Link } from 'react-router-dom';
import { Reveal3D, StaggerGroup, StaggerItem, OrganicBlob } from './motionPrimitives';

const BUSINESS_FEATURES = [
  { icon: '📊', text: 'Dashboard de administración en tiempo real' },
  { icon: '🎁', text: 'Crea recompensas personalizadas de puntos o sellos' },
  { icon: '📍', text: 'Visibilidad en el mapa para nuevos clientes' },
  { icon: '📋', text: 'Reportes de ventas vs puntos otorgados' },
  { icon: '🔖', text: 'Membresías y beneficios exclusivos' },
];

const CLIENT_FEATURES = [
  { icon: '⭐', text: 'Acumula puntos en tus negocios favoritos' },
  { icon: '🎁', text: 'Canjea recompensas cuando quieras' },
  { icon: '📍', text: 'Descubre negocios con recompensas cerca de ti' },
  { icon: '📱', text: 'Código QR personal — solo muéstralo en caja' },
  { icon: '🏆', text: 'Membresías con beneficios diarios' },
];

function AudienceCard({ type, title, subtitle, features, cta, ctaTo, accentBar, iconBg, iconColor, ctaStyle, cornerRadius }) {
  return (
    <div
      className="relative overflow-hidden border border-white bg-white/70 backdrop-blur-xl p-8 flex flex-col group hover:-translate-y-1 transition-all duration-300 shadow-[0_20px_60px_-25px_rgba(91,45,160,0.3)]"
      style={{ borderRadius: cornerRadius }}
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: accentBar }} />

      {/* Badge */}
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-5 self-start"
        style={{ background: iconBg, color: iconColor }}
      >
        {type === 'business' ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
        {title}
      </span>

      <h3 className="font-display text-slate-900 text-[28px] font-extrabold leading-tight mb-2" style={{ letterSpacing: '-0.02em' }}>{subtitle}</h3>
      <p className="text-slate-500 text-[13px] mb-6 leading-relaxed">
        {type === 'business'
          ? 'Crea tu programa de fidelización, gestiona clientes y genera reportes — todo desde un panel de control moderno.'
          : 'Acumula puntos con cada compra, descubre negocios cerca de ti y canjea recompensas exclusivas.'}
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-[13px] text-slate-600">
            <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[13px]"
              style={{ background: iconBg }}>{f.icon}</span>
            {f.text}
          </li>
        ))}
      </ul>

      <Link
        to={ctaTo}
        className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold text-[14px] transition-all hover:gap-3 group/btn"
        style={ctaStyle}
      >
        {cta}
        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
}

export function AudienceSection() {
  return (
    <section className="py-24 px-5 relative overflow-hidden">
      <OrganicBlob color="#38BDF8" size={460} opacity={0.18} radius="50%" blur={120} duration={20} className="top-1/3 -left-32" />
      <OrganicBlob color="#FF5FA2" size={380} opacity={0.15} radius="50%" blur={110} duration={24} delay={3} className="bottom-0 -right-24" />

      <div className="max-w-5xl mx-auto relative">

        {/* Heading */}
        <Reveal3D className="text-center mb-14 max-w-xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8B5CF6' }}>Para todos</p>
          <h2 className="font-display text-slate-900 text-[clamp(32px,5.5vw,48px)] font-extrabold leading-[1.05] mb-4" style={{ letterSpacing: '-0.03em' }}>
            Una plataforma,<br />dos mundos
          </h2>
          <p className="text-slate-500 text-[15px]">
            Diseñada para conectar negocios con sus clientes más valiosos
          </p>
        </Reveal3D>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-5" stagger={0.18}>
          <StaggerItem axis="y" rotate={-16}>
            <AudienceCard
              type="business"
              title="Para negocios"
              subtitle="Fideliza a tus clientes"
              features={BUSINESS_FEATURES}
              cta="Crear cuenta negocio"
              ctaTo="/signup"
              accentBar="linear-gradient(90deg, #EBA626, #FF5FA2)"
              iconBg="rgba(235,166,38,0.12)"
              iconColor="#C47D10"
              ctaStyle={{ background: '#EBA626', color: '#fff' }}
              cornerRadius="2.5rem 2.5rem 2.5rem 0.75rem"
            />
          </StaggerItem>
          <StaggerItem axis="y" rotate={16}>
            <AudienceCard
              type="client"
              title="Para clientes"
              subtitle="Gana en cada visita"
              features={CLIENT_FEATURES}
              cta="Crear cuenta gratis"
              ctaTo="/signup"
              accentBar="linear-gradient(90deg, #38BDF8, #8B5CF6)"
              iconBg="rgba(139,92,246,0.12)"
              iconColor="#6D28D9"
              ctaStyle={{ background: 'rgba(139,92,246,0.12)', color: '#6D28D9', border: '1px solid rgba(139,92,246,0.3)' }}
              cornerRadius="2.5rem 2.5rem 0.75rem 2.5rem"
            />
          </StaggerItem>
        </StaggerGroup>

        {/* Free client note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-[12px] text-center px-4 flex-wrap">
          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8B5CF6' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Las cuentas de cliente son <span className="text-slate-600 font-semibold">completamente gratuitas</span> — siempre</span>
        </div>
      </div>
    </section>
  );
}
