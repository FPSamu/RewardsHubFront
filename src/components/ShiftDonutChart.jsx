import { useMemo, useState } from 'react';

const COLORS = [
    { fill: '#EBA626', light: '#FDF3DC' },
    { fill: '#22A06B', light: '#F0FBF6' },
    { fill: '#0077CC', light: '#F0F8FF' },
    { fill: '#E5484D', light: '#FFF5F5' },
    { fill: '#9B5FD0', light: '#F5F0FF' },
    { fill: '#D9930A', light: '#FEF8EE' },
];
const NO_SHIFT = { fill: '#D1D5DB', light: '#F9FAFB' };

const SIZE = 180;
const STROKE = 38;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

const ShiftDonutChart = ({ shiftStats, locations }) => {
    const firstBranchId = useMemo(() => {
        if (!shiftStats?.length) return null;
        const withBranch = shiftStats.find((s) => s.branchId !== null);
        return withBranch?.branchId ?? null;
    }, [shiftStats]);

    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const activeBranchId = selectedBranchId ?? firstBranchId;

    // Branches que tienen al menos 1 transacción de tipo 'add'
    const activeBranches = useMemo(() => {
        const seen = new Set();
        const result = [];
        shiftStats?.forEach((s) => {
            if (s.branchId && !seen.has(s.branchId)) {
                seen.add(s.branchId);
                const loc = locations?.find((l) => (l._id || l.id) === s.branchId);
                result.push({ id: s.branchId, label: loc?.name || loc?.address || 'Sucursal' });
            }
        });
        return result;
    }, [shiftStats, locations]);

    const [hovered, setHovered] = useState(null);

    const segments = useMemo(() => {
        const filtered = (shiftStats ?? []).filter((s) => s.branchId === activeBranchId);
        const total = filtered.reduce((s, x) => s + x.transactionCount, 0);
        if (total === 0) return [];

        let angle = 0;
        let colorIdx = 0;
        return filtered.map((item) => {
            const pct = item.transactionCount / total;
            const sweep = pct * 360;
            const startAngle = angle;
            angle += sweep;
            const isNoShift = item.shiftId === null;
            const color = isNoShift ? NO_SHIFT : COLORS[colorIdx++ % COLORS.length];
            return { ...item, pct, sweep, startAngle, color };
        });
    }, [shiftStats, activeBranchId]);

    const total = segments.reduce((s, x) => s + x.transactionCount, 0);

    if (!shiftStats?.length || activeBranches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">Sin datos de turnos aún</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Branch selector */}
            <div className="flex gap-2 flex-wrap">
                {activeBranches.map((b) => (
                    <button
                        key={b.id}
                        onClick={() => { setSelectedBranchId(b.id); setHovered(null); }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                        style={activeBranchId === b.id
                            ? { background: '#EBA626', color: '#6B3A00' }
                            : { background: '#F3F4F6', color: '#6B7280' }
                        }
                    >
                        {b.label}
                    </button>
                ))}
            </div>

            {total === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                    <p className="text-sm font-medium">Sin transacciones en esta sucursal</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Donut */}
                    <div className="relative flex-shrink-0">
                        <svg width={SIZE} height={SIZE} className="drop-shadow-sm">
                            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F3F4F6" strokeWidth={STROKE} />
                            {segments.map((seg, i) => {
                                const strokeLen = (seg.sweep / 360) * CIRCUMFERENCE;
                                return (
                                    <circle
                                        key={i}
                                        cx={CX} cy={CY} r={R}
                                        fill="none"
                                        stroke={seg.color.fill}
                                        strokeWidth={hovered === i ? STROKE + 6 : STROKE}
                                        strokeDasharray={`${strokeLen} ${CIRCUMFERENCE}`}
                                        strokeDashoffset={0}
                                        strokeLinecap="round"
                                        style={{
                                            transformOrigin: `${CX}px ${CY}px`,
                                            transform: `rotate(${seg.startAngle - 90}deg)`,
                                            transition: 'stroke-width 0.2s ease',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={() => setHovered(i)}
                                        onMouseLeave={() => setHovered(null)}
                                    />
                                );
                            })}
                            <text x={CX} y={CY - 8} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: '#1F2937' }}>
                                {total}
                            </text>
                            <text x={CX} y={CY + 12} textAnchor="middle" style={{ fontSize: 10, fill: '#6B7280', fontWeight: 500 }}>
                                transacciones
                            </text>
                        </svg>

                        {hovered !== null && segments[hovered] && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                                <div
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md text-white whitespace-nowrap"
                                    style={{ background: segments[hovered].color.fill }}
                                >
                                    {segments[hovered].shiftName}: {Math.round(segments[hovered].pct * 100)}%
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-2.5 w-full">
                        {segments.map((seg, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 cursor-pointer"
                                style={{ background: hovered === i ? seg.color.light : 'transparent' }}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color.fill }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-neutral-800 truncate">{seg.shiftName}</p>
                                    <p className="text-xs text-neutral-500">{seg.transactionCount} transacciones</p>
                                </div>
                                <span className="text-sm font-bold flex-shrink-0" style={{ color: seg.color.fill }}>
                                    {Math.round(seg.pct * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftDonutChart;
