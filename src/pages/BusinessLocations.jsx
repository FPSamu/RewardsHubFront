import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import businessService from '../services/businessService';
import workShiftService from '../services/workShiftService';
import { LocationInfoCard } from '../components/business/locations/LocationInfoCard';
import { LocationAddressSection } from '../components/business/locations/LocationAddressSection';
import { LocationMapSection } from '../components/business/locations/LocationMapSection';
import { LocationBranchPasswordNote } from '../components/business/locations/LocationBranchPasswordNote';
import { ExistingLocationsPanel } from '../components/business/locations/ExistingLocationsPanel';
import { LocationShiftsPanel } from '../components/business/locations/LocationShiftsPanel';
import { BranchPasswordSetup } from '../components/business/locations/BranchPasswordSetup';

const parseError = (err) =>
  typeof err === 'string' ? err : err?.message ?? err?.error ?? 'Error al guardar';

function EditingBanner({ name, onCancel }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <svg
          className="w-4 h-4 text-amber-600 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        <p className="text-[13px] font-semibold text-amber-800">
          Editando: <span className="font-bold">{name}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function SuccessBadge({ text }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-green-600">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {text}
    </span>
  );
}

export default function BusinessLocations() {
  const [locations, setLocations] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [business, setBusiness] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    branchPassword: '',
  });
  const [mapPosition, setMapPosition] = useState([20.6597, -103.3496]);
  const [locationChanged, setLocationChanged] = useState(false);

  const [needsBranchSetup, setNeedsBranchSetup] = useState(false);
  const [pendingShifts, setPendingShifts] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saved, setSaved] = useState(false);
  const [needsBranchPassword, setNeedsBranchPassword] = useState(false);

  const formRef = useRef(null);
  const routerLocation = useLocation();

  useEffect(() => {
    businessService
      .getMyBusiness()
      .then((data) => {
        const locs = data.locations || [];
        setLocations(locs);
        setBusiness(data);
        setNeedsBranchSetup(!data.hasBranchPassword);
        setNeedsBranchPassword(
          data.registeredWithGoogle === true &&
            data.hasBranchPassword === false &&
            locs.length === 0
        );

        // Pre-select a location for editing if navigated here with an editId
        const editId = routerLocation.state?.editId;
        if (editId) {
          const loc = locs.find((l) => l._id === editId);
          if (loc) {
            const parts = (loc.address || '').split('-');
            const state  = parts.pop()?.replace(/-/g, ' ') ?? '';
            const city   = parts.pop()?.replace(/-/g, ' ') ?? '';
            const street = parts.join('-').replace(/-/g, ' ');
            setFormData({ name: loc.name || '', street, city, state, branchPassword: '' });
            setEditingId(loc._id);
            if (loc.latitude && loc.longitude) setMapPosition([loc.latitude, loc.longitude]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPage(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setFormData({ name: '', street: '', city: '', state: '', branchPassword: '' });
    setEditingId(null);
    setLocationChanged(false);
    setSaved(false);
    setSubmitError('');
    setPendingShifts([]);
  };

  const handleEdit = (loc) => {
    const parts = (loc.address || '').split('-');
    const state = parts.pop()?.replace(/-/g, ' ') ?? '';
    const city = parts.pop()?.replace(/-/g, ' ') ?? '';
    const street = parts.join('-').replace(/-/g, ' ');

    setFormData({ name: loc.name || '', street, city, state, branchPassword: '' });
    setEditingId(loc._id);
    if (loc.latitude && loc.longitude) {
      setMapPosition([loc.latitude, loc.longitude]);
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSetMain = async (id) => {
    try {
      const updatedBiz = await businessService.updateLocation(id, { isMain: true });
      setLocations(updatedBiz.locations);
    } catch (err) {
      setSubmitError(parseError(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      const updatedBiz = await businessService.deleteLocation(id);
      setLocations(updatedBiz.locations);
    } catch (err) {
      setSubmitError(parseError(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, street, city, state, branchPassword } = formData;
    if (!name.trim() || !street.trim() || !city.trim() || !state.trim()) {
      setSubmitError('Completa todos los campos requeridos.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSaved(false);

    try {
      const addressString = `${street.trim().replace(/\s+/g, '-')}-${city.trim().replace(/\s+/g, '-')}-${state.trim().replace(/\s+/g, '-')}`;
      const payload = { name: name.trim(), address: addressString };

      if (locationChanged || editingId) {
        payload.latitude = mapPosition[0];
        payload.longitude = mapPosition[1];
      }

      let updatedBiz;
      if (editingId) {
        updatedBiz = await businessService.updateLocation(editingId, payload);
      } else {
        if (needsBranchPassword && branchPassword.trim()) {
          payload.branchPassword = branchPassword.trim();
        }
        updatedBiz = await businessService.addLocation(payload);
        setNeedsBranchPassword(false);

        // Find the newly created location and create its shifts via the work-shifts API
        if (pendingShifts.length) {
          const prevIds = new Set(locations.map((l) => l._id));
          const newLoc  = updatedBiz.locations?.find((l) => !prevIds.has(l._id));
          if (newLoc) {
            const businessId = business?.id ?? business?._id;
            await Promise.allSettled(
              pendingShifts.map((s) =>
                workShiftService.create({
                  businessId,
                  branchId:  newLoc._id,
                  name:      s.name,
                  startTime: s.startTime,
                  endTime:   s.endTime,
                  color:     s.color,
                })
              )
            );
          }
        }
      }

      setLocations(updatedBiz.locations);
      resetForm();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSubmitError(parseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const editingLocation = locations.find((l) => l._id === editingId);

  if (!loadingPage && needsBranchSetup) {
    return <BranchPasswordSetup onDone={() => setNeedsBranchSetup(false)} />;
  }

  return (
    <div className="pb-10 space-y-6">
      <div>
        <h1 className="text-[20px] font-extrabold text-neutral-900">Sucursales</h1>
        <p className="text-[13px] text-neutral-400 mt-0.5">
          Gestiona las ubicaciones físicas de tu negocio
        </p>
      </div>

      {editingId && (
        <EditingBanner name={editingLocation?.name} onCancel={resetForm} />
      )}

      <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <LocationInfoCard
              name={formData.name}
              onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
            />
            <LocationAddressSection
              street={formData.street}
              city={formData.city}
              state={formData.state}
              onChange={(v) => setFormData((p) => ({ ...p, ...v }))}
            />
            <LocationMapSection
              street={formData.street}
              city={formData.city}
              state={formData.state}
              position={mapPosition}
              onPositionChange={(pos) => {
                setMapPosition(pos);
                setLocationChanged(true);
              }}
            />
            {needsBranchPassword && !editingId && (
              <LocationBranchPasswordNote
                value={formData.branchPassword}
                onChange={(v) => setFormData((p) => ({ ...p, branchPassword: v }))}
              />
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="submit"
                disabled={submitting || (!editingId && pendingShifts.length === 0)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting && (
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                )}
                {submitting
                  ? 'Guardando…'
                  : editingId
                  ? 'Actualizar sucursal'
                  : 'Agregar sucursal'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
              )}
              {saved && <SuccessBadge text="Guardado" />}
            </div>

            {submitError && (
              <p className="text-[12px] text-accent-danger">{submitError}</p>
            )}
          </form>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <LocationShiftsPanel
            locations={locations}
            editingId={editingId}
            businessId={business?.id ?? business?._id}
            pendingShifts={pendingShifts}
            onPendingShiftsAdd={(s) => setPendingShifts((p) => [...p, s])}
            onPendingShiftsRemove={(i) => setPendingShifts((p) => p.filter((_, idx) => idx !== i))}
          />
          <ExistingLocationsPanel
            locations={locations}
            loading={loadingPage}
            editingId={editingId}
            onEdit={handleEdit}
            onSetMain={handleSetMain}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
