import { useState, useRef, useCallback } from 'react';
import BranchPieChart from './BranchPieChart';
import ShiftDonutChart from './ShiftDonutChart';

const PAGES = [
    {
        icon: (
            <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
        ),
        iconBg: 'bg-brand-muted',
        title: '¿Cuál sucursal genera más movimiento?',
        subtitle: 'Basado en el total de transacciones registradas',
    },
    {
        icon: (
            <svg className="w-5 h-5 text-accent-info" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        iconBg: 'bg-accent-infoBg',
        title: '¿En qué turno se genera más actividad?',
        subtitle: 'Filtra por sucursal para ver el detalle de turnos',
    },
];

const DRAG_THRESHOLD = 60;

export default function BranchActivityCarousel({ branchStats, shiftStats, locations }) {
    const [page, setPage] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const startX = useRef(null);
    const trackRef = useRef(null);

    const goTo = useCallback((p) => {
        setPage(Math.max(0, Math.min(PAGES.length - 1, p)));
    }, []);

    const onPointerDown = (e) => {
        // Ignore clicks on interactive children (buttons, selects)
        if (e.target.closest('button, select, input')) return;
        startX.current = e.clientX;
        setDragging(true);
        trackRef.current?.setPointerCapture(e.pointerId);
    };

    const onPointerMove = useCallback((e) => {
        if (!dragging || startX.current === null) return;
        const diff = e.clientX - startX.current;
        // Resist dragging past edges
        if (page === 0 && diff > 0) return;
        if (page === PAGES.length - 1 && diff < 0) return;
        setDragOffset(diff);
    }, [dragging, page]);

    const onPointerUp = useCallback(() => {
        if (!dragging) return;
        if (dragOffset < -DRAG_THRESHOLD) goTo(page + 1);
        else if (dragOffset > DRAG_THRESHOLD) goTo(page - 1);
        setDragOffset(0);
        setDragging(false);
        startX.current = null;
    }, [dragging, dragOffset, page, goTo]);

    const translateX = `calc(${-page * 100}% + ${dragOffset}px)`;

    return (
        <div className="flex flex-col gap-5">
            {/* Slide track */}
            <div
                ref={trackRef}
                className="overflow-hidden"
                style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
            >
                <div
                    style={{
                        display: 'flex',
                        transform: `translateX(${translateX})`,
                        transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: 'transform',
                        userSelect: 'none',
                    }}
                >
                    {/* Page 1 — Sucursales */}
                    <div style={{ minWidth: '100%' }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className={`${PAGES[0].iconBg} p-2.5 rounded-full flex-shrink-0`}>
                                {PAGES[0].icon}
                            </div>
                            <div>
                                <p className="text-[15px] font-bold text-neutral-800">{PAGES[0].title}</p>
                                <p className="text-[12px] text-neutral-500">{PAGES[0].subtitle}</p>
                            </div>
                        </div>
                        <BranchPieChart branchStats={branchStats} locations={locations} />
                    </div>

                    {/* Page 2 — Turnos */}
                    <div style={{ minWidth: '100%' }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className={`${PAGES[1].iconBg} p-2.5 rounded-full flex-shrink-0`}>
                                {PAGES[1].icon}
                            </div>
                            <div>
                                <p className="text-[15px] font-bold text-neutral-800">{PAGES[1].title}</p>
                                <p className="text-[12px] text-neutral-500">{PAGES[1].subtitle}</p>
                            </div>
                        </div>
                        <ShiftDonutChart shiftStats={shiftStats} locations={locations} />
                    </div>
                </div>
            </div>

            {/* Navigation bar */}
            <div className="flex items-center justify-center gap-3">
                {/* Prev arrow */}
                <button
                    onClick={() => goTo(page - 1)}
                    disabled={page === 0}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
                    style={{
                        background: page === 0 ? '#F3F4F6' : '#EBA626',
                        color: page === 0 ? '#D1D5DB' : '#6B3A00',
                        cursor: page === 0 ? 'default' : 'pointer',
                    }}
                    aria-label="Anterior"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                    {PAGES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Página ${i + 1}`}
                            style={{
                                width: i === page ? 20 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: i === page ? '#EBA626' : '#E5E7EB',
                                transition: 'all 0.25s ease',
                                cursor: 'pointer',
                                border: 'none',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>

                {/* Next arrow */}
                <button
                    onClick={() => goTo(page + 1)}
                    disabled={page === PAGES.length - 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
                    style={{
                        background: page === PAGES.length - 1 ? '#F3F4F6' : '#EBA626',
                        color: page === PAGES.length - 1 ? '#D1D5DB' : '#6B3A00',
                        cursor: page === PAGES.length - 1 ? 'default' : 'pointer',
                    }}
                    aria-label="Siguiente"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
