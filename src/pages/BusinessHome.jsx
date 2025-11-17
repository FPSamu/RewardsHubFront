import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import businessService from '../services/businessService';
import rewardService from '../services/rewardService';
import userPointsService from '../services/userPointsService';

const BusinessHome = () => {
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [rewards, setRewards] = useState([]);
    const [stats, setStats] = useState({
        totalClients: 0,
        totalRewards: 0,
        activeRewards: 0,
        totalPointsDistributed: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch business details
                const businessData = await businessService.getMyBusiness();
                setBusiness(businessData);

                // Fetch rewards
                const rewardsData = await rewardService.getBusinessRewards(businessData.id);
                setRewards(rewardsData);

                // Fetch business users with points
                const usersData = await userPointsService.getBusinessUsers();

                // Calculate total points distributed
                const totalPoints = usersData.users?.reduce((sum, user) => {
                    return sum + (user.businessPoints?.points || 0);
                }, 0) || 0;

                // Calculate stats
                const activeRewards = rewardsData.filter(r => r.isActive).length;
                setStats({
                    totalClients: usersData.totalUsers || 0,
                    totalRewards: rewardsData.length,
                    activeRewards: activeRewards,
                    totalPointsDistributed: totalPoints
                });

                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                        ¡Hola, {business?.name || 'Negocio'}! 👋
                    </h2>
                    <p className="text-gray-600 text-base">
                        Bienvenido a tu panel de gestión
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                    ¡Hola, {business?.name || 'Negocio'}! 👋
                </h2>
                <p className="text-gray-600 text-base">
                    Bienvenido a tu panel de gestión de RewardsHub
                </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-brand-primary to-accent-gold rounded-xl shadow-card p-6 text-white">
                <h3 className="text-2xl font-bold mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/business/dashboard/scan')}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 text-left transition-all duration-180 border border-white/30"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-3 rounded-full">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.75}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Escanear QR</p>
                                <p className="text-sm text-white/80">Registrar compra de cliente</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/business/dashboard/clients')}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 text-left transition-all duration-180 border border-white/30"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-3 rounded-full">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.75}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Ver Clientes</p>
                                <p className="text-sm text-white/80">Gestionar clientes</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/business/dashboard/rewards')}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 text-left transition-all duration-180 border border-white/30"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-3 rounded-full">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.75}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Recompensas</p>
                                <p className="text-sm text-white/80">Gestionar recompensas</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200 hover:shadow-popover transition-shadow duration-180">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                            <p className="text-3xl font-bold text-brand-primary">{stats.totalClients}</p>
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
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200 hover:shadow-popover transition-shadow duration-180">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Recompensas</p>
                            <p className="text-3xl font-bold text-accent-gold">{stats.totalRewards}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-full">
                            <svg
                                className="w-8 h-8 text-accent-gold"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.75}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200 hover:shadow-popover transition-shadow duration-180">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Recompensas Activas</p>
                            <p className="text-3xl font-bold text-accent-success">{stats.activeRewards}</p>
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200 hover:shadow-popover transition-shadow duration-180">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Puntos Distribuidos</p>
                            <p className="text-3xl font-bold text-accent-info">{stats.totalPointsDistributed}</p>
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
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Rewards */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight">Tus Recompensas</h3>
                    <button
                        onClick={() => navigate('/business/dashboard/rewards')}
                        className="text-brand-primary hover:text-brand-primaryOnColor text-sm font-semibold transition-colors duration-180"
                    >
                        Ver todas →
                    </button>
                </div>
                {rewards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rewards.slice(0, 3).map((reward) => (
                            <div
                                key={reward.id}
                                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 border border-gray-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">{reward.name}</h4>
                                        <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                                    </div>
                                    <span className={`ml-3 px-3 py-1 rounded-pill text-xs font-semibold ${reward.isActive
                                            ? 'bg-green-50 text-accent-success'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {reward.isActive ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    {reward.type === 'points' ? (
                                        <span className="text-brand-primary font-semibold">
                                            {reward.pointsRequired} puntos
                                        </span>
                                    ) : (
                                        <span className="text-accent-success font-semibold">
                                            {reward.stampsRequired} sellos
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
                                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                            />
                        </svg>
                        <p className="text-gray-600 font-medium">No tienes recompensas configuradas</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Crea tu primera recompensa para comenzar
                        </p>
                        <button
                            onClick={() => navigate('/business/dashboard/rewards')}
                            className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180"
                        >
                            Crear Recompensa
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessHome;
