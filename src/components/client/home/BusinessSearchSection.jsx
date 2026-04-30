import { BusinessAvatar } from '../shared/BusinessAvatar';

function SectionHeader({ children }) {
  return (
    <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-400 px-4 pt-2 pb-1">
      {children}
    </h2>
  );
}

export function BusinessSearchSection({ businesses, searchTerm, onSearch, onBusinessClick }) {
  const filtered = businesses.filter(b =>
    (b.businessName || b.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <SectionHeader>Mis Puntos por Negocio</SectionHeader>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar negocio..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface border border-neutral-200 rounded-xl placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-150"
          />
          {searchTerm && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="mx-4 bg-surface rounded-2xl border border-neutral-200 shadow-card overflow-hidden divide-y divide-neutral-100">
        {filtered.length === 0 ? (
          <div className="py-10 text-center px-4">
            {searchTerm ? (
              <>
                <p className="text-sm font-medium text-neutral-600">Sin resultados para "{searchTerm}"</p>
                <p className="text-xs text-neutral-400 mt-1">Intenta con otro nombre</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-neutral-600">Sin negocios visitados aún</p>
                <p className="text-xs text-neutral-400 mt-1">Visita negocios afiliados para acumular puntos</p>
              </>
            )}
          </div>
        ) : (
          filtered.map((biz) => (
            <button
              key={biz._id || biz.businessId}
              onClick={() => onBusinessClick(biz)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors duration-150 text-left"
            >
              <BusinessAvatar logoUrl={biz.businessLogoUrl} name={biz.businessName || biz.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-950 truncate">
                  {biz.businessName || biz.name || 'Negocio'}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {biz.lastVisit
                    ? `Última visita: ${new Date(biz.lastVisit).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}`
                    : 'Sin visitas registradas'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-bold text-brand-primary">{biz.points} pts</span>
                {biz.stamps > 0 && (
                  <span className="text-[11px] font-medium text-accent-success bg-accent-successBg px-2 py-0.5 rounded-full">
                    {biz.stamps} sellos
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
