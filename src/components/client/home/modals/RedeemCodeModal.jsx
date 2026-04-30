export function RedeemCodeModal({ isOpen, onClose, code, onCodeChange, onSubmit, status, result, error }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px]"
        onClick={status !== 'loading' ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative bg-surface rounded-2xl shadow-lg w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-brand-primary px-6 py-5 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Canjear Código</h2>
          <p className="text-white/75 text-xs mt-0.5">Ingresa el código de tu ticket</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-accent-successBg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-950 mb-1">¡Puntos Canjeados!</h3>
              <p className="text-neutral-600 text-sm mb-5">
                Recibiste{' '}
                <span className="font-bold text-brand-primary">+{result?.pointsAdded} puntos</span>
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide text-center mb-2">
                  Código del Ticket
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 text-center text-2xl font-mono tracking-widest border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary uppercase placeholder:text-neutral-300 transition-all"
                  placeholder="XXX-XXX"
                  maxLength={10}
                  disabled={status === 'loading'}
                  autoFocus
                />
              </div>

              {status === 'error' && (
                <div className="bg-accent-dangerBg text-accent-danger px-3 py-2.5 rounded-xl text-sm text-center border border-accent-dangerBorder flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !code}
                className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-hover active:bg-brand-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : 'Canjear Puntos'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
