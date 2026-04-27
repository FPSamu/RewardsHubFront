export function AccountTypeToggle({ value, onChange }) {
  return (
    <div
      className="flex p-1 rounded-xl gap-1"
      style={{ background: 'rgba(235,166,38,0.12)', border: '1px solid rgba(235,166,38,0.2)' }}
    >
      <button
        type="button"
        onClick={() => onChange('client')}
        className={`flex-1 h-9 rounded-lg text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
          value === 'client'
            ? 'bg-white text-[#13110A] shadow-sm'
            : 'text-[#947F4E] hover:text-[#6B5B2E]'
        }`}
      >
        <span>👤</span> Cliente
      </button>
      <button
        type="button"
        onClick={() => onChange('business')}
        className={`flex-1 h-9 rounded-lg text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
          value === 'business'
            ? 'bg-white text-[#13110A] shadow-sm'
            : 'text-[#947F4E] hover:text-[#6B5B2E]'
        }`}
      >
        <span>🏢</span> Negocio
      </button>
    </div>
  );
}
