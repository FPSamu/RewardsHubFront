export function FormTextarea({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 3,
  hint,
  disabled,
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-[#6B5B2E] mb-1.5">
          {label}
          {required && <span className="text-[#E5484D] ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        disabled={disabled}
        className="w-full px-4 py-3 text-[15px] font-medium text-[#13110A] placeholder-[#C4B48A] bg-white border border-[#EDE3C8] rounded-xl focus:outline-none focus:ring-[3px] focus:ring-[#FAE5AD] focus:border-[#EBA626] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 resize-none"
      />
      {hint && <p className="mt-1.5 text-[12px] text-[#947F4E]">{hint}</p>}
    </div>
  );
}
