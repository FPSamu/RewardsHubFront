import { BusinessAvatar } from '../shared/BusinessAvatar';

export function ClientHeader({ user, onMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-neutral-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Hamburger */}
        <button
          onClick={onMenuOpen}
          aria-label="Abrir menú"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors duration-150 -ml-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <span className="font-bold text-[17px] text-neutral-950 tracking-tight select-none">
          Rewards<span className="text-brand-primary">Hub</span>
        </span>

        {/* Avatar */}
        <button
          onClick={onMenuOpen}
          aria-label="Perfil"
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
        >
          <BusinessAvatar
            logoUrl={user?.profilePicture}
            name={user?.username ?? 'U'}
            size="sm"
            className="w-full h-full"
          />
        </button>
      </div>
    </header>
  );
}
