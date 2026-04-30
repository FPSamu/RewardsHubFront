const SORT_OPTIONS = [
  { value: 'points',    label: 'Puntos' },
  { value: 'stamps',    label: 'Sellos' },
  { value: 'name',      label: 'Nombre' },
  { value: 'lastVisit', label: 'Recientes' },
];

export function ClientsSearchBar({ search, onSearch, sortBy, onSort }) {
  return (
    <div className="bg-surface rounded-xl shadow-card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-300 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sort chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSort(value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
              sortBy === value
                ? 'bg-brand-primary text-brand-onColor'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
