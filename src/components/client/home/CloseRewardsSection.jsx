import { BusinessAvatar } from '../shared/BusinessAvatar';

export function CloseRewardsSection({ rewards, businessPoints, onBusinessClick }) {
  if (!rewards.length) return null;

  return (
    <div className="mx-4 bg-brand-primary rounded-2xl shadow-card p-5 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-[15px]">¡Estás cerca!</p>
          <p className="text-white/75 text-xs">Con tu próxima visita podrías alcanzarla</p>
        </div>
      </div>

      <div className="space-y-2">
        {rewards.map((reward) => {
          const gapLabel = reward.isPoints
            ? `~${Math.ceil(reward.gap)} pts más`
            : reward.gap === 1 ? '1 sello más' : `${reward.gap} sellos más`;
          const fullBiz = businessPoints.find(bp => bp.businessId === reward.businessId) || reward;

          return (
            <button
              key={`${reward._id ?? reward.id}-${reward.businessId}`}
              onClick={() => onBusinessClick(fullBiz)}
              className="w-full bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-xl p-3.5 flex items-center gap-3 transition-colors duration-150 text-left"
            >
              <BusinessAvatar logoUrl={reward.businessLogoUrl} name={reward.businessName} size="md"
                className="border-2 border-white/30" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{reward.name}</p>
                <p className="text-white/70 text-xs truncate">{reward.businessName}</p>
              </div>
              <span className="flex-shrink-0 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                {gapLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
