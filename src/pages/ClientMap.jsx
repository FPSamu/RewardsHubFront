import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';
import rewardService from '../services/rewardService';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon for user location (red with person symbol)
const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `
        <div style="
            background-color: #ef4444;
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <svg style="
                width: 24px;
                height: 24px;
                transform: rotate(45deg);
                fill: white;
            " viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Custom icons for businesses based on status
const createBusinessIcon = (color, hasRewards = false, logoUrl = null) => {
    const colorMap = {
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
    };

    // If logo exists, show logo in a circular marker
    if (logoUrl) {
        return L.divIcon({
            className: 'custom-business-marker',
            html: `
                <div style="
                    position: relative;
                    width: 44px;
                    height: 44px;
                ">
                    <div style="
                        background-color: white;
                        width: 44px;
                        height: 44px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid ${colorMap[color] || colorMap.blue};
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                    ">
                        <img 
                            src="${logoUrl}" 
                            alt="Logo"
                            style="
                                width: 32px;
                                height: 32px;
                                object-fit: cover;
                                transform: rotate(45deg);
                                border-radius: 4px;
                            "
                        />
                    </div>
                    ${hasRewards ? `
                        <div style="
                            position: absolute;
                            top: -2px;
                            right: -2px;
                            background-color: #ef4444;
                            border-radius: 50%;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 2px solid white;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                        ">
                            <span style="font-size: 11px;">🎁</span>
                        </div>
                    ` : ''}
                </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 44],
            popupAnchor: [0, -44],
        });
    }

    // Default marker without logo
    return L.divIcon({
        className: 'custom-business-marker',
        html: `
            <div style="
                background-color: ${colorMap[color] || colorMap.blue};
                width: 36px;
                height: 36px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            ">
                <svg style="
                    width: 20px;
                    height: 20px;
                    transform: rotate(45deg);
                    fill: white;
                " viewBox="0 0 24 24">
                    <path d="M12 2L2 7v2h20V7L12 2zm0 2.18L18.09 7H5.91L12 4.18zM2 9v2h2v9h2V11h2v9h2V11h2v9h2V11h2v9h2V11h2v9h2v-9h2V9H2z"/>
                </svg>
                ${hasRewards ? `
                    <div style="
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background-color: #ef4444;
                        border-radius: 50%;
                        width: 18px;
                        height: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 2px solid white;
                        transform: rotate(45deg);
                    ">
                        <span style="font-size: 12px;">🎁</span>
                    </div>
                ` : ''}
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
};

// Custom component to update map center when location changes
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const ClientMap = () => {
    const [businesses, setBusinesses] = useState([]);
    const [nearbyBusinesses, setNearbyBusinesses] = useState([]);
    const [userPointsData, setUserPointsData] = useState(null);
    const [businessesWithRewards, setBusinessesWithRewards] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    // Get user location
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('La geolocalización no está soportada en tu navegador');
            setGettingLocation(false);
            // Default to Guadalajara center if geolocation not supported
            setUserLocation({ lat: 20.6597, lng: -103.3496 });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationError(null);
                setGettingLocation(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                let errorMessage = 'No se pudo obtener tu ubicación';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Información de ubicación no disponible.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
                        break;
                }

                setLocationError(errorMessage);
                setGettingLocation(false);
                // Default to Guadalajara center on error
                setUserLocation({ lat: 20.6597, lng: -103.3496 });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    // Fetch businesses when user location is available
    useEffect(() => {
        const fetchBusinesses = async () => {
            if (!userLocation) return;

            try {
                setLoading(true);

                // Fetch user points to determine visited businesses
                const pointsData = await userPointsService.getUserPoints();
                setUserPointsData(pointsData);

                // Fetch nearby businesses using user's location
                const nearbyData = await businessService.getNearbyBusinesses(
                    userLocation.lat,
                    userLocation.lng,
                    50 // 50km radius
                );

                // Create a map of visited businesses with points/stamps
                const visitedMap = {};
                if (pointsData && pointsData.businessPoints) {
                    pointsData.businessPoints.forEach(bp => {
                        visitedMap[bp.businessId] = {
                            points: bp.points || 0,
                            stamps: bp.stamps || 0,
                            lastVisit: bp.lastVisit
                        };
                    });
                }

                // Process nearby businesses and check for available rewards
                const businessesData = nearbyData.businesses || [];
                setNearbyBusinesses(businessesData);

                // Fetch available rewards for each business
                const rewardsMap = {};
                await Promise.all(
                    businessesData.map(async (business) => {
                        try {
                            const userPoints = visitedMap[business.id];
                            if (!userPoints) {
                                rewardsMap[business.id] = [];
                                return;
                            }

                            // Get rewards for this business
                            const rewards = await rewardService.getBusinessRewards(business.id);

                            // Filter rewards that user can redeem
                            const availableRewards = rewards.filter(reward => {
                                if (!reward.isActive) return false;

                                // Check if user has enough points for points-based rewards
                                if (reward.pointsRequired !== undefined && reward.pointsRequired !== null) {
                                    return userPoints.points >= reward.pointsRequired;
                                }

                                // Check if user has enough stamps for stamps-based rewards
                                if (reward.stampsRequired !== undefined && reward.stampsRequired !== null) {
                                    return userPoints.stamps >= reward.stampsRequired;
                                }

                                return false;
                            });

                            rewardsMap[business.id] = availableRewards;
                        } catch (err) {
                            console.error(`Error fetching rewards for business ${business.id}:`, err);
                            rewardsMap[business.id] = [];
                        }
                    })
                );

                setBusinessesWithRewards(rewardsMap);

                // Map businesses with status and user data
                const enrichedBusinesses = businessesData.map(business => {
                    const businessId = business.id;
                    const visited = visitedMap[businessId];
                    const availableRewards = rewardsMap[businessId] || [];

                    // Determine primary status
                    // Status logic: visited if has points/stamps, not_visited otherwise
                    // rewards_available is tracked separately
                    let status = 'not_visited';
                    if (visited && (visited.points > 0 || visited.stamps > 0)) {
                        status = 'visited';
                    }

                    return {
                        id: businessId,
                        name: business.name,
                        address: business.address || business.location?.formattedAddress || 'Dirección no disponible',
                        location: business.location,
                        status: status,
                        points: visited ? visited.points : 0,
                        stamps: visited ? visited.stamps : 0,
                        distance: business.distance ? `${business.distance.toFixed(1)} km` : '-- km',
                        availableRewards: availableRewards.length,
                        hasRewards: availableRewards.length > 0, // Track if has rewards separately
                    };
                });

                // DEDUPLICAR: Si hay múltiples sucursales del mismo negocio (mismo id),
                // mantener solo una (la más cercana)
                const uniqueBusinessesMap = new Map();
                enrichedBusinesses.forEach(business => {
                    const existingBusiness = uniqueBusinessesMap.get(business.id);

                    // Si no existe o este está más cerca, guardarlo
                    if (!existingBusiness) {
                        uniqueBusinessesMap.set(business.id, business);
                    } else {
                        // Comparar distancias (convertir de string "X.X km" a número)
                        const existingDistance = parseFloat(existingBusiness.distance);
                        const currentDistance = parseFloat(business.distance);

                        if (!isNaN(currentDistance) && (isNaN(existingDistance) || currentDistance < existingDistance)) {
                            uniqueBusinessesMap.set(business.id, business);
                        }
                    }
                });

                // Convertir el Map de vuelta a array
                const deduplicatedBusinesses = Array.from(uniqueBusinessesMap.values());

                console.log('📊 Negocios antes de deduplicar:', enrichedBusinesses.length);
                console.log('📊 Negocios después de deduplicar:', deduplicatedBusinesses.length);

                setBusinesses(deduplicatedBusinesses);
                setError(null);
            } catch (err) {
                console.error('Error fetching businesses:', err);
                // Don't block the UI, just log the error
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [userLocation]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando negocios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
            </div>
        );
    }

    // Use real data if available
    const allBusinesses = businesses || [];

    // Filter businesses based on active filter
    const getFilteredBusinesses = () => {
        let filtered = [];

        // Calculate these arrays fresh each time to avoid stale data
        const visited = allBusinesses.filter((b) => b.status === 'visited');
        const notVisited = allBusinesses.filter((b) => b.status === 'not_visited');
        const rewardsAvailable = allBusinesses.filter((b) => b.hasRewards === true);

        // Filter by status
        switch (activeFilter) {
            case 'visited':
                filtered = visited;
                break;
            case 'rewards':
                filtered = rewardsAvailable;
                break;
            case 'not_visited':
                filtered = notVisited;
                break;
            case 'all':
            default:
                filtered = allBusinesses;
                break;
        }

        return filtered;
    };

    const filteredBusinesses = getFilteredBusinesses();

    // Calculate counts for the filter buttons
    const visited = allBusinesses.filter((b) => b.status === 'visited');
    const notVisited = allBusinesses.filter((b) => b.status === 'not_visited');
    const rewardsAvailable = allBusinesses.filter((b) => b.hasRewards === true);

    const getStatusBadge = (status, hasRewards) => {
        if (hasRewards) {
            return <span className="px-3 py-1 bg-green-50 text-accent-successOnColor text-xs font-semibold rounded-pill">Recompensas Disponibles</span>;
        }

        switch (status) {
            case 'visited':
                return <span className="px-3 py-1 bg-brand-muted text-brand-onColor text-xs font-semibold rounded-pill">Visitado</span>;
            case 'not_visited':
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-pill">No Visitado</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                    <img
                        src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                        alt="RewardsHub Logo"
                        className="h-10 w-auto object-contain"
                    />
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Mapa de Negocios</h2>
                </div>
                <p className="text-gray-600">Explora todos los negocios afiliados a RewardsHub cerca de tu ubicación</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-muted border border-brand-primary/20 rounded-xl p-6 shadow-card hover:shadow-popover transition-shadow duration-180">
                    <h3 className="text-lg font-semibold text-brand-onColor mb-2">Visitados</h3>
                    <p className="text-4xl font-bold text-brand-primary">{visited.length}</p>
                </div>
                <div className="bg-green-50 border border-accent-success/20 rounded-xl p-6 shadow-card hover:shadow-popover transition-shadow duration-180">
                    <h3 className="text-lg font-semibold text-accent-successOnColor mb-2">Con Recompensas</h3>
                    <p className="text-4xl font-bold text-accent-success">{rewardsAvailable.length}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-card hover:shadow-popover transition-shadow duration-180">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Por Visitar</h3>
                    <p className="text-4xl font-bold text-gray-600">{notVisited.length}</p>
                </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-gray-200">
                {locationError && (
                    <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800 px-4 py-3">
                        <p className="text-sm">⚠️ {locationError}</p>
                        <p className="text-xs mt-1">Mostrando ubicación predeterminada (Guadalajara)</p>
                    </div>
                )}

                {gettingLocation ? (
                    <div className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Obteniendo tu ubicación...</p>
                        </div>
                    </div>
                ) : userLocation ? (
                    <MapContainer
                        center={[userLocation.lat, userLocation.lng]}
                        zoom={13}
                        style={{ height: '500px', width: '100%' }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={[userLocation.lat, userLocation.lng]} />

                        {/* User location marker */}
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={userIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <p className="font-bold text-red-600">📍 Tu ubicación</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Business markers */}
                        {nearbyBusinesses.map((business) => {
                            if (!business.location || !business.location.latitude || !business.location.longitude) {
                                return null;
                            }

                            // Find business data to get status and rewards
                            const businessData = businesses.find(b => b.id === business.id) || {};

                            const status = businessData.status || 'not_visited';
                            const availableRewardsCount = businessData.availableRewards || 0;
                            const userPoints = userPointsData?.businessPoints?.find(bp => bp.businessId === business.id);
                            const availableRewardsList = businessesWithRewards[business.id] || [];

                            // Determine marker color based on status
                            let markerColor = 'blue'; // not visited
                            if (status === 'visited') {
                                markerColor = 'yellow'; // visited (has points/stamps)
                            }
                            if (status === 'rewards_available') {
                                markerColor = 'green'; // has available rewards
                            }

                            const hasRewards = availableRewardsCount > 0;
                            const logoUrl = business.logoUrl || null;

                            return (
                                <Marker
                                    key={business.id}
                                    position={[business.location.latitude, business.location.longitude]}
                                    icon={createBusinessIcon(markerColor, hasRewards, logoUrl)}
                                >
                                    <Popup>
                                        <div className="min-w-[200px]">
                                            <h3 className="font-bold text-brand-primary text-lg mb-2">
                                                {business.name}
                                            </h3>

                                            {/* Status badge */}
                                            <div className="mb-2">
                                                {status === 'rewards_available' && (
                                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                                        🎁 {availableRewardsCount} recompensa{availableRewardsCount > 1 ? 's' : ''} disponible{availableRewardsCount > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                {status === 'visited' && (
                                                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                                        ✓ Visitado
                                                    </span>
                                                )}
                                                {status === 'not_visited' && (
                                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                        ○ No visitado
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1 text-sm text-gray-700">
                                                {business.location.formattedAddress && (
                                                    <p className="text-xs text-gray-600">
                                                        📍 {business.location.formattedAddress}
                                                    </p>
                                                )}
                                                {business.distance && (
                                                    <p className="text-xs text-gray-600">
                                                        📏 {business.distance.toFixed(2)} km de distancia
                                                    </p>
                                                )}

                                                {/* Show user's points/stamps if they have visited */}
                                                {userPoints && (userPoints.points > 0 || userPoints.stamps > 0) && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <p className="text-xs font-semibold text-gray-700 mb-1">Tus puntos:</p>
                                                        {userPoints.points > 0 && (
                                                            <p className="text-xs text-gray-600">
                                                                ⭐ {userPoints.points} puntos
                                                            </p>
                                                        )}
                                                        {userPoints.stamps > 0 && (
                                                            <p className="text-xs text-gray-600">
                                                                🎫 {userPoints.stamps} sellos
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Show available rewards list */}
                                                {availableRewardsList.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <p className="text-xs font-semibold text-green-700 mb-2">
                                                            🎁 Recompensas disponibles para canjear:
                                                        </p>
                                                        <div className="space-y-2">
                                                            {availableRewardsList.map((reward, idx) => (
                                                                <div
                                                                    key={reward.id || idx}
                                                                    className="bg-green-50 rounded p-2 border border-green-200"
                                                                >
                                                                    <p className="text-xs font-semibold text-gray-800">
                                                                        {reward.name}
                                                                    </p>
                                                                    {reward.description && (
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {reward.description}
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-1 flex items-center justify-between">
                                                                        <span className="text-xs text-gray-500">
                                                                            {reward.rewardType === 'discount' && '💰 Descuento'}
                                                                            {reward.rewardType === 'free_product' && '🎁 Producto gratis'}
                                                                            {reward.rewardType === 'coupon' && '🎟️ Cupón'}
                                                                            {reward.rewardType === 'cashback' && '💵 Cashback'}
                                                                        </span>
                                                                        <span className="text-xs font-semibold text-green-600">
                                                                            {reward.rewardValue}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {reward.pointsRequired && (
                                                                            <span>Cuesta: {reward.pointsRequired} pts</span>
                                                                        )}
                                                                        {reward.stampsRequired && (
                                                                            <span>Cuesta: {reward.stampsRequired} sellos</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Open in Google Maps Button */}
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${business.location.latitude},${business.location.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Abrir en Google Maps
                                                </a>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                ) : (
                    <div className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                        <div className="text-center">
                            <svg
                                className="w-24 h-24 text-blue-400 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                />
                            </svg>
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">Error al cargar el mapa</h3>
                            <p className="text-gray-500">No se pudo obtener la ubicación</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Business List */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Lista de Negocios</h3>

                {/* Status Filters */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Filtrar por Estado</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-pill font-medium transition-all duration-180 shadow-sm whitespace-nowrap flex-shrink-0 ${activeFilter === 'all'
                                ? 'bg-brand-primary text-white hover:opacity-96'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todos ({allBusinesses.length})
                        </button>
                        <button
                            onClick={() => setActiveFilter('visited')}
                            className={`px-4 py-2 rounded-pill font-medium transition-all duration-180 shadow-sm whitespace-nowrap flex-shrink-0 ${activeFilter === 'visited'
                                ? 'bg-brand-primary text-white hover:opacity-96'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Visitados ({visited.length})
                        </button>
                        <button
                            onClick={() => setActiveFilter('rewards')}
                            className={`px-4 py-2 rounded-pill font-medium transition-all duration-180 shadow-sm whitespace-nowrap flex-shrink-0 ${activeFilter === 'rewards'
                                ? 'bg-brand-primary text-white hover:opacity-96'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Con Recompensas ({rewardsAvailable.length})
                        </button>
                        <button
                            onClick={() => setActiveFilter('not_visited')}
                            className={`px-4 py-2 rounded-pill font-medium transition-all duration-180 shadow-sm whitespace-nowrap flex-shrink-0 ${activeFilter === 'not_visited'
                                ? 'bg-brand-primary text-white hover:opacity-96'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            No Visitados ({notVisited.length})
                        </button>
                    </div>
                </div>

                {/* Business Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBusinesses.length > 0 ? filteredBusinesses.map((business) => {
                        // Find the original business data to get the logo
                        const businessWithLogo = nearbyBusinesses.find(b => b.id === business.id);
                        const logoUrl = businessWithLogo?.logoUrl || null;

                        return (
                            <div
                                key={business.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-popover transition-all duration-180 cursor-pointer bg-white"
                            >
                                {/* Business Icon & Status */}
                                <div className="flex items-start justify-between mb-3">
                                    {logoUrl ? (
                                        <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-brand-primary shadow-sm">
                                            <img
                                                src={logoUrl}
                                                alt={business.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-brand-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-sm">
                                            {business.name.charAt(0)}
                                        </div>
                                    )}
                                    {getStatusBadge(business.status, business.hasRewards)}
                                </div>

                                {/* Business Info */}
                                <h4 className="text-lg font-bold text-gray-800 mb-1 tracking-tight">{business.name}</h4>
                                <p className="text-xs text-gray-500 mb-3 flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    {business.distance}
                                </p>

                                {/* Points/Stamps Info */}
                                {business.status === 'visited' && (
                                    <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                                        {business.points > 0 && (
                                            <div className="flex items-center text-sm">
                                                <span className="font-semibold text-brand-primary">{business.points}</span>
                                                <span className="text-gray-600 ml-1">puntos</span>
                                            </div>
                                        )}
                                        {business.stamps > 0 && (
                                            <div className="flex items-center text-sm">
                                                <span className="font-semibold text-accent-success">{business.stamps}</span>
                                                <span className="text-gray-600 ml-1">sellos</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {business.status === 'rewards_available' && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-sm font-semibold text-accent-success">
                                            🎁 {business.availableRewards} recompensa(s) disponible(s)
                                        </p>
                                    </div>
                                )}

                                {business.status === 'not_visited' && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">¡Visita este negocio y acumula puntos!</p>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            <p className="text-lg font-semibold">No hay negocios en esta categoría</p>
                            <p className="text-sm mt-2">Intenta con otro filtro</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientMap;
