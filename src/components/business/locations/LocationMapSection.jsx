import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

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
  shadowSize: [41, 41],
});

function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);
  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      icon={goldIcon}
      eventHandlers={{
        dragend() {
          const latlng = markerRef.current?.getLatLng();
          if (latlng) onPositionChange([latlng.lat, latlng.lng]);
        },
      }}
    />
  );
}

function MapUpdater({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h2 className="text-[14px] font-bold text-neutral-800">{title}</h2>
        {description && (
          <p className="text-[12px] text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

export function LocationMapSection({ street, city, state, position, onPositionChange }) {
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (!street || !city || !state) return;
    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: `${street}, ${city}, ${state}`, format: 'json', limit: 1 },
        });
        if (response.data?.length > 0) {
          const { lat, lon } = response.data[0];
          onPositionChange([parseFloat(lat), parseFloat(lon)]);
        }
      } catch {
        // silently ignore geocoding errors
      } finally {
        setIsGeocoding(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [street, city, state]);

  return (
    <SectionCard
      title="Ubicación en el mapa"
      description="El mapa se actualiza automáticamente. Arrastra el pin para mayor precisión."
    >
      <div className="isolate relative h-[280px] rounded-lg overflow-hidden border border-neutral-200">
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={position} />
          <DraggableMarker position={position} onPositionChange={onPositionChange} />
        </MapContainer>
        {isGeocoding && (
          <div className="absolute inset-0 bg-white/60 z-[1000] flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="animate-spin rounded-full h-7 w-7 border-4 border-brand-primary border-t-transparent mb-2" />
            <p className="text-[12px] font-semibold text-brand-primary">Buscando dirección…</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
