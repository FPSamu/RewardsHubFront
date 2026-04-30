import { useState, useEffect } from 'react';
import businessService from '../../../services/businessService';

function parseError(err) {
  if (typeof err === 'string') return err;
  return err?.message ?? err?.error ?? 'Error al guardar el nombre';
}

export function BusinessNameSection({ business, onUpdated }) {
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    setName(business?.name ?? '');
  }, [business?.name]);

  const isDirty = name.trim() !== (business?.name ?? '');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre no puede estar vacío'); return; }
    if (!isDirty) return;

    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const updated = await businessService.updateBusinessInfo({ name: name.trim() });
      const patch = { name: name.trim(), ...updated };
      onUpdated?.(patch);
      window.dispatchEvent(new CustomEvent('businessUpdated', { detail: patch }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div>
        <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
          Nombre del negocio
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); setSaved(false); }}
          maxLength={80}
          placeholder="Nombre de tu negocio"
          className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
        />
        {error && <p className="mt-1.5 text-[12px] text-accent-danger">{error}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="flex items-center gap-2 px-4 py-2 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-onColor border-t-transparent animate-spin" />
              Guardando…
            </>
          ) : 'Guardar'}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-accent-success">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Guardado
          </span>
        )}
      </div>
    </form>
  );
}
