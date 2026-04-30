import { useNavigate } from 'react-router-dom';

const REWARD_TYPE_LABELS = {
  discount:     'Descuento',
  free_product: 'Prod. gratis',
  coupon:       'Cupón',
  cashback:     'Cashback',
};

function RewardTypeIcon({ isPoints }) {
  if (isPoints) {
    return (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="py-3.5 border-b border-neutral-50 last:border-0 space-y-2 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-3 w-28 rounded bg-neutral-100" />
        <div className="h-3 w-14 rounded bg-neutral-100" />
      </div>
      <div className="h-2.5 w-36 rounded bg-neutral-100" />
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      </div>
      <p className="text-[13px] font-semibold text-neutral-600">Sin recompensas</p>
      <p className="text-[12px] text-neutral-400">Agrega tu primera recompensa</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-1 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
      >
        Agregar recompensa
      </button>
    </div>
  );
}

function RewardCard({ reward, onEdit }) {
  const isPoints = reward.pointsRequired != null;
  const req = isPoints ? reward.pointsRequired : reward.stampsRequired;
  const unit = isPoints ? 'pts' : 'sellos';
  const typeLabel = REWARD_TYPE_LABELS[reward.rewardType] ?? reward.rewardType;

  return (
    <div className="flex items-start justify-between gap-3 py-3.5 border-b border-neutral-50 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-bold text-neutral-800 leading-tight">{reward.name}</p>
          {!reward.isActive && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-500">
              Inactiva
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isPoints
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'bg-green-100 text-green-700'
            }`}
          >
            <RewardTypeIcon isPoints={isPoints} />
            {req} {unit}
          </span>
          {typeLabel && (
            <span className="text-[11px] text-neutral-400">{typeLabel}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(reward)}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Editar
      </button>
    </div>
  );
}

export function RewardsSection({ rewards, loading }) {
  const navigate = useNavigate();

  const handleEdit = () => navigate('/business/dashboard/rewards');
  const handleAdd  = () => navigate('/business/dashboard/rewards');

  const activeRewards = rewards?.filter((r) => r.isActive) ?? [];
  const inactiveRewards = rewards?.filter((r) => !r.isActive) ?? [];
  const displayRewards = [...activeRewards, ...inactiveRewards].slice(0, 5);

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-neutral-800">Recompensas</p>
          {!loading && rewards?.length > 0 && (
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {activeRewards.length} activa{activeRewards.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva
        </button>
      </div>

      <div className="px-5 divide-y divide-neutral-50">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !displayRewards.length ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <>
            {displayRewards.map((reward) => (
              <RewardCard key={reward.id ?? reward._id} reward={reward} onEdit={handleEdit} />
            ))}
            {(rewards?.length ?? 0) > 5 && (
              <button
                type="button"
                onClick={() => navigate('/business/dashboard/rewards')}
                className="w-full py-3 text-[12px] font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
              >
                Ver todas ({rewards.length}) →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
