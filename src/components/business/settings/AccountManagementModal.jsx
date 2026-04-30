import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../../services/subscriptionService';
import businessService from '../../../services/businessService';

function parseError(err) {
  if (typeof err === 'string') return err;
  return err?.response?.data?.message
    ?? err?.response?.data?.error
    ?? err?.message
    ?? 'Ocurrió un error. Intenta de nuevo.';
}

const DeactivateIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

function OptionCard({ icon, title, description, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-4 px-4 py-4 rounded-xl border text-left transition-all duration-150 group ${
        danger
          ? 'border-red-100 hover:border-red-200 hover:bg-red-50'
          : 'border-neutral-100 hover:border-amber-200 hover:bg-amber-50/40'
      }`}
    >
      <div className={`mt-0.5 flex-shrink-0 p-2 rounded-lg ${
        danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[14px] font-bold ${danger ? 'text-red-700' : 'text-neutral-800'}`}>
          {title}
        </p>
        <p className="text-[12px] text-neutral-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <svg
        className={`w-4 h-4 flex-shrink-0 mt-1 ml-auto transition-transform group-hover:translate-x-0.5 ${
          danger ? 'text-red-400' : 'text-neutral-400'
        }`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function ConfirmDeactivate({ onCancel, onDone }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await subscriptionService.cancelSubscription();
      onDone();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
          <DeactivateIcon />
        </div>
        <div>
          <p className="text-[16px] font-extrabold text-neutral-900">Desactivar cuenta</p>
          <p className="text-[12px] text-neutral-400">Cancelar suscripción</p>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3.5 text-[13px] text-amber-800 leading-relaxed">
        Tu suscripción será cancelada y tu cuenta desactivada al final del período actual. Puedes seguir usando RewardsHub hasta que termine tu período de suscripción.
      </div>

      {error && (
        <p className="text-[12px] text-accent-danger font-medium">{error}</p>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-pill bg-amber-500 text-white text-[13px] font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Procesando…
            </>
          ) : 'Confirmar desactivación'}
        </button>
      </div>
    </div>
  );
}

function ConfirmDelete({ onCancel }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [confirm, setConfirm] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await businessService.deleteAccount();
      navigate('/login');
    } catch (err) {
      setError(parseError(err));
      setLoading(false);
    }
  };

  const isReady = confirm.trim().toLowerCase() === 'eliminar';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-100 text-red-600">
          <DeleteIcon />
        </div>
        <div>
          <p className="text-[16px] font-extrabold text-neutral-900">Eliminar cuenta</p>
          <p className="text-[12px] text-neutral-400">Acción irreversible</p>
        </div>
      </div>

      <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3.5 flex gap-3 items-start">
        <WarningIcon className="flex-shrink-0 text-red-500 mt-0.5" />
        <p className="text-[13px] text-red-700 leading-relaxed">
          Estás a punto de eliminar tu cuenta permanentemente. Tu membresía será cancelada en este instante, sin ninguna devolución o reembolso aplicable. Esta acción no se puede deshacer.
        </p>
      </div>

      <div>
        <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
          Escribe <span className="font-bold text-neutral-800">eliminar</span> para confirmar
        </label>
        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="eliminar"
          autoComplete="off"
          className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-all"
        />
      </div>

      {error && (
        <p className="text-[12px] text-accent-danger font-medium">{error}</p>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || !isReady}
          className="flex-1 px-4 py-2.5 rounded-pill bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Eliminando…
            </>
          ) : 'Eliminar cuenta definitivamente'}
        </button>
      </div>
    </div>
  );
}

function DeactivateDone({ onClose }) {
  return (
    <div className="space-y-5 text-center py-2">
      <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-[16px] font-extrabold text-neutral-900">Suscripción cancelada</p>
        <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed">
          Tu cuenta permanecerá activa hasta el final del período de suscripción. Después de eso, tu acceso será desactivado.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full px-4 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-bold hover:opacity-90 transition-opacity"
      >
        Entendido
      </button>
    </div>
  );
}

// step: 'options' | 'deactivate' | 'delete' | 'deactivate-done'
export function AccountManagementModal({ onClose }) {
  const [step, setStep] = useState('options');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-[2px]"
        onClick={step === 'options' ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Sheet / Modal */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4 pointer-events-none">
        <div className="pointer-events-auto w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-neutral-200" />
          </div>

          <div className="px-5 pb-8 pt-4 sm:pt-6 sm:pb-6">
            {/* Header (options step only) */}
            {step === 'options' && (
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[16px] font-extrabold text-neutral-900">Manejo de cuenta</p>
                  <p className="text-[12px] text-neutral-400 mt-0.5">Gestiona el estado de tu cuenta</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {step === 'options' && (
              <div className="space-y-3">
                <OptionCard
                  icon={<DeactivateIcon />}
                  title="Desactivar cuenta"
                  description="Cancela tu suscripción al final del período. Tu cuenta permanece activa hasta entonces."
                  danger={false}
                  onClick={() => setStep('deactivate')}
                />
                <OptionCard
                  icon={<DeleteIcon />}
                  title="Eliminar cuenta"
                  description="Elimina tu cuenta y datos de forma permanente. Esta acción no se puede deshacer."
                  danger
                  onClick={() => setStep('delete')}
                />
              </div>
            )}

            {step === 'deactivate' && (
              <ConfirmDeactivate
                onCancel={() => setStep('options')}
                onDone={() => setStep('deactivate-done')}
              />
            )}

            {step === 'delete' && (
              <ConfirmDelete onCancel={() => setStep('options')} />
            )}

            {step === 'deactivate-done' && (
              <DeactivateDone onClose={onClose} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
