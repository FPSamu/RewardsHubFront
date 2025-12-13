import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css'; // Leaflet css might still be needed if used elsewhere, otherwise remove
import businessService from '../services/businessService';
import subscriptionService from '../services/subscriptionService';

const BusinessLayout = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [businessData, setBusinessData] = useState(null);
    const [currentBusiness, setCurrentBusiness] = useState(null);
    const [settingsFormData, setSettingsFormData] = useState({
        name: '',
        description: '',
        category: 'food'
    });
    // Removed legacy map states
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsError, setSettingsError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const menuRef = useRef(null);
    const fileInputRef = useRef(null);

    // Load business data on mount for profile button
    useEffect(() => {
        const loadBusinessData = async () => {
            try {
                const data = await businessService.getMyBusiness();
                setCurrentBusiness(data);
            } catch (error) {
                console.error('Error loading business data:', error);
            }
        };
        loadBusinessData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const handleSettings = async () => {
        setIsMenuOpen(false);
        try {
            const data = await businessService.getMyBusiness();
            console.log("Business Data loaded:", data); // DEBUG
            setBusinessData(data);
            setSettingsFormData({
                name: data.name || '',
                description: data.description || '',
                category: data.category || 'food'
            });

            // Configurar logo preview
            if (data.logoUrl) {
                setLogoPreview(data.logoUrl);
            }
            setLogoFile(null);

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
            description: '',
            category: 'food'
        });
        // Removed legacy map reset
        setLogoFile(null);
        setLogoPreview(null);
        setSettingsError(null);
        setSavingSettings(false);
    };

    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        try {
            // Try to cancel subscription first if exists
            try {
                await subscriptionService.cancelSubscription();
            } catch (error) {
                console.log('No subscription to cancel or already cancelled');
            }

            // Delete the account
            await businessService.deleteAccount();

            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            // Redirect to landing page
            navigate('/');
        } catch (error) {
            console.error('Error deleting account:', error);
            setSettingsError('Error al eliminar la cuenta. Por favor intenta de nuevo.');
            setDeletingAccount(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setSettingsError('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                setSettingsError('La imagen debe ser menor a 5MB');
                return;
            }

            setLogoFile(file);

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setSettingsError(null);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(businessData?.logoUrl || null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Removed handleMapPositionChange

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingsError(null);

        try {
            // Preparar datos para actualizar
            const updates = {
                name: settingsFormData.name.trim(),
                category: settingsFormData.category
            };

            // Solo incluir descripción si tiene contenido
            if (settingsFormData.description?.trim()) {
                updates.description = settingsFormData.description.trim();
            }

            // Llamar al servicio para actualizar información básica
            await businessService.updateBusinessInfo(updates);

            // Si hay un nuevo logo, subirlo
            if (logoFile) {
                setUploadingLogo(true);
                try {
                    await businessService.uploadLogo(logoFile);
                } catch (logoError) {
                    console.error('Error uploading logo:', logoError);
                    setSettingsError('Logo actualizado, pero hubo un error al subir la imagen');
                } finally {
                    setUploadingLogo(false);
                }
            }

            // REMOVED: Legacy location update logic
            // The location management is now handled in a separate view

            // Recargar datos del negocio para obtener todos los cambios
            const finalData = await businessService.getMyBusiness();
            setBusinessData(finalData);
            setCurrentBusiness(finalData); // Actualizar también el estado del negocio actual para el botón de perfil

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
                        <div className="flex-shrink-0 flex items-center space-x-2">
                            <img
                                src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                                alt="RewardsHub Logo"
                                className="h-10 w-auto object-contain"
                            />
                            <h1 className="text-xl sm:text-2xl font-bold text-brand-primary">RewardsHub Business</h1>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex space-x-2">
                            <NavLink
                                to="/business/dashboard/home"
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
                                    {currentBusiness?.logoUrl ? (
                                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand-primary flex-shrink-0">
                                            <img
                                                src={currentBusiness.logoUrl}
                                                alt="Business Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-semibold">
                                            {currentBusiness?.name?.charAt(0).toUpperCase() || 'B'}
                                        </div>
                                    )}
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
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Configuración</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate('/business/location-setup');
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-180 flex items-center space-x-2"
                                        >
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Sucursales</span>
                                        </button>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-180 flex items-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
                                    to="/business/dashboard/home"
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
                    // Removed map props
                    logoPreview={logoPreview}
                    onLogoChange={handleLogoChange}
                    onRemoveLogo={handleRemoveLogo}
                    fileInputRef={fileInputRef}
                    uploadingLogo={uploadingLogo}
                    saving={savingSettings}
                    error={settingsError}
                    onClose={handleCloseSettingsModal}
                    onSubmit={handleSaveSettings}
                    navigate={navigate}
                    onDeleteAccount={() => setShowDeleteConfirm(true)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    onConfirm={async () => {
                        setShowDeleteConfirm(false);
                        try {
                            // Check if business has active subscription
                            const status = await subscriptionService.getSubscriptionStatus();
                            if (status.status === 'active') {
                                setShowSubscriptionWarning(true);
                            } else {
                                // No active subscription, proceed with deletion
                                await handleDeleteAccount();
                            }
                        } catch (error) {
                            console.error('Error checking subscription:', error);
                            // If we can't check, show warning to be safe
                            setShowSubscriptionWarning(true);
                        }
                    }}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}

            {/* Subscription Warning Modal */}
            {showSubscriptionWarning && (
                <SubscriptionWarningModal
                    onConfirm={async () => {
                        setShowSubscriptionWarning(false);
                        await handleDeleteAccount();
                    }}
                    onCancel={() => setShowSubscriptionWarning(false)}
                    deleting={deletingAccount}
                />
            )}
        </div>
    );
};

// Settings Modal Component
function SettingsModal({ formData, setFormData, businessData, logoPreview, onLogoChange, onRemoveLogo, fileInputRef, uploadingLogo, saving, error, onClose, onSubmit, navigate, onDeleteAccount }) {
    const [showAccountOptions, setShowAccountOptions] = useState(false);

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

                    {/* Business Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Categoría del Negocio <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white"
                        >
                            <option value="food">🍔 Comida</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Selecciona la categoría que mejor describa tu negocio</p>
                    </div>

                    {/* Business Logo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Logo del Negocio
                        </label>
                        <div className="flex items-start gap-4">
                            {/* Logo Preview */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Upload Controls */}
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={onLogoChange}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                                </label>
                                {logoPreview && (
                                    <button
                                        type="button"
                                        onClick={onRemoveLogo}
                                        className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Quitar
                                    </button>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                                </p>
                                {uploadingLogo && (
                                    <p className="text-xs text-brand-primary mt-2 flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-brand-primary border-t-transparent"></div>
                                        Subiendo logo...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Manage Locations Link (Replaces the map) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ubicación y Sucursales
                        </label>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full border border-gray-200">
                                    <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {(businessData?.locations || []).length} sucursales configuradas
                                    </p>
                                    <p className="text-xs text-gray-500">Gestiona tus direcciones y horarios</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose(); // Close modal first
                                    navigate('/business/location-setup');
                                }}
                                className="text-sm font-semibold text-brand-primary hover:text-brand-onColor hover:underline"
                            >
                                Gestionar →
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowAccountOptions(!showAccountOptions)}
                                className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                            >
                                Gestión de cuenta
                                <svg
                                    className={`w-3 h-3 transition-transform ${showAccountOptions ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showAccountOptions && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] z-10">
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        Cancelar suscripción
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onDeleteAccount}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar cuenta
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
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
                    </div>
                </form>
            </div>
        </div>
    );
}

// ... DeleteConfirmModal and SubscriptionWarningModal (same as before) ...
function DeleteConfirmModal({ onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-popover max-w-md w-full p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar cuenta?</h3>
                        <p className="text-sm text-gray-600">
                            Esta acción eliminará permanentemente tu cuenta y todos los datos asociados.
                            Esta operación no se puede deshacer.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 rounded-lg transition-colors"
                    >
                        Sí, eliminar cuenta
                    </button>
                </div>
            </div>
        </div>
    );
}

function SubscriptionWarningModal({ onConfirm, onCancel, deleting }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-popover max-w-md w-full p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Suscripción activa detectada</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Tu cuenta tiene una suscripción activa. Si continúas:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside mb-3">
                            <li>Se cancelará tu suscripción automáticamente</li>
                            <li>Se eliminará tu cuenta permanentemente</li>
                            <li>No se realizarán más cobros</li>
                            <li>Perderás acceso a todos los datos</li>
                        </ul>
                        <p className="text-sm font-semibold text-gray-800">
                            ¿Estás seguro de que deseas continuar?
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Eliminando...
                            </>
                        ) : (
                            'Sí, eliminar todo'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BusinessLayout;

