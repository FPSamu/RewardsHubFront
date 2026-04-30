import { useState } from 'react';
import api from '../services/api';
import * as adminPinService from '../services/adminPinService';
import authService from '../services/authService';
import { censorEmail } from '../utils/format';

/**
 * Modal that asks for the admin PIN before any write operation.
 * If the PIN is temporary, shows a change-PIN form inline before proceeding.
 *
 * Props:
 *   onSuccess — called after PIN is verified (and changed if temporary)
 *   onClose   — called when the user dismisses the modal
 */
export default function AdminPinModal({ onSuccess, onClose }) {
  const [step, setStep] = useState('verify'); // 'verify' | 'change' | 'reset' | 'reset-sent'
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await adminPinService.verifyPin(pin.trim());
      if (result.isTemporary) {
        setStep('change');
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'PIN incorrecto');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userEmail = authService.getCurrentUser()?.email ?? '';
      await api.post('/business/admin-pin/reset', {});
      setEmail(userEmail);
      setStep('reset-sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (newPin.length < 6) {
      setError('El nuevo PIN debe tener al menos 6 caracteres');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Los PINs no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await adminPinService.changePin(pin.trim(), newPin);
      // Re-verify with new PIN to get a fresh adminToken
      await adminPinService.verifyPin(newPin);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar el PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl shadow-popover max-w-sm w-full p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-muted flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-onColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {step === 'verify' && 'PIN de Administrador'}
                {step === 'change' && 'Cambiar PIN'}
                {step === 'reset' && 'Recuperar PIN'}
                {step === 'reset-sent' && 'PIN enviado'}
              </h3>
              <p className="text-xs text-gray-500">
                {step === 'verify' && 'Ingresa tu PIN para continuar'}
                {step === 'change' && 'Tu PIN es temporal. Debes cambiarlo ahora.'}
                {step === 'reset' && 'Verifica tu contraseña para recibir un PIN nuevo'}
                {step === 'reset-sent' && 'Revisa tu correo electrónico'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Verify step */}
        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ingresa tu PIN"
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-center tracking-widest text-lg"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !pin.trim()}
              className="w-full py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Verificando...</>
              ) : 'Verificar PIN'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('reset'); setError(''); }}
              className="w-full text-xs text-center text-gray-400 hover:text-brand-primary transition-colors"
            >
              ¿Olvidaste tu PIN?
            </button>
          </form>
        )}

        {/* Reset PIN step */}
        {step === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-gray-600">
              Te enviaremos un PIN temporal a tu correo registrado. Úsalo para ingresar y luego crea uno nuevo.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Enviando...</>
              ) : 'Enviar PIN temporal'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('verify'); setError(''); }}
              className="w-full text-xs text-center text-gray-400 hover:text-brand-primary transition-colors"
            >
              Volver
            </button>
          </form>
        )}

        {/* Reset sent confirmation */}
        {step === 'reset-sent' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Correo con instrucciones para recuperar tu PIN enviado a
            </p>
            <p className="text-sm font-semibold text-gray-800 break-all">{censorEmail(email)}</p>
            <button
              onClick={() => { setStep('verify'); setPin(''); setError(''); }}
              className="w-full py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity"
            >
              Ingresar PIN
            </button>
          </div>
        )}

        {/* Change PIN step */}
        {step === 'change' && (
          <form onSubmit={handleChange} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              Tu PIN es temporal. Crea uno nuevo para continuar.
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nuevo PIN</label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-center tracking-widest text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar nuevo PIN</label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Repite el PIN"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-center tracking-widest text-lg"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !newPin || !confirmPin}
              className="w-full py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Guardando...</>
              ) : 'Guardar PIN y continuar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
