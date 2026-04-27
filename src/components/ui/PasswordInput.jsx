import { useState } from 'react';

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  required,
  autoComplete = 'current-password',
  hint,
  disabled,
  labelRight,
}) {
  const [show, setShow] = useState(false);

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
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#947F4E] pointer-events-none">
          <LockIcon />
        </div>
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full h-11 pl-10 pr-11 text-[15px] font-medium text-[#13110A] placeholder-[#C4B48A] bg-white border border-[#EDE3C8] rounded-xl focus:outline-none focus:ring-[3px] focus:ring-[#FAE5AD] focus:border-[#EBA626] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#947F4E] hover:text-[#6B5B2E] transition-colors duration-150 focus:outline-none disabled:opacity-50"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-[12px] text-[#947F4E]">{hint}</p>}
    </div>
  );
}
