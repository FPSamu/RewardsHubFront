export function SubscriptionHeader({ onLogout }) {
  return (
    <header className="relative z-10 px-5 py-5 border-b border-white/8">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <img
          src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/RewardsHub.png"
          alt="RewardsHub"
          className="h-8 w-auto object-contain"
        />
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-[13px] font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
