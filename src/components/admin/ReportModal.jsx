import { useState, useRef, useEffect } from 'react';
import reportService from '../../services/reportService';

// ─── Date presets ─────────────────────────────────────────────────────────────

const toISO = (d) => d.toISOString().split('T')[0];

const PRESETS = [
  {
    key: 'today',
    label: 'Hoy',
    range: () => { const t = toISO(new Date()); return { start: t, end: t }; },
  },
  {
    key: 'week',
    label: 'Últimos 7 días',
    range: () => {
      const end   = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { start: toISO(start), end: toISO(end) };
    },
  },
  {
    key: 'month',
    label: 'Este mes',
    range: () => {
      const now   = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toISO(start), end: toISO(now) };
    },
  },
  { key: 'custom', label: 'Personalizado', range: null },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
      {children}
    </p>
  );
}

function Checkbox({ checked, indeterminate }) {
  return (
    <div
      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked || indeterminate
          ? 'bg-brand-primary border-brand-primary'
          : 'border-neutral-300 bg-white'
      }`}
    >
      {indeterminate && !checked ? (
        <span className="block w-2 h-0.5 bg-white rounded-full" />
      ) : checked ? (
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
    </div>
  );
}

function LocationSelector({ locations, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!locations?.length) return null;

  const allSelected  = selected.size === 0;
  const someSelected = selected.size > 0 && selected.size < locations.length;

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else {
      next.add(id);
      if (next.size === locations.length) next.clear();
    }
    onChange(next);
  };

  const triggerLabel = allSelected
    ? 'Todas las sucursales'
    : selected.size === 1
    ? (locations.find((l) => selected.has(l._id))?.name ?? 'Sucursal seleccionada')
    : `${selected.size} sucursales seleccionadas`;

  return (
    <div ref={ref} className="relative">
      <SectionLabel>Sucursales</SectionLabel>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-left hover:border-neutral-300 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[13px] font-medium text-neutral-800 truncate">{triggerLabel}</span>
          {!allSelected && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold">
              {selected.size}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface rounded-xl shadow-popover border border-neutral-200 overflow-hidden z-20">
          {/* "Todas" row */}
          <button
            type="button"
            onClick={() => { onChange(new Set()); setOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold transition-colors ${
              allSelected ? 'bg-brand-primary/[0.06] text-brand-primary' : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Checkbox checked={allSelected} indeterminate={false} />
            Todas las sucursales
            <span className="ml-auto text-[11px] font-normal text-neutral-400">{locations.length}</span>
          </button>

          <div className="border-t border-neutral-100 max-h-48 overflow-y-auto">
            {locations.map((loc) => {
              const active = selected.has(loc._id);
              return (
                <button
                  key={loc._id}
                  type="button"
                  onClick={() => toggle(loc._id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${
                    active ? 'bg-brand-primary/[0.04] text-brand-primary' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Checkbox checked={active} indeterminate={false} />
                  <span className="flex-1 text-left truncate">
                    {loc.name || `Sucursal ${loc._id.slice(-4)}`}
                  </span>
                  {loc.isMain && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                      Principal
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {someSelected && (
            <div className="border-t border-neutral-100 px-4 py-2 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                {selected.size} de {locations.length} seleccionadas
              </span>
              <button
                type="button"
                onClick={() => onChange(new Set())}
                className="text-[11px] font-semibold text-brand-primary hover:underline"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DateRangeSelector({ preset, onPreset, startDate, endDate, onStartDate, onEndDate }) {
  return (
    <div>
      <SectionLabel>Rango de fechas</SectionLabel>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onPreset(key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
              preset === key
                ? 'bg-brand-primary text-brand-onColor'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom inputs */}
      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Desde</label>
            <input
              type="date"
              value={startDate}
              max={endDate || toISO(new Date())}
              onChange={(e) => onStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Hasta</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={toISO(new Date())}
              onChange={(e) => onEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      )}

      {/* Resolved range summary */}
      {preset !== 'custom' && startDate && (
        <p className="text-[12px] text-neutral-500 mt-1">
          {startDate === endDate ? startDate : `${startDate} → ${endDate}`}
        </p>
      )}
    </div>
  );
}

function ReportSummary({ locations, selectedLocations, startDate, endDate }) {
  const locationLabel = selectedLocations.size === 0
    ? 'Todas las sucursales'
    : `${selectedLocations.size} sucursal${selectedLocations.size !== 1 ? 'es' : ''}`;

  if (!startDate || !endDate) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-muted border border-brand-border">
      <svg className="w-4 h-4 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-[12px] text-brand-onColor">
        <span className="font-semibold">{locationLabel}</span>
        {' · '}
        {startDate === endDate ? startDate : `${startDate} al ${endDate}`}
      </p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function ReportModal({ business, onClose }) {
  const locations = business?.locations ?? [];

  const [selectedLocations, setSelectedLocations] = useState(new Set());
  const [preset,    setPreset]    = useState('month');
  const [startDate, setStartDate] = useState(() => PRESETS.find(p => p.key === 'month').range().start);
  const [endDate,   setEndDate]   = useState(() => PRESETS.find(p => p.key === 'month').range().end);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handlePreset = (key) => {
    setPreset(key);
    const found = PRESETS.find(p => p.key === key);
    if (found?.range) {
      const { start, end } = found.range();
      setStartDate(start);
      setEndDate(end);
    }
  };

  const isValid = startDate && endDate && startDate <= endDate;

  const handleGenerate = async () => {
    if (!isValid) {
      setError('Selecciona un rango de fechas válido');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const blob = await reportService.generateReport({
        startDate,
        endDate,
        locationIds: [...selectedLocations],
      });

      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.download = `reporte_${startDate}_${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-lg flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-muted flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-neutral-800">Generar reporte</h3>
              <p className="text-[12px] text-neutral-400">Exporta transacciones en PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {locations.length > 0 && (
            <LocationSelector
              locations={locations}
              selected={selectedLocations}
              onChange={setSelectedLocations}
            />
          )}

          <DateRangeSelector
            preset={preset}
            onPreset={handlePreset}
            startDate={startDate}
            endDate={endDate}
            onStartDate={setStartDate}
            onEndDate={setEndDate}
          />

          <ReportSummary
            locations={locations}
            selectedLocations={selectedLocations}
            startDate={startDate}
            endDate={endDate}
          />

          {error && (
            <p className="text-[12px] text-accent-danger bg-accent-dangerBg border border-accent-dangerBorder rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-neutral-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !isValid}
            className="flex-1 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-brand-onColor border-t-transparent animate-spin" />
                Generando…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
