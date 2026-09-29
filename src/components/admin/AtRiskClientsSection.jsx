function Avatar({ name }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="w-8 h-8 rounded-full bg-accent-dangerBg ring-1 ring-accent-dangerBorder flex items-center justify-center flex-shrink-0">
      <span className="text-[12px] font-bold text-accent-danger">{initial}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 rounded bg-neutral-100 animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-neutral-100 animate-pulse" />
      </div>
      <div className="h-5 w-16 rounded-lg bg-neutral-100 animate-pulse" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
      <div className="w-10 h-10 rounded-full bg-accent-successBg flex items-center justify-center">
        <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-neutral-600">Todos tus clientes siguen activos</p>
      <p className="text-xs text-neutral-400">Nadie ha dejado de visitarte recientemente</p>
    </div>
  );
}

function ClientRow({ client }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors duration-100">
      <Avatar name={client.username} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-neutral-800 truncate">
          {client.username ?? 'Usuario'}
        </p>
        <p className="text-[11px] text-neutral-400 truncate">{client.email}</p>
      </div>
      <span className="flex-shrink-0 px-2 py-1 rounded-lg text-[11px] font-bold bg-accent-dangerBg text-accent-danger whitespace-nowrap">
        {client.daysSinceVisit}d sin volver
      </span>
    </div>
  );
}

export function AtRiskClientsSection({ clients, loading }) {
  return (
    <div className="bg-surface rounded-xl border border-neutral-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-[14px] font-bold text-neutral-800">Clientes en riesgo de irse</h3>
        <p className="text-[12px] text-neutral-400 mt-0.5">No han vuelto en 30 días o más — considera mandarles una promo</p>
      </div>

      <div className="divide-y divide-neutral-50 max-h-[420px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : !clients?.length ? (
          <EmptyState />
        ) : (
          clients.map((c) => <ClientRow key={c.userId} client={c} />)
        )}
      </div>
    </div>
  );
}
