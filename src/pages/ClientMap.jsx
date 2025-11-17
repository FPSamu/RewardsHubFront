import { useState, useEffect } from 'react';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';

const ClientMap = () => {
    const [businesses, setBusinesses] = useState([]);
    const [, setUserPoints] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all businesses
                const businessesData = await businessService.getAllBusinesses();

                // Fetch user points to determine visited businesses
                const pointsData = await userPointsService.getUserPoints();
                setUserPoints(pointsData);

                // Create a map of visited businesses with points/stamps
                const visitedMap = {};
                if (pointsData && pointsData.businessPoints) {
                    pointsData.businessPoints.forEach(bp => {
                        visitedMap[bp.businessId] = {
                            points: bp.points || 0,
                            stamps: bp.stamps || 0,
                            lastVisit: bp.lastVisit
                        };
                    });
                }

                // Map businesses with status and user data
                const enrichedBusinesses = businessesData.map(business => {
                    const businessId = business._id;
                    const visited = visitedMap[businessId];

                    return {
                        id: businessId,
                        name: business.name,
                        category: business.category || 'General',
                        address: business.address || 'Dirección no disponible',
                        status: visited ? 'visited' : 'not_visited',
                        points: visited ? visited.points : 0,
                        stamps: visited ? visited.stamps : 0,
                        distance: '-- km', // Distance calculation would require geolocation
                        availableRewards: 0, // Would need rewards service to calculate
                    };
                });

                setBusinesses(enrichedBusinesses);
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando negocios...</p>
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

    const dummyBusinesses = [
        {
            id: '507f1f77bcf86cd799439012',
            name: 'Café Central',
            category: 'Cafetería',
            address: 'Av. Vallarta 1234, Guadalajara',
            status: 'visited',
            points: 45,
            stamps: 3,
            distance: '0.5 km',
        },
        {
            id: '507f1f77bcf86cd799439014',
            name: 'Restaurante El Sabor',
            category: 'Restaurante',
            address: 'Calle Juárez 567, Guadalajara',
            status: 'visited',
            points: 120,
            stamps: 0,
            distance: '1.2 km',
        },
        {
            id: '507f1f77bcf86cd799439016',
            name: 'Panadería Dulce Aroma',
            category: 'Panadería',
            address: 'Av. México 890, Guadalajara',
            status: 'visited',
            points: 0,
            stamps: 7,
            distance: '0.8 km',
        },
        {
            id: '507f1f77bcf86cd799439018',
            name: 'Gimnasio FitLife',
            category: 'Gimnasio',
            address: 'Av. Américas 345, Guadalajara',
            status: 'visited',
            points: 80,
            stamps: 0,
            distance: '2.1 km',
        },
        {
            id: '507f1f77bcf86cd799439020',
            name: 'Librería Páginas',
            category: 'Librería',
            address: 'Av. Chapultepec 678, Guadalajara',
            status: 'visited',
            points: 30,
            stamps: 4,
            distance: '1.5 km',
        },
        {
            id: '507f1f77bcf86cd799439023',
            name: 'Pizza Napolitana',
            category: 'Restaurante',
            address: 'Av. Patria 234, Guadalajara',
            status: 'rewards_available',
            points: 0,
            stamps: 0,
            distance: '1.8 km',
            availableRewards: 2,
        },
        {
            id: '507f1f77bcf86cd799439024',
            name: 'Spa Relax',
            category: 'Bienestar',
            address: 'Av. Montevideo 456, Guadalajara',
            status: 'not_visited',
            points: 0,
            stamps: 0,
            distance: '3.2 km',
        },
        {
            id: '507f1f77bcf86cd799439025',
            name: 'Cine Metroplex',
            category: 'Entretenimiento',
            address: 'Av. Lázaro Cárdenas 789, Guadalajara',
            status: 'not_visited',
            points: 0,
            stamps: 0,
            distance: '2.5 km',
        },
        {
            id: '507f1f77bcf86cd799439026',
            name: 'Farmacia Salud+',
            category: 'Farmacia',
            address: 'Av. Hidalgo 123, Guadalajara',
            status: 'rewards_available',
            points: 0,
            stamps: 0,
            distance: '0.9 km',
            availableRewards: 1,
        },
        {
            id: '507f1f77bcf86cd799439027',
            name: 'Taller Mecánico Express',
            category: 'Automotriz',
            address: 'Av. Federalismo 456, Guadalajara',
            status: 'not_visited',
            points: 0,
            stamps: 0,
            distance: '4.1 km',
        },
    ];

    // Use real data if available, fallback to empty arrays
    const allBusinesses = businesses.length > 0 ? businesses : dummyBusinesses;
    const visited = allBusinesses.filter((b) => b.status === 'visited');
    const notVisited = allBusinesses.filter((b) => b.status === 'not_visited');
    const rewardsAvailable = allBusinesses.filter((b) => b.status === 'rewards_available');

    const getStatusBadge = (status) => {
        switch (status) {
            case 'visited':
                return <span className="px-3 py-1 bg-brand-muted text-brand-onColor text-xs font-semibold rounded-pill">Visitado</span>;
            case 'rewards_available':
                return <span className="px-3 py-1 bg-green-50 text-accent-successOnColor text-xs font-semibold rounded-pill">Recompensas Disponibles</span>;
            case 'not_visited':
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-pill">No Visitado</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Mapa de Negocios</h2>
                <p className="text-gray-600">Explora todos los negocios afiliados a RewardsHub</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-muted border border-brand-primary/20 rounded-xl p-6 shadow-card hover:shadow-popover transition-shadow duration-180">
                    <h3 className="text-lg font-semibold text-brand-onColor mb-2">Visitados</h3>
                    <p className="text-4xl font-bold text-brand-primary">{visited.length}</p>
                </div>
                <div className="bg-green-50 border border-accent-success/20 rounded-xl p-6 shadow-card hover:shadow-popover transition-shadow duration-180">
                    <h3 className="text-lg font-semibold text-accent-successOnColor mb-2">Con Recompensas</h3>
                    <p className="text-4xl font-bold text-accent-success">{rewardsAvailable.length}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-card hover:shadow-popover transition-shadow duration-180">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Por Visitar</h3>
                    <p className="text-4xl font-bold text-gray-600">{notVisited.length}</p>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 h-96 flex items-center justify-center border-b">
                    <div className="text-center">
                        <svg
                            className="w-24 h-24 text-blue-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">Mapa Interactivo</h3>
                        <p className="text-gray-500">
                            La integración del mapa estará disponible próximamente
                        </p>
                    </div>
                </div>
            </div>

            {/* Business List */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Lista de Negocios</h3>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button className="px-4 py-2 bg-brand-primary text-white rounded-pill font-medium hover:opacity-96 transition-all duration-180 shadow-sm">
                        Todos ({allBusinesses.length})
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-pill font-medium hover:bg-gray-200 transition-all duration-180">
                        Visitados ({visited.length})
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-pill font-medium hover:bg-gray-200 transition-all duration-180">
                        Con Recompensas ({rewardsAvailable.length})
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-pill font-medium hover:bg-gray-200 transition-all duration-180">
                        No Visitados ({notVisited.length})
                    </button>
                </div>

                {/* Business Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allBusinesses.map((business) => (
                        <div
                            key={business.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-popover transition-all duration-180 cursor-pointer bg-white"
                        >
                            {/* Business Icon & Status */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="bg-brand-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-sm">
                                    {business.name.charAt(0)}
                                </div>
                                {getStatusBadge(business.status)}
                            </div>

                            {/* Business Info */}
                            <h4 className="text-lg font-bold text-gray-800 mb-1 tracking-tight">{business.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{business.category}</p>
                            <p className="text-xs text-gray-500 mb-3 flex items-center">
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                {business.distance} • {business.address}
                            </p>

                            {/* Points/Stamps Info */}
                            {business.status === 'visited' && (
                                <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                                    {business.points > 0 && (
                                        <div className="flex items-center text-sm">
                                            <span className="font-semibold text-brand-primary">{business.points}</span>
                                            <span className="text-gray-600 ml-1">puntos</span>
                                        </div>
                                    )}
                                    {business.stamps > 0 && (
                                        <div className="flex items-center text-sm">
                                            <span className="font-semibold text-accent-success">{business.stamps}</span>
                                            <span className="text-gray-600 ml-1">sellos</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {business.status === 'rewards_available' && (
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-sm font-semibold text-accent-success">
                                        🎁 {business.availableRewards} recompensa(s) disponible(s)
                                    </p>
                                </div>
                            )}

                            {business.status === 'not_visited' && (
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">¡Visita este negocio y acumula puntos!</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientMap;
