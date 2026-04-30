export function BusinessHeader({ business, onMenuOpen }) {
  const initial = business?.name?.charAt(0).toUpperCase() ?? 'B';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Hamburger */}
        <button
          onClick={onMenuOpen}
          aria-label="Abrir menú"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors -ml-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <span className="font-bold text-[17px] text-gray-900 tracking-tight select-none">
          Rewards<span className="text-brand-primary">Hub</span>
          <span className="ml-1.5 text-[13px] font-semibold text-gray-400">Business</span>
        </span>

        {/* Business avatar */}
        <button
          onClick={onMenuOpen}
          aria-label="Perfil"
          className="w-9 h-9 rounded-full flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
        >
          {business?.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="w-full h-full rounded-full object-cover border-2 border-brand-primary/30"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm border-2 border-brand-primary/30">
              {initial}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
