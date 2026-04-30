import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function parseAddress(raw = '') {
  const parts = raw.split('-');
  if (parts.length >= 3) {
    const state  = parts.pop().replace(/_/g, ' ');
    const city   = parts.pop().replace(/_/g, ' ');
    const street = parts.join('-').replace(/_/g, ' ');
    return { street, city, state };
  }
  return { street: raw.replace(/-/g, ' '), city: '', state: '' };
}

function ScheduleBadges({ schedule }) {
  if (!schedule) return null;
  const active = DAY_KEYS.filter((k) => schedule[k]?.open);
  if (!active.length) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {DAY_KEYS.map((key, i) => {
        const day = schedule[key];
        if (!day?.open) return null;
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-primary/10 text-brand-primary"
          >
            {DAYS[i].slice(0, 3)}
            <span className="text-neutral-500 font-normal">{day.from}–{day.to}</span>
          </span>
        );
      })}
    </div>
  );
}

function LocationCard({ location, onEdit }) {
  const { street, city, state } = parseAddress(location.address);
  const hasSchedule = location.schedule && DAY_KEYS.some((k) => location.schedule[k]?.open);

  return (
    <div className="flex items-start justify-between gap-3 py-3.5 border-b border-neutral-50 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-bold text-neutral-800 leading-tight">{location.name}</p>
          {location.isMain && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
              Principal
            </span>
          )}
        </div>

        <p className="text-[12px] text-neutral-500 mt-0.5 leading-snug">
          {[street, city, state].filter(Boolean).join(', ')}
        </p>

      </div>

      <button
        type="button"
        onClick={() => onEdit(location)}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Editar
      </button>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-[13px] font-semibold text-neutral-600">Sin sucursales</p>
      <p className="text-[12px] text-neutral-400">Agrega tu primera ubicación</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-1 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
      >
        Agregar sucursal
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="py-3.5 border-b border-neutral-50 last:border-0 space-y-2 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-3 w-28 rounded bg-neutral-100" />
        <div className="h-3 w-14 rounded bg-neutral-100" />
      </div>
      <div className="h-2.5 w-40 rounded bg-neutral-100" />
      <div className="h-2.5 w-32 rounded bg-neutral-100" />
    </div>
  );
}

export function LocationsSection({ locations, loading }) {
  const navigate = useNavigate();

  const handleEdit = (loc) => navigate('/business/dashboard/locations', { state: { editId: loc._id } });
  const handleAdd  = () => navigate('/business/dashboard/locations');

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-neutral-800">Sucursales</p>
          {!loading && locations?.length > 0 && (
            <p className="text-[11px] text-neutral-400 mt-0.5">{locations.length} ubicación{locations.length !== 1 ? 'es' : ''}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva
        </button>
      </div>

      <div className="px-5 divide-y divide-neutral-50">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !locations?.length ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          locations.map((loc) => (
            <LocationCard key={loc._id} location={loc} onEdit={handleEdit} />
          ))
        )}
      </div>
    </div>
  );
}
