import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { businessService } from '../services/businessService';

// Fix default marker icon issue with Leaflet + Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom gold marker icon
const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle marker dragging
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

// Component to handle map clicks
function MapClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function BusinessLocationSetup() {
  const navigate = useNavigate();
  const [position, setPosition] = useState([20.6597, -103.3496]); // Guadalajara default
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    loadBusinessLocation();
  }, []);

  const loadBusinessLocation = async () => {
    try {
      setLoading(true);
      const data = await businessService.getMyBusiness();
      setBusinessInfo(data);

      // If location exists, use it as initial position
      if (data.location && data.location.latitude && data.location.longitude) {
        setPosition([data.location.latitude, data.location.longitude]);
      }
    } catch (err) {
      console.error('Error loading business location:', err);
      setError('No se pudo cargar la ubicación inicial');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    try {
      setSaving(true);
      setError('');

      await businessService.updateCoordinates({
        latitude: position[0],
        longitude: position[1]
      });

      // Navigate to subscription page after successful save
      navigate('/business/subscription');
    } catch (err) {
      console.error('Error saving coordinates:', err);
      setError('Error al guardar la ubicación. Por favor, intenta de nuevo.');
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/business/subscription');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500 mb-4"></div>
          <p className="text-gray-600">Cargando ubicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Confirma la ubicación de tu negocio
          </h1>
          <p className="text-gray-600">
            Arrastra el marcador dorado o haz clic en el mapa para ajustar la ubicación exacta de{' '}
            <span className="font-semibold text-amber-600">{businessInfo?.name}</span>
          </p>
          {businessInfo?.address && (
            <p className="text-sm text-gray-500 mt-2">
              📍 {businessInfo.address}
            </p>
          )}
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div style={{ height: '500px', width: '100%' }}>
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker position={position} setPosition={setPosition} />
              <MapClickHandler setPosition={setPosition} />
            </MapContainer>
          </div>
        </div>

        {/* Coordinates Display */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coordenadas seleccionadas:</p>
              <p className="font-mono text-sm text-gray-800 mt-1">
                Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>💡 Tip: Arrastra el marcador</p>
              <p>para mayor precisión</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Omitir por ahora
          </button>
          <button
            onClick={handleSaveLocation}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <span>✓</span>
                Confirmar ubicación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
