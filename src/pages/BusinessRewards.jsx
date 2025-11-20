import { useState, useEffect } from 'react';
import businessService from '../services/businessService';
import rewardService from '../services/rewardService';
import systemService from '../services/systemService';

const BusinessRewards = () => {
    const [business, setBusiness] = useState(null);
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPointsSystemModal, setShowPointsSystemModal] = useState(false);
    const [rewardType, setRewardType] = useState(null); // 'points' or 'stamps'
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    // Estado para verificar si existe sistema de puntos
    const [hasPointsSystem, setHasPointsSystem] = useState(false);
    const [pointsSystemConfig, setPointsSystemConfig] = useState(null);
    const [pointsSystem, setPointsSystem] = useState(null);
    const [stampsSystem, setStampsSystem] = useState(null);

    // Points system configuration form
    const [pointsSystemForm, setPointsSystemForm] = useState({
        amount: '',
        currency: 'MXN',
        points: ''
    });

    // Points reward form state
    const [pointsRewardFormData, setPointsRewardFormData] = useState({
        name: '',
        description: '',
        pointsRequired: '',
        rewardType: 'discount',
        rewardValue: '',
        rewardDescription: ''
    });

    // Stamps reward form state
    const [stampsFormData, setStampsFormData] = useState({
        name: '',
        description: '',
        targetStamps: '',
        productType: 'any',
        productIdentifier: '',
        stampReward: {
            rewardType: 'free_product',
            rewardValue: '',
            description: ''
        }
    });

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

            // Fetch systems (separado de rewards)
            const systemsData = await systemService.getBusinessSystems();

            // Verificar si existe un sistema de puntos (type: 'points')
            const pointsSys = systemsData.find(s => s.type === 'points' && s.isActive);
            if (pointsSys) {
                setHasPointsSystem(true);
                setPointsSystemConfig(pointsSys.pointsConversion);
                setPointsSystem(pointsSys);
            } else {
                setHasPointsSystem(false);
                setPointsSystemConfig(null);
                setPointsSystem(null);
            }

            // Verificar si existe un sistema de sellos (type: 'stamps')
            const stampsSys = systemsData.find(s => s.type === 'stamps' && s.isActive);
            setStampsSystem(stampsSys || null);

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
                    <div className="flex items-center gap-3">
                        {!hasPointsSystem && (
                            <button
                                onClick={() => setShowPointsSystemModal(true)}
                                className="px-6 py-3 bg-accent-gold text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Configurar Sistema de Puntos
                            </button>
                        )}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card"
                        >
                            + Nueva Recompensa
                        </button>
                    </div>
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
                                        {reward.pointsRequired ? (
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
                                            {reward.pointsRequired ? (
                                                <span className="text-xs font-semibold text-brand-primary">
                                                    {reward.pointsRequired} puntos requeridos
                                                </span>
                                            ) : reward.stampsRequired ? (
                                                <span className="text-xs font-semibold text-accent-success">
                                                    {reward.stampsRequired} sellos requeridos
                                                </span>
                                            ) : null}
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
                                        {reward.pointsRequired ? (
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

            {/* Create Modal */}
            {showCreateModal && (
                <CreateRewardModal
                    rewardType={rewardType}
                    setRewardType={setRewardType}
                    pointsRewardFormData={pointsRewardFormData}
                    setPointsRewardFormData={setPointsRewardFormData}
                    stampsFormData={stampsFormData}
                    setStampsFormData={setStampsFormData}
                    creating={creating}
                    createError={createError}
                    hasPointsSystem={hasPointsSystem}
                    pointsSystemConfig={pointsSystemConfig}
                    onClose={handleCloseModal}
                    onSubmit={handleCreateReward}
                    onConfigurePoints={() => {
                        setShowCreateModal(false);
                        setShowPointsSystemModal(true);
                    }}
                />
            )}

            {/* Points System Configuration Modal */}
            {showPointsSystemModal && (
                <PointsSystemConfigModal
                    formData={pointsSystemForm}
                    setFormData={setPointsSystemForm}
                    creating={creating}
                    error={createError}
                    onClose={() => {
                        setShowPointsSystemModal(false);
                        setPointsSystemForm({ amount: '', currency: 'MXN', points: '' });
                        setCreateError(null);
                    }}
                    onSubmit={handleCreatePointsSystem}
                />
            )}
        </div>
    );

    function handleCloseModal() {
        setShowCreateModal(false);
        setRewardType(null);
        setCreateError(null);
        // Reset forms
        setPointsRewardFormData({
            name: '',
            description: '',
            pointsRequired: '',
            rewardType: 'discount',
            rewardValue: '',
            rewardDescription: ''
        });
        setStampsFormData({
            name: '',
            description: '',
            targetStamps: '',
            productType: 'any',
            productIdentifier: '',
            stampReward: {
                rewardType: 'free_product',
                rewardValue: '',
                description: ''
            }
        });
    }

    async function handleCreatePointsSystem(e) {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);

        try {
            const payload = {
                name: 'Sistema de Puntos',
                description: 'Sistema de acumulación de puntos',
                pointsConversion: {
                    amount: parseFloat(pointsSystemForm.amount),
                    currency: pointsSystemForm.currency,
                    points: parseInt(pointsSystemForm.points)
                }
            };

            await systemService.createPointsSystem(payload);
            await fetchData();

            setShowPointsSystemModal(false);
            setPointsSystemForm({ amount: '', currency: 'MXN', points: '' });
            setCreateError(null);
        } catch (err) {
            console.error('Error creating points system:', err);
            setCreateError(err.message || 'Error al configurar el sistema de puntos');
        } finally {
            setCreating(false);
        }
    }

    async function handleCreateReward(e) {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);

        try {
            if (rewardType === 'points') {
                if (!pointsSystem) {
                    throw new Error('No se encontró el sistema de puntos');
                }

                const payload = {
                    systemId: pointsSystem.id,
                    name: pointsRewardFormData.name,
                    description: pointsRewardFormData.description,
                    rewardType: pointsRewardFormData.rewardType,
                    rewardValue: pointsRewardFormData.rewardType === 'discount' ?
                        parseFloat(pointsRewardFormData.rewardValue) :
                        pointsRewardFormData.rewardValue,
                    pointsRequired: parseInt(pointsRewardFormData.pointsRequired)
                };
                await rewardService.createPointsReward(payload);
            } else if (rewardType === 'stamps') {
                const payload = {
                    name: stampsFormData.name,
                    description: stampsFormData.description,
                    rewardType: stampsFormData.stampReward.rewardType,
                    rewardValue: stampsFormData.stampReward.rewardValue ?
                        parseFloat(stampsFormData.stampReward.rewardValue) :
                        stampsFormData.name,
                    stampsRequired: parseInt(stampsFormData.targetStamps)
                };

                // Si ya existe un sistema de sellos, incluir su ID
                if (stampsSystem) {
                    payload.systemId = stampsSystem.id;
                }

                await rewardService.createStampsReward(payload);
            }            // Reload rewards
            await fetchData();
            handleCloseModal();
        } catch (err) {
            console.error('Error creating reward:', err);
            setCreateError(err.message || 'Error al crear la recompensa');
        } finally {
            setCreating(false);
        }
    }
};

// Points System Configuration Modal Component
function PointsSystemConfigModal({ formData, setFormData, creating, error, onClose, onSubmit }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-popover max-w-lg w-full my-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Configurar Sistema de Puntos</h3>
                            <p className="text-sm text-gray-600 mt-1">Define cómo los clientes acumulan puntos</p>
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-blue-800">¿Qué es esto?</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Esta configuración establece la equivalencia entre dinero gastado y puntos ganados.
                                    Solo necesitas configurarlo una vez.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-amber-50 to-yellow-50">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Conversión de Puntos
                        </h4>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Monto ($) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    placeholder="100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Moneda <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                >
                                    <option value="MXN">MXN</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Puntos <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.points}
                                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        {formData.amount && formData.points && (
                            <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Vista previa:</p>
                                <p className="text-sm text-gray-600">
                                    Por cada <span className="font-bold text-brand-primary">${formData.amount} {formData.currency}</span> gastados,
                                    el cliente recibirá <span className="font-bold text-brand-primary">{formData.points} puntos</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={creating}
                            className="px-6 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {creating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Configurando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Guardar Configuración
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Modal Component
function CreateRewardModal({
    rewardType,
    setRewardType,
    pointsRewardFormData,
    setPointsRewardFormData,
    stampsFormData,
    setStampsFormData,
    creating,
    createError,
    hasPointsSystem,
    pointsSystemConfig,
    onClose,
    onSubmit,
    onConfigurePoints
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-popover max-w-2xl w-full my-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-800">Crear Nueva Recompensa</h3>
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

                <div className="p-6">
                    {!rewardType ? (
                        <TypeSelection
                            setRewardType={setRewardType}
                            hasPointsSystem={hasPointsSystem}
                            onConfigurePoints={onConfigurePoints}
                        />
                    ) : rewardType === 'points' ? (
                        <PointsRewardForm
                            formData={pointsRewardFormData}
                            setFormData={setPointsRewardFormData}
                            pointsSystemConfig={pointsSystemConfig}
                            onSubmit={onSubmit}
                            creating={creating}
                            error={createError}
                            onBack={() => setRewardType(null)}
                        />
                    ) : rewardType === 'stamps' ? (
                        <StampsRewardForm
                            formData={stampsFormData}
                            setFormData={setStampsFormData}
                            onSubmit={onSubmit}
                            creating={creating}
                            error={createError}
                            onBack={() => setRewardType(null)}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// Type Selection Component
function TypeSelection({ setRewardType, hasPointsSystem, onConfigurePoints }) {
    return (
        <div className="space-y-4">
            <p className="text-gray-600 mb-6">Selecciona el tipo de recompensa que deseas crear:</p>

            <button
                onClick={() => hasPointsSystem ? setRewardType('points') : null}
                disabled={!hasPointsSystem}
                className={`w-full p-6 border-2 rounded-xl transition-all duration-180 text-left group ${hasPointsSystem
                    ? 'border-gray-200 hover:border-brand-primary hover:bg-brand-muted cursor-pointer'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
            >
                <div className="flex items-start space-x-4">
                    <div className={`rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 transition-transform ${hasPointsSystem
                        ? 'bg-brand-primary text-white group-hover:scale-110'
                        : 'bg-gray-300 text-gray-500'
                        }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800 mb-1">Sistema de Puntos</h4>
                        <p className="text-sm text-gray-600">Los clientes acumulan puntos por cada compra y pueden canjearlos por recompensas específicas.</p>
                        {!hasPointsSystem ? (
                            <div className="mt-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-xs text-red-600 font-semibold">Primero configura tu sistema de puntos</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onConfigurePoints();
                                    }}
                                    className="text-xs text-brand-primary font-semibold hover:underline ml-2"
                                >
                                    Configurar ahora →
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-brand-primary font-semibold mt-2">✓ Sistema configurado</p>
                        )}
                    </div>
                </div>
            </button>

            <button
                onClick={() => setRewardType('stamps')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-accent-success hover:bg-green-50 transition-all duration-180 text-left group"
            >
                <div className="flex items-start space-x-4">
                    <div className="bg-accent-success text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-1">Sistema de Estampas</h4>
                        <p className="text-sm text-gray-600">Los clientes reciben una estampa por compra y obtienen una recompensa al completar el objetivo.</p>
                        <p className="text-xs text-accent-success font-semibold mt-2">Ejemplo: 10 cafés = 1 café gratis</p>
                    </div>
                </div>
            </button>
        </div>
    );
}

// Points Reward Form Component
function PointsRewardForm({ formData, setFormData, pointsSystemConfig, onSubmit, creating, error, onBack }) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Info del sistema de puntos configurado */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Sistema de Puntos Configurado</p>
                        <p className="text-xs text-gray-600 mt-1">
                            {pointsSystemConfig?.amount} {pointsSystemConfig?.currency} = {pointsSystemConfig?.points} puntos
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título de la Recompensa <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="Ej: Descuento de $50"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    rows="3"
                    placeholder="Describe qué obtiene el cliente con esta recompensa"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta de Puntos <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    required
                    min="1"
                    value={formData.pointsRequired}
                    onChange={(e) => setFormData({ ...formData, pointsRequired: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">¿Cuántos puntos necesita el cliente para obtener esta recompensa?</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-4">Detalles de la Recompensa</h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tipo de Recompensa <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.rewardType}
                            onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        >
                            <option value="discount">Descuento</option>
                            <option value="free_product">Producto Gratis</option>
                            <option value="coupon">Cupón</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Valor de la Recompensa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.rewardValue}
                            onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            placeholder="50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.rewardType === 'discount' ? 'Porcentaje o monto en pesos del descuento' : 'Valor del producto o cupón'}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                >
                    ← Volver
                </button>
                <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creating ? 'Creando...' : 'Crear Recompensa'}
                </button>
            </div>
        </form>
    );
}

// Stamps Reward Form Component
function StampsRewardForm({ formData, setFormData, onSubmit, creating, error, onBack }) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título de la Recompensa <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-success focus:border-transparent"
                    placeholder="Ej: Café Gratis"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-success focus:border-transparent"
                    rows="3"
                    placeholder="Describe qué obtiene el cliente con esta recompensa"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta de Estampas <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    required
                    min="1"
                    value={formData.targetStamps}
                    onChange={(e) => setFormData({ ...formData, targetStamps: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-success focus:border-transparent"
                    placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">¿Cuántas estampas necesita el cliente para obtener esta recompensa?</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-4">Detalles de la Recompensa</h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tipo de Recompensa <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.stampReward.rewardType}
                            onChange={(e) => setFormData({
                                ...formData,
                                stampReward: { ...formData.stampReward, rewardType: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-success focus:border-transparent"
                        >
                            <option value="free_product">Producto Gratis</option>
                            <option value="coupon">Cupón</option>
                            <option value="discount">Descuento</option>
                        </select>
                    </div>

                    {formData.stampReward.rewardType !== 'free_product' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Valor de la Recompensa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.stampReward.rewardValue}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    stampReward: { ...formData.stampReward, rewardValue: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-success focus:border-transparent"
                                placeholder="50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.stampReward.rewardType === 'discount' ? 'Porcentaje o monto en pesos del descuento' : 'Valor del cupón'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                >
                    ← Volver
                </button>
                <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 bg-accent-success text-white rounded-pill font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creating ? 'Creando...' : 'Crear Recompensa'}
                </button>
            </div>
        </form>
    );
}

export default BusinessRewards;
