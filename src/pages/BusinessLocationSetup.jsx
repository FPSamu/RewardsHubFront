import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import businessService from '../services/businessService';
import axios from 'axios';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
      }
    },
  };
  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={goldIcon}
    />
  );
}

const MapUpdater = ({ center }) => {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export default function BusinessLocationSetup() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsBranchPassword, setNeedsBranchPassword] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    branchPassword: '',
  });
  
  // Map State
  const [mapPosition, setMapPosition] = useState([20.6597, -103.3496]);
  const [locationChanged, setLocationChanged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const data = await businessService.getMyBusiness();
      setLocations(data.locations || []);
      // Show branch password field when: Google account + no branch password set yet + no locations yet
      setNeedsBranchPassword(
        data.registeredWithGoogle === true && data.hasBranchPassword === false && (data.locations || []).length === 0
      );
    } catch (err) {
      console.error(err);
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVO: EFECTO AUTOMÁTICO (DEBOUNCE) ---
  useEffect(() => {
    // Si no hay datos suficientes o el formulario está cerrado, no hacemos nada
    if (!showForm || !formData.street || !formData.city || !formData.state) return;

    // Si el usuario ya movió el pin manualmente en esta sesión de edición,
    // podríamos optar por NO moverlo automáticamente para no frustrarlo.
    // Pero si quieres que la escritura siempre mande, quita la condición !locationChanged.
    // Aquí asumo que si escribe, quiere actualizar el mapa.
    
    const timerId = setTimeout(async () => {
        setGeocoding(true);
        try {
            const query = `${formData.street}, ${formData.city}, ${formData.state}`;
            // Usamos Nominatim para el preview visual
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: { q: query, format: 'json', limit: 1 }
            });

            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                const newPos = [parseFloat(lat), parseFloat(lon)];
                setMapPosition(newPos);
                setLocationChanged(true); // Marcamos que tenemos coordenadas válidas
            }
        } catch (err) {
            console.error("Error autocompletando mapa:", err);
        } finally {
            setGeocoding(false);
        }
    }, 1500); // Espera 1.5 segundos después de que el usuario deje de escribir

    // Cleanup: Si el usuario escribe antes de los 1.5s, cancelamos el timer anterior
    return () => clearTimeout(timerId);

  }, [formData.street, formData.city, formData.state, showForm]);


  const handleOpenForm = (location = null) => {
    if (location) {
      const parts = location.address ? location.address.split('-') : [];
      let street = '', city = '', state = '';
      if (parts.length >= 3) {
        state = parts.pop();
        city = parts.pop();
        street = parts.join('-');
      } else {
        street = location.address || '';
      }
      setFormData({ name: location.name || '', street, city, state, branchPassword: '' });
      if (location.latitude && location.longitude) {
        setMapPosition([location.latitude, location.longitude]);
      }
      setEditingId(location._id);
    } else {
      setFormData({ name: '', street: '', city: '', state: '', branchPassword: '' });
      setEditingId(null);
      setLocationChanged(false);
    }
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (locationId) => {
    if (!confirm('¿Estás seguro de eliminar esta sucursal?')) return;
    try {
      const updatedBiz = await businessService.deleteLocation(locationId);
      setLocations(updatedBiz.locations);
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleMapPositionChange = (newPos) => {
    setMapPosition(newPos);
    setLocationChanged(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const streetFmt = formData.street.trim().replace(/\s+/g, '-');
      const cityFmt = formData.city.trim().replace(/\s+/g, '-');
      const stateFmt = formData.state.trim().replace(/\s+/g, '-');
      const addressString = `${streetFmt}-${cityFmt}-${stateFmt}`;

      const payload = {
        name: formData.name.trim(),
        address: addressString
      };

      if (locationChanged || editingId) {
        payload.latitude = mapPosition[0];
        payload.longitude = mapPosition[1];
      }

      let updatedBiz;
      if (editingId) {
        updatedBiz = await businessService.updateLocation(editingId, payload);
      } else {
        // En creación, si se movió el mapa (automático o manual), enviamos coordenadas
        if (locationChanged) {
          payload.latitude = mapPosition[0];
          payload.longitude = mapPosition[1];
        }
        // Incluir branchPassword si es cuenta Google sin contraseña de sucursal configurada
        if (needsBranchPassword && formData.branchPassword.trim()) {
          payload.branchPassword = formData.branchPassword.trim();
        }
        updatedBiz = await businessService.addLocation(payload);
        // Una vez creada la primera sucursal, ya no se necesita el campo
        setNeedsBranchPassword(false);
      }

      setLocations(updatedBiz.locations);
      setShowForm(false);
      setLocationChanged(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al guardar. Verifica la dirección.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-card p-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Mis Sucursales</h2>
              <p className="text-gray-500 mt-1">Gestiona las ubicaciones físicas de tu negocio.</p>
            </div>
            {!showForm && (
              <button
                onClick={() => handleOpenForm()}
                className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Agregar Sucursal
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-brand-primary/20 mb-8 animate-fade-in shadow-inner">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Data */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ej: Sucursal Centro"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Calle y Número</label>
                      <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={e => setFormData({...formData, street: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Ciudad</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={e => setFormData({...formData, city: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={e => setFormData({...formData, state: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {/* Contraseña de sucursal — solo para cuentas Google sin password configurado */}
                    {needsBranchPassword && !editingId && (
                      <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-amber-800 font-medium">
                            Tu cuenta fue creada con Google. Define una contraseña de sucursal para que tu personal de caja pueda iniciar sesión sin acceder a tu correo.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Contraseña de Sucursal <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={formData.branchPassword}
                            onChange={e => setFormData({ ...formData, branchPassword: e.target.value })}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          />
                          <p className="text-xs text-amber-700 mt-1">Los cajeros usarán tu correo + esta contraseña para acceder.</p>
                        </div>
                      </div>
                    )}

                    {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
                  </div>

                  {/* Right Column: Map */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ubicación (Se actualiza al escribir la dirección)
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden h-[300px] relative">
                      <MapContainer
                        center={mapPosition}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={mapPosition} />
                        <DraggableMarker 
                          position={mapPosition} 
                          setPosition={handleMapPositionChange} 
                        />
                      </MapContainer>
                      
                      {/* Indicador de "Buscando..." sobre el mapa */}
                      {geocoding && (
                         <div className="absolute inset-0 bg-white/60 z-[1000] flex flex-col items-center justify-center backdrop-blur-sm">
                             <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-primary border-t-transparent mb-2"></div>
                             <p className="text-sm font-bold text-brand-primary">Buscando dirección...</p>
                         </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 El mapa se moverá automáticamente al escribir. Puedes arrastrar el marcador para mayor precisión.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2 bg-brand-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : 'Guardar Ubicación'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Sucursales (Se mantiene igual) */}
          <div className="space-y-4">
            {locations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p>No tienes sucursales registradas.</p>
              </div>
            ) : (
              locations.map((loc) => (
                <div key={loc._id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-800">{loc.name}</h3>
                      {loc.isMain && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">PRINCIPAL</span>}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{loc.address.replace(/-/g, ' ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenForm(loc)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(loc._id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => navigate('/business/dashboard')}
              className="text-brand-primary font-bold hover:underline flex items-center gap-1"
            >
              Continuar al Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}