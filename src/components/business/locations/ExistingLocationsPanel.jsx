import { useState } from 'react';

function SkeletonRow() {
  return (
    <div className="px-5 py-4 border-b border-neutral-100 last:border-0 animate-pulse space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-3 w-28 rounded bg-neutral-100" />
        <div className="h-3 w-14 rounded bg-neutral-100" />
      </div>
      <div className="h-2.5 w-40 rounded bg-neutral-100" />
    </div>
  );
}

function parseAddress(raw = '') {
  const parts = raw.split('-');
  if (parts.length >= 3) {
    const state = parts.pop().replace(/-/g, ' ');
    const city = parts.pop().replace(/-/g, ' ');
    const street = parts.join('-').replace(/-/g, ' ');
    return [street, city, state].filter(Boolean).join(', ');
  }
  return raw.replace(/-/g, ' ');
}

export function ExistingLocationsPanel({ locations, loading, editingId, onEdit, onDelete, onSetMain }) {
  const [pendingDelete,  setPendingDelete]  = useState(null);
  const [pendingMain,    setPendingMain]    = useState(null);
  const [settingMain,    setSettingMain]    = useState(false);

  const handleSetMain = async (id) => {
    setSettingMain(true);
    try {
      await onSetMain(id);
    } finally {
      setSettingMain(false);
      setPendingMain(null);
    }
  };

  const handleDeleteClick = (id) => {
    if (pendingDelete === id) {
      onDelete(id);
      setPendingDelete(null);
    } else {
      setPendingDelete(id);
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-neutral-800">Mis sucursales</h2>
        {!loading && locations?.length > 0 && (
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-neutral-100 text-[11px] font-bold text-neutral-500">
            {locations.length}
          </span>
        )}
      </div>

      <div className="divide-y divide-neutral-100">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : !locations?.length ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center px-5">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-neutral-600">Sin sucursales registradas</p>
            <p className="text-[12px] text-neutral-400">Agrega tu primera ubicación en el formulario</p>
          </div>
        ) : (
          locations.map((loc) => (
            <div
              key={loc._id}
              className={`px-5 py-4 transition-all ${
                editingId === loc._id ? 'ring-2 ring-inset ring-brand-primary/40 bg-brand-primary/[0.03]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-neutral-800 leading-tight">{loc.name}</p>
                    {loc.isMain && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-neutral-500 mt-0.5 leading-snug">
                    {parseAddress(loc.address)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!loc.isMain && (
                    <button
                      type="button"
                      onClick={() => setPendingMain(loc._id)}
                      disabled={settingMain}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-500 transition-colors"
                      title="Establecer como principal"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(loc)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
                    title="Editar"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(loc._id)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {pendingMain === loc._id && (
                <div className="mt-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-[12px] font-semibold text-neutral-600">¿Establecer como principal?</span>
                  <button
                    type="button"
                    onClick={() => handleSetMain(loc._id)}
                    disabled={settingMain}
                    className="px-2.5 py-1 rounded-pill bg-amber-500 text-white text-[11px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {settingMain ? '…' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingMain(null)}
                    className="px-2.5 py-1 rounded-pill border border-neutral-200 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {pendingDelete === loc._id && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-neutral-600">¿Eliminar?</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(loc._id)}
                    className="px-2.5 py-1 rounded-pill bg-accent-danger text-white text-[11px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="px-2.5 py-1 rounded-pill border border-neutral-200 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
