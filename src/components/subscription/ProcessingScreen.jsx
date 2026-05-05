export function ProcessingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5"
      style={{ background: '#0D0A05' }}>
      <div className="text-center max-w-sm">
        {/* Animated ring */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full opacity-20 animate-ping"
            style={{ background: '#EBA626' }} />
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <h2 className="text-white text-[22px] font-extrabold mb-2">Verificando tu pago</h2>
        <p className="text-white/40 text-[14px] leading-relaxed">
          Estamos confirmando tu suscripción con Stripe.
          <br />Esto solo toma un momento.
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
