import { useMemo, useRef, useState } from 'react';
import { formatCurrency, formatNumber } from '../../utils/format';

const CHART_W = 720;
const CHART_H = 220;
const PAD = 10;

function formatShortDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

const METRICS = [
  { key: 'revenue',     label: 'Ingresos',            color: '#C47D10', field: 'revenue',           fmt: formatCurrency, unitLabel: (d) => `suma de los últimos ${d} días · MXN` },
  { key: 'points',      label: 'Puntos',               color: '#22A06B', field: 'pointsDistributed', fmt: formatNumber,   unitLabel: (d) => `puntos distribuidos en los últimos ${d} días` },
  { key: 'clients',     label: 'Clientes nuevos',      color: '#0077CC', field: 'newClients',        fmt: formatNumber,   unitLabel: (d) => `clientes nuevos en los últimos ${d} días` },
  { key: 'redemptions', label: 'Recompensas canjeadas', color: '#B33F8C', field: 'redemptions',      fmt: formatNumber,   unitLabel: (d) => `recompensas canjeadas en los últimos ${d} días` },
];

function TrendChart({ data, metric, days }) {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const { points, areaPath, linePath, total } = useMemo(() => {
    const values = data.map((d) => d[metric.field] ?? 0);
    const n = values.length;
    if (n === 0) return { points: [], areaPath: '', linePath: '', total: 0 };

    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const pts = values.map((v, i) => {
      const x = n === 1 ? CHART_W / 2 : PAD + (i / (n - 1)) * (CHART_W - PAD * 2);
      const y = PAD + (1 - (v - min) / range) * (CHART_H - PAD * 2);
      return { x, y, v, date: data[i].date };
    });

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${CHART_H - PAD} L${pts[0].x.toFixed(1)},${CHART_H - PAD} Z`;
    const total = values.reduce((a, b) => a + b, 0);

    return { points: pts, areaPath: area, linePath: line, total };
  }, [data, metric]);

  const handleMove = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * CHART_W;
    let nearest = 0;
    let best = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - relX);
      if (d < best) { best = d; nearest = i; }
    });
    setHoverIdx(nearest);
  };

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;
  const gradId = `trend-grad-${metric.key}`;

  return (
    <div>
      <div className="flex items-baseline gap-2.5 flex-wrap mb-2">
        <span className="font-display tabular-nums text-[28px] font-extrabold text-neutral-950 leading-none tracking-tight">
          {metric.fmt(total)}
        </span>
        <span className="text-[12px] text-neutral-400">{metric.unitLabel(days)}</span>
      </div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="w-full h-[220px] block overflow-visible"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric.color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={metric.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {areaPath && <path d={areaPath} fill={`url(#${gradId})`} stroke="none" />}
          {linePath && (
            <path d={linePath} fill="none" stroke={metric.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {hovered && (
            <>
              <line x1={hovered.x} y1={PAD} x2={hovered.x} y2={CHART_H - PAD} stroke={metric.color} strokeWidth="1" strokeOpacity="0.22" />
              <circle cx={hovered.x} cy={hovered.y} r="4.5" fill={metric.color} stroke="white" strokeWidth="2" />
            </>
          )}
          <rect x="0" y="0" width={CHART_W} height={CHART_H} fill="transparent" />
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-md"
            style={{ left: `${(hovered.x / CHART_W) * 100}%`, top: `${(hovered.y / CHART_H) * 100}%`, marginTop: '-8px' }}
          >
            {metric.fmt(hovered.v)}
            <span className="block font-medium text-white/60 text-[10px] mt-0.5">{formatShortDate(hovered.date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-surface rounded-xl border border-neutral-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 rounded bg-neutral-100 animate-pulse" />
        <div className="h-7 w-64 rounded-full bg-neutral-100 animate-pulse" />
      </div>
      <div className="h-6 w-32 rounded bg-neutral-100 animate-pulse mb-4" />
      <div className="h-[220px] rounded-lg bg-neutral-50 animate-pulse" />
    </div>
  );
}

export function TimeSeriesSection({ data, loading, days = 30 }) {
  const [metricKey, setMetricKey] = useState('revenue');

  if (loading) return <SkeletonChart />;
  if (!data?.length) return null;

  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0];

  return (
    <div className="bg-surface rounded-xl border border-neutral-100 p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
        <div>
          <p className="text-[13.5px] font-bold text-neutral-800">Tendencia</p>
          <p className="text-[11.5px] text-neutral-400 mt-0.5">
            {formatShortDate(data[0].date)} — {formatShortDate(data[data.length - 1].date)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetricKey(m.key)}
              aria-pressed={m.key === metricKey}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                m.key === metricKey
                  ? 'bg-neutral-900 border-neutral-900 text-white'
                  : 'bg-surface border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: m.key === metricKey ? m.color : m.color, opacity: m.key === metricKey ? 1 : 0.55 }}
              />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <TrendChart data={data} metric={metric} days={days} />
    </div>
  );
}
