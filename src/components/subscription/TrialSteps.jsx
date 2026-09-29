const STEPS = [
  {
    n: '1',
    icon: '🔓',
    title: 'Acceso completo hoy',
    text: 'Activa tu cuenta con tu tarjeta — no se te cobra nada en este momento.',
  },
  {
    n: '2',
    icon: '🚀',
    title: '30 días para probar',
    text: 'Recompensas, puntos y sellos, escaneo QR, reportes — todo incluido, sin límites.',
  },
  {
    n: '3',
    icon: '💳',
    title: 'Tú decides',
    text: 'Cancela antes de que termine el mes y no pagas nada. Si no, tu plan se activa solo.',
  },
];

export function TrialSteps() {
  return (
    <div className="mb-14 px-5">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="pointer-events-none absolute -right-3 -top-5 text-[64px] font-black leading-none text-white/[0.04] select-none">
              {s.n}
            </span>
            <div className="relative flex items-center gap-2.5 mb-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black text-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #34d399, #EBA626)' }}
              >
                {s.n}
              </div>
              <span className="text-[18px]">{s.icon}</span>
            </div>
            <p className="relative text-white text-[14px] font-bold mb-1.5">{s.title}</p>
            <p className="relative text-white/40 text-[12px] leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
