import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import authService from '../services/authService';
import userPointsService from '../services/userPointsService';
import businessService from '../services/businessService';
import deliveryService from '../services/deliveryService';
import rewardService from '../services/rewardService';

const ClientHome = () => {
    const [user, setUser] = useState(null);
    const [userPointsData, setUserPointsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [availableRewards, setAvailableRewards] = useState([]);
    const [closeRewards, setCloseRewards] = useState([]);

    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [businessRewards, setBusinessRewards] = useState([]);
    const [loadingRewards, setLoadingRewards] = useState(false);

    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemStatus, setRedeemStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [redeemResult, setRedeemResult] = useState(null);
    const [redeemError, setRedeemError] = useState('');

    // Listen for user updates
    useEffect(() => {
        const handleStorageChange = () => {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
        };

        // Listen to storage events
        window.addEventListener('storage', handleStorageChange);

        // Also listen to a custom event for same-tab updates
        window.addEventListener('userUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleStorageChange);
        };
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Get current user from localStorage
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);

            // Fetch user points data
            const pointsData = await userPointsService.getUserPoints();

            // Fetch business names for each businessId
            if (pointsData?.businessPoints && pointsData.businessPoints.length > 0) {
                const businessPointsWithNames = await Promise.all(
                    pointsData.businessPoints.map(async (bp) => {
                        try {
                            const business = await businessService.getBusinessById(bp.businessId);
                            return {
                                ...bp,
                                businessName: business.name || 'Negocio',
                                businessEmail: business.email,
                                businessLogoUrl: business.logoUrl || undefined
                            };
                        } catch (error) {
                            console.error(`Error fetching business ${bp.businessId}:`, error);
                            return {
                                ...bp,
                                businessName: 'Negocio',
                            };
                        }
                    })
                );
                pointsData.businessPoints = businessPointsWithNames;

                // Calcular recompensas disponibles y cercanas
                const available = [];
                const close = [];

                const allBusinessRewards = await Promise.all(
                    businessPointsWithNames.map(async (bp) => {
                        try {
                            const rewards = await rewardService.getBusinessRewards(bp.businessId);
                            const rewardsArray = Array.isArray(rewards) ? rewards : (rewards?.rewards || []);
                            return { bp, rewards: rewardsArray.filter(r => r.isActive !== false) };
                        } catch {
                            return { bp, rewards: [] };
                        }
                    })
                );

                for (const { bp, rewards } of allBusinessRewards) {
                    // Estimado de puntos por visita: ratio puntos/sellos
                    const avgPointsPerVisit = bp.stamps > 0 ? bp.points / bp.stamps : null;
                    const bizMeta = {
                        businessName: bp.businessName,
                        businessId: bp.businessId,
                        businessLogoUrl: bp.businessLogoUrl,
                        userPoints: bp.points,
                        userStamps: bp.stamps,
                    };

                    for (const reward of rewards) {
                        const isPoints = reward.type === 'points' || reward.pointsRequired;
                        const required = isPoints
                            ? reward.pointsRequired
                            : (reward.stampsRequired || reward.targetStamps);
                        const current = isPoints ? bp.points : bp.stamps;

                        if (!required || required <= 0) continue;

                        if (current >= required) {
                            available.push({ ...reward, ...bizMeta });
                        } else {
                            const gap = required - current;
                            let isClose = false;

                            if (!isPoints) {
                                // Sellos: "cerca" = falta 1 sello
                                isClose = gap <= 1;
                            } else if (avgPointsPerVisit && avgPointsPerVisit > 0) {
                                // Puntos con historial: "cerca" = el gap cabe en ~1 visita promedio
                                isClose = gap <= avgPointsPerVisit;
                            } else {
                                // Puntos sin historial de sellos: "cerca" = ya tiene ≥75%
                                isClose = current >= required * 0.75;
                            }

                            if (isClose) {
                                close.push({
                                    ...reward,
                                    ...bizMeta,
                                    gap,
                                    isPoints,
                                    avgPointsPerVisit,
                                });
                            }
                        }
                    }
                }

                setAvailableRewards(available);
                setCloseRewards(close);
            }

            setUserPointsData(pointsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {

        fetchData();
    }, []);

    const handleRedeemSubmit = async (e) => {
        e.preventDefault();
        if (!redeemCode.trim()) return;

        setRedeemStatus('loading');
        setRedeemError('');

        try {
            const data = await deliveryService.claimCode(redeemCode.trim());
            setRedeemResult(data);
            setRedeemStatus('success');
            setRedeemCode(''); // Limpiar input
            
            // Recargar datos para que se actualicen los puntos en el fondo
            await fetchData(); 
        } catch (err) {
            console.error(err);
            setRedeemStatus('error');
            setRedeemError(err.message || 'Código inválido o expirado');
        }
    };
    
    const closeRedeemModal = () => {
        setShowRedeemModal(false);
        // Resetear estados del modal después de un momento para que la animación de cierre se vea bien
        setTimeout(() => {
            setRedeemStatus('idle');
            setRedeemResult(null);
            setRedeemError('');
            setRedeemCode('');
        }, 300);
    };

    const handleBusinessClick = async (business) => {
        setSelectedBusiness(business);
        setBusinessRewards([]);
        setLoadingRewards(true);
        try {
            const rewards = await rewardService.getBusinessRewards(business.businessId);
            const rewardsArray = Array.isArray(rewards) ? rewards : (rewards?.rewards || []);
            setBusinessRewards(rewardsArray.filter(r => r.isActive !== false));
        } catch (err) {
            console.error('Error fetching rewards:', err);
            setBusinessRewards([]);
        } finally {
            setLoadingRewards(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                        ¡Hola, {user?.username || 'Usuario'}! 👋
                    </h2>
                    <p className="text-gray-600 text-base">
                        Bienvenido a tu panel de RewardsHub
                    </p>
                </div>

                {/* Error Message */}
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    {error}
                </div>
            </div>
        );
    }

    // Initialize with empty array if no business points
    const businessPoints = userPointsData?.businessPoints || [];
    const totalPoints = businessPoints.reduce((sum, bp) => sum + bp.points, 0);
    const totalStamps = businessPoints.reduce((sum, bp) => sum + bp.stamps, 0);
    const visitedBusinesses = businessPoints.length;

    const filteredBusinesses = businessPoints.filter(business =>
        (business.businessName || business.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const businessesWithAvailableRewards = Object.values(
        availableRewards.reduce((acc, reward) => {
            if (!acc[reward.businessId]) {
                acc[reward.businessId] = {
                    businessId: reward.businessId,
                    businessName: reward.businessName,
                    businessLogoUrl: reward.businessLogoUrl,
                    rewardCount: 0,
                };
            }
            acc[reward.businessId].rewardCount++;
            return acc;
        }, {})
    );

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                    <img
                        src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                        alt="RewardsHub Logo"
                        className="h-12 w-auto object-contain"
                    />
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                        ¡Hola, {user?.username || 'Usuario'}! 👋
                    </h2>
                </div>
                <p className="text-gray-600 text-base">
                    Bienvenido a tu panel de RewardsHub
                </p>
            </div>

            {/* Available Rewards Card */}
            {businessesWithAvailableRewards.length > 0 && (
                <div className="bg-gradient-to-br from-accent-success to-emerald-600 rounded-xl shadow-card p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">
                                {businessesWithAvailableRewards.length === 1
                                    ? '¡Tienes recompensas en 1 negocio!'
                                    : `¡Tienes recompensas en ${businessesWithAvailableRewards.length} negocios!`}
                            </h3>
                            <p className="text-white/80 text-sm">Toca un negocio para ver tus recompensas disponibles</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {businessesWithAvailableRewards.map((biz) => {
                            const fullBusiness = businessPoints.find(bp => bp.businessId === biz.businessId) || biz;
                            return (
                                <div
                                    key={biz.businessId}
                                    onClick={() => handleBusinessClick(fullBusiness)}
                                    className="bg-white/15 rounded-xl p-4 flex items-center space-x-4 cursor-pointer hover:bg-white/25 transition-colors duration-150"
                                >
                                    {biz.businessLogoUrl ? (
                                        <img
                                            src={biz.businessLogoUrl}
                                            alt={biz.businessName}
                                            className="w-10 h-10 rounded-full object-cover bg-white flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-lg">{biz.businessName?.[0] || '?'}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{biz.businessName}</p>
                                        <p className="text-white/80 text-sm">
                                            {biz.rewardCount === 1 ? '1 recompensa disponible' : `${biz.rewardCount} recompensas disponibles`}
                                        </p>
                                    </div>
                                    <svg className="w-5 h-5 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Close Rewards Card — solo se muestra si no hay recompensas disponibles */}
            {availableRewards.length === 0 && closeRewards.length > 0 && (
                <div className="bg-gradient-to-br from-rose-400 to-brand-primary rounded-xl shadow-card p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">¡Estás cerca de una recompensa!</h3>
                            <p className="text-white/80 text-sm">Con tu próxima compra podrías alcanzarla</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {closeRewards.map((reward) => {
                            const gapLabel = reward.isPoints
                                ? `~${Math.ceil(reward.gap)} pts más`
                                : reward.gap === 1
                                    ? '1 sello más'
                                    : `${reward.gap} sellos más`;
                            return (
                                <div
                                    key={`${reward._id || reward.id}-${reward.businessId}`}
                                    onClick={() => {
                                        const fullBusiness = businessPoints.find(bp => bp.businessId === reward.businessId) || reward;
                                        handleBusinessClick(fullBusiness);
                                    }}
                                    className="bg-white/15 rounded-xl p-4 flex items-center space-x-4 cursor-pointer hover:bg-white/25 transition-colors duration-150"
                                >
                                    {reward.businessLogoUrl ? (
                                        <img
                                            src={reward.businessLogoUrl}
                                            alt={reward.businessName}
                                            className="w-10 h-10 rounded-full object-cover bg-white flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-lg">{reward.businessName?.[0] || '?'}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{reward.name}</p>
                                        <p className="text-white/80 text-sm truncate">{reward.businessName}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <span className="bg-white/25 text-white text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                                            {gapLabel}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-brand-primary to-accent-gold rounded-xl shadow-card p-6 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-2xl font-bold mb-2">Tu Código QR</h3>
                        <p className="text-white/90 mb-4">
                            Muestra este código en los negocios afiliados para acumular puntos
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-popover">
                        <QRCodeSVG value={user?.id || userPointsData?.userId || 'no-id'} size={200} />
                    </div>
                    <br />
                    <div className="text-sm text-white/80 font-mono">
                        Toma una captura de pantalla de éste código y accede más rápidamente
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200 hover:shadow-popover transition-shadow duration-180">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Puntos</p>
                            <p className="text-3xl font-bold text-brand-primary">{totalPoints}</p>
                        </div>
                        <div className="bg-brand-muted p-3 rounded-full">
                            <svg
                                className="w-8 h-8 text-brand-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.75}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200 hover:shadow-popover transition-shadow duration-180">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Sellos</p>
                            <p className="text-3xl font-bold text-accent-success">{totalStamps}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full">
                            <svg
                                className="w-8 h-8 text-accent-success"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.75}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200 hover:shadow-popover transition-shadow duration-180">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Negocios Visitados</p>
                            <p className="text-3xl font-bold text-accent-info">{visitedBusinesses}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <svg
                                className="w-8 h-8 text-accent-info"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.75}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & All Businesses Section */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">Mis Puntos por Negocio</h3>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors duration-200"
                        placeholder="Buscar negocio por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Results List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {!searchTerm ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>Ingresa el nombre del negocio para buscar</p>
                        </div>
                    ) : filteredBusinesses.length > 0 ? (
                        filteredBusinesses.map((business) => (
                            <div
                                key={business._id || business.businessId}
                                onClick={() => handleBusinessClick(business)}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 gap-3 cursor-pointer"
                            >
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    {business.businessLogoUrl ? (
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-gray-200">
                                            <img
                                                src={business.businessLogoUrl}
                                                alt={business.businessName || 'Logo'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-brand-primary text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                                            {(business.businessName || business.name || 'N').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                                            {business.businessName || business.name || 'Negocio'}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">
                                            Última visita: {new Date(business.lastVisit).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-brand-primary">
                                            {business.points} pts
                                        </span>
                                    </div>
                                    {business.stamps > 0 && (
                                        <span className="text-xs font-medium text-accent-success bg-green-50 px-2 py-0.5 rounded-full">
                                            {business.stamps} sellos
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No se encontraron negocios que coincidan con "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">Actividad Reciente</h3>
                {businessPoints.length > 0 ? (
                    <div className="space-y-3">
                        {businessPoints
                            .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
                            .slice(0, 3)
                            .map((business) => (
                                <div
                                    key={business._id || business.businessId}
                                    onClick={() => handleBusinessClick(business)}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 cursor-pointer gap-3"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        {business.businessLogoUrl ? (
                                            <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-brand-primary shadow-card">
                                                <img
                                                    src={business.businessLogoUrl}
                                                    alt={business.businessName || 'Logo del negocio'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-brand-primary text-white rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center font-bold shadow-card">
                                                {(business.businessName || business.name || 'N').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-semibold text-gray-800 truncate">{business.businessName || business.name || 'Negocio'}</h4>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                {new Date(business.lastVisit).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        {business.points > 0 && (
                                            <span className="whitespace-nowrap px-2.5 py-1 bg-brand-muted text-brand-onColor text-xs font-semibold rounded-pill">
                                                +{business.points} pts
                                            </span>
                                        )}
                                        {business.stamps > 0 && (
                                            <span className="whitespace-nowrap px-2.5 py-1 bg-green-50 text-accent-successOnColor text-xs font-semibold rounded-pill">
                                                {business.stamps} sellos
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <svg
                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <p className="text-gray-600 font-medium">No tienes actividad reciente</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Visita un negocio afiliado para comenzar a acumular puntos
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={() => setShowRedeemModal(true)}
                className="fixed bottom-6 right-6 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-brand-onColor transition-all duration-300 z-40 group flex items-center gap-2 pr-6"
            >
                <div className="bg-white/20 p-2 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                </div>
                <span className="font-bold hidden sm:block">Canjear Código</span>
                <span className="font-bold sm:hidden">Canjear</span>
            </button>

            {selectedBusiness && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                            {selectedBusiness.businessLogoUrl ? (
                                <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border border-gray-200">
                                    <img src={selectedBusiness.businessLogoUrl} alt={selectedBusiness.businessName} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="bg-brand-primary text-white rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                    {(selectedBusiness.businessName || 'N').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-800 truncate">{selectedBusiness.businessName}</h3>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-sm font-semibold text-brand-primary">{selectedBusiness.points} pts</span>
                                    {selectedBusiness.stamps > 0 && (
                                        <span className="text-sm font-semibold text-accent-success">{selectedBusiness.stamps} sellos</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedBusiness(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Rewards list */}
                        <div className="overflow-y-auto flex-1 p-5">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Recompensas disponibles</p>

                            {loadingRewards ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
                                </div>
                            ) : businessRewards.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-14 h-14 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                    </svg>
                                    <p className="text-gray-500 font-medium">Sin recompensas configuradas</p>
                                    <p className="text-sm text-gray-400 mt-1">Este negocio aún no tiene recompensas activas</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {businessRewards.map((reward) => {
                                        const isPoints = reward.type === 'points' || reward.pointsRequired;
                                        const required = isPoints ? reward.pointsRequired : reward.stampsRequired;
                                        const current = isPoints ? selectedBusiness.points : selectedBusiness.stamps;
                                        const progress = required > 0 ? Math.min((current / required) * 100, 100) : 0;
                                        const canRedeem = current >= required;

                                        return (
                                            <div key={reward._id || reward.id} className={`rounded-xl border p-4 ${canRedeem ? 'border-accent-success bg-green-50' : 'border-gray-200 bg-white'}`}>
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-800 text-sm">{reward.name}</h4>
                                                        {reward.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{reward.description}</p>
                                                        )}
                                                    </div>
                                                    {canRedeem ? (
                                                        <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 bg-accent-success text-white rounded-full">
                                                            ¡Listo!
                                                        </span>
                                                    ) : (
                                                        <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                            {required - current} {isPoints ? 'pts' : 'sellos'} más
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Progress bar */}
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs text-gray-500">
                                                        <span>{current} {isPoints ? 'pts' : 'sellos'}</span>
                                                        <span>{required} {isPoints ? 'pts' : 'sellos'}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${canRedeem ? 'bg-accent-success' : 'bg-brand-primary'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showRedeemModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
                        {/* Header del Modal */}
                        <div className="bg-brand-primary p-6 text-center text-white relative">
                            <button 
                                onClick={closeRedeemModal}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold">Canjear Código</h2>
                            <p className="text-brand-muted text-sm mt-1">Ingresa el código de tu ticket</p>
                        </div>

                        <div className="p-8">
                            {redeemStatus === 'success' ? (
                                <div className="text-center animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Puntos Canjeados!</h3>
                                    <p className="text-gray-600 mb-6">
                                        Has recibido <span className="font-bold text-brand-primary text-xl">+{redeemResult?.pointsAdded} puntos</span>
                                    </p>
                                    <button 
                                        onClick={closeRedeemModal}
                                        className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleRedeemSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                                            Código del Ticket
                                        </label>
                                        <input
                                            type="text"
                                            value={redeemCode}
                                            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                            className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary uppercase placeholder:text-gray-300 transition-all"
                                            placeholder="XXX-XXX"
                                            maxLength={10}
                                            disabled={redeemStatus === 'loading'}
                                            autoFocus
                                        />
                                    </div>

                                    {redeemStatus === 'error' && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200 flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {redeemError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={redeemStatus === 'loading' || !redeemCode}
                                        className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                                    >
                                        {redeemStatus === 'loading' ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                Verificando...
                                            </>
                                        ) : 'Canjear Puntos'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientHome;
