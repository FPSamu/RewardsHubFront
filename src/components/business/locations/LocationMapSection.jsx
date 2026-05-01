import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const locationPin = L.divIcon({
  className: '',
  html: `
    <div style="
      width:36px;height:36px;border-radius:50%;
      background:#6366f1;border:3px solid white;
      box-shadow:0 3px 10px rgba(99,102,241,0.45);
      display:flex;align-items:center;justify-content:center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
      </svg>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);
  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      icon={locationPin}
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
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
