const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export function SubmitButton({ children, loading, loadingText, disabled, fullWidth = true, className = '' }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`${fullWidth ? 'w-full' : ''} h-11 flex items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white bg-[#EBA626] hover:bg-[#C47D10] focus:outline-none focus:ring-[3px] focus:ring-[#FAE5AD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ${className}`}
      style={{ boxShadow: '0 4px 14px rgba(235,166,38,0.35)' }}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText || 'Cargando...'}
        </>
      ) : children}
    </button>
  );
}
