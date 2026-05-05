const TRUST_ITEMS = [
  { icon: '🔒', text: 'Pago seguro con Stripe' },
  { icon: '✕', text: 'Cancela en cualquier momento' },
  { icon: '⚡', text: 'Acceso inmediato tras el pago' },
  { icon: '💬', text: 'Soporte técnico incluido' },
];

export function TrustBar() {
  return (
    <div className="mt-14 px-5">
      <div className="max-w-3xl mx-auto">
        {/* Stripe badge */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 bg-white/8" />
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(99,91,255,0.18)', border: '1px solid rgba(99,91,255,0.45)' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1z" fill="rgba(99,91,255,0.5)" stroke="#8b83ff" strokeWidth="1.5" />
            </svg>
            <span className="text-[13px] font-bold" style={{ color: '#a5a0ff' }}>stripe</span>
            <span className="text-white/55 text-[12px]">· Pago 100% seguro</span>
          </div>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {/* Trust items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 text-center p-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-[18px]">{item.icon}</span>
              <span className="text-white/40 text-[11px] leading-snug">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
