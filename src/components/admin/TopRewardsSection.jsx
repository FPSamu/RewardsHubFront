function SkeletonRow() {
  return (
    <div className="px-5 py-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-3 w-32 rounded bg-neutral-100 animate-pulse" />
        <div className="h-3 w-8 rounded bg-neutral-100 animate-pulse" />
      </div>
      <div className="h-2 rounded-full bg-neutral-100 animate-pulse" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-neutral-600">Sin canjes todavía</p>
      <p className="text-xs text-neutral-400">Cuando canjeen recompensas, verás cuáles son las favoritas aquí</p>
    </div>
  );
}

function RewardBar({ reward, maxRedemptions, rank }) {
  const pct = maxRedemptions > 0 ? Math.max((reward.redemptions / maxRedemptions) * 100, 4) : 0;

  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-muted text-brand-primary text-[10px] font-bold flex items-center justify-center">
            {rank}
          </span>
          <p className="text-[13px] font-semibold text-neutral-800 truncate">{reward.rewardName}</p>
        </div>
        <span className="flex-shrink-0 text-[12px] font-bold text-neutral-600">
          {reward.redemptions} {reward.redemptions === 1 ? 'canje' : 'canjes'}
        </span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: '#C47D10' }}
        />
      </div>
    </div>
  );
}

export function TopRewardsSection({ rewards, loading }) {
  const maxRedemptions = rewards?.length ? Math.max(...rewards.map((r) => r.redemptions)) : 0;

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-[14px] font-bold text-neutral-800">Recompensas más exitosas</h3>
        <p className="text-[12px] text-neutral-400 mt-0.5">Las que más canjean tus clientes</p>
      </div>

      <div className="divide-y divide-neutral-50">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : !rewards?.length ? (
          <EmptyState />
        ) : (
          rewards.map((r, i) => (
            <RewardBar key={r.rewardId ?? r.rewardName} reward={r} maxRedemptions={maxRedemptions} rank={i + 1} />
          ))
        )}
      </div>
    </div>
  );
}
