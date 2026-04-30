function SectionCard({ title, description, children }) {
  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h2 className="text-[14px] font-bold text-neutral-800">{title}</h2>
        {description && (
          <p className="text-[12px] text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

export function LocationAddressSection({ street, city, state, onChange }) {
  const handle = (field) => (e) =>
    onChange({ street, city, state, [field]: e.target.value });

  return (
    <SectionCard
      title="Dirección"
      description="Dirección física de la sucursal"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
            Calle y número
          </label>
          <input
            type="text"
            value={street}
            onChange={handle('street')}
            placeholder="Ej: Av. Hidalgo 123"
            className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
              Ciudad
            </label>
            <input
              type="text"
              value={city}
              onChange={handle('city')}
              placeholder="Ej: Guadalajara"
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
              Estado
            </label>
            <input
              type="text"
              value={state}
              onChange={handle('state')}
              placeholder="Ej: Jalisco"
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
