import { BusinessAvatar } from '../shared/BusinessAvatar';

function SectionHeader({ children }) {
  return (
    <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-400 px-4 pt-2 pb-1">
      {children}
    </h2>
  );
}

export function RecentActivitySection({ businessPoints, onBusinessClick }) {
  const recent = [...businessPoints]
    .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
    .slice(0, 3);

  if (!recent.length) {
    return (
      <div>
        <SectionHeader>Actividad Reciente</SectionHeader>
        <div className="mx-4 bg-surface rounded-2xl border border-neutral-200 shadow-card py-10 text-center">
          <svg className="w-12 h-12 text-neutral-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm font-medium text-neutral-600">Sin actividad reciente</p>
          <p className="text-xs text-neutral-400 mt-1">Visita un negocio para empezar</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader>Actividad Reciente</SectionHeader>
      <div className="mx-4 bg-surface rounded-2xl border border-neutral-200 shadow-card overflow-hidden divide-y divide-neutral-100">
        {recent.map((biz) => (
          <button
            key={biz._id || biz.businessId}
            onClick={() => onBusinessClick(biz)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors duration-150 text-left"
          >
            <BusinessAvatar
              logoUrl={biz.businessLogoUrl}
              name={biz.businessName || biz.name}
              size="lg"
              className="border-2 border-brand-border"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-neutral-950 truncate">
                {biz.businessName || biz.name || 'Negocio'}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {biz.lastVisit
                  ? new Date(biz.lastVisit).toLocaleDateString('es-MX', { weekday: 'short', month: 'short', day: 'numeric' })
                  : '—'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {biz.points > 0 && (
                <span className="text-[11px] font-bold bg-brand-muted text-brand-onColor px-2 py-0.5 rounded-full whitespace-nowrap">
                  +{biz.points} pts
                </span>
              )}
              {biz.stamps > 0 && (
                <span className="text-[11px] font-semibold bg-accent-successBg text-accent-success px-2 py-0.5 rounded-full whitespace-nowrap">
                  {biz.stamps} sellos
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
