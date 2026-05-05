export function AlertBanner({ type, message }) {
  const isSuccess = type === 'success';

  return (
    <div
      className="mb-8 max-w-2xl mx-auto rounded-2xl px-5 py-4 flex items-center gap-3"
      style={
        isSuccess
          ? { background: 'rgba(34,160,107,0.1)', border: '1px solid rgba(34,160,107,0.3)' }
          : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }
      }
    >
      {isSuccess ? (
        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <p className={`text-[13px] font-semibold ${isSuccess ? 'text-emerald-300' : 'text-red-300'}`}>
        {message}
      </p>
    </div>
  );
}
