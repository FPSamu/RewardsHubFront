import { Reveal3D, StaggerGroup, StaggerItem, OrganicBlob } from './motionPrimitives';

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
    gradient: 'linear-gradient(135deg, #EBA626, #FF5FA2)',
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
    gradient: 'linear-gradient(135deg, #8B5CF6, #38BDF8)',
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
    gradient: 'linear-gradient(135deg, #38BDF8, #34D399)',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-5 relative overflow-hidden">
      <OrganicBlob color="#8B5CF6" size={480} opacity={0.14} radius="50%" blur={120} duration={19} className="top-0 right-1/4" />

      <div className="max-w-5xl mx-auto relative">
        <Reveal3D className="text-center mb-16">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8B5CF6' }}>Proceso</p>
          <h2 className="font-display text-slate-900 text-[clamp(32px,5.5vw,48px)] font-extrabold leading-tight" style={{ letterSpacing: '-0.03em' }}>
            Así de simple
          </h2>
          <p className="text-slate-500 text-[15px] mt-3">Tres pasos para transformar visitas en clientes fieles</p>
        </Reveal3D>

        {/* Connected flow */}
        <div className="relative">
          {/* Connecting gradient line (desktop) with a traveling pulse */}
          <div className="hidden md:block absolute top-9 left-[16.6%] right-[16.6%] h-[3px] rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(90deg, #EBA626, #8B5CF6, #34D399)' }}>
            <div className="absolute top-0 h-full w-10 bg-white/80 rounded-full" style={{ animation: 'travelDot 3.5s ease-in-out infinite' }} />
          </div>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.15}>
            {STEPS.map((step, i) => (
              <StaggerItem
                key={i}
                className="relative flex flex-col items-center text-center"
                y={64}
                rotate={18}
              >
                {/* Node */}
                <div className="relative mb-5 z-10">
                  <div
                    className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ background: step.gradient, boxShadow: '0 16px 32px -12px rgba(91,45,160,0.35)' }}
                  >
                    {step.icon}
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full border-2 border-[#FAFAFA] bg-white flex items-center justify-center text-[10px] font-black text-slate-700 shadow-sm"
                  >
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-slate-900 text-[16px] font-bold mb-2 leading-tight">{step.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed max-w-[240px]">{step.description}</p>

                {/* Connector arrow (mobile) */}
                {i < STEPS.length - 1 && (
                  <div className="md:hidden mt-5 text-slate-300">
                    <svg className="w-5 h-5 mx-auto rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
