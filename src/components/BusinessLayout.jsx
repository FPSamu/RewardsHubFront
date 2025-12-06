import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import businessService from '../services/businessService';

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

const BusinessLayout = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [businessData, setBusinessData] = useState(null);
    const [settingsFormData, setSettingsFormData] = useState({
        name: '',
        description: ''
    });
    const [mapPosition, setMapPosition] = useState([20.6597, -103.3496]); // Guadalajara default
    const [locationChanged, setLocationChanged] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsError, setSettingsError] = useState(null);
    const menuRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const handleSettings = async () => {
        setIsMenuOpen(false);
        
        // Cargar datos del negocio
        try {
            const data = await businessService.getMyBusiness();
            setBusinessData(data);
            setSettingsFormData({
                name: data.name || '',
                description: data.description || ''
            });
            
            // Configurar posición del mapa
            if (data.location && data.location.latitude && data.location.longitude) {
                setMapPosition([data.location.latitude, data.location.longitude]);
            }
            setLocationChanged(false);
            
            setShowSettingsModal(true);
        } catch (error) {
            console.error('Error loading business data:', error);
            // Abrir modal con datos vacíos si hay error
            setShowSettingsModal(true);
        }
    };

    const handleCloseSettingsModal = () => {
        setShowSettingsModal(false);
        setSettingsFormData({
            name: '',
            description: ''
        });
        setMapPosition([20.6597, -103.3496]);
        setLocationChanged(false);
        setSettingsError(null);
        setSavingSettings(false);
    };

    const handleMapPositionChange = (newPosition) => {
        setMapPosition(newPosition);
        setLocationChanged(true);
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingsError(null);

        try {
            // Preparar datos para actualizar
            const updates = {
                name: settingsFormData.name.trim()
            };

            // Solo incluir descripción si tiene contenido
            if (settingsFormData.description?.trim()) {
                updates.description = settingsFormData.description.trim();
            }

            // Llamar al servicio para actualizar información básica
            const updatedBusiness = await businessService.updateBusinessInfo(updates);
            
            // Si la ubicación cambió, actualizarla también
            if (locationChanged) {
                await businessService.updateCoordinates({
                    latitude: mapPosition[0],
                    longitude: mapPosition[1]
                });
                // Recargar datos del negocio para obtener la ubicación actualizada
                const finalData = await businessService.getMyBusiness();
                setBusinessData(finalData);
            } else {
                // Actualizar datos locales con la respuesta
                setBusinessData(updatedBusiness);
            }
            
            // Cerrar modal
            handleCloseSettingsModal();
        } catch (error) {
            console.error('Error updating business:', error);
            setSettingsError(error.message || 'Error al actualizar la información del negocio');
            setSavingSettings(false);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-card border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-brand-primary">RewardsHub Business</h1>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex space-x-2">
                            <NavLink
                                to="/business/dashboard"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-pill text-sm font-medium transition-all duration-180 ${isActive
                                        ? 'bg-brand-muted text-brand-onColor'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                    }`
                                }
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/business/dashboard/clients"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-pill text-sm font-medium transition-all duration-180 ${isActive
                                        ? 'bg-brand-muted text-brand-onColor'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                    }`
                                }
                            >
                                Clientes
                            </NavLink>
                            <NavLink
                                to="/business/dashboard/rewards"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-pill text-sm font-medium transition-all duration-180 ${isActive
                                        ? 'bg-brand-muted text-brand-onColor'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                    }`
                                }
                            >
                                Recompensas
                            </NavLink>
                            <NavLink
                                to="/business/dashboard/scan"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-pill text-sm font-medium transition-all duration-180 ${isActive
                                        ? 'bg-brand-muted text-brand-onColor'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                    }`
                                }
                            >
                                Escanear QR
                            </NavLink>
                        </div>

                        {/* Right side - Mobile Menu Button + User Menu */}
                        <div className="flex items-center space-x-3">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-brand-primary hover:bg-gray-100 focus:outline-none focus:ring-3 focus:ring-brand-muted transition-all duration-180"
                            >
                                <span className="sr-only">Abrir menú</span>
                                {!isMobileMenuOpen ? (
                                    <svg
                                        className="block h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="block h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}
                            </button>

                            {/* User Menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-pill hover:bg-gray-100 transition-all duration-180 focus:outline-none focus:ring-3 focus:ring-brand-muted"
                                >
                                    <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-semibold">
                                        B
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-gray-600 transition-transform duration-180 ${isMenuOpen ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-popover border border-gray-200 py-1 z-50">
                                        <button
                                            onClick={handleSettings}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-180 flex items-center space-x-2"
                                        >
                                            <svg
                                                className="w-5 h-5 text-gray-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <span>Configuración</span>
                                        </button>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-180 flex items-center space-x-2"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
                                            <span>Cerrar Sesión</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden pb-3 pt-2">
                            <div className="space-y-1">
                                <NavLink
                                    to="/business/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-180 ${isActive
                                            ? 'bg-brand-muted text-brand-onColor'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                        }`
                                    }
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/business/dashboard/clients"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-180 ${isActive
                                            ? 'bg-brand-muted text-brand-onColor'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                        }`
                                    }
                                >
                                    Clientes
                                </NavLink>
                                <NavLink
                                    to="/business/dashboard/rewards"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-180 ${isActive
                                            ? 'bg-brand-muted text-brand-onColor'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                        }`
                                    }
                                >
                                    Recompensas
                                </NavLink>
                                <NavLink
                                    to="/business/dashboard/scan"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-180 ${isActive
                                            ? 'bg-brand-muted text-brand-onColor'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                        }`
                                    }
                                >
                                    Escanear QR
                                </NavLink>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Settings Modal */}
            {showSettingsModal && (
                <SettingsModal
                    formData={settingsFormData}
                    setFormData={setSettingsFormData}
                    businessData={businessData}
                    mapPosition={mapPosition}
                    onMapPositionChange={handleMapPositionChange}
                    locationChanged={locationChanged}
                    saving={savingSettings}
                    error={settingsError}
                    onClose={handleCloseSettingsModal}
                    onSubmit={handleSaveSettings}
                    navigate={navigate}
                />
            )}
        </div>
    );
};

// Settings Modal Component
function SettingsModal({ formData, setFormData, businessData, mapPosition, onMapPositionChange, locationChanged, saving, error, onClose, onSubmit, navigate }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-popover max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Configuración del Negocio</h3>
                            <p className="text-sm text-gray-600 mt-1">Actualiza la información de tu negocio</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-blue-800">Información del negocio</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Esta información será visible para tus clientes en la aplicación.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Business Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nombre del Negocio <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            placeholder="Ej: Café del Centro"
                        />
                        <p className="text-xs text-gray-500 mt-1">El nombre comercial de tu negocio</p>
                    </div>

                    {/* Business Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            rows="3"
                            placeholder="Describe tu negocio y los servicios que ofreces"
                        />
                        <p className="text-xs text-gray-500 mt-1">Información adicional sobre tu negocio (opcional)</p>
                    </div>

                    {/* Business Location Map */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ubicación en el Mapa
                        </label>
                        {mapPosition ? (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div style={{ height: '300px', width: '100%' }}>
                                    <MapContainer
                                        center={mapPosition}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom={true}
                                        zoomControl={true}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <DraggableMarker position={mapPosition} setPosition={onMapPositionChange} />
                                        <MapClickHandler setPosition={onMapPositionChange} />
                                    </MapContainer>
                                </div>
                                <div className={`p-3 border-t border-gray-200 ${locationChanged ? 'bg-amber-50' : 'bg-gray-50'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600 mb-1">
                                                📍 Lat: {mapPosition[0].toFixed(6)}, Lng: {mapPosition[1].toFixed(6)}
                                            </p>
                                            {locationChanged && (
                                                <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Ubicación modificada - Guarda los cambios
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 text-right">
                                            <p>💡 Arrastra el marcador</p>
                                            <p>o haz clic en el mapa</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-sm font-semibold text-gray-700 mb-1">No hay ubicación configurada</p>
                                <p className="text-xs text-gray-500 mb-3">Configura la ubicación de tu negocio para que los clientes puedan encontrarte</p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/business/dashboard/location-setup')}
                                    className="text-sm text-brand-primary hover:underline font-semibold"
                                >
                                    Configurar ubicación →
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {mapPosition && businessData?.location ? 
                                'Arrastra el marcador o haz clic en el mapa para cambiar la ubicación' : 
                                'Tu ubicación será visible para los clientes en el mapa'
                            }
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-6 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity shadow-card flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BusinessLayout;
