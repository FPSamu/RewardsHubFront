export function FormInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  icon,
  hint,
  disabled,
  readOnly,
  labelRight,
}) {
  return (
    <div>
      {(label || labelRight) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label htmlFor={id} className="block text-[13px] font-semibold text-[#6B5B2E]">
              {label}
              {required && <span className="text-[#E5484D] ml-0.5">*</span>}
            </label>
          )}
          {labelRight && <div>{labelRight}</div>}
        </div>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#947F4E] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full h-11 ${icon ? 'pl-10' : 'pl-4'} pr-4 text-[15px] font-medium text-[#13110A] placeholder-[#C4B48A] border border-[#EDE3C8] rounded-xl focus:outline-none focus:ring-[3px] focus:ring-[#FAE5AD] focus:border-[#EBA626] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ${readOnly ? 'bg-[#FAFAF6] cursor-default' : 'bg-white'}`}
        />
      </div>
      {hint && <p className="mt-1.5 text-[12px] text-[#947F4E]">{hint}</p>}
    </div>
  );
}
