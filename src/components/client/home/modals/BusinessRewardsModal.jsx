import { BusinessAvatar } from '../../shared/BusinessAvatar';
import { RewardProgressBar } from '../../shared/RewardProgressBar';

export function BusinessRewardsModal({ business, rewards, loading, onClose }) {
  if (!business) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl shadow-lg w-full sm:max-w-lg max-h-[85dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
          <BusinessAvatar logoUrl={business.businessLogoUrl} name={business.businessName} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-neutral-950 truncate">{business.businessName}</h3>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm font-semibold text-brand-primary">{business.points} pts</span>
              {business.stamps > 0 && (
                <span className="text-sm font-semibold text-accent-success">{business.stamps} sellos</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            Recompensas disponibles
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-neutral-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <p className="text-sm font-medium text-neutral-600">Sin recompensas activas</p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {rewards.map((reward) => {
                const isPoints = reward.type === 'points' || reward.pointsRequired;
                const required = isPoints ? reward.pointsRequired : reward.stampsRequired;
                const current  = isPoints ? business.points : business.stamps;
                const canRedeem = current >= required;

                return (
                  <div
                    key={reward._id || reward.id}
                    className={`rounded-xl border p-4 ${canRedeem ? 'border-accent-successBorder bg-accent-successBg' : 'border-neutral-200 bg-surface'}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-950 text-sm">{reward.name}</p>
                        {reward.description && (
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{reward.description}</p>
                        )}
                      </div>
                      {canRedeem ? (
                        <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 bg-accent-success text-white rounded-full">
                          ¡Listo!
                        </span>
                      ) : (
                        <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                          {required - current} {isPoints ? 'pts' : 'sellos'} más
                        </span>
                      )}
                    </div>
                    <RewardProgressBar
                      current={current}
                      required={required}
                      isPoints={isPoints}
                      canRedeem={canRedeem}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
