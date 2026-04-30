export function LocationBranchPasswordNote({ value, onChange }) {
  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h2 className="text-[14px] font-bold text-neutral-800">Contraseña de sucursal</h2>
      </div>
      <div className="px-5 py-5 space-y-4">
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <svg
            className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-[12px] text-amber-800 font-medium leading-relaxed">
            Tu cuenta fue creada con Google. Define una contraseña de sucursal para que tu personal
            de caja pueda iniciar sesión sin acceder a tu correo.
          </p>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
            Contraseña de sucursal
          </label>
          <input
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            minLength={6}
            required
            placeholder="Mínimo 6 caracteres"
            className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
          />
        </div>
      </div>
    </div>
  );
}
