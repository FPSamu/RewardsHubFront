export function RedeemFAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Canjear código"
      className="fixed bottom-6 right-4 z-40 flex items-center gap-2.5 bg-brand-primary text-white pl-4 pr-5 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:bg-brand-hover active:scale-95 transition-all duration-150 font-bold text-sm"
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
      Canjear Código
    </button>
  );
}
