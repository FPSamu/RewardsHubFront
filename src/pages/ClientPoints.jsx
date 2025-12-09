import { useState, useEffect } from 'react';
import userPointsService from '../services/userPointsService';
import { transactionService } from '../services/transactionService';
import businessService from '../services/businessService';

const ClientPoints = () => {
    const [userPointsData, setUserPointsData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [businessLogos, setBusinessLogos] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user points and transactions in parallel
                const [pointsData, transactionsData] = await Promise.all([
                    userPointsService.getUserPoints(),
                    transactionService.getUserTransactions(50, 0),
                ]);

                // Fetch business names for each businessId in pointsData
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
                }

                setUserPointsData(pointsData);

                // Ensure transactions is always an array
                let transactionsList = [];
                if (Array.isArray(transactionsData)) {
                    transactionsList = transactionsData;
                } else if (transactionsData && Array.isArray(transactionsData.transactions)) {
                    transactionsList = transactionsData.transactions;
                } else {
                    transactionsList = [];
                }
                setTransactions(transactionsList);

                // Fetch business logos for unique business IDs
                const uniqueBusinessIds = [...new Set(transactionsList.map(t => t.businessId).filter(Boolean))];
                const logosMap = {};
                await Promise.all(
                    uniqueBusinessIds.map(async (businessId) => {
                        try {
                            const business = await businessService.getBusinessById(businessId);
                            if (business.logoUrl) {
                                logosMap[businessId] = business.logoUrl;
                            }
                        } catch (err) {
                            console.error(`Error fetching logo for business ${businessId}:`, err);
                        }
                    })
                );
                setBusinessLogos(logosMap);

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

    const filteredBusinesses = userPointsData.businessPoints.filter(business =>
        (business.businessName || business.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper function to format transaction type
    const getTransactionTypeInfo = (type) => {
        switch (type) {
            case 'add':
                return {
                    label: 'Suma',
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    icon: '➕'
                };
            case 'subtract':
                return {
                    label: 'Resta',
                    bgColor: 'bg-orange-100',
                    textColor: 'text-orange-800',
                    icon: '➖'
                };
            case 'redeem':
                return {
                    label: 'Canje',
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    icon: '🎁'
                };
            default:
                return {
                    label: type,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    icon: '•'
                };
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                    <img
                        src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                        alt="RewardsHub Logo"
                        className="h-10 w-auto object-contain"
                    />
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Mis Puntos y Recompensas</h2>
                </div>
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
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-180 gap-3"
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
                            <p>No se encontraron negocios que coincidan con &quot{searchTerm}&quot</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Historial de Transacciones</h3>

                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">No hay transacciones registradas</p>
                        <p className="text-sm mt-2">Tus transacciones aparecerán aquí cuando realices compras o canjes</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction) => {
                            const typeInfo = getTransactionTypeInfo(transaction.type);
                            const hasPoints = transaction.totalPointsChange !== 0;
                            const hasStamps = transaction.totalStampsChange !== 0;

                            return (
                                <div
                                    key={transaction.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left section: Business and type */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {businessLogos[transaction.businessId] ? (
                                                    <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm">
                                                        <img
                                                            src={businessLogos[transaction.businessId]}
                                                            alt={transaction.businessName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="bg-brand-primary text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {(transaction.businessName || 'N').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                                                        {typeInfo.icon} {typeInfo.label}
                                                    </span>
                                                    <h4 className="font-bold text-gray-800">{transaction.businessName}</h4>
                                                </div>
                                            </div>

                                            {/* Transaction details */}
                                            <div className="space-y-1 text-sm text-gray-600">
                                                {transaction.purchaseAmount && (
                                                    <p>💰 Monto de compra: ${transaction.purchaseAmount.toFixed(2)}</p>
                                                )}

                                                {transaction.rewardName && (
                                                    <p>🎁 Recompensa: {transaction.rewardName}</p>
                                                )}

                                                {transaction.notes && (
                                                    <p className="italic">📝 {transaction.notes}</p>
                                                )}

                                                {/* Systems affected */}
                                                {transaction.items && transaction.items.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="font-semibold text-gray-700">Sistemas de recompensa:</p>
                                                        <ul className="ml-4 space-y-1">
                                                            {transaction.items.map((item, idx) => (
                                                                <li key={idx}>
                                                                    <span className="font-medium">{item.rewardSystemName}:</span>
                                                                    {item.pointsChange !== 0 && (
                                                                        <span className={item.pointsChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                                                            {' '}{item.pointsChange > 0 ? '+' : ''}{item.pointsChange} pts
                                                                        </span>
                                                                    )}
                                                                    {item.stampsChange !== 0 && (
                                                                        <span className={item.stampsChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                                                            {item.pointsChange !== 0 ? ', ' : ' '}
                                                                            {item.stampsChange > 0 ? '+' : ''}{item.stampsChange} sellos
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right section: Points/Stamps and date */}
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                {hasPoints && (
                                                    <p className={`text-2xl font-bold ${transaction.totalPointsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {transaction.totalPointsChange > 0 ? '+' : ''}{transaction.totalPointsChange} pts
                                                    </p>
                                                )}
                                                {hasStamps && (
                                                    <p className={`text-lg font-semibold ${transaction.totalStampsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {transaction.totalStampsChange > 0 ? '+' : ''}{transaction.totalStampsChange} sellos
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(transaction.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPoints;
