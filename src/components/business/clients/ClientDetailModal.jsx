import { ClientAvatar } from './ClientAvatar';
import { formatNumber } from '../../../utils/format';

function formatFullDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const REWARD_TYPE_LABEL = {
  discount:     'Descuento',
  free_product: 'Producto gratis',
  coupon:       'Cupón',
  cashback:     'Cashback',
};

function RewardItem({ reward, status }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${
      status.available
        ? 'bg-accent-successBg border-accent-successBorder'
        : 'bg-neutral-50 border-neutral-100'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        status.available ? 'bg-accent-success/10' : 'bg-neutral-100'
      }`}>
        <svg className={`w-4 h-4 ${status.available ? 'text-accent-success' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-neutral-800">{reward.name}</p>
        {reward.description && (
          <p className="text-[12px] text-neutral-500 mt-0.5">{reward.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {reward.pointsRequired != null && (
            <span className="px-2 py-0.5 rounded-full bg-brand-muted text-[11px] font-semibold text-brand-onColor">
              {reward.pointsRequired} pts
            </span>
          )}
          {reward.stampsRequired != null && (
            <span className="px-2 py-0.5 rounded-full bg-accent-successBg text-[11px] font-semibold text-accent-successOnColor">
              {reward.stampsRequired} sellos
            </span>
          )}
          {REWARD_TYPE_LABEL[reward.rewardType] && (
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[11px] font-semibold text-purple-700">
              {REWARD_TYPE_LABEL[reward.rewardType]}
            </span>
          )}
        </div>
      </div>
      <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
        status.available
          ? 'bg-accent-success text-white'
          : 'bg-neutral-100 text-neutral-500'
      }`}>
        {status.label}
      </span>
    </div>
  );
}

export function ClientDetailModal({ client, rewards, rewardSystems, getRewardStatus, onClose }) {
  if (!client) return null;

  const sortedRewards = [...(rewards ?? [])].sort((a, b) => {
    const aOk = getRewardStatus(a, client.points, client.stamps).available;
    const bOk = getRewardStatus(b, client.points, client.stamps).available;
    if (aOk && !bOk) return -1;
    if (!aOk && bOk) return 1;
    return (a.pointsRequired ?? a.stampsRequired ?? 0) - (b.pointsRequired ?? b.stampsRequired ?? 0);
  });

  const availableCount = sortedRewards.filter(r =>
    getRewardStatus(r, client.points, client.stamps).available
  ).length;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-lg max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-[15px] font-bold text-neutral-800">Detalles del cliente</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {/* Client identity */}
          <div className="flex items-center gap-4">
            <ClientAvatar name={client.username} size="lg" />
            <div className="min-w-0">
              <p className="text-[16px] font-extrabold text-neutral-900 truncate">{client.username ?? 'Usuario'}</p>
              <p className="text-[13px] text-neutral-500 truncate">{client.email ?? ''}</p>
              <p className="text-[12px] text-neutral-400 mt-0.5">Última visita: {formatFullDate(client.lastVisit)}</p>
            </div>
          </div>

          {/* Points + Stamps */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand-primary p-4">
              <p className="text-[11px] font-semibold text-brand-onColor/70 uppercase tracking-wider">Puntos</p>
              <p className="text-[28px] font-extrabold text-brand-onColor leading-none mt-1">{formatNumber(client.points ?? 0)}</p>
              {rewardSystems?.points && (
                <p className="text-[11px] text-brand-onColor/60 mt-1 truncate">{rewardSystems.points.name}</p>
              )}
            </div>
            <div className="rounded-xl bg-accent-success p-4">
              <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Sellos</p>
              <p className="text-[28px] font-extrabold text-white leading-none mt-1">{client.stamps ?? 0}</p>
              {rewardSystems?.stamps?.length > 0 && (
                <p className="text-[11px] text-white/60 mt-1">{rewardSystems.stamps.length} sistema{rewardSystems.stamps.length > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>

          {/* Available rewards banner */}
          {availableCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-gold/10 border border-accent-gold/30">
              <div className="w-8 h-8 rounded-lg bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-accent-goldOnColor">
                {availableCount} recompensa{availableCount > 1 ? 's' : ''} disponible{availableCount > 1 ? 's' : ''} para canjear
              </p>
            </div>
          )}

          {/* Rewards list */}
          {sortedRewards.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Recompensas</p>
              {sortedRewards.map((reward) => (
                <RewardItem
                  key={reward.id ?? reward._id}
                  reward={reward}
                  status={getRewardStatus(reward, client.points, client.stamps)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center bg-neutral-50 rounded-xl">
              <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <p className="text-[13px] font-semibold text-neutral-500">Sin recompensas configuradas</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-pill bg-brand-primary text-brand-onColor text-[14px] font-semibold hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
