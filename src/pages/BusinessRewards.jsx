import { useState, useEffect } from 'react';
import businessService from '../services/businessService';
import rewardService from '../services/rewardService';

const BusinessRewards = () => {
    const [business, setBusiness] = useState(null);
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch business details
            const businessData = await businessService.getMyBusiness();
            setBusiness(businessData);

            // Fetch rewards
            const rewardsData = await rewardService.getBusinessRewards(businessData.id);
            setRewards(rewardsData);

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
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
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                        Gestión de Recompensas
                    </h2>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    {error}
                </div>
            </div>
        );
    }

    const activeRewards = rewards.filter(r => r.isActive);
    const inactiveRewards = rewards.filter(r => !r.isActive);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                            Gestión de Recompensas
                        </h2>
                        <p className="text-gray-600 text-base">
                            Administra las recompensas de {business?.name}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card"
                    >
                        + Nueva Recompensa
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Recompensas</p>
                            <p className="text-3xl font-bold text-brand-primary">{rewards.length}</p>
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
                                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Recompensas Activas</p>
                            <p className="text-3xl font-bold text-accent-success">{activeRewards.length}</p>
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

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Recompensas Inactivas</p>
                            <p className="text-3xl font-bold text-gray-400">{inactiveRewards.length}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-full">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.75}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Rewards */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">Recompensas Activas</h3>
                {activeRewards.length > 0 ? (
                    <div className="space-y-3">
                        {activeRewards.map((reward) => (
                            <div
                                key={reward.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 border border-gray-200"
                            >
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="bg-brand-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-card">
                                        {reward.type === 'points' ? (
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800">{reward.name}</h4>
                                        <p className="text-sm text-gray-600">{reward.description}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                            {reward.type === 'points' ? (
                                                <span className="text-xs font-semibold text-brand-primary">
                                                    {reward.pointsRequired} puntos requeridos
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-accent-success">
                                                    {reward.stampsRequired} sellos requeridos
                                                </span>
                                            )}
                                            {reward.discount && (
                                                <span className="text-xs font-semibold text-accent-gold">
                                                    {reward.discount}% descuento
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-pill text-sm font-semibold hover:bg-gray-300 transition-colors duration-180"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-pill text-sm font-semibold hover:bg-red-100 transition-colors duration-180"
                                    >
                                        Desactivar
                                    </button>
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
                        <p className="text-gray-600 font-medium">No tienes recompensas activas</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Crea una nueva recompensa o activa una existente
                        </p>
                    </div>
                )}
            </div>

            {/* Inactive Rewards */}
            {inactiveRewards.length > 0 && (
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">Recompensas Inactivas</h3>
                    <div className="space-y-3">
                        {inactiveRewards.map((reward) => (
                            <div
                                key={reward.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 border border-gray-200 opacity-75"
                            >
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="bg-gray-300 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                                        {reward.type === 'points' ? (
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800">{reward.name}</h4>
                                        <p className="text-sm text-gray-600">{reward.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="px-4 py-2 bg-accent-success text-white rounded-pill text-sm font-semibold hover:opacity-90 transition-opacity duration-180"
                                    >
                                        Activar
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-pill text-sm font-semibold hover:bg-red-100 transition-colors duration-180"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Modal Placeholder */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-popover p-6 max-w-lg w-full mx-4">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Crear Nueva Recompensa</h3>
                        <p className="text-gray-600 mb-4">
                            Funcionalidad de creación de recompensas (implementar formulario)
                        </p>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-pill font-semibold hover:bg-gray-300 transition-colors duration-180"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessRewards;
