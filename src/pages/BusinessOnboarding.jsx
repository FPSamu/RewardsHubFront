import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import businessService from '../services/businessService';
import BusinessLocations from './BusinessLocations';
import { OnboardingRewardStep } from '../components/business/onboarding/OnboardingRewardStep';
import { OnboardingBusinessStep } from '../components/business/onboarding/OnboardingBusinessStep';

const STEPS = [
  { id: 1, label: 'Sucursal' },
  { id: 2, label: 'Recompensa' },
  { id: 3, label: 'Tu negocio' },
];

function Header({ onLogout }) {
  return (
    <header className="border-b border-neutral-100 bg-white">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <img
          src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/RewardsHub.png"
          alt="RewardsHub"
          className="h-7 w-auto object-contain"
        />
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-600 text-[13px] font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

function StepIndicator({ step, maxVisited, onJump }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((s, i) => {
        const isCurrent = s.id === step;
        const isDone = s.id < step;
        const isReachable = s.id <= maxVisited;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onJump(s.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-pill text-[12px] font-semibold transition-colors ${
                isCurrent
                  ? 'bg-brand-primary text-brand-onColor'
                  : isDone
                  ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15 cursor-pointer'
                  : 'bg-neutral-100 text-neutral-400 cursor-default'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isCurrent ? 'bg-white/25' : isDone ? 'bg-brand-primary text-white' : 'bg-neutral-200'
                }`}
              >
                {isDone ? '✓' : s.id}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-neutral-200" />}
          </div>
        );
      })}
    </div>
  );
}

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [step, setStep] = useState(1);
  const [maxVisited, setMaxVisited] = useState(1);
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    businessService.getMyBusiness().then(setBusiness).catch(() => {});
  }, []);

  const goTo = useCallback((n) => {
    setStep(n);
    setMaxVisited((prev) => Math.max(prev, n));
  }, []);

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    navigate('/login');
  };

  const handleBusinessUpdated = (patch) => {
    setBusiness((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[22px] font-extrabold text-neutral-900">
            {business?.name ? `¡Bienvenido, ${business.name}!` : 'Configura tu negocio'}
          </h1>
          <p className="text-[13px] text-neutral-400">
            Unos pasos antes de llegar a la suscripción
          </p>
        </div>

        <StepIndicator step={step} maxVisited={maxVisited} onJump={goTo} />

        {/* Step 1 needs the full width for its two-column layout; steps 2-3 are
            simple forms that read better narrower, so only they get centered. */}
        <div className={step === 1 ? '' : 'max-w-2xl mx-auto'}>
          <div className="bg-surface rounded-xl shadow-card p-5">
            {step === 1 && (
              <BusinessLocations hideHeader onLocationsChange={(locs) => setHasLocation(locs.length > 0)} />
            )}
            {step === 2 && <OnboardingRewardStep onDone={() => goTo(3)} />}
            {step === 3 && <OnboardingBusinessStep business={business} onUpdated={handleBusinessUpdated} />}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="px-5 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Atrás
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step === 1 && (
                <div className="flex items-center gap-3">
                  {!hasLocation && (
                    <p className="text-[12px] text-neutral-400">Agrega una sucursal con sus turnos para continuar</p>
                  )}
                  <button
                    type="button"
                    disabled={!hasLocation}
                    onClick={() => goTo(2)}
                    className="px-6 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuar →
                  </button>
                </div>
              )}
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => goTo(3)}
                  className="px-5 py-2.5 rounded-pill text-neutral-500 text-[13px] font-semibold hover:text-neutral-700 transition-colors"
                >
                  Omitir por ahora
                </button>
              )}
              {step === 3 && (
                <button
                  type="button"
                  onClick={() => navigate('/business/subscription')}
                  className="px-6 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  Continuar a suscripción →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
