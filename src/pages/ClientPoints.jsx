import { useState, useEffect } from 'react';
import userPointsService from '../services/userPointsService';

const ClientPoints = () => {
    const [userPointsData, setUserPointsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const pointsData = await userPointsService.getUserPoints();
                setUserPointsData(pointsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching points data:', err);
                setError(err.message || 'Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando puntos...</p>
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

    if (!userPointsData || !userPointsData.businessPoints || userPointsData.businessPoints.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl">
                <p className="font-semibold">No tienes puntos acumulados aún</p>
                <p className="text-sm mt-1">Visita un negocio afiliado y comienza a acumular puntos</p>
            </div>
        );
    }

    // Note: Using real API data from backend
    // The data structure matches IUserPoints model with businessPoints array

    const totalPoints = userPointsData.businessPoints.reduce((sum, bp) => sum + bp.points, 0);
    const totalStamps = userPointsData.businessPoints.reduce((sum, bp) => sum + bp.stamps, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Mis Puntos y Recompensas</h2>
                <p className="text-gray-600">
                    Administra tus puntos y sellos en todos los negocios afiliados
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-primary to-accent-gold rounded-xl shadow-card p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Puntos Totales</h3>
                    <p className="text-4xl font-bold">{totalPoints}</p>
                    <p className="text-sm text-white/90 mt-2">
                        Acumulados en {userPointsData.businessPoints.filter((b) => b.points > 0).length} negocios
                    </p>
                </div>

                <div className="bg-gradient-to-br from-accent-success to-green-600 rounded-xl shadow-card p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Sellos Totales</h3>
                    <p className="text-4xl font-bold">{totalStamps}</p>
                    <p className="text-sm text-white/90 mt-2">
                        Acumulados en {userPointsData.businessPoints.filter((b) => b.stamps > 0).length} negocios
                    </p>
                </div>
            </div>

            {/* Business Points Details */}
            <div className="space-y-4">
                {userPointsData.businessPoints.map((business) => (
                    <div key={business.businessId} className="bg-white rounded-xl shadow-card overflow-hidden border border-gray-200">
                        {/* Business Header */}
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold">{business.businessName}</h3>
                                    <p className="text-sm text-gray-300 mt-1">
                                        Última visita:{' '}
                                        {new Date(business.lastVisit).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {business.points > 0 && (
                                        <div className="bg-brand-primary rounded-lg px-4 py-2 mb-2 shadow-card">
                                            <p className="text-sm font-medium">Puntos</p>
                                            <p className="text-2xl font-bold">{business.points}</p>
                                        </div>
                                    )}
                                    {business.stamps > 0 && (
                                        <div className="bg-accent-success rounded-lg px-4 py-2 shadow-card">
                                            <p className="text-sm font-medium">Sellos</p>
                                            <p className="text-2xl font-bold">{business.stamps}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reward Systems */}
                        <div className="p-6 space-y-6">
                            {business.rewardSystems.map((system) => (
                                <div key={system.rewardSystemId} className="border-l-4 border-brand-primary pl-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800">{system.systemName}</h4>
                                            <p className="text-sm text-gray-600">
                                                Sistema de {system.type === 'points' ? 'puntos' : 'sellos'}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-pill text-sm font-medium ${system.type === 'points'
                                                ? 'bg-brand-muted text-brand-onColor'
                                                : 'bg-green-50 text-accent-successOnColor'
                                                }`}
                                        >
                                            {system.type === 'points' ? `${system.points} pts` : `${system.stamps}/${system.targetStamps} sellos`}
                                        </span>
                                    </div>

                                    {/* Points System Details */}
                                    {system.type === 'points' && system.pointsConversion && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 mb-3">
                                                <span className="font-semibold">Conversión:</span> {system.pointsConversion.amount}{' '}
                                                {system.pointsConversion.currency} = {system.pointsConversion.points} punto(s)
                                            </p>

                                            {/* Available Rewards */}
                                            {system.availableRewards && system.availableRewards.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">
                                                        Recompensas disponibles:
                                                    </p>
                                                    <div className="space-y-2">
                                                        {system.availableRewards.map((reward, idx) => {
                                                            const canRedeem = system.points >= reward.pointsRequired;
                                                            const progress = Math.min((system.points / reward.pointsRequired) * 100, 100);

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`p-3 rounded-lg border transition-all duration-180 ${canRedeem ? 'bg-green-50 border-accent-success' : 'bg-gray-50 border-gray-200'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div>
                                                                            <p
                                                                                className={`text-sm font-medium ${canRedeem ? 'text-accent-successOnColor' : 'text-gray-800'
                                                                                    }`}
                                                                            >
                                                                                {reward.description}
                                                                            </p>
                                                                            <p className="text-xs text-gray-600">
                                                                                {reward.pointsRequired} puntos requeridos
                                                                            </p>
                                                                        </div>
                                                                        {canRedeem && (
                                                                            <span className="px-3 py-1 bg-accent-success text-white text-xs font-semibold rounded-pill shadow-card">
                                                                                ¡Disponible!
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Progress bar */}
                                                                    <div className="w-full bg-gray-200 rounded-pill h-2">
                                                                        <div
                                                                            className={`h-2 rounded-pill transition-all duration-240 ${canRedeem ? 'bg-accent-success' : 'bg-brand-primary'
                                                                                }`}
                                                                            style={{ width: `${progress}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Stamps System Details */}
                                    {system.type === 'stamps' && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 mb-3">
                                                <span className="font-semibold">Objetivo:</span> {system.targetStamps} sellos para
                                                obtener: {system.stampReward?.description}
                                            </p>

                                            {/* Stamps Progress */}
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                {Array.from({ length: system.targetStamps }).map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-card transition-all duration-180 ${idx < system.stamps
                                                            ? 'bg-accent-success text-white'
                                                            : 'bg-gray-200 text-gray-400'
                                                            }`}
                                                    >
                                                        {idx < system.stamps ? '✓' : idx + 1}
                                                    </div>
                                                ))}
                                            </div>

                                            {system.stamps >= system.targetStamps && (
                                                <div className="bg-green-50 border border-accent-success text-accent-successOnColor px-4 py-3 rounded-lg">
                                                    <p className="font-semibold">¡Recompensa disponible!</p>
                                                    <p className="text-sm">{system.stampReward?.description}</p>
                                                </div>
                                            )}

                                            {system.stamps < system.targetStamps && (
                                                <p className="text-sm text-gray-600">
                                                    Te faltan {system.targetStamps - system.stamps} sello(s) para completar esta
                                                    tarjeta
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500">
                                        Última actualización:{' '}
                                        {new Date(system.lastUpdated).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClientPoints;
