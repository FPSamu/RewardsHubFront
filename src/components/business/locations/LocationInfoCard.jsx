export function LocationInfoCard({ name, onChange }) {
  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h2 className="text-[14px] font-bold text-neutral-800">Información básica</h2>
        <p className="text-[12px] text-neutral-400 mt-0.5">
          Nombre con el que tus clientes identificarán esta sucursal
        </p>
      </div>
      <div className="px-5 py-5">
        <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
          Nombre de la sucursal
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          maxLength={60}
          placeholder="Ej: Sucursal Centro"
          className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
        />
      </div>
    </div>
  );
}
