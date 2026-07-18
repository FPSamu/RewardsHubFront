import { useMemo, useState } from 'react';

const COLORS = [
    { fill: '#EBA626', light: '#FDF3DC', text: '#6B3A00' },
    { fill: '#22A06B', light: '#F0FBF6', text: '#0A4A2E' },
    { fill: '#0077CC', light: '#F0F8FF', text: '#003D6B' },
    { fill: '#E5484D', light: '#FFF5F5', text: '#7A0D10' },
    { fill: '#9B5FD0', light: '#F5F0FF', text: '#3D1A6B' },
    { fill: '#D9930A', light: '#FEF8EE', text: '#3D2200' },
];

const INACTIVE = { fill: '#D1D5DB', light: '#F9FAFB', text: '#6B7280' };

const SIZE = 180;
const STROKE = 38;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function polarToXY(angleDeg, r) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: CX + r * Math.cos(rad),
        y: CY + r * Math.sin(rad),
    };
}

const BranchPieChart = ({ branchStats, locations }) => {
    const [hovered, setHovered] = useState(null);

    // Segments para la dona (solo sucursales con transacciones)
    const segments = useMemo(() => {
        const total = branchStats.reduce((s, b) => s + b.transactionCount, 0);
        if (total === 0) return [];

        let currentAngle = 0;
        let colorIdx = 0;
        return branchStats.map((branch) => {
            const pct = branch.transactionCount / total;
            const angle = pct * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const loc = locations.find((l) => (l._id || l.id) === branch.branchId);
            const label = loc?.name || loc?.address || (branch.branchId ? 'Sucursal' : 'Sin sucursal');
            const color = COLORS[colorIdx % COLORS.length];
            colorIdx++;

            return { ...branch, label, pct, angle, startAngle, endAngle, color };
        });
    }, [branchStats, locations]);

    // Leyenda completa: todas las sucursales, con o sin actividad
    const legendItems = useMemo(() => {
        let colorIdx = 0;
        return locations.map((loc) => {
            const locId = loc._id || loc.id;
            const stat = branchStats.find((b) => b.branchId === locId);
            const label = loc.name || loc.address || 'Sucursal';
            const active = !!stat;
            const color = active ? COLORS[colorIdx % COLORS.length] : INACTIVE;
            if (active) colorIdx++;

            // Índice en segments para sincronizar el hover
            const segIdx = active
                ? segments.findIndex((s) => s.branchId === locId)
                : -1;

            return { label, stat, active, color, segIdx, locId };
        });
    }, [locations, branchStats, segments]);

    const total = branchStats.reduce((s, b) => s + b.transactionCount, 0);

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-sm font-medium">Sin transacciones registradas aún</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Donut SVG */}
            <div className="relative flex-shrink-0">
                <svg width={SIZE} height={SIZE} className="drop-shadow-sm">
                    {/* Track */}
                    <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F3F4F6" strokeWidth={STROKE} />

                    {segments.map((seg, i) => {
                        const isHovered = hovered === i;
                        const strokeLen = (seg.angle / 360) * CIRCUMFERENCE;
                        return (
                            <circle
                                key={i}
                                cx={CX} cy={CY} r={R}
                                fill="none"
                                stroke={seg.color.fill}
                                strokeWidth={isHovered ? STROKE + 6 : STROKE}
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
                            {segments[hovered].label}: {Math.round(segments[hovered].pct * 100)}%
                        </div>
                    </div>
                )}
            </div>

            {/* Legend — todas las sucursales */}
            <div className="flex flex-col gap-2.5 w-full">
                {legendItems.map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150"
                        style={{
                            background: item.active && hovered === item.segIdx ? item.color.light : 'transparent',
                            cursor: item.active ? 'pointer' : 'default',
                            opacity: item.active ? 1 : 0.6,
                        }}
                        onMouseEnter={() => item.active && setHovered(item.segIdx)}
                        onMouseLeave={() => item.active && setHovered(null)}
                    >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color.fill }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
                            <p className="text-xs text-gray-500">
                                {item.active ? `${item.stat.transactionCount} transacciones` : 'Sin actividad'}
                            </p>
                        </div>
                        {item.active ? (
                            <span className="text-sm font-bold flex-shrink-0" style={{ color: item.color.fill }}>
                                {Math.round(item.stat.transactionCount / total * 100)}%
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400 flex-shrink-0">—</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BranchPieChart;
