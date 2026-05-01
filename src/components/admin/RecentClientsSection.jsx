import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../../utils/format';

function Avatar({ name }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="w-8 h-8 rounded-full bg-brand-muted ring-1 ring-brand-border flex items-center justify-center flex-shrink-0">
      <span className="text-[12px] font-bold text-brand-onColor">{initial}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 rounded bg-neutral-100 animate-pulse" />
        <div className="h-2.5 w-16 rounded bg-neutral-100 animate-pulse" />
      </div>
      <div className="h-5 w-16 rounded-lg bg-neutral-100 animate-pulse" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-neutral-600">Sin transacciones recientes</p>
      <p className="text-xs text-neutral-400">Las transacciones aparecerán aquí</p>
    </div>
  );
}

const TYPE_BADGE = {
  add:      { label: 'Compra',  classes: 'bg-green-100 text-green-700' },
  subtract: { label: 'Ajuste', classes: 'bg-neutral-100 text-neutral-500' },
  redeem:   { label: 'Canje',   classes: 'bg-brand-muted text-brand-primary' },
};

function formatRelativeDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function TransactionRow({ tx }) {
  const pts    = tx.totalPointsChange  ?? 0;
  const stamps = tx.totalStampsChange  ?? 0;
  const badge  = TYPE_BADGE[tx.type] ?? TYPE_BADGE.add;
  const date   = formatRelativeDate(tx.createdAt);

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors duration-100">
      <Avatar name={tx.username} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-neutral-800 truncate">
            {tx.username ?? 'Usuario'}
          </p>
          <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.classes}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {tx.type === 'redeem' && tx.rewardName ? (
            <p className="text-[11px] text-neutral-400 truncate">{tx.rewardName}</p>
          ) : null}
          {date && (
            <p className="text-[11px] text-neutral-300 truncate">{tx.type === 'redeem' && tx.rewardName ? `· ${date}` : date}</p>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        {pts !== 0 && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-bold ${
            pts > 0
              ? 'bg-brand-primary text-brand-onColor'
              : 'bg-accent-danger/10 text-accent-danger'
          }`}>
            {pts > 0 ? '+' : ''}{formatNumber(pts)} pts
          </span>
        )}
        {stamps !== 0 && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-bold ${
            stamps > 0
              ? 'bg-accent-success text-white'
              : 'bg-accent-danger/10 text-accent-danger'
          }`}>
            {stamps > 0 ? '+' : ''}{stamps} sellos
          </span>
        )}
        {pts === 0 && stamps === 0 && (
          <span className="text-[12px] text-neutral-400">—</span>
        )}
      </div>
    </div>
  );
}

export function RecentClientsSection({ clients, loading }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div>
          <h3 className="text-[14px] font-bold text-neutral-800">Actividad reciente</h3>
          <p className="text-[12px] text-neutral-400 mt-0.5">Últimas transacciones del negocio</p>
        </div>
        <button
          onClick={() => navigate('/business/dashboard/clients')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-brand-primary hover:bg-brand-muted transition-colors duration-150"
        >
          Ver clientes
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-neutral-50 max-h-[420px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : !clients?.length ? (
          <EmptyState />
        ) : (
          clients.map((tx) => (
            <TransactionRow key={tx.id ?? tx._id} tx={tx} />
          ))
        )}
      </div>
    </div>
  );
}
