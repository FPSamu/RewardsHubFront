import { useState, useEffect } from 'react';
import { KpiRibbon } from '../components/admin/KpiRibbon';
import { RecentClientsSection } from '../components/admin/RecentClientsSection';
import { LocationsSection } from '../components/admin/LocationsSection';
import { RewardsSection } from '../components/admin/RewardsSection';
import { ReportModal } from '../components/admin/ReportModal';
import { TimeSeriesSection } from '../components/admin/TimeSeriesSection';
import { AtRiskClientsSection } from '../components/admin/AtRiskClientsSection';
import { TopRewardsSection } from '../components/admin/TopRewardsSection';
import { BranchComparisonSection } from '../components/admin/BranchComparisonSection';
import BranchActivityCarousel from '../components/BranchActivityCarousel';
import businessDashboardService from '../services/businessDashboardService';
import businessService from '../services/businessService';
import rewardService from '../services/rewardService';

const PERIODS = [7, 30, 90];
const TABS = [
  { key: 'resumen',   label: 'Resumen' },
  { key: 'actividad', label: 'Actividad' },
  { key: 'gestion',   label: 'Gestión' },
];

function PageHeader({ business, period, onPeriod, onReport }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
      <div>
        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">
          Panel de administración
        </p>
        <h1 className="font-display text-[22px] font-bold text-neutral-950 leading-tight">
          {business?.name ?? 'Mi negocio'}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex bg-surface border border-neutral-200 rounded-lg p-0.5 gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${
                p === period ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
        <button
          onClick={onReport}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 bg-surface text-neutral-700 text-[12.5px] font-bold hover:border-neutral-400 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Reporte
        </button>
      </div>
    </div>
  );
}

function DashboardTabs({ active, onChange }) {
  return (
    <div className="flex gap-5 border-b border-neutral-200 mb-5 overflow-x-auto">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`pb-2.5 text-[13.5px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
            active === t.key
              ? 'text-neutral-950 border-brand-hover'
              : 'text-neutral-400 border-transparent hover:text-neutral-600'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ErrorBanner({ onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-accent-dangerBg flex items-center justify-center">
        <svg className="w-6 h-6 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-700">No se pudieron cargar las métricas</p>
        <p className="text-xs text-neutral-500 mt-0.5">Verifica tu conexión e intenta de nuevo</p>
      </div>
      <button
        onClick={onRetry}
        className="mt-1 px-4 py-2 rounded-pill bg-brand-primary text-brand-onColor text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Reintentar
      </button>
    </div>
  );
}

export default function BusinessAdminDashboard() {
  const [tab, setTab] = useState('resumen');
  const [period, setPeriod] = useState(30);
  const [showReport, setShowReport] = useState(false);

  const [business,        setBusiness]        = useState(null);
  const [recentClients,   setRecentClients]   = useState(null);
  const [rewards,         setRewards]         = useState(null);
  const [topRewards,      setTopRewards]      = useState(null);
  const [branchStats,     setBranchStats]     = useState([]);
  const [shiftStats,      setShiftStats]      = useState([]);
  const [loadingClients,  setLoadingClients]  = useState(true);
  const [loadingRewards,  setLoadingRewards]  = useState(true);
  const [loadingTopRewards, setLoadingTopRewards] = useState(true);

  const [kpiSummary,        setKpiSummary]        = useState(null);
  const [errorKpi,          setErrorKpi]          = useState(false);
  const [loadingKpi,        setLoadingKpi]        = useState(true);
  const [timeSeries,        setTimeSeries]        = useState(null);
  const [loadingTimeSeries, setLoadingTimeSeries]  = useState(true);
  const [atRiskClients,     setAtRiskClients]      = useState(null);
  const [loadingAtRisk,     setLoadingAtRisk]      = useState(true);
  const [branchComparison,       setBranchComparison]       = useState([]);
  const [loadingBranchComparison, setLoadingBranchComparison] = useState(true);

  // ── One-time fetches (not period-dependent) ──────────────────────────────
  useEffect(() => {
    let cancelled = false;

    businessService.getMyBusiness().then((data) => {
      if (cancelled) return;
      setBusiness(data);
      const bizId = data.id ?? data._id;
      if (bizId) {
        rewardService.getBusinessRewards(bizId, true)
          .then((r) => { if (!cancelled) setRewards(r); })
          .catch(() => { if (!cancelled) setRewards([]); })
          .finally(() => { if (!cancelled) setLoadingRewards(false); });
      } else {
        setRewards([]);
        setLoadingRewards(false);
      }

      if ((data.locations?.length ?? 0) >= 2) {
        businessService.getStatsByBranch().then((r) => { if (!cancelled) setBranchStats(r); }).catch(() => {});
        businessService.getShiftStatsByBranch().then((r) => { if (!cancelled) setShiftStats(r); }).catch(() => {});
      }
    }).catch(() => {
      if (!cancelled) { setRewards([]); setLoadingRewards(false); }
    });

    businessDashboardService.getRecentClients(20)
      .then((data) => { if (!cancelled) setRecentClients(data); })
      .catch(() => { if (!cancelled) setRecentClients([]); })
      .finally(() => { if (!cancelled) setLoadingClients(false); });

    // "En riesgo" usa un umbral fijo de 30 días — no depende del selector de
    // periodo (que solo gobierna ingresos/puntos/canjes/clientes nuevos).
    businessService.getAtRiskClients(30, 20)
      .then((data) => { if (!cancelled) setAtRiskClients(data); })
      .catch(() => { if (!cancelled) setAtRiskClients([]); })
      .finally(() => { if (!cancelled) setLoadingAtRisk(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Period-dependent fetches ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingKpi(true);
    setLoadingTimeSeries(true);
    setLoadingTopRewards(true);
    setErrorKpi(false);

    businessService.getKpiSummary(period)
      .then((data) => { if (!cancelled) setKpiSummary(data); })
      .catch(() => { if (!cancelled) setErrorKpi(true); })
      .finally(() => { if (!cancelled) setLoadingKpi(false); });

    businessService.getTimeSeriesStats(period)
      .then((data) => { if (!cancelled) setTimeSeries(data); })
      .catch(() => { if (!cancelled) setTimeSeries([]); })
      .finally(() => { if (!cancelled) setLoadingTimeSeries(false); });

    businessService.getTopRewards(5, period)
      .then((data) => { if (!cancelled) setTopRewards(data); })
      .catch(() => { if (!cancelled) setTopRewards([]); })
      .finally(() => { if (!cancelled) setLoadingTopRewards(false); });

    if ((business?.locations?.length ?? 0) >= 2) {
      setLoadingBranchComparison(true);
      businessService.getBranchComparison(period)
        .then((data) => { if (!cancelled) setBranchComparison(data); })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoadingBranchComparison(false); });
    } else {
      setLoadingBranchComparison(false);
    }

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, business?.locations?.length]);

  const handleRetryKpi = () => {
    setErrorKpi(false);
    setLoadingKpi(true);
    businessService.getKpiSummary(period)
      .then(setKpiSummary)
      .catch(() => setErrorKpi(true))
      .finally(() => setLoadingKpi(false));
  };

  const hasMultipleBranches = (business?.locations?.length ?? 0) >= 2;

  return (
    <div className="pb-8">
      <PageHeader business={business} period={period} onPeriod={setPeriod} onReport={() => setShowReport(true)} />
      <DashboardTabs active={tab} onChange={setTab} />

      {/* ================= RESUMEN ================= */}
      {tab === 'resumen' && (
        <div className="space-y-5">
          {errorKpi ? (
            <ErrorBanner onRetry={handleRetryKpi} />
          ) : (
            <KpiRibbon summary={kpiSummary} timeSeries={timeSeries} loading={loadingKpi || loadingTimeSeries} days={period} />
          )}

          <TimeSeriesSection data={timeSeries} loading={loadingTimeSeries} days={period} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AtRiskClientsSection clients={atRiskClients?.slice(0, 5)} loading={loadingAtRisk} />
            <TopRewardsSection rewards={topRewards} loading={loadingTopRewards} days={period} />
          </div>

          {hasMultipleBranches && (
            <BranchComparisonSection
              comparison={branchComparison}
              locations={business.locations}
              loading={loadingBranchComparison}
              days={period}
            />
          )}
        </div>
      )}

      {/* ================= ACTIVIDAD ================= */}
      {tab === 'actividad' && (
        <div className="space-y-5">
          <RecentClientsSection clients={recentClients} loading={loadingClients} />
          <AtRiskClientsSection clients={atRiskClients} loading={loadingAtRisk} />
        </div>
      )}

      {/* ================= GESTIÓN ================= */}
      {tab === 'gestion' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RewardsSection rewards={rewards} loading={loadingRewards} />
            <LocationsSection
              locations={business?.locations}
              loading={!business}
              onLocationsChange={(locs) => setBusiness((b) => b ? { ...b, locations: locs } : b)}
            />
          </div>

          {hasMultipleBranches && (
            <div className="bg-white rounded-xl border border-neutral-100 p-5">
              <p className="text-[13.5px] font-bold text-neutral-800 mb-4">Actividad por sucursal</p>
              <BranchActivityCarousel
                branchStats={branchStats}
                shiftStats={shiftStats}
                locations={business.locations}
              />
            </div>
          )}
        </div>
      )}

      {showReport && (
        <ReportModal onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
