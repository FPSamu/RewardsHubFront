import { useState, useEffect, useMemo } from 'react';
import userPointsService from '../services/userPointsService';
import { transactionService } from '../services/transactionService';
import businessService from '../services/businessService';
import { BusinessAvatar } from '../components/client/shared/BusinessAvatar';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRelative(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return 'Ahora';
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)    return `hace ${d}d`;
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 bg-neutral-100 rounded-full" />
        <div className="h-2.5 w-20 bg-neutral-100 rounded-full" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="h-5 w-16 bg-neutral-100 rounded-full" />
        <div className="h-4 w-12 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}

function BusinessCard({ biz, filter }) {
  const showPoints = filter !== 'stamps';
  const showStamps = filter !== 'points';

  return (
    <div className="flex items-center gap-3.5 px-5 py-4">
      <BusinessAvatar
        logoUrl={biz.businessLogoUrl}
        name={biz.businessName}
        size="lg"
        className="border border-neutral-200 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-neutral-900 truncate leading-tight">
          {biz.businessName || 'Negocio'}
        </p>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          {biz.lastVisit
            ? `Última visita ${new Date(biz.lastVisit).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
            : 'Sin visitas registradas'}
        </p>
      </div>

      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        {showPoints && biz.points > 0 && (
          <span className="inline-flex items-center gap-1 bg-brand-muted text-brand-primary text-[12px] font-bold px-2.5 py-1 rounded-lg leading-none">
            {biz.points.toLocaleString()}
            <span className="font-normal opacity-70 text-[10px]">pts</span>
          </span>
        )}
        {showStamps && biz.stamps > 0 && (
          <span className="inline-flex items-center gap-1 bg-accent-successBg text-accent-success text-[12px] font-bold px-2.5 py-1 rounded-lg leading-none">
            {biz.stamps}
            <span className="font-normal opacity-70 text-[10px]">sellos</span>
          </span>
        )}
        {((!showPoints || biz.points === 0) && (!showStamps || biz.stamps === 0)) && (
          <span className="text-[12px] text-neutral-300 font-medium">—</span>
        )}
      </div>
    </div>
  );
}

const TX_CONFIG = {
  add:      { label: 'Compra',  bg: 'bg-green-100',  text: 'text-green-700' },
  subtract: { label: 'Ajuste', bg: 'bg-neutral-100', text: 'text-neutral-500' },
  redeem:   { label: 'Canje',   bg: 'bg-brand-muted', text: 'text-brand-primary' },
};

function TransactionRow({ tx, businessLogos }) {
  const cfg    = TX_CONFIG[tx.type] ?? TX_CONFIG.add;
  const pts    = tx.totalPointsChange  ?? 0;
  const stamps = tx.totalStampsChange  ?? 0;
  const logo   = businessLogos[tx.businessId];

  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <BusinessAvatar
        logoUrl={logo}
        name={tx.businessName}
        size="md"
        className="border border-neutral-200 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold text-neutral-800 truncate leading-tight">
            {tx.businessName || 'Negocio'}
          </p>
          <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {tx.rewardName && (
            <p className="text-[11px] text-neutral-400 truncate">{tx.rewardName}</p>
          )}
          <p className="text-[11px] text-neutral-300 truncate flex-shrink-0">
            {tx.rewardName ? '· ' : ''}{formatRelative(tx.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        {pts !== 0 && (
          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-lg ${
            pts > 0 ? 'bg-brand-primary text-brand-onColor' : 'bg-accent-danger/10 text-accent-danger'
          }`}>
            {pts > 0 ? '+' : ''}{pts} pts
          </span>
        )}
        {stamps !== 0 && (
          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-lg ${
            stamps > 0 ? 'bg-accent-success text-white' : 'bg-accent-danger/10 text-accent-danger'
          }`}>
            {stamps > 0 ? '+' : ''}{stamps} sellos
          </span>
        )}
        {pts === 0 && stamps === 0 && (
          <span className="text-[12px] text-neutral-300">—</span>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'all',    label: 'Todos'  },
  { key: 'points', label: 'Puntos' },
  { key: 'stamps', label: 'Sellos' },
];

export default function ClientPoints() {
  const [businessPoints, setBusinessPoints] = useState([]);
  const [transactions,   setTransactions]   = useState([]);
  const [businessLogos,  setBusinessLogos]  = useState({});
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [search,         setSearch]         = useState('');
  const [filter,         setFilter]         = useState('all');
  const [activeTab,      setActiveTab]      = useState('negocios'); // 'negocios' | 'historial'

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [pointsData, txData] = await Promise.all([
          userPointsService.getUserPoints(),
          transactionService.getUserTransactions(50, 0),
        ]);

        // Enrich business points with metadata
        const bpRaw = pointsData?.businessPoints ?? [];
        const withMeta = await Promise.all(
          bpRaw.map(async (bp) => {
            try {
              const biz = await businessService.getBusinessById(bp.businessId);
              return { ...bp, businessName: biz.username ?? biz.name ?? 'Negocio', businessLogoUrl: biz.logoUrl };
            } catch {
              return { ...bp, businessName: 'Negocio' };
            }
          })
        );
        setBusinessPoints(withMeta);

        // Transactions
        const txList = Array.isArray(txData)
          ? txData
          : Array.isArray(txData?.transactions)
          ? txData.transactions
          : [];
        setTransactions(txList);

        // Logos for transactions (reuse already-fetched data where possible)
        const metaMap = Object.fromEntries(withMeta.map((b) => [b.businessId, b]));
        const uniqueIds = [...new Set(txList.map((t) => t.businessId).filter(Boolean))];
        const logos = {};
        await Promise.all(
          uniqueIds.map(async (id) => {
            if (metaMap[id]?.businessLogoUrl) {
              logos[id] = metaMap[id].businessLogoUrl;
            } else {
              try {
                const biz = await businessService.getBusinessById(id);
                if (biz.logoUrl) logos[id] = biz.logoUrl;
              } catch { /* ignore */ }
            }
          })
        );
        setBusinessLogos(logos);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalPoints = useMemo(() => businessPoints.reduce((s, b) => s + b.points, 0), [businessPoints]);
  const totalStamps = useMemo(() => businessPoints.reduce((s, b) => s + b.stamps, 0), [businessPoints]);

  const filteredBusinesses = useMemo(() => {
    return businessPoints
      .filter((b) => {
        if (filter === 'points') return b.points > 0;
        if (filter === 'stamps') return b.stamps > 0;
        return true;
      })
      .filter((b) =>
        !search || (b.businessName || '').toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
  }, [businessPoints, filter, search]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 pb-8 px-4">
        {/* Hero skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-brand-primary px-6 py-7 mx-0 animate-pulse">
          <div className="h-4 w-24 bg-white/20 rounded-full mb-3" />
          <div className="h-10 w-32 bg-white/20 rounded-full mb-2" />
          <div className="h-3 w-40 bg-white/10 rounded-full" />
        </div>
        {/* Tabs skeleton */}
        <div className="flex gap-2 px-0">
          {[1,2].map(i => <div key={i} className="h-9 flex-1 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
        {/* Cards skeleton */}
        <div className="bg-surface rounded-xl shadow-card overflow-hidden divide-y divide-neutral-50">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-accent-dangerBg flex items-center justify-center">
          <svg className="w-7 h-7 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-neutral-700">No se pudo cargar tu información</p>
        <p className="text-xs text-neutral-400">{error}</p>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────

  const isEmpty = businessPoints.length === 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 pb-8 px-4">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-primary px-6 py-7">
        <div className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 -right-14 w-60 h-60 rounded-full bg-white/[0.07]" />

        <p className="text-[11px] font-bold text-brand-onColor/60 uppercase tracking-widest mb-1">
          Mis puntos y sellos
        </p>

        <div className="relative flex items-end justify-between gap-4">
          <div>
            <p className="text-[44px] font-extrabold text-brand-onColor leading-none tabular-nums">
              {totalPoints.toLocaleString()}
            </p>
            <p className="text-[13px] text-brand-onColor/70 mt-1">puntos acumulados</p>
          </div>

          {totalStamps > 0 && (
            <div className="text-right pb-1">
              <p className="text-[28px] font-extrabold text-brand-onColor/90 leading-none tabular-nums">
                {totalStamps}
              </p>
              <p className="text-[11px] text-brand-onColor/60">sellos</p>
            </div>
          )}
        </div>

        {businessPoints.length > 0 && (
          <p className="relative text-[11px] text-brand-onColor/50 mt-3">
            En {businessPoints.length} negocio{businessPoints.length !== 1 ? 's' : ''} · actualizado ahora
          </p>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex bg-neutral-100 rounded-xl p-1 gap-1">
        {[
          { key: 'negocios',  label: 'Negocios'  },
          { key: 'historial', label: 'Historial'  },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-surface text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Negocios tab ──────────────────────────────────────────────────── */}
      {activeTab === 'negocios' && (
        <div className="space-y-3">

          {/* Filter pills */}
          {!isEmpty && (
            <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    filter === f.key
                      ? 'bg-brand-primary text-brand-onColor'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          {!isEmpty && (
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar negocio..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* List */}
          {isEmpty ? (
            <div className="bg-surface rounded-xl shadow-card flex flex-col items-center gap-3 py-14 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-brand-muted flex items-center justify-center">
                <svg className="w-7 h-7 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-neutral-800">Sin puntos aún</p>
                <p className="text-[13px] text-neutral-400 mt-1">Visita un negocio afiliado y empieza a acumular</p>
              </div>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="bg-surface rounded-xl shadow-card py-10 text-center">
              <p className="text-[13px] text-neutral-400">Sin resultados para "{search}"</p>
            </div>
          ) : (
            <div className="bg-surface rounded-xl shadow-card overflow-hidden divide-y divide-neutral-50">
              {filteredBusinesses.map((biz) => (
                <BusinessCard
                  key={biz._id || biz.businessId}
                  biz={biz}
                  filter={filter}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Historial tab ──────────────────────────────────────────────────── */}
      {activeTab === 'historial' && (
        <div className="bg-surface rounded-xl shadow-card overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-[14px] font-bold text-neutral-800">Historial de transacciones</h3>
            <p className="text-[12px] text-neutral-400 mt-0.5">Tus últimas 50 transacciones</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-neutral-50">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-neutral-600">Sin transacciones</p>
                <p className="text-[12px] text-neutral-400">Tus transacciones aparecerán aquí</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <TransactionRow
                  key={tx.id ?? tx._id}
                  tx={tx}
                  businessLogos={businessLogos}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
