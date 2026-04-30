import { BusinessAvatar } from '../shared/BusinessAvatar';

export function AvailableRewardsSection({ businesses, businessPoints, onBusinessClick }) {
  if (!businesses.length) return null;

  return (
    <div className="mx-4 bg-accent-success rounded-2xl shadow-card p-5 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-[15px]">
            {businesses.length === 1
              ? '¡Recompensa disponible!'
              : `¡Recompensas en ${businesses.length} negocios!`}
          </p>
          <p className="text-white/75 text-xs">Toca para ver tus recompensas</p>
        </div>
      </div>

      <div className="space-y-2">
        {businesses.map((biz) => {
          const fullBiz = businessPoints.find(bp => bp.businessId === biz.businessId) || biz;
          return (
            <button
              key={biz.businessId}
              onClick={() => onBusinessClick(fullBiz)}
              className="w-full bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-xl p-3.5 flex items-center gap-3 transition-colors duration-150 text-left"
            >
              <BusinessAvatar logoUrl={biz.businessLogoUrl} name={biz.businessName} size="md"
                className="border-2 border-white/30" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{biz.businessName}</p>
                <p className="text-white/70 text-xs">
                  {biz.rewardCount === 1 ? '1 recompensa' : `${biz.rewardCount} recompensas`}
                </p>
              </div>
              <svg className="w-4 h-4 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
