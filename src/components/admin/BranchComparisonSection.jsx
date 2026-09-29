function SkeletonRow() {
  return (
    <div className="px-5 py-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-neutral-100 animate-pulse" />
        <div className="h-3 w-12 rounded bg-neutral-100 animate-pulse" />
      </div>
      <div className="h-2 rounded-full bg-neutral-100 animate-pulse" />
      <div className="h-2 rounded-full bg-neutral-50 animate-pulse" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-neutral-600">Sin actividad todavía</p>
      <p className="text-xs text-neutral-400">Aquí verás cómo compara cada sucursal periodo a periodo</p>
    </div>
  );
}

function ChangeBadge({ changePct }) {
  if (changePct === null) {
    return <span className="text-[11px] font-semibold text-neutral-400">Nuevo</span>;
  }
  const up = changePct > 0;
  const flat = changePct === 0;
  const classes = flat
    ? 'bg-neutral-100 text-neutral-500'
    : up
    ? 'bg-accent-successBg text-accent-success'
    : 'bg-accent-dangerBg text-accent-danger';
  const arrow = flat ? '·' : up ? '↑' : '↓';
  return (
    <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${classes}`}>
      {arrow} {Math.abs(Math.round(changePct))}%
    </span>
  );
}

function BranchRow({ branch, label, maxCount }) {
  const currentPct  = maxCount > 0 ? Math.max((branch.currentCount / maxCount) * 100, branch.currentCount > 0 ? 3 : 0) : 0;
  const previousPct = maxCount > 0 ? Math.max((branch.previousCount / maxCount) * 100, branch.previousCount > 0 ? 3 : 0) : 0;

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[13px] font-semibold text-neutral-800 truncate">{label}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[12px] text-neutral-500">{branch.currentCount} transacciones</span>
          <ChangeBadge changePct={branch.changePct} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-16 text-[10px] font-semibold text-neutral-400 flex-shrink-0">Este periodo</span>
          <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${currentPct}%`, background: '#C47D10' }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-[10px] font-semibold text-neutral-400 flex-shrink-0">Anterior</span>
          <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full bg-neutral-300" style={{ width: `${previousPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BranchComparisonSection({ comparison, locations, loading, days = 30 }) {
  const maxCount = comparison?.length
    ? Math.max(...comparison.map((b) => Math.max(b.currentCount, b.previousCount)))
    : 0;

  const withLabels = (comparison ?? []).map((b) => {
    const loc = locations?.find((l) => (l._id || l.id) === b.branchId);
    return { ...b, label: loc?.name || loc?.address || (b.branchId ? 'Sucursal' : 'Sin sucursal') };
  }).sort((a, b) => b.currentCount - a.currentCount);

  return (
    <div className="bg-surface rounded-xl border border-neutral-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-[14px] font-bold text-neutral-800">Comparación de sucursales</h3>
        <p className="text-[12px] text-neutral-400 mt-0.5">Últimos {days} días vs los {days} anteriores</p>
      </div>

      <div className="divide-y divide-neutral-50">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)
        ) : !withLabels.length || maxCount === 0 ? (
          <EmptyState />
        ) : (
          withLabels.map((b) => (
            <BranchRow key={b.branchId ?? 'none'} branch={b} label={b.label} maxCount={maxCount} />
          ))
        )}
      </div>
    </div>
  );
}
