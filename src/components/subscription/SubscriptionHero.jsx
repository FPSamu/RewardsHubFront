export function SubscriptionHero({ hasLifetimeAccess }) {
  return (
    <div className="text-center mb-14 px-5">
      {hasLifetimeAccess ? (
        <>
          {/* Special lifetime badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-[11px] font-semibold tracking-wide">Oferta exclusiva desbloqueada</span>
          </div>
          <h1 className="text-white text-[clamp(28px,5vw,48px)] font-extrabold leading-tight mb-4">
            Tienes acceso a algo<br />
            <span style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              muy especial
            </span>
          </h1>
          <p className="text-white/45 text-[15px] max-w-lg mx-auto leading-relaxed">
            Has desbloqueado acceso de por vida a RewardsHub Business.
            Sin pagos mensuales, sin contratos. Para siempre.
          </p>
        </>
      ) : (
        <>
          <p className="text-amber-400/70 text-[11px] font-bold uppercase tracking-widest mb-3">Suscripción</p>
          <h1 className="text-white text-[clamp(28px,5vw,48px)] font-extrabold leading-tight mb-4">
            Elige tu plan
          </h1>
          <p className="text-white/45 text-[15px] max-w-lg mx-auto leading-relaxed">
            Activa tu cuenta de negocio y comienza a fidelizar clientes.
            Sin contratos ocultos. Cancela cuando quieras.
          </p>
        </>
      )}
    </div>
  );
}
