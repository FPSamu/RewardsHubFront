import { ProfilePhotoSection } from '../settings/ProfilePhotoSection';
import { BusinessNameSection } from '../settings/BusinessNameSection';

export function OnboardingBusinessStep({ business, onUpdated }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[16px] font-bold text-neutral-900">Configura tu negocio</h2>
        <p className="text-[13px] text-neutral-400 mt-0.5">
          Así es como te verán tus clientes en RewardsHub. Puedes ajustarlo cuando quieras desde
          Configuración.
        </p>
      </div>

      <div className="space-y-6">
        <ProfilePhotoSection business={business} onUpdated={onUpdated} />
        <div className="border-t border-neutral-100" />
        <BusinessNameSection business={business} onUpdated={onUpdated} />
      </div>
    </div>
  );
}
