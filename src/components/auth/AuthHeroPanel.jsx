import { BrandLogo } from '../ui/BrandLogo';

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EBA626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SmallCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EBA626" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const StoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EBA626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M4 9v11h16V9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

const FEATURE_ICONS = { star: StarIcon, check: SmallCheckIcon, store: StoreIcon };

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AVATAR_COLORS = ['#EBA626', '#C47D10', '#FAE5AD', '#6B3A00'];

const CONTENT = {
  login: {
    title: (
      <>
        Todas tus<br />
        <span className="text-[#EBA626]">recompensas</span>,<br />
        en un solo lugar
      </>
    ),
    description: 'Junta puntos en tus lugares favoritos o haz que tus clientes vuelvan una y otra vez.',
    featureTitle: 'Un solo QR, todas tus recompensas',
    featureDescription: 'Los clientes juntan puntos en cada visita y los canjean en sus lugares favoritos.',
    icon: 'check',
    bullets: null,
  },
  login_cashier: {
    title: (
      <>
        Escanea,<br />
        <span className="text-[#EBA626]">suma puntos</span><br />
        y sigue atendiendo
      </>
    ),
    description: 'Escanea el QR de tus clientes y registra cada compra en segundos.',
    featureTitle: 'Todo listo para atender',
    featureDescription: 'Suma puntos y canjea recompensas sin salir del mostrador.',
    icon: 'store',
    bullets: null,
  },
  signup_client: {
    badge: 'Para clientes',
    title: (
      <>
        Gana puntos en<br />
        tus <span className="text-[#EBA626]">negocios</span><br />
        favoritos
      </>
    ),
    description: 'Acumula puntos con cada visita y canjéalos por recompensas exclusivas en negocios cerca de ti.',
    featureTitle: 'Únete a miles de clientes satisfechos',
    featureDescription: 'Tu código QR único te abre las puertas a increíbles beneficios.',
    avatarLabel: '+15k clientes activos',
    bullets: ['Genera tu código QR único', 'Acumula puntos automáticamente', 'Canjea recompensas exclusivas'],
  },
  signup_business: {
    badge: 'Para negocios',
    title: (
      <>
        Fideliza a tus<br />
        <span className="text-[#EBA626]">clientes</span><br />
        con RewardsHub
      </>
    ),
    description: 'Crea tu programa de puntos personalizado, escanea QR y construye una base de clientes leales.',
    featureTitle: 'Configura en minutos, resultados en días',
    featureDescription: 'Sistema de puntos listo para usar desde el primer escaneo de QR.',
    avatarLabel: '+2k negocios activos',
    bullets: ['Escanea QR de clientes', 'Configura tu sistema de puntos', 'Gestiona tu base de clientes'],
  },
};

export function AuthHeroPanel({ mode = 'login', accountType = 'client', loginMode = 'default' }) {
  const contentKey =
    mode === 'login' ? (loginMode === 'cashier' ? 'login_cashier' : 'login') : `signup_${accountType}`;
  const content = CONTENT[contentKey];
  const FeatureIcon = FEATURE_ICONS[content.icon] || StarIcon;

  return (
    <div className="w-full h-full flex flex-col justify-between p-12 bg-[#0D0B07] relative overflow-hidden">
      {/* Ambient glow top-right */}
      <div
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(235,166,38,0.22) 0%, rgba(235,166,38,0.04) 60%, transparent 80%)' }}
      />
      {/* Ambient glow bottom-left */}
      <div
        className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(235,166,38,0.12) 0%, transparent 70%)' }}
      />
      {/* Geometric grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(rgba(235,166,38,1) 1px, transparent 1px), linear-gradient(90deg, rgba(235,166,38,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top: logo */}
      <div className="relative z-10">
        <BrandLogo theme="light" size="md" />
      </div>

      {/* Center: animated headline — key forces remount → CSS animation */}
      <div key={contentKey} className="relative z-10 flex-1 flex flex-col justify-center py-10 auth-hero-appear">
        {content.badge && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 w-fit"
            style={{ background: 'rgba(235,166,38,0.15)', border: '1px solid rgba(235,166,38,0.3)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#EBA626]" />
            <span className="text-[#EBA626] text-[11px] font-semibold tracking-wide uppercase">
              {content.badge}
            </span>
          </div>
        )}

        <h1 className="text-white text-[40px] leading-[1.15] font-extrabold tracking-tight mb-4">
          {content.title}
        </h1>

        <p className="text-[#7A6A45] text-[14px] leading-relaxed max-w-xs mb-6">
          {content.description}
        </p>

        {content.bullets && (
          <ul className="space-y-2.5">
            {content.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[#EBA626]"
                  style={{ background: 'rgba(235,166,38,0.18)' }}
                >
                  <CheckIcon />
                </span>
                <span className="text-[#C4A96A] text-[13px] font-medium">{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom: feature card */}
      <div
        className="relative z-10 rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(235,166,38,0.18)' }}>
            <FeatureIcon />
          </div>
          <div>
            <p className="text-white text-[13px] font-semibold mb-1">{content.featureTitle}</p>
            <p className="text-[#7A6A45] text-[12px] leading-snug">{content.featureDescription}</p>
          </div>
        </div>
        {content.avatarLabel && (
          <div className="flex items-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {AVATAR_COLORS.map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#0D0B07] flex items-center justify-center text-[10px] font-bold text-[#0D0B07]"
                  style={{ background: color }}
                >
                  {['A', 'B', 'C', 'D'][i]}
                </div>
              ))}
            </div>
            <span className="text-[#7A6A45] text-[12px] font-medium">{content.avatarLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
