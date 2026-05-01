import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';
import rewardService from '../services/rewardService';
import { BusinessAvatar } from '../components/client/shared/BusinessAvatar';

// ─── Leaflet markers ─────────────────────────────────────────────────────────

const USER_ICON = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:22px;height:22px">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(99,102,241,0.25);
        animation:mapPulse 2s ease-out infinite;
      "></div>
      <div style="
        position:absolute;inset:3px;border-radius:50%;
        background:#6366f1;border:2.5px solid white;
        box-shadow:0 2px 6px rgba(99,102,241,0.5);
      "></div>
    </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const PIN_COLORS = {
  reward:   '#10b981',
  visited:  '#6366f1',
  default:  '#9ca3af',
};

// Initial fallback when there's no logo
function nameInitial(name) {
  return (name?.[0] ?? '?').toUpperCase();
}

function createPin(type, logoUrl, name) {
  const color      = PIN_COLORS[type] ?? PIN_COLORS.default;
  const borderSize = type === 'reward' ? '2.5px' : '2px';
  const shadow     = type === 'reward'
    ? '0 2px 8px rgba(16,185,129,0.4)'
    : '0 2px 8px rgba(0,0,0,0.2)';

  const inner = logoUrl
    ? `<img src="${logoUrl}" style="
        width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;
      " />`
    : `<div style="
        width:100%;height:100%;border-radius:50%;
        background:${color};
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:13px;font-weight:700;font-family:system-ui,sans-serif;
        line-height:1;
      ">${nameInitial(name)}</div>`;

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px;height:36px;border-radius:50%;
        border:${borderSize} solid ${color};
        box-shadow:${shadow};
        background:white;
        overflow:hidden;
        display:flex;align-items:center;justify-content:center;
      ">${inner}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Inject pulse keyframe once
if (typeof document !== 'undefined' && !document.getElementById('map-pulse-style')) {
  const s = document.createElement('style');
  s.id = 'map-pulse-style';
  s.textContent = `
    @keyframes mapPulse {
      0%   { transform:scale(1);  opacity:.6 }
      70%  { transform:scale(2.4);opacity:0  }
      100% { transform:scale(1);  opacity:0  }
    }
    .leaflet-popup-content-wrapper {
      border-radius:14px !important;
      box-shadow:0 4px 20px rgba(0,0,0,0.12) !important;
      padding:0 !important;
    }
    .leaflet-popup-content { margin:0 !important; }
    .leaflet-popup-tip-container { display:none !important; }
  `;
  document.head.appendChild(s);
}

// ─── Map helpers ──────────────────────────────────────────────────────────────

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [target, map]);
  return null;
}

function RecenterBtn({ center }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(center, 14, { duration: 0.6 })}
      className="absolute bottom-20 right-3 z-[400] w-10 h-10 bg-surface rounded-xl shadow-card flex items-center justify-center text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all"
      title="Centrar en mi ubicación"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8V7m0 9v1M3 12h1m16 0h1" />
        <circle cx="12" cy="12" r="9" strokeWidth={1.75} />
        <circle cx="12" cy="12" r="3" strokeWidth={1.75} />
      </svg>
    </button>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MapLoading({ label }) {
  return (
    <div className="absolute inset-0 bg-neutral-100 flex flex-col items-center justify-center gap-3 z-10">
      <div className="w-12 h-12 rounded-full border-4 border-neutral-200 border-t-brand-primary animate-spin" />
      <p className="text-[13px] font-medium text-neutral-500">{label}</p>
    </div>
  );
}

function LocationBanner({ message }) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 shadow-card">
      <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p className="text-[11px] text-amber-800 font-medium">{message}</p>
    </div>
  );
}

function BusinessBottomCard({ biz, userPointsMap, rewardsMap, onClose }) {
  if (!biz) return null;
  const userPts = userPointsMap[biz.id] ?? {};
  const rewards = rewardsMap[biz.id] ?? [];
  const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${biz.location?.latitude},${biz.location?.longitude}`;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[400] p-3">
      <div className="bg-surface rounded-2xl shadow-lg overflow-hidden">
        {/* Handle */}
        <div className="w-8 h-1 bg-neutral-200 rounded-full mx-auto mt-3 mb-2" />

        <div className="px-4 pb-4 space-y-3">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <BusinessAvatar
              logoUrl={biz.logoUrl}
              name={biz.name}
              size="lg"
              className="border border-neutral-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-neutral-900 truncate leading-tight">{biz.name}</p>
              <p className="text-[12px] text-neutral-400 mt-0.5 truncate">
                {biz.distance} de distancia
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status badges row */}
          <div className="flex flex-wrap gap-1.5">
            {rewards.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-successBg text-accent-success text-[11px] font-bold rounded-full border border-accent-successBorder">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                {rewards.length} recompensa{rewards.length > 1 ? 's' : ''} disponible{rewards.length > 1 ? 's' : ''}
              </span>
            )}
            {biz.status === 'visited' && (
              <span className="px-2.5 py-1 bg-brand-muted text-brand-primary text-[11px] font-bold rounded-full">
                Visitado
              </span>
            )}
            {biz.status === 'not_visited' && (
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-500 text-[11px] font-medium rounded-full">
                Sin visitar
              </span>
            )}
          </div>

          {/* Points / stamps */}
          {((userPts.points ?? 0) > 0 || (userPts.stamps ?? 0) > 0) && (
            <div className="flex gap-2">
              {userPts.points > 0 && (
                <div className="flex-1 bg-brand-muted rounded-xl p-2.5 text-center">
                  <p className="text-[18px] font-extrabold text-brand-primary leading-none">{userPts.points}</p>
                  <p className="text-[10px] text-brand-primary/70 font-medium mt-0.5 uppercase tracking-wide">puntos</p>
                </div>
              )}
              {userPts.stamps > 0 && (
                <div className="flex-1 bg-accent-successBg rounded-xl p-2.5 text-center">
                  <p className="text-[18px] font-extrabold text-accent-success leading-none">{userPts.stamps}</p>
                  <p className="text-[10px] text-accent-success/70 font-medium mt-0.5 uppercase tracking-wide">sellos</p>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <a
            href={gmaps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-primary text-brand-onColor rounded-xl text-[13px] font-bold hover:opacity-90 active:scale-[.98] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cómo llegar
          </a>
        </div>
      </div>
    </div>
  );
}

function BusinessRow({ biz, userPointsMap, rewardsMap, onSelect }) {
  const userPts  = userPointsMap[biz.id] ?? {};
  const rewards  = rewardsMap[biz.id]    ?? [];

  return (
    <button
      onClick={() => onSelect(biz)}
      className="w-full flex items-center gap-3.5 px-0 py-3.5 text-left hover:bg-neutral-50 active:bg-neutral-100 transition-colors rounded-xl"
    >
      <BusinessAvatar
        logoUrl={biz.logoUrl}
        name={biz.name}
        size="lg"
        className="border border-neutral-200 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-neutral-900 truncate leading-tight">{biz.name}</p>
        <p className="text-[11px] text-neutral-400 mt-0.5">{biz.distance}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {rewards.length > 0 && (
            <span className="text-[10px] font-bold bg-accent-successBg text-accent-success px-2 py-0.5 rounded-full">
              {rewards.length} recompensa{rewards.length > 1 ? 's' : ''}
            </span>
          )}
          {(userPts.points ?? 0) > 0 && (
            <span className="text-[10px] font-semibold bg-brand-muted text-brand-primary px-2 py-0.5 rounded-full">
              {userPts.points} pts
            </span>
          )}
          {(userPts.stamps ?? 0) > 0 && (
            <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
              {userPts.stamps} sellos
            </span>
          )}
        </div>
      </div>

      <svg className="w-4 h-4 text-neutral-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'all',        label: 'Todos'         },
  { key: 'rewards',    label: 'Recompensas'   },
  { key: 'visited',    label: 'Visitados'     },
  { key: 'not_visited',label: 'Sin visitar'   },
];

export default function ClientMap() {
  const [businesses,     setBusinesses]     = useState([]);
  const [nearbyRaw,      setNearbyRaw]      = useState([]);
  const [userPointsMap,  setUserPointsMap]  = useState({});
  const [rewardsMap,     setRewardsMap]     = useState({});
  const [loading,        setLoading]        = useState(true);
  const [userLocation,   setUserLocation]   = useState(null);
  const [locationError,  setLocationError]  = useState(null);
  const [gettingLoc,     setGettingLoc]     = useState(true);
  const [activeFilter,   setActiveFilter]   = useState('all');
  const [selected,       setSelected]       = useState(null);
  const [flyTarget,      setFlyTarget]      = useState(null);

  // ── Get user location ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 20.6597, lng: -103.3496 });
      setLocationError('Geolocalización no soportada. Mostrando Guadalajara.');
      setGettingLoc(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setGettingLoc(false);
      },
      () => {
        setUserLocation({ lat: 20.6597, lng: -103.3496 });
        setLocationError('Ubicación no disponible. Mostrando Guadalajara.');
        setGettingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ── Fetch businesses ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!userLocation) return;

    const fetch = async () => {
      try {
        setLoading(true);

        const [pointsData, nearbyData] = await Promise.all([
          userPointsService.getUserPoints(),
          businessService.getNearbyBusinesses(userLocation.lat, userLocation.lng, 50),
        ]);

        // Build userPoints map: { businessId → { points, stamps } }
        const ptsMap = {};
        (pointsData?.businessPoints ?? []).forEach((bp) => {
          ptsMap[bp.businessId] = { points: bp.points || 0, stamps: bp.stamps || 0 };
        });
        setUserPointsMap(ptsMap);

        const rawList = nearbyData?.businesses ?? [];
        setNearbyRaw(rawList);

        // Deduplicate by id, keep closest
        const deduped = new Map();
        rawList.forEach((b) => {
          const prev = deduped.get(b.id);
          if (!prev || (b.distance ?? Infinity) < (prev.distance ?? Infinity)) {
            deduped.set(b.id, b);
          }
        });
        const uniqueList = Array.from(deduped.values());

        // Enrich with status + rewards
        const rMap = {};
        await Promise.all(
          uniqueList.map(async (b) => {
            try {
              const userPts = ptsMap[b.id];
              if (!userPts) { rMap[b.id] = []; return; }
              const allRewards = await rewardService.getBusinessRewards(b.id);
              rMap[b.id] = (allRewards ?? []).filter((r) => {
                if (!r.isActive) return false;
                if (r.pointsRequired != null) return userPts.points >= r.pointsRequired;
                if (r.stampsRequired != null) return userPts.stamps >= r.stampsRequired;
                return false;
              });
            } catch {
              rMap[b.id] = [];
            }
          })
        );
        setRewardsMap(rMap);

        const enriched = uniqueList.map((b) => {
          const userPts = ptsMap[b.id];
          const hasVisited = userPts && (userPts.points > 0 || userPts.stamps > 0);
          return {
            id:        b.id,
            name:      b.username ?? b.name ?? 'Negocio',
            logoUrl:   b.logoUrl ?? null,
            location:  b.location,
            distance:  b.distance != null ? `${b.distance.toFixed(1)} km` : '— km',
            distanceRaw: b.distance ?? 9999,
            status:    hasVisited ? 'visited' : 'not_visited',
            hasRewards: (rMap[b.id]?.length ?? 0) > 0,
          };
        });

        setBusinesses(enriched);
      } catch (e) {
        console.error('Error loading map data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userLocation]);

  // ── Select a business (from list or marker) ────────────────────────────────
  const handleSelect = useCallback((biz) => {
    setSelected(biz);
    if (biz.location?.latitude && biz.location?.longitude) {
      setFlyTarget([biz.location.latitude, biz.location.longitude]);
    }
  }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = businesses.filter((b) => {
    if (activeFilter === 'rewards')     return b.hasRewards;
    if (activeFilter === 'visited')     return b.status === 'visited';
    if (activeFilter === 'not_visited') return b.status === 'not_visited';
    return true;
  }).sort((a, b) => a.distanceRaw - b.distanceRaw);

  const counts = {
    all:         businesses.length,
    rewards:     businesses.filter(b => b.hasRewards).length,
    visited:     businesses.filter(b => b.status === 'visited').length,
    not_visited: businesses.filter(b => b.status === 'not_visited').length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pb-8">

      {/* ── Map ──────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: '60vh', minHeight: '300px' }}
      >
        {/* Loading overlay */}
        {(gettingLoc || loading) && (
          <MapLoading label={gettingLoc ? 'Obteniendo tu ubicación…' : 'Cargando negocios…'} />
        )}

        {userLocation && (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <FlyTo target={flyTarget} />

            {/* User location */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_ICON} />

            {/* Business markers */}
            {businesses.map((biz) => {
              if (!biz.location?.latitude || !biz.location?.longitude) return null;
              const pinType = biz.hasRewards ? 'reward' : biz.status === 'visited' ? 'visited' : 'default';
              return (
                <Marker
                  key={biz.id}
                  position={[biz.location.latitude, biz.location.longitude]}
                  icon={createPin(pinType, biz.logoUrl, biz.name)}
                  eventHandlers={{ click: () => handleSelect(biz) }}
                />
              );
            })}

            <RecenterBtn center={[userLocation.lat, userLocation.lng]} />
          </MapContainer>
        )}

        {/* Location error banner */}
        {locationError && !selected && (
          <LocationBanner message={locationError} />
        )}

        {/* Selected business card */}
        {selected && (
          <BusinessBottomCard
            biz={selected}
            userPointsMap={userPointsMap}
            rewardsMap={rewardsMap}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* ── Below map ──────────────────────────────────────────────────────── */}
      <div className="px-4 space-y-4 mt-4">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Cercanos',     value: counts.all,         accent: 'bg-brand-muted text-brand-primary'         },
            { label: 'Recompensas',  value: counts.rewards,     accent: 'bg-accent-successBg text-accent-success'   },
            { label: 'Visitados',    value: counts.visited,     accent: 'bg-accent-infoBg text-accent-info'         },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-xl shadow-card p-3 text-center">
              <p className={`text-[22px] font-extrabold leading-none ${s.accent.split(' ')[1]}`}>{s.value}</p>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                activeFilter === f.key
                  ? 'bg-brand-primary text-brand-onColor'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {f.label}
              {counts[f.key] > 0 && activeFilter !== f.key && (
                <span className="ml-1.5 text-[11px] opacity-60">{counts[f.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Business list */}
        <div className="bg-surface rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-neutral-800">Negocios cercanos</h3>
              <p className="text-[12px] text-neutral-400 mt-0.5">Radio de 50 km desde tu ubicación</p>
            </div>
            <span className="text-[12px] font-semibold text-neutral-400">{filtered.length} negocios</span>
          </div>

          {loading ? (
            <div className="divide-y divide-neutral-50">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3.5 px-5 py-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 bg-neutral-100 rounded-full" />
                    <div className="h-2.5 w-16 bg-neutral-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-neutral-600">Sin negocios en esta categoría</p>
              <p className="text-[12px] text-neutral-400">Prueba con otro filtro</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50 px-5">
              {filtered.map((biz) => (
                <BusinessRow
                  key={biz.id}
                  biz={biz}
                  userPointsMap={userPointsMap}
                  rewardsMap={rewardsMap}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
