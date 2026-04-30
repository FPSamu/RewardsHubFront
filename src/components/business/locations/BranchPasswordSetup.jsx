import { useState } from 'react';
import businessService from '../../../services/businessService';
import * as adminPinService from '../../../services/adminPinService';

const parseError = (err) =>
  typeof err === 'string' ? err : err?.message ?? err?.error ?? 'Error al guardar la contraseña';

function FeatureItem({ children }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-[13px] text-neutral-600 leading-snug">{children}</span>
    </li>
  );
}

export function BranchPasswordSetup({ onDone }) {
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [pin,       setPin]       = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const mismatch   = confirm.length > 0 && confirm !== password;
  const tooShort   = password.length > 0 && password.length < 6;
  const canSubmit  = password.length >= 6 && password === confirm && pin.length >= 4;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      // Verify PIN first to get the admin token, then set branch password
      if (!adminPinService.hasToken()) {
        await adminPinService.verifyPin(pin);
      }
      await businessService.setBranchPassword(password);
      onDone();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <div className="w-full max-w-md space-y-5">

        {/* Icon + heading */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[20px] font-extrabold text-neutral-900">Contraseña de sucursal</h1>
            <p className="text-[13px] text-neutral-400 mt-1">
              Configúrala una vez — la usarás en todas tus sucursales
            </p>
          </div>
        </div>

        {/* Explanation card */}
        <div className="bg-surface rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="text-[14px] font-bold text-neutral-800">¿Para qué sirve?</h2>
          </div>
          <div className="px-5 py-4">
            <ul className="space-y-2.5">
              <FeatureItem>
                Tu personal de caja la usa para iniciar sesión en el escáner de RewardsHub sin necesitar acceso a tu correo.
              </FeatureItem>
              <FeatureItem>
                Es una contraseña separada de tu cuenta principal, diseñada para uso operativo diario.
              </FeatureItem>
              <FeatureItem>
                Puedes cambiarla desde configuración en cualquier momento.
              </FeatureItem>
            </ul>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-surface rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="text-[14px] font-bold text-neutral-800">Establecer contraseña</h2>
            <p className="text-[12px] text-neutral-400 mt-0.5">Mínimo 6 caracteres</p>
          </div>
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all ${
                    tooShort ? 'border-accent-danger' : 'border-neutral-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPwd ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {tooShort && (
                <p className="mt-1.5 text-[12px] text-accent-danger">Mínimo 6 caracteres</p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                className={`w-full px-3 py-2.5 rounded-lg border text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all ${
                  mismatch ? 'border-accent-danger' : 'border-neutral-200'
                }`}
              />
              {mismatch && (
                <p className="mt-1.5 text-[12px] text-accent-danger">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Admin PIN */}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                PIN de administrador
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                placeholder="Tu PIN de admin"
                autoComplete="off"
                inputMode="numeric"
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all tracking-widest"
              />
              <p className="mt-1.5 text-[11px] text-neutral-400">
                Requerido para confirmar cambios de seguridad
              </p>
            </div>

            {error && (
              <p className="text-[12px] text-accent-danger font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving || !canSubmit}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-pill bg-brand-primary text-brand-onColor text-[14px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Guardando…
                </>
              ) : 'Establecer contraseña'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
