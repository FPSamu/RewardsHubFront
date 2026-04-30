export function Checkbox({ id, checked, onChange, label, disabled }) {
  const toggle = () => { if (!disabled) onChange(!checked); };

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={toggle}
        disabled={disabled}
        className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#FAE5AD] disabled:opacity-50 transition-all duration-150 ${
          checked
            ? 'bg-[#EBA626] border-[#EBA626]'
            : 'bg-white border-[#D9C99C] hover:border-[#EBA626]'
        }`}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {label && (
        <span
          id={id}
          onClick={toggle}
          className="text-[13px] font-medium text-[#6B5B2E] cursor-pointer select-none"
        >
          {label}
        </span>
      )}
    </div>
  );
}
