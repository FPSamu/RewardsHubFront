import { ClientAvatar } from './ClientAvatar';
import { formatNumber } from '../../../utils/format';

function formatLastVisit(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7)  return `Hace ${diff} días`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export function ClientRow({ client, availableRewards, onSelect }) {
  const lastVisit = formatLastVisit(client.lastVisit);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(client)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(client)}
      className="flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 active:bg-neutral-100 transition-colors duration-100 cursor-pointer group"
    >
      <ClientAvatar name={client.username} size="md" />

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-neutral-800 truncate">{client.username ?? 'Usuario'}</p>
        <p className="text-[12px] text-neutral-400 truncate">{client.email ?? ''}</p>
      </div>

      {/* Badges */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        {client.points > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-muted text-[11px] font-semibold text-brand-onColor">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {formatNumber(client.points)} pts
          </span>
        )}
        {client.stamps > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-successBg text-[11px] font-semibold text-accent-successOnColor">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {client.stamps} sellos
          </span>
        )}
        {availableRewards > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-gold text-[11px] font-semibold text-white">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            {availableRewards}
          </span>
        )}
      </div>

      {/* Last visit — hidden on small */}
      {lastVisit && (
        <p className="hidden lg:block text-[12px] text-neutral-400 flex-shrink-0 w-20 text-right">{lastVisit}</p>
      )}

      {/* Chevron */}
      <svg className="w-4 h-4 text-neutral-300 group-hover:text-neutral-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
