import { useMemo, useRef, useState } from 'react';
import { formatCurrency, formatNumber } from '../../utils/format';

const CHART_W = 280;
const CHART_H = 64;
const PAD = 4;

function formatShortDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

// Single-series sparkline with a hover crosshair + tooltip. One metric, one
// axis, one hue — no legend needed since the card title already names it.
function MiniAreaChart({ color, values }) {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const { points, areaPath, linePath } = useMemo(() => {
    const n = values.length;
    if (n === 0) return { points: [], areaPath: '', linePath: '' };

    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const pts = values.map((v, i) => {
      const x = n === 1 ? CHART_W / 2 : PAD + (i / (n - 1)) * (CHART_W - PAD * 2);
      const y = PAD + (1 - (v - min) / range) * (CHART_H - PAD * 2);
      return { x, y, v };
    });

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${CHART_H - PAD} L${pts[0].x.toFixed(1)},${CHART_H - PAD} Z`;

    return { points: pts, areaPath: area, linePath: line };
  }, [values]);

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

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full h-16 overflow-visible"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {areaPath && <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} stroke="none" />}
        {linePath && (
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {hovered && (
          <>
            <line x1={hovered.x} y1={PAD} x2={hovered.x} y2={CHART_H - PAD} stroke={color} strokeWidth="1" strokeOpacity="0.25" />
            <circle cx={hovered.x} cy={hovered.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
          </>
        )}

        {/* Invisible wide hit area so hover works across the full width */}
        <rect x="0" y="0" width={CHART_W} height={CHART_H} fill="transparent" />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute -top-2 -translate-x-1/2 -translate-y-full px-2 py-1 rounded-lg bg-neutral-900 text-white text-[10px] font-semibold whitespace-nowrap shadow-md"
          style={{ left: `${(hovered.x / CHART_W) * 100}%` }}
        >
          {formatNumber(hovered.v)}
        </div>
      )}
    </div>
  );
}

function MetricChart({ icon, label, color, bg, ring, values, total, formatTotal }) {
  return (
    <div className="bg-surface rounded-xl shadow-card p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${bg} ${ring}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-extrabold text-neutral-950 leading-none tracking-tight">
            {formatTotal ? formatTotal(total) : formatNumber(total)}
          </p>
          <p className="text-[11px] font-semibold text-neutral-500 mt-0.5">{label}</p>
        </div>
      </div>
      <MiniAreaChart color={color} values={values} />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-surface rounded-xl shadow-card p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-16 rounded bg-neutral-100 animate-pulse" />
          <div className="h-2.5 w-24 rounded bg-neutral-100 animate-pulse" />
        </div>
      </div>
      <div className="h-16 rounded-lg bg-neutral-50 animate-pulse" />
    </div>
  );
}

export function TimeSeriesSection({ data, loading, days = 30 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonChart /><SkeletonChart /><SkeletonChart />
      </div>
    );
  }

  if (!data?.length) return null;

  const revenue     = data.map((d) => d.revenue);
  const points      = data.map((d) => d.pointsDistributed);
  const newClients  = data.map((d) => d.newClients);

  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  return (
    <div>
      <p className="text-[12px] text-neutral-400 mb-3">
        {formatShortDate(data[0].date)} — {formatShortDate(data[data.length - 1].date)}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricChart
          label={`Ingresos · últimos ${days} días`}
          color="#C47D10"
          bg="bg-brand-muted"
          ring="ring-brand-border"
          icon={
            <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          values={revenue}
          total={sum(revenue)}
          formatTotal={formatCurrency}
        />
        <MetricChart
          label={`Puntos distribuidos · últimos ${days} días`}
          color="#22A06B"
          bg="bg-accent-successBg"
          ring="ring-accent-successBorder"
          icon={
            <svg className="w-4 h-4 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          values={points}
          total={sum(points)}
        />
        <MetricChart
          label={`Clientes nuevos · últimos ${days} días`}
          color="#0077CC"
          bg="bg-accent-infoBg"
          ring="ring-blue-200"
          icon={
            <svg className="w-4 h-4 text-accent-info" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          values={newClients}
          total={sum(newClients)}
        />
      </div>
    </div>
  );
}
