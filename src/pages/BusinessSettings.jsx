import { useState, useEffect } from 'react';
import businessService from '../services/businessService';
import { ProfilePhotoSection } from '../components/business/settings/ProfilePhotoSection';
import { BusinessNameSection } from '../components/business/settings/BusinessNameSection';
import { AccountManagementModal } from '../components/business/settings/AccountManagementModal';

function SettingsCard({ title, description, children }) {
  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h2 className="text-[14px] font-bold text-neutral-800">{title}</h2>
        {description && (
          <p className="text-[12px] text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="bg-surface rounded-xl shadow-card p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-neutral-100 animate-pulse" />
          <div className="h-2.5 w-40 rounded bg-neutral-100 animate-pulse" />
          <div className="h-7 w-28 rounded-lg bg-neutral-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function BusinessSettings() {
  const [business,       setBusiness]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [showAccountMgmt, setShowAccountMgmt] = useState(false);

  useEffect(() => {
    businessService.getMyBusiness()
      .then(setBusiness)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdated = (updated) => {
    setBusiness((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="pb-10 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-[20px] font-extrabold text-neutral-900">Configuración</h1>
        <p className="text-[13px] text-neutral-400 mt-0.5">Administra las preferencias de tu negocio</p>
      </div>

      {loading ? (
        <PageSkeleton />
      ) : (
        <SettingsCard
          title="Perfil del negocio"
          description="Información visible para tus clientes en RewardsHub"
        >
          <div className="space-y-6">
            <ProfilePhotoSection business={business} onUpdated={handleUpdated} />
            <div className="border-t border-neutral-100" />
            <BusinessNameSection business={business} onUpdated={handleUpdated} />
          </div>
        </SettingsCard>
      )}

      {/* Account management */}
      <div className="bg-surface rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-[14px] font-bold text-neutral-800">Cuenta</h2>
          <p className="text-[12px] text-neutral-400 mt-0.5">Administra el estado de tu cuenta en RewardsHub</p>
        </div>
        <div className="px-5 py-5">
          <button
            type="button"
            onClick={() => setShowAccountMgmt(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Manejo de cuenta
          </button>
        </div>
      </div>

      {showAccountMgmt && (
        <AccountManagementModal onClose={() => setShowAccountMgmt(false)} />
      )}
    </div>
  );
}
