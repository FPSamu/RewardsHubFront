function CheckIcon({ variant }) {
  const color =
    variant === 'lifetime' ? '#d8b4fe'
    : variant === 'yearly'  ? '#EBA626'
    : '#6b7280';
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.15" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Monthly ────────────────────────────────────────────────────────────────────
function MonthlyCard({ plan, onSubscribe, loading }) {
  return (
    <div
      className="relative rounded-3xl border p-8 flex flex-col"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-1">Mensual</p>
      <p className="text-white/30 text-[13px] mb-5">Empieza sin compromiso</p>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-white text-[46px] font-extrabold leading-none">$399</span>
        <span className="text-white/30 text-[14px] ml-1">.00</span>
        <span className="text-white/30 text-[13px] ml-1">/ mes</span>
      </div>
      <p className="text-white/20 text-[11px] mb-7">Facturado mensualmente · MXN</p>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5 text-[13px] text-white/55">
            <CheckIcon variant="monthly" />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(plan)}
        disabled={loading}
        className="w-full py-3.5 rounded-full border border-white/20 text-white text-[14px] font-bold hover:bg-white/8 hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Spinner /> : 'Comenzar ahora'}
      </button>
    </div>
  );
}

// ── Yearly ─────────────────────────────────────────────────────────────────────
function YearlyCard({ plan, onSubscribe, loading }) {
  return (
    <div
      className="relative rounded-3xl border p-8 flex flex-col"
      style={{ background: 'rgba(235,166,38,0.06)', borderColor: 'rgba(235,166,38,0.3)' }}
    >
      {/* Best value badge */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
          style={{ background: 'linear-gradient(135deg, #EBA626, #FFD876)' }}>
          Mejor valor · ahorra $1,188
        </span>
      </div>

      {/* Corner glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-20"
        style={{ background: '#EBA626' }} />

      <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-1">Anual</p>
      <p className="text-white/30 text-[13px] mb-5">El más popular entre negocios</p>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-white text-[46px] font-extrabold leading-none">$299</span>
        <span className="text-white/30 text-[14px] ml-1">.99</span>
        <span className="text-white/30 text-[13px] ml-1">/ mes</span>
      </div>
      <p className="text-amber-400/60 text-[11px] mb-7">≈ $3,599 / año · MXN</p>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5 text-[13px] text-white/70">
            <CheckIcon variant="yearly" />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(plan)}
        disabled={loading}
        className="w-full py-3.5 rounded-full text-white text-[14px] font-bold transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #EBA626, #d99520)' }}
      >
        {loading ? <Spinner /> : 'Empezar plan anual'}
      </button>
    </div>
  );
}

// ── Lifetime ───────────────────────────────────────────────────────────────────
function LifetimeCard({ plan, onSubscribe, loading }) {
  return (
    <div
      className="relative rounded-3xl p-[2px] md:col-span-2"
      style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)' }}
    >
      {/* Inner card */}
      <div className="relative rounded-[22px] p-8 flex flex-col h-full overflow-hidden"
        style={{ background: '#110b1a' }}>

        {/* Glowing orb background */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />

        {/* Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white"
              style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)' }}>
              <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Miembro Fundador
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white"
              style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Exclusivo
            </span>
          </div>
          <span className="text-white/25 text-[11px] line-through">Valor: $54,000 MXN</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Left: price + description */}
          <div className="flex-1">
            <p className="text-white/60 text-[13px] mb-2">Plan Lifetime</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-white text-[56px] font-extrabold leading-none"
                style={{
                  background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #fb923c 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                GRATIS
              </span>
            </div>
            <p className="text-purple-300/70 text-[13px] mb-6">Para siempre · Sin pagos futuros</p>

            <p className="text-white/40 text-[13px] leading-relaxed max-w-sm">
              Un pago único de <strong className="text-white/70">$0</strong> — acceso completo de por vida a todas las funcionalidades, actualizaciones futuras y soporte prioritario VIP.
            </p>
          </div>

          {/* Right: features */}
          <div className="flex-1">
            <ul className="space-y-3 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-purple-200/70">
                  <CheckIcon variant="lifetime" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSubscribe(plan)}
              disabled={loading}
              className="w-full py-4 rounded-full text-white text-[15px] font-bold transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)',
                boxShadow: '0 8px 32px rgba(168,85,247,0.4)',
              }}
            >
              {loading ? <Spinner /> : '✨ Activar acceso lifetime'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Spinner helper ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      Procesando...
    </span>
  );
}

// ── Public export ──────────────────────────────────────────────────────────────
export function PlanCard({ plan, onSubscribe, loading }) {
  if (plan.id === 'lifetime_access') {
    return <LifetimeCard plan={plan} onSubscribe={onSubscribe} loading={loading} />;
  }
  if (plan.id === 'yearly') {
    return <YearlyCard plan={plan} onSubscribe={onSubscribe} loading={loading} />;
  }
  return <MonthlyCard plan={plan} onSubscribe={onSubscribe} loading={loading} />;
}
