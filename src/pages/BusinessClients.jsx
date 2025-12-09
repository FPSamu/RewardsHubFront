import { useState, useEffect } from 'react';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';
import authService from '../services/authService';
import rewardService from '../services/rewardService';
import systemService from '../services/systemService';

const BusinessClients = () => {
    const [business, setBusiness] = useState(null);
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('points'); // 'points', 'stamps', 'name', 'lastVisit'
    const [selectedClient, setSelectedClient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rewards, setRewards] = useState([]);
    const [rewardSystems, setRewardSystems] = useState({ points: null, stamps: [] });
    // const [loadingModal, setLoadingModal] = useState(false);

    useEffect(() => {
        fetchData();
        fetchRewardsAndSystems();
    }, []);

    const fetchRewardsAndSystems = async () => {
        try {
            // Fetch business rewards
            const businessData = await businessService.getMyBusiness();
            const rewardsData = await rewardService.getBusinessRewards(businessData.id);
            setRewards(rewardsData);

            // Fetch reward systems
            const systems = await systemService.getBusinessSystems();
            const pointsSystem = systems.find(sys => sys.type === 'points' && sys.isActive);
            const stampSystems = systems.filter(sys => sys.type === 'stamps' && sys.isActive);

            setRewardSystems({
                points: pointsSystem || null,
                stamps: stampSystems || []
            });
        } catch (err) {
            console.error('Error fetching rewards and systems:', err);
        }
    };

    useEffect(() => {
        // Filter clients based on search term
        if (searchTerm) {
            const filtered = clients.filter(client =>
                client.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClients(filtered);
        } else {
            setFilteredClients(clients);
        }
    }, [searchTerm, clients]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch business details
            const businessData = await businessService.getMyBusiness();
            setBusiness(businessData);

            // Fetch business users with points
            const usersData = await userPointsService.getBusinessUsers();

            // Fetch user details for each user
            const clientsDataPromises = usersData.users?.map(async (user) => {
                try {
                    // Get user details from /auth/:id
                    const userDetails = await authService.getUserById(user.userId);
                    return {
                        id: user.userId,
                        _id: user.userId,
                        userId: user.userId,
                        username: userDetails.username || 'Usuario',
                        email: userDetails.email || '',
                        points: user.businessPoints?.points || 0,
                        stamps: user.businessPoints?.stamps || 0,
                        lastVisit: user.businessPoints?.lastVisit || null,
                        availableRewards: 0 // TODO: Calculate based on reward systems
                    };
                } catch (err) {
                    console.error(`Error fetching user details for ${user.userId}:`, err);
                    return {
                        id: user.userId,
                        _id: user.userId,
                        userId: user.userId,
                        username: 'Usuario',
                        email: '',
                        points: user.businessPoints?.points || 0,
                        stamps: user.businessPoints?.stamps || 0,
                        lastVisit: user.businessPoints?.lastVisit || null,
                        availableRewards: 0
                    };
                }
            }) || [];

            const clientsData = await Promise.all(clientsDataPromises);

            setClients(clientsData);
            setFilteredClients(clientsData);

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const sortClients = (clientsList) => {
        const sorted = [...clientsList];
        switch (sortBy) {
            case 'points':
                return sorted.sort((a, b) => (b.points || 0) - (a.points || 0));
            case 'stamps':
                return sorted.sort((a, b) => (b.stamps || 0) - (a.stamps || 0));
            case 'name':
                return sorted.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
            case 'lastVisit':
                return sorted.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
            default:
                return sorted;
        }
    };

    const getAvailableRewards = (client) => {
        if (!rewards || rewards.length === 0) return 0;

        let availableCount = 0;
        rewards.forEach(reward => {
            // Check if reward is active
            if (!reward.isActive) return;

            // Check for points-based rewards
            if (reward.pointsRequired && client.points >= reward.pointsRequired) {
                availableCount++;
            }
            // Check for stamps-based rewards
            else if (reward.stampsRequired && client.stamps >= reward.stampsRequired) {
                availableCount++;
            }
        });

        return availableCount;
    };

    const handleViewDetails = async (client) => {
        setSelectedClient(client);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedClient(null);
    };

    const getRewardStatus = (reward, clientPoints, clientStamps) => {
        // Check if reward is active
        if (!reward.isActive) {
            return { available: false, label: 'Inactiva', color: 'gray' };
        }

        // Check for points-based rewards
        if (reward.pointsRequired !== undefined && reward.pointsRequired !== null) {
            if (clientPoints >= reward.pointsRequired) {
                return { available: true, label: 'Disponible', color: 'green' };
            }
            const pointsNeeded = reward.pointsRequired - clientPoints;
            return { available: false, label: `Faltan ${pointsNeeded} pts`, color: 'amber' };
        }
        // Check for stamps-based rewards
        else if (reward.stampsRequired !== undefined && reward.stampsRequired !== null) {
            if (clientStamps >= reward.stampsRequired) {
                return { available: true, label: 'Disponible', color: 'green' };
            }
            const stampsNeeded = reward.stampsRequired - clientStamps;
            return { available: false, label: `Faltan ${stampsNeeded} sellos`, color: 'amber' };
        }

        return { available: false, label: 'No configurada', color: 'gray' };
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
                        Gestión de Clientes
                    </h2>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    {error}
                </div>
            </div>
        );
    }

    const sortedClients = sortClients(filteredClients);
    const totalPoints = clients.reduce((sum, client) => sum + (client.points || 0), 0);
    const totalStamps = clients.reduce((sum, client) => sum + (client.stamps || 0), 0);
    const clientsWithRewards = clients.filter(client => getAvailableRewards(client) > 0).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <img
                                src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                                alt="RewardsHub Logo"
                                className="h-10 w-auto object-contain"
                            />
                            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                                Gestión de Clientes
                            </h2>
                        </div>
                        <p className="text-gray-600 text-base">
                            Clientes de {business?.name}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                            <p className="text-3xl font-bold text-brand-primary">{clients.length}</p>
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

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Puntos Totales</p>
                            <p className="text-3xl font-bold text-accent-gold">{totalPoints}</p>
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
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Sellos Totales</p>
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

                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Con Recompensas</p>
                            <p className="text-3xl font-bold text-accent-info">{clientsWithRewards}</p>
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
                                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar cliente por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-pill focus:outline-none focus:ring-4 focus:ring-brand-muted focus:border-brand-primary transition-all duration-180"
                            />
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-600">Ordenar por:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-pill focus:outline-none focus:ring-4 focus:ring-brand-muted focus:border-brand-primary transition-all duration-180 text-sm font-medium"
                        >
                            <option value="points">Puntos</option>
                            <option value="stamps">Sellos</option>
                            <option value="name">Nombre</option>
                            <option value="lastVisit">Última visita</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Clients List */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
                    Lista de Clientes ({sortedClients.length})
                </h3>
                {sortedClients.length > 0 ? (
                    <div className="space-y-3">
                        {sortedClients.map((client) => {
                            const availableRewards = getAvailableRewards(client);
                            return (
                                <div
                                    key={client.id || client._id}
                                    className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 border border-gray-200 p-4"
                                >
                                    {/* Header: Avatar + Name/Email */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="bg-brand-primary text-white rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center font-bold shadow-card">
                                            {(client.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-800 truncate">{client.username || 'Usuario'}</h4>
                                            <p className="text-sm text-gray-600 truncate">{client.email || 'Sin email'}</p>
                                            {client.lastVisit && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Última visita: {new Date(client.lastVisit).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Points and Stamps Badges - Responsive Grid */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="inline-flex items-center px-3 py-1.5 bg-brand-muted text-brand-onColor text-xs font-semibold rounded-pill">
                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {client.points || 0} pts
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-accent-successOnColor text-xs font-semibold rounded-pill">
                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {client.stamps || 0} sellos
                                        </span>
                                        {availableRewards > 0 && (
                                            <span className="inline-flex items-center px-3 py-1.5 bg-accent-gold text-white text-xs font-semibold rounded-pill">
                                                🎁 {availableRewards} disponible{availableRewards > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>

                                    {/* View Details Button - Full Width on Mobile */}
                                    <button
                                        onClick={() => handleViewDetails(client)}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-brand-primary text-white rounded-pill text-sm font-semibold hover:opacity-90 transition-opacity duration-180 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Ver detalles
                                    </button>
                                </div>
                            );
                        })}
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
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <p className="text-gray-600 font-medium">
                            {searchTerm ? 'No se encontraron clientes' : 'Aún no tienes clientes'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Los clientes aparecerán aquí cuando realicen su primera compra'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Detalles del Cliente */}
            {showModal && selectedClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-overlay" onClick={closeModal}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                            <h3 className="text-2xl font-bold text-gray-800">Detalles del Cliente</h3>
                            <button
                                onClick={closeModal}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-180"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Client Info Card - Estilo similar al de la landing */}
                        <div className="p-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-2xl font-bold text-white">
                                            {(selectedClient.username || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-xl text-gray-900">{selectedClient.username || 'Usuario'}</div>
                                        <div className="text-sm text-gray-600">{selectedClient.email || 'Sin email'}</div>
                                        {selectedClient.lastVisit && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Última visita: {new Date(selectedClient.lastVisit).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Points and Stamps Display */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-brand-primary to-amber-500 rounded-2xl p-4 shadow-md">
                                        <div className="text-white text-sm opacity-90 mb-1">Puntos Acumulados</div>
                                        <div className="text-white text-3xl font-bold">{selectedClient.points || 0}</div>
                                        {rewardSystems.points && (
                                            <div className="text-white text-xs opacity-75 mt-1">
                                                Sistema: {rewardSystems.points.name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-4 shadow-md">
                                        <div className="text-white text-sm opacity-90 mb-1">Sellos Acumulados</div>
                                        <div className="text-white text-3xl font-bold">{selectedClient.stamps || 0}</div>
                                        {rewardSystems.stamps.length > 0 && (
                                            <div className="text-white text-xs opacity-75 mt-1">
                                                {rewardSystems.stamps.length} sistema{rewardSystems.stamps.length > 1 ? 's' : ''} activo{rewardSystems.stamps.length > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rewards Summary */}
                                {rewards && rewards.length > 0 && (() => {
                                    const availableCount = rewards.filter(r =>
                                        r.isActive && (
                                            (r.pointsRequired && selectedClient.points >= r.pointsRequired) ||
                                            (r.stampsRequired && selectedClient.stamps >= r.stampsRequired)
                                        )
                                    ).length;

                                    return availableCount > 0 && (
                                        <div className="bg-gradient-to-r from-accent-gold to-amber-400 rounded-2xl p-4 shadow-lg">
                                            <div className="flex items-center justify-between text-white">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm opacity-90">Recompensas Disponibles</div>
                                                        <div className="text-2xl font-bold">{availableCount}</div>
                                                    </div>
                                                </div>
                                                <div className="text-3xl">🎉</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Rewards Section */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-accent-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                    </svg>
                                    Recompensas
                                </h4>

                                {rewards && rewards.length > 0 ? (
                                    <div className="space-y-3">
                                        {/* Sort rewards: available first, then by points/stamps needed */}
                                        {(() => {
                                            const sortedRewards = [...rewards]
                                                .sort((a, b) => {
                                                    const statusA = getRewardStatus(a, selectedClient.points, selectedClient.stamps);
                                                    const statusB = getRewardStatus(b, selectedClient.points, selectedClient.stamps);

                                                    // Available rewards first
                                                    if (statusA.available && !statusB.available) return -1;
                                                    if (!statusA.available && statusB.available) return 1;

                                                    // Then sort by points/stamps required (lowest first)
                                                    const costA = a.pointsRequired || a.stampsRequired || 0;
                                                    const costB = b.pointsRequired || b.stampsRequired || 0;
                                                    return costA - costB;
                                                });

                                            const availableRewards = sortedRewards.filter(r =>
                                                getRewardStatus(r, selectedClient.points, selectedClient.stamps).available
                                            );
                                            // Only show available rewards
                                            if (availableRewards.length === 0) {
                                                return (
                                                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                                                        <svg
                                                            className="w-12 h-12 text-gray-300 mx-auto mb-3"
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
                                                        <p className="text-gray-600 font-medium">No hay recompensas disponibles</p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            El cliente necesita acumular más puntos o sellos
                                                        </p>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div>
                                                    <h5 className="text-sm font-bold text-green-700 mb-3 flex items-center">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                        Recompensas Disponibles ({availableRewards.length})
                                                    </h5>
                                                    {availableRewards.map((reward) => {
                                                        const status = getRewardStatus(reward, selectedClient.points, selectedClient.stamps);
                                                        return (
                                                            <div
                                                                key={reward.id}
                                                                className="flex items-center justify-between p-4 rounded-xl transition-all duration-180 bg-green-50 border-2 border-green-200 mb-3"
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <span className="font-semibold text-gray-900">{reward.name}</span>
                                                                        {status.available && (
                                                                            <span className="text-green-600">✓</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 mb-2">{reward.description}</div>
                                                                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                                                                        {/* Show points requirement */}
                                                                        {reward.pointsRequired !== undefined && reward.pointsRequired !== null && (
                                                                            <span className="px-3 py-1 bg-brand-muted text-brand-primary text-xs font-semibold rounded-full">
                                                                                {reward.pointsRequired} puntos
                                                                            </span>
                                                                        )}
                                                                        {/* Show stamps requirement */}
                                                                        {reward.stampsRequired !== undefined && reward.stampsRequired !== null && (
                                                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                                                {reward.stampsRequired} sellos
                                                                            </span>
                                                                        )}
                                                                        {/* Show reward type badge */}
                                                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                                            {reward.rewardType === 'discount' && '💰 Descuento'}
                                                                            {reward.rewardType === 'free_product' && '🎁 Producto Gratis'}
                                                                            {reward.rewardType === 'coupon' && '🎟️ Cupón'}
                                                                            {reward.rewardType === 'cashback' && '💵 Cashback'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <span
                                                                        className={`px-4 py-2 text-sm font-semibold rounded-full ${status.available
                                                                            ? 'bg-green-500 text-white'
                                                                            : status.color === 'amber'
                                                                                ? 'bg-amber-100 text-amber-700'
                                                                                : 'bg-gray-200 text-gray-600'
                                                                            }`}
                                                                    >
                                                                        {status.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                                        <svg
                                            className="w-12 h-12 text-gray-300 mx-auto mb-3"
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
                                        <p className="text-gray-600 font-medium">No hay recompensas disponibles</p>
                                        <p className="text-sm text-gray-500 mt-1">Crea recompensas para tus clientes</p>
                                    </div>
                                )}
                            </div>

                            {/* Close Button */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={closeModal}
                                    className="w-full px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessClients;
