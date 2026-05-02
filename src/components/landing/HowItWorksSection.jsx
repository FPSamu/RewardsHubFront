const STEPS = [
  {
    n: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5a.5.5 0 11-1 0 .5.5 0 011 0zm-1-8.5a.5.5 0 11-1 0 .5.5 0 011 0zM4.5 7.5A.5.5 0 114 7.5a.5.5 0 01.5 0zm0 8a.5.5 0 11-1 0 .5.5 0 011 0z" />
      </svg>
    ),
    title: 'El negocio configura su programa',
    description: 'En minutos, el negocio crea su sistema de puntos o sellos, define las recompensas y activa su perfil en el mapa.',
    color: '#EBA626',
    bg: 'rgba(235,166,38,0.1)',
  },
  {
    n: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'El cliente escanea su QR',
    description: 'Con su código QR personal, el cliente escanea en caja y acumula puntos o sellos automáticamente en cada visita.',
    color: '#22A06B',
    bg: 'rgba(34,160,107,0.1)',
  },
  {
    n: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    title: 'Canjea sus recompensas',
    description: 'Cuando acumula suficientes puntos, el cliente canjea la recompensa directamente en el negocio. Simple y sin complicaciones.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.1)',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-5 relative overflow-hidden" data-aos="fade-up">
      {/* Background accent */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-5"
        style={{ background: 'radial-gradient(circle, #EBA626 0%, transparent 70%)' }} />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-amber-400/70 text-[11px] font-bold uppercase tracking-widest mb-3">Proceso</p>
          <h2 className="text-white text-[clamp(28px,5vw,42px)] font-extrabold leading-tight">
            Así de simple
          </h2>
          <p className="text-white/40 text-[15px] mt-3">Tres pasos para transformar visitas en clientes fieles</p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)' }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center"
                data-aos="fade-up"
                data-aos-delay={i * 120}
              >
                {/* Number badge */}
                <div className="relative mb-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-0 relative z-10"
                    style={{ background: step.bg, color: step.color, border: `1px solid ${step.color}30` }}
                  >
                    {step.icon}
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-[#0D0A05] flex items-center justify-center text-[10px] font-black"
                    style={{ background: step.color, color: '#fff' }}
                  >
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-white text-[16px] font-bold mb-2 leading-tight">{step.title}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed max-w-[240px]">{step.description}</p>

                {/* Connector arrow (mobile) */}
                {i < STEPS.length - 1 && (
                  <div className="md:hidden mt-5 text-white/20">
                    <svg className="w-5 h-5 mx-auto rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
