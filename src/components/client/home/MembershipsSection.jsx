import { BusinessAvatar } from '../shared/BusinessAvatar';

function SectionHeader({ children }) {
  return (
    <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-400 px-4 pt-2 pb-1">
      {children}
    </h2>
  );
}

export function MembershipsSection({ memberships }) {
  if (!memberships.length) return null;

  return (
    <div>
      <SectionHeader>Mis Membresías</SectionHeader>
      <div className="mx-4 space-y-2">
        {memberships.map((m) => (
          <div
            key={m._id}
            className="bg-surface border border-neutral-200 rounded-xl p-4 flex items-center gap-3 shadow-xs"
          >
            <BusinessAvatar logoUrl={m.businessLogo} name={m.businessName} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-neutral-950 truncate">{m.businessName}</p>
              <p className="text-xs text-brand-onColor font-medium truncate">{m.planSnapshot?.benefit}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {m.daysLeft === 0 ? 'Vence hoy' : `${m.daysLeft} día${m.daysLeft !== 1 ? 's' : ''} restante${m.daysLeft !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex-shrink-0">
              {m.redeemedToday ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-500 text-[11px] font-medium rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Usado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-successBg text-accent-success text-[11px] font-semibold rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /></svg>
                  Activa
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
