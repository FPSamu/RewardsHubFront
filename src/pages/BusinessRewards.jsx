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
    const [isEditingPointsSystem, setIsEditingPointsSystem] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [rewardType, setRewardType] = useState(null); // 'points' or 'stamps'
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

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

    // Edit reward form state
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        rewardType: '',
        rewardValue: '',
        pointsRequired: '',
        stampsRequired: ''
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

            // Fetch rewards (including inactive ones)
            const rewardsData = await rewardService.getBusinessRewards(businessData.id, true);
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

    // Handler to open modal for create or edit
    function handleOpenPointsSystemModal(editMode = false) {
        setIsEditingPointsSystem(editMode);
        if (editMode && pointsSystem) {
            setPointsSystemForm({
                amount: pointsSystem.pointsConversion?.amount?.toString() || '',
                currency: pointsSystem.pointsConversion?.currency || 'MXN',
                points: pointsSystem.pointsConversion?.points?.toString() || ''
            });
        } else {
            setPointsSystemForm({ amount: '', currency: 'MXN', points: '' });
        }
        setCreateError(null);
        setShowPointsSystemModal(true);
    }

    // Handler for saving (create or update)
    async function handleSavePointsSystem(e) {
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

            if (isEditingPointsSystem && pointsSystem) {
                await systemService.updatePointsSystem(pointsSystem.id, payload);
            } else {
                await systemService.createPointsSystem(payload);
            }
            await fetchData();

            setShowPointsSystemModal(false);
            setPointsSystemForm({ amount: '', currency: 'MXN', points: '' });
            setCreateError(null);
        } catch (err) {
            console.error('Error saving points system:', err);
            setCreateError(err.message || 'Error al configurar el sistema de puntos');
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex flex-col gap-4">
                    {/* Title Section */}
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <img
                                src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                                alt="RewardsHub Logo"
                                className="h-10 w-auto object-contain"
                            />
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                                Gestión de Recompensas
                            </h2>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Administra las recompensas de {business?.name}
                        </p>
                    </div>

                    {/* Buttons Section */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {!hasPointsSystem && (
                            <button
                                onClick={() => handleOpenPointsSystemModal(false)}
                                className="w-full sm:w-auto px-6 py-3 bg-accent-gold text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Configurar Sistema de Puntos</span>
                                <span className="sm:hidden">Configurar Puntos</span>
                            </button>
                        )}
                        {hasPointsSystem && (
                            <button
                                onClick={() => handleOpenPointsSystemModal(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-accent-gold text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Editar Sistema de Puntos</span>
                                <span className="sm:hidden">Editar Puntos</span>
                            </button>
                        )}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full sm:w-auto px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Recompensa
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
                                className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 border border-gray-200 p-4"
                            >
                                {/* Header: Icon + Title/Description */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="bg-brand-primary text-white rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center font-bold shadow-card">
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
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800">{reward.name}</h4>
                                        <p className="text-sm text-gray-600">{reward.description}</p>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {reward.pointsRequired ? (
                                        <span className="inline-flex items-center px-3 py-1.5 bg-brand-muted text-brand-primary text-xs font-semibold rounded-pill">
                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {reward.pointsRequired} puntos
                                        </span>
                                    ) : reward.stampsRequired ? (
                                        <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-accent-success text-xs font-semibold rounded-pill">
                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {reward.stampsRequired} sellos
                                        </span>
                                    ) : null}
                                    {reward.discount && (
                                        <span className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-accent-gold text-xs font-semibold rounded-pill">
                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                            </svg>
                                            {reward.discount}% descuento
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons - Responsive Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleOpenEditModal(reward)}
                                        className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-pill text-sm font-semibold hover:bg-gray-300 transition-colors duration-180 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeactivateReward(reward.id)}
                                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-pill text-sm font-semibold hover:bg-red-100 transition-colors duration-180 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
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
                                        onClick={() => handleActivateReward(reward.id)}
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
                    isEditing={isEditingPointsSystem}
                    onClose={() => {
                        setShowPointsSystemModal(false);
                        setPointsSystemForm({ amount: '', currency: 'MXN', points: '' });
                        setCreateError(null);
                    }}
                    onSubmit={handleSavePointsSystem}
                />
            )}

            {/* Edit Reward Modal */}
            {showEditModal && editingReward && (
                <EditRewardModal
                    reward={editingReward}
                    formData={editFormData}
                    setFormData={setEditFormData}
                    updating={updating}
                    error={updateError}
                    onClose={handleCloseEditModal}
                    onSubmit={handleUpdateReward}
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

    // async function handleCreatePointsSystem(e) {
    //     e.preventDefault();
    //     setCreating(true);
    //     setCreateError(null);

    //     try {
    //         const payload = {
    //             name: 'Sistema de Puntos',
    //             description: 'Sistema de acumulación de puntos',
    //             pointsConversion: {
    //                 amount: parseFloat(pointsSystemForm.amount),
    //                 currency: pointsSystemForm.currency,
    //                 points: parseInt(pointsSystemForm.points)
    //             }
    //         };

    //         await systemService.createPointsSystem(payload);
    //         await fetchData();

    //         setShowPointsSystemModal(false);
    //         setPointsSystemForm({ amount: '', currency: 'MXN', points: '' });
    //         setCreateError(null);
    //     } catch (err) {
    //         console.error('Error creating points system:', err);
    //         setCreateError(err.message || 'Error al configurar el sistema de puntos');
    //     } finally {
    //         setCreating(false);
    //     }
    // }

    async function handleCreateReward(e) {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);

        try {
            if (rewardType === 'points') {
                if (!pointsSystem) {
                    throw new Error('No se encontró el sistema de puntos');
                }

                // Determinar el valor de la recompensa según el tipo
                let rewardValue;
                if (pointsRewardFormData.rewardType === 'free_product') {
                    // Para producto gratis, usar el nombre de la recompensa
                    rewardValue = pointsRewardFormData.name;
                } else if (pointsRewardFormData.rewardType === 'discount') {
                    // Para descuento, convertir a número
                    rewardValue = parseFloat(pointsRewardFormData.rewardValue);
                } else {
                    // Para otros tipos (cupón), usar el valor como está
                    rewardValue = pointsRewardFormData.rewardValue;
                }

                const payload = {
                    systemId: pointsSystem.id,
                    name: pointsRewardFormData.name,
                    description: pointsRewardFormData.description,
                    rewardType: pointsRewardFormData.rewardType,
                    rewardValue: rewardValue,
                    pointsRequired: parseInt(pointsRewardFormData.pointsRequired)
                };
                await rewardService.createPointsReward(payload);
            } else if (rewardType === 'stamps') {
                let systemIdToUse = stampsSystem?.id;

                // Si no existe un sistema de sellos, crear uno automáticamente
                if (!systemIdToUse) {
                    const systemData = {
                        name: 'Sistema de Sellos',
                        description: 'Sistema de recompensas por sellos',
                        targetStamps: parseInt(stampsFormData.targetStamps),
                        productType: stampsFormData.productType,
                        productIdentifier: stampsFormData.productIdentifier || undefined
                    };
                    const newSystem = await systemService.createStampsSystem(systemData);
                    systemIdToUse = newSystem.id;
                }

                const payload = {
                    systemId: systemIdToUse,
                    name: stampsFormData.name,
                    description: stampsFormData.description,
                    rewardType: stampsFormData.stampReward.rewardType,
                    rewardValue: stampsFormData.stampReward.rewardValue ?
                        parseFloat(stampsFormData.stampReward.rewardValue) :
                        stampsFormData.name,
                    stampsRequired: parseInt(stampsFormData.targetStamps)
                };

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

    function handleOpenEditModal(reward) {
        setEditingReward(reward);
        setEditFormData({
            name: reward.name || '',
            description: reward.description || '',
            rewardType: reward.rewardType || '',
            rewardValue: reward.rewardValue || '',
            pointsRequired: reward.pointsRequired || '',
            stampsRequired: reward.stampsRequired || ''
        });
        setShowEditModal(true);
    }

    function handleCloseEditModal() {
        setShowEditModal(false);
        setEditingReward(null);
        setUpdateError(null);
        setEditFormData({
            name: '',
            description: '',
            rewardType: '',
            rewardValue: '',
            pointsRequired: '',
            stampsRequired: ''
        });
    }

    async function handleUpdateReward(e) {
        e.preventDefault();
        if (!editingReward) return;

        setUpdating(true);
        setUpdateError(null);

        try {
            const payload = {
                name: editFormData.name,
                description: editFormData.description,
                rewardType: editFormData.rewardType,
                rewardValue: editFormData.rewardType === 'discount' ?
                    parseFloat(editFormData.rewardValue) :
                    editFormData.rewardValue
            };

            // Include points or stamps requirement based on what the reward has
            if (editFormData.pointsRequired) {
                payload.pointsRequired = parseInt(editFormData.pointsRequired);
            }
            if (editFormData.stampsRequired) {
                payload.stampsRequired = parseInt(editFormData.stampsRequired);
            }

            await rewardService.updateReward(editingReward.id, payload);
            await fetchData();
            handleCloseEditModal();
        } catch (err) {
            console.error('Error updating reward:', err);
            setUpdateError(err.message || 'Error al actualizar la recompensa');
        } finally {
            setUpdating(false);
        }
    }

    async function handleDeactivateReward(rewardId) {
        if (!confirm('¿Estás seguro de que deseas desactivar esta recompensa?')) {
            return;
        }

        try {
            await rewardService.updateReward(rewardId, { isActive: false });
            await fetchData();
        } catch (err) {
            console.error('Error deactivating reward:', err);
            alert(err.message || 'Error al desactivar la recompensa');
        }
    }

    async function handleActivateReward(rewardId) {
        try {
            await rewardService.updateReward(rewardId, { isActive: true });
            await fetchData();
        } catch (err) {
            console.error('Error activating reward:', err);
            alert(err.message || 'Error al activar la recompensa');
        }
    }
};

// Points System Configuration Modal Component
function PointsSystemConfigModal({ formData, setFormData, creating, error, isEditing, onClose, onSubmit }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-popover max-w-lg w-full my-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Sistema de Puntos' : 'Configurar Sistema de Puntos'}</h3>
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
                                    Esta configuración establece la equivalencia entre dinero gastado y puntos ganados.<br />
                                    {isEditing ? (
                                        <span className="font-bold text-red-700">Editar la configuración afectará cómo se acumulan puntos a partir de ahora.</span>
                                    ) : (
                                        <>Solo necesitas configurarlo una vez.</>
                                    )}
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
                                    {isEditing ? 'Guardando...' : 'Configurando...'}
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {isEditing ? 'Guardar Cambios' : 'Guardar Configuración'}
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

                    {formData.rewardType !== 'free_product' && (
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

// Edit Reward Modal Component
function EditRewardModal({ reward, formData, setFormData, updating, error, onClose, onSubmit }) {
    const isPointsReward = reward.pointsRequired !== undefined && reward.pointsRequired !== null;
    const isStampsReward = reward.stampsRequired !== undefined && reward.stampsRequired !== null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-popover max-w-2xl w-full my-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Editar Recompensa</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {isPointsReward ? 'Recompensa por puntos' : 'Recompensa por sellos'}
                            </p>
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
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nombre de la Recompensa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            placeholder="Ej: Café Gratis"
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                            rows="3"
                            placeholder="Describe los detalles de la recompensa"
                        />
                    </div>

                    {/* Tipo de Recompensa */}
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
                            <option value="discount">💰 Descuento</option>
                            <option value="free_product">🎁 Producto Gratis</option>
                            <option value="coupon">🎟️ Cupón</option>
                            <option value="cashback">💵 Cashback</option>
                        </select>
                    </div>

                    {/* Valor de la Recompensa */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Valor de la Recompensa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type={formData.rewardType === 'discount' || formData.rewardType === 'cashback' ? 'number' : 'text'}
                            required
                            min={formData.rewardType === 'discount' || formData.rewardType === 'cashback' ? '0' : undefined}
                            step={formData.rewardType === 'discount' || formData.rewardType === 'cashback' ? '0.01' : undefined}
                            value={formData.rewardValue}
                            onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            placeholder={
                                formData.rewardType === 'discount' ? '10 (para 10% o $10)' :
                                    formData.rewardType === 'free_product' ? 'Nombre del producto gratis' :
                                        formData.rewardType === 'cashback' ? '50 (pesos)' :
                                            'Descripción del cupón'
                            }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.rewardType === 'discount' && 'Porcentaje (%) o monto fijo ($) de descuento'}
                            {formData.rewardType === 'free_product' && 'Nombre del producto que se regala'}
                            {formData.rewardType === 'cashback' && 'Cantidad de dinero a devolver en pesos'}
                            {formData.rewardType === 'coupon' && 'Descripción de lo que incluye el cupón'}
                        </p>
                    </div>

                    {/* Objetivo (Puntos o Sellos) */}
                    {isPointsReward && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Puntos Requeridos <span className="text-red-500">*</span>
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
                            <p className="text-xs text-gray-500 mt-1">
                                Cantidad de puntos que debe acumular el cliente para canjear esta recompensa
                            </p>
                        </div>
                    )}

                    {isStampsReward && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sellos Requeridos <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.stampsRequired}
                                onChange={(e) => setFormData({ ...formData, stampsRequired: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                placeholder="10"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Cantidad de sellos que debe acumular el cliente para canjear esta recompensa
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-pill font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updating ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BusinessRewards;
