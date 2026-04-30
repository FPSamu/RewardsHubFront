import { useState, useEffect } from 'react';
import { StatsGrid } from '../components/admin/StatsGrid';
import { RecentClientsSection } from '../components/admin/RecentClientsSection';
import { LocationsSection } from '../components/admin/LocationsSection';
import { RewardsSection } from '../components/admin/RewardsSection';
import { ReportModal } from '../components/admin/ReportModal';
import businessDashboardService from '../services/businessDashboardService';
import transactionService from '../services/transactionService';
import businessService from '../services/businessService';
import rewardService from '../services/rewardService';

function DashboardHeader({ business, onReport }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-primary px-6 py-7 mb-6">
      <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -right-16 w-56 h-56 rounded-full bg-white/[0.07]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-brand-onColor/70 uppercase tracking-widest mb-1">
            Panel de Administración
          </p>
          <h1 className="text-[22px] font-extrabold text-brand-onColor leading-tight">
            {business?.name ?? 'Mi Negocio'}
          </h1>
          <p className="mt-1 text-[13px] text-brand-onColor/60">
            Métricas en tiempo real de tu negocio en RewardsHub
          </p>
        </div>

        <button
          onClick={onReport}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-primary text-[13px] font-bold shadow-sm hover:bg-brand-muted transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Reporte
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-[13px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
      {children}
    </h2>
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
  const [stats,           setStats]           = useState(null);
  const [business,        setBusiness]        = useState(null);
  const [recentClients,   setRecentClients]   = useState(null);
  const [rewards,         setRewards]         = useState(null);
  const [loadingStats,    setLoadingStats]    = useState(true);
  const [loadingClients,  setLoadingClients]  = useState(true);
  const [loadingRewards,  setLoadingRewards]  = useState(true);
  const [errorStats,      setErrorStats]      = useState(false);
  const [showReport,      setShowReport]      = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchBusiness = async () => {
      try {
        const data = await businessService.getMyBusiness();
        if (!cancelled) {
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
        }
      } catch {
        if (!cancelled) { setRewards([]); setLoadingRewards(false); }
      }
    };

    const fetchStats = async () => {
      try {
        const data = await businessDashboardService.getStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setErrorStats(true);
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };

    const fetchClients = async () => {
      try {
        const data = await businessDashboardService.getRecentClients(5);
        if (!cancelled) setRecentClients(data);
      } catch {
        if (!cancelled) setRecentClients([]);
      } finally {
        if (!cancelled) setLoadingClients(false);
      }
    };

    fetchBusiness();
    fetchStats();
    fetchClients();

    return () => { cancelled = true; };
  }, []);

  const handleRetry = () => {
    setErrorStats(false);
    setLoadingStats(true);
    businessDashboardService.getStats()
      .then(setStats)
      .catch(() => setErrorStats(true))
      .finally(() => setLoadingStats(false));
  };

  return (
    <div className="pb-8 space-y-6">
      <DashboardHeader business={business} onReport={() => setShowReport(true)} />

      <div>
        <SectionTitle>Métricas rápidas</SectionTitle>
        {errorStats ? (
          <ErrorBanner onRetry={handleRetry} />
        ) : (
          <StatsGrid stats={stats} loading={loadingStats} />
        )}
      </div>

      <div>
        <SectionTitle>Gestión</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RewardsSection rewards={rewards} loading={loadingRewards} />
          <LocationsSection locations={business?.locations} loading={!business} />
        </div>
      </div>

      <div>
        <SectionTitle>Actividad reciente</SectionTitle>
        <RecentClientsSection clients={recentClients} loading={loadingClients} />
      </div>

      {showReport && (
        <ReportModal business={business} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
