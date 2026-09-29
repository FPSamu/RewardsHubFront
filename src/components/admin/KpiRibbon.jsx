import { formatCurrency, formatNumber } from '../../utils/format';

function sparklinePath(values) {
  const n = values.length;
  if (n < 2) return '';
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (n - 1)) * 100;
      const y = 22 - ((v - min) / range) * 20;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function deltaPct(current, previous) {
  if (previous > 0) return ((current - previous) / previous) * 100;
  return current > 0 ? 100 : 0;
}

function DeltaChip({ current, previous }) {
  if (current === 0 && previous === 0) {
    return <span className="kpi-delta text-[11px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400">Sin datos</span>;
  }
  const pct = deltaPct(current, previous);
  const flat = Math.round(pct) === 0;
  const up = pct > 0;
  const classes = flat
    ? 'bg-neutral-100 text-neutral-500'
    : up
    ? 'bg-accent-successBg text-accent-success'
    : 'bg-accent-dangerBg text-accent-danger';
  const arrow = flat ? '·' : up ? '↑' : '↓';
  return (
    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${classes}`}>
      {arrow} {Math.abs(Math.round(pct))}%
    </span>
  );
}

function Tile({ label, value, formatted, delta, sparkline, sparkColor, flatNote, alertNote }) {
  return (
    <div className="bg-surface rounded-xl border border-neutral-100 p-4 flex flex-col gap-2 transition-colors hover:border-neutral-200">
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span className="font-display tabular-nums text-[21px] font-extrabold text-neutral-950 leading-none tracking-tight">
          {formatted ?? formatNumber(value)}
        </span>
        {delta ? <DeltaChip current={delta.current} previous={delta.previous} /> : null}
        {flatNote ? <span className="text-[11px] font-semibold text-neutral-400 whitespace-nowrap">{flatNote}</span> : null}
        {alertNote ? <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-accent-dangerBg text-accent-danger whitespace-nowrap">{alertNote}</span> : null}
      </div>
      {sparkline ? (
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="w-full h-5">
          <path d={sparklinePath(sparkline)} fill="none" stroke={sparkColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <div className="h-5 flex items-center">
          <div className="w-full h-px bg-neutral-100" />
        </div>
      )}
    </div>
  );
}

function SkeletonTile() {
  return (
    <div className="bg-surface rounded-xl border border-neutral-100 p-4 flex flex-col gap-3">
      <div className="h-2.5 w-20 rounded bg-neutral-100 animate-pulse" />
      <div className="h-6 w-16 rounded bg-neutral-100 animate-pulse" />
      <div className="h-5 rounded bg-neutral-50 animate-pulse" />
    </div>
  );
}

export function KpiRibbon({ summary, timeSeries, loading, days = 30 }) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)}
      </div>
    );
  }

  const revenueSpark     = timeSeries?.map((d) => d.revenue) ?? [];
  const pointsSpark      = timeSeries?.map((d) => d.pointsDistributed) ?? [];
  const clientsSpark     = timeSeries?.map((d) => d.newClients) ?? [];
  const redemptionsSpark = timeSeries?.map((d) => d.redemptions) ?? [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Tile
        label="Clientes totales"
        value={summary.totalClients.current}
        delta={summary.totalClients}
        sparkline={clientsSpark}
        sparkColor="#0077CC"
      />
      <Tile
        label={`Ingresos · ${days}d`}
        formatted={formatCurrency(summary.revenue.current)}
        delta={summary.revenue}
        sparkline={revenueSpark}
        sparkColor="#C47D10"
      />
      <Tile
        label={`Puntos distribuidos · ${days}d`}
        value={summary.pointsDistributed.current}
        delta={summary.pointsDistributed}
        sparkline={pointsSpark}
        sparkColor="#22A06B"
      />
      <Tile
        label={`Recompensas canjeadas · ${days}d`}
        value={summary.redemptions.current}
        delta={summary.redemptions}
        sparkline={redemptionsSpark}
        sparkColor="#B33F8C"
      />
      <Tile
        label="Recompensas activas"
        value={summary.totalActiveRewards}
        flatNote="Disponibles hoy"
      />
      <Tile
        label="Clientes en riesgo"
        value={summary.atRiskClients}
        alertNote={summary.atRiskClients > 0 ? 'Revisar' : undefined}
        flatNote={summary.atRiskClients > 0 ? '30d o más' : 'Todo bien'}
      />
    </div>
  );
}
