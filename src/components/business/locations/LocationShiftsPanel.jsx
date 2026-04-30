import { useState, useEffect } from 'react';
import workShiftService from '../../../services/workShiftService';

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
  '#EF4444', '#06B6D4', '#F97316', '#EC4899',
];

const EMPTY_FORM = { name: '', startTime: '08:00', endTime: '17:00', color: PRESET_COLORS[0] };

const parseError = (err) =>
  typeof err === 'string' ? err : err?.message ?? err?.error ?? 'Error al guardar';

// ─── Shared sub-components ────────────────────────────────────────────────────

function ColorPicker({ value, onChange }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-neutral-600 mb-2">Color</label>
      <div className="flex gap-2 flex-wrap">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            style={{ backgroundColor: c }}
            className={`w-6 h-6 rounded-full transition-transform ${
              value === c ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110' : 'hover:scale-110'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ShiftForm({ onSave, onCancel, saving }) {
  const [form,  setForm]  = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre del turno es requerido'); return; }
    setError('');
    try {
      await onSave({ ...form, name: form.name.trim() });
    } catch (err) {
      setError(parseError(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pt-3 pb-1 space-y-3 border-t border-neutral-100">
      <div>
        <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
          Nombre del turno
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Ej: Turno Mañana"
          maxLength={40}
          className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Inicio</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Fin</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      <ColorPicker value={form.color} onChange={(c) => setForm((p) => ({ ...p, color: c }))} />

      {error && <p className="text-[12px] text-accent-danger">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
          {saving ? 'Guardando…' : 'Agregar turno'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-pill border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ShiftRow({ shift, onDelete }) {
  const [pendingDel, setPendingDel] = useState(false);

  return (
    <div className="py-3 border-b border-neutral-50 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: shift.color ?? '#3B82F6' }}
          />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-neutral-800 leading-tight">{shift.name}</p>
            <p className="text-[12px] text-neutral-500 mt-0.5">
              {shift.startTime} – {shift.endTime}
            </p>
            {!shift.isActive && (
              <span className="text-[10px] font-semibold text-neutral-400">Inactivo</span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          {!pendingDel ? (
            <button
              type="button"
              onClick={() => setPendingDel(true)}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { onDelete(shift.id); setPendingDel(false); }}
                className="px-2 py-1 rounded-pill bg-accent-danger text-white text-[11px] font-semibold hover:opacity-90"
              >
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => setPendingDel(false)}
                className="px-2 py-1 rounded-pill border border-neutral-200 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingShiftRow({ shift, onRemove }) {
  return (
    <div className="py-3 border-b border-neutral-50 last:border-0 flex items-start justify-between gap-2">
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: shift.color ?? '#3B82F6' }}
        />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-neutral-800 leading-tight">{shift.name}</p>
          <p className="text-[12px] text-neutral-500 mt-0.5">{shift.startTime} – {shift.endTime}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function EmptyShifts({ onAdd }) {
  return (
    <div className="py-5 text-center border border-dashed border-neutral-200 rounded-xl">
      <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-[12px] font-semibold text-neutral-500">Sin turnos registrados</p>
      <button type="button" onClick={onAdd} className="mt-2 text-[12px] font-bold text-brand-primary hover:underline">
        + Agregar primer turno
      </button>
    </div>
  );
}

function SkeletonShift() {
  return (
    <div className="py-3 border-b border-neutral-50 last:border-0 flex items-center gap-2.5 animate-pulse">
      <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 flex-shrink-0" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 w-28 rounded bg-neutral-100" />
        <div className="h-2.5 w-20 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

// ─── Creating mode: local pending shifts ────────────────────────────────────

function CreatingShiftsPanel({ shifts, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-bold text-neutral-800">Turnos</p>
          <p className="text-[12px] text-neutral-400 mt-0.5">Se guardarán junto con la sucursal</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {shifts.length === 0 && !showForm && (
          <EmptyShifts onAdd={() => setShowForm(true)} />
        )}
        {shifts.length > 0 && !showForm && (
          <div className="divide-y divide-neutral-50">
            {shifts.map((shift, i) => (
              <PendingShiftRow key={i} shift={shift} onRemove={() => onRemove(i)} />
            ))}
          </div>
        )}
        {showForm && (
          <ShiftForm
            onSave={(data) => { onAdd(data); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
            saving={false}
          />
        )}
      </div>
    </div>
  );
}

// ─── Editing mode: shifts from API ──────────────────────────────────────────

function EditingShiftsPanel({ location, businessId }) {
  const [shifts,    setShifts]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setShifts([]);
    workShiftService.getByBranch(location._id)
      .then((data) => { if (!cancelled) setShifts(data ?? []); })
      .catch(() => { if (!cancelled) setShifts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [location._id]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const created = await workShiftService.create({
        businessId,
        branchId: location._id,
        name:      formData.name,
        startTime: formData.startTime,
        endTime:   formData.endTime,
        color:     formData.color,
      });
      setShifts((prev) => [...prev, created]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (shiftId) => {
    await workShiftService.delete(shiftId);
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  };

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-neutral-800">Turnos</p>
          <p className="text-[12px] text-neutral-400 mt-0.5 truncate">{location.name}</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {loading && (
          <div className="divide-y divide-neutral-50">
            <SkeletonShift />
            <SkeletonShift />
          </div>
        )}

        {!loading && shifts.length === 0 && !showForm && (
          <EmptyShifts onAdd={() => setShowForm(true)} />
        )}

        {!loading && shifts.length > 0 && !showForm && (
          <div className="divide-y divide-neutral-50">
            {shifts.map((shift) => (
              <ShiftRow key={shift.id} shift={shift} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {showForm && (
          <ShiftForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export function LocationShiftsPanel({
  locations,
  editingId,
  businessId,
  pendingShifts,
  onPendingShiftsAdd,
  onPendingShiftsRemove,
}) {
  const editingLocation = locations?.find((l) => l._id === editingId);

  if (editingId && editingLocation) {
    return (
      <EditingShiftsPanel
        key={editingId}
        location={editingLocation}
        businessId={businessId}
      />
    );
  }

  return (
    <CreatingShiftsPanel
      shifts={pendingShifts}
      onAdd={onPendingShiftsAdd}
      onRemove={onPendingShiftsRemove}
    />
  );
}
