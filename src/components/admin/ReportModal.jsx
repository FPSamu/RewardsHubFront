import { useState } from 'react';
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

function ReportSummary({ startDate, endDate }) {
  if (!startDate || !endDate) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-muted border border-brand-border">
      <svg className="w-4 h-4 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-[12px] text-brand-primary font-medium">
        {startDate === endDate ? startDate : `${startDate} al ${endDate}`}
      </p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function ReportModal({ onClose }) {
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
      const blob = await reportService.generate({ startDate, endDate });

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
          <DateRangeSelector
            preset={preset}
            onPreset={handlePreset}
            startDate={startDate}
            endDate={endDate}
            onStartDate={setStartDate}
            onEndDate={setEndDate}
          />

          <ReportSummary startDate={startDate} endDate={endDate} />

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
