import { useState, useEffect } from 'react';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';
import authService from '../services/authService';

const BusinessClients = () => {
    const [business, setBusiness] = useState(null);
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('points'); // 'points', 'stamps', 'name', 'lastVisit'

    useEffect(() => {
        fetchData();
    }, []);

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
        // Lógica para determinar si el cliente tiene recompensas disponibles
        // Esto se calculará según los puntos/sellos del cliente y las recompensas del negocio
        return client.availableRewards || 0;
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
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                            Gestión de Clientes
                        </h2>
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
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 border border-gray-200"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="bg-brand-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-card">
                                            {(client.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{client.username || 'Usuario'}</h4>
                                            <p className="text-sm text-gray-600">{client.email || 'Sin email'}</p>
                                            {client.lastVisit && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Última visita: {new Date(client.lastVisit).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="px-3 py-1 bg-brand-muted text-brand-onColor text-xs font-semibold rounded-pill">
                                                    {client.points || 0} pts
                                                </span>
                                                <span className="px-3 py-1 bg-green-50 text-accent-successOnColor text-xs font-semibold rounded-pill">
                                                    {client.stamps || 0} sellos
                                                </span>
                                            </div>
                                            {availableRewards > 0 && (
                                                <span className="inline-block px-3 py-1 bg-accent-gold text-white text-xs font-semibold rounded-pill">
                                                    🎁 {availableRewards} recompensa{availableRewards > 1 ? 's' : ''} disponible{availableRewards > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            className="px-4 py-2 bg-brand-primary text-white rounded-pill text-sm font-semibold hover:opacity-90 transition-opacity duration-180"
                                        >
                                            Ver detalles
                                        </button>
                                    </div>
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
        </div>
    );
};

export default BusinessClients;
