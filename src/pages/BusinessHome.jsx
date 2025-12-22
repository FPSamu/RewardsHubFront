import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import businessService from '../services/businessService';
import rewardService from '../services/rewardService';
import userPointsService from '../services/userPointsService';
import workShiftService from '../services/workShiftService';
import reportService from '../services/reportService';

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

    // Estados para el modal de turnos
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [shiftFormData, setShiftFormData] = useState({
        name: '',
        startTime: '',
        endTime: ''
    });
    const [savingShift, setSavingShift] = useState(false);
    const [shiftError, setShiftError] = useState(null);

    // Estados para el modal de reportes
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState('shift'); // 'shift', 'day', 'range'
    const [reportData, setReportData] = useState({
        shiftId: '',
        date: new Date().toISOString().split('T')[0],
        startDate: '',
        endDate: ''
    });
    const [availableShifts, setAvailableShifts] = useState([]);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [reportError, setReportError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch business details
                const businessData = await businessService.getMyBusiness();
                setBusiness(businessData);

                // Verificar si el negocio tiene turnos configurados
                try {
                    const shiftsResponse = await workShiftService.getMyWorkShifts();
                    // Manejar diferentes estructuras de respuesta del backend
                    const shiftsData = Array.isArray(shiftsResponse)
                        ? shiftsResponse
                        : (shiftsResponse?.shifts || shiftsResponse?.workShifts || []);

                    console.log('Shifts data:', shiftsData); // Para debugging

                    // Si no hay turnos configurados, mostrar el modal
                    if (!shiftsData || shiftsData.length === 0) {
                        setShowShiftModal(true);
                    }
                } catch (shiftErr) {
                    console.error('Error fetching shifts:', shiftErr);
                    // Si hay error al obtener turnos, asumir que no hay y mostrar modal
                    setShowShiftModal(true);
                }

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

    // Manejar cambios en el formulario de turnos
    const handleShiftFormChange = (e) => {
        const { name, value } = e.target;
        setShiftFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error cuando el usuario empieza a escribir
        if (shiftError) setShiftError(null);
    };

    // Manejar envío del formulario de turnos
    const handleShiftFormSubmit = async (e) => {
        e.preventDefault();

        // Validar que todos los campos estén llenos
        if (!shiftFormData.name.trim() || !shiftFormData.startTime || !shiftFormData.endTime) {
            setShiftError('Todos los campos son obligatorios');
            return;
        }

        // Nota: Permitimos turnos que cruzan la medianoche (ej: 22:00 - 02:00)
        // El backend debería manejar esto correctamente


        try {
            setSavingShift(true);
            setShiftError(null);

            // Verificar que tenemos el businessId
            if (!business?.id) {
                setShiftError('Error: No se pudo obtener la información del negocio');
                setSavingShift(false);
                return;
            }

            const shiftPayload = {
                businessId: business.id,
                name: shiftFormData.name.trim(),
                startTime: shiftFormData.startTime,
                endTime: shiftFormData.endTime
            };

            // console.log('Creating shift with payload:', shiftPayload);

            const response = await workShiftService.createWorkShift(shiftPayload);

            // console.log('Shift created successfully:', response);

            // Cerrar el modal y resetear el formulario
            setShowShiftModal(false);
            setShiftFormData({
                name: '',
                startTime: '',
                endTime: ''
            });
        } catch (err) {
            console.error('Error creating shift:', err);

            // Extraer mensaje de error más específico
            let errorMessage = 'Error al crear el turno. Por favor, intenta de nuevo.';

            if (typeof err === 'string') {
                errorMessage = err;
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (err?.error) {
                errorMessage = err.error;
            }

            setShiftError(errorMessage);
        } finally {
            setSavingShift(false);
        }
    };

    // Funciones para manejar reportes
    const handleOpenReportModal = async () => {
        setShowReportModal(true);
        setReportError(null);

        // Cargar turnos disponibles
        try {
            const shiftsResponse = await workShiftService.getMyWorkShifts();
            const shiftsData = Array.isArray(shiftsResponse)
                ? shiftsResponse
                : (shiftsResponse?.shifts || shiftsResponse?.workShifts || []);
            setAvailableShifts(shiftsData);

            // Seleccionar el primer turno por defecto si existe
            if (shiftsData.length > 0) {
                setReportData(prev => ({ ...prev, shiftId: shiftsData[0].id }));
            }
        } catch (error) {
            console.error('Error loading shifts:', error);
        }
    };

    const handleCloseReportModal = () => {
        setShowReportModal(false);
        setReportType('shift');
        setReportData({
            shiftId: '',
            date: new Date().toISOString().split('T')[0],
            startDate: '',
            endDate: ''
        });
        setReportError(null);
    };

    const handleGenerateReport = async () => {
        setGeneratingReport(true);
        setReportError(null);

        try {
            let pdfBlob;

            if (reportType === 'shift') {
                if (!reportData.shiftId || !reportData.date) {
                    setReportError('Por favor selecciona un turno y una fecha');
                    setGeneratingReport(false);
                    return;
                }
                console.log('Generating shift report with:', { shiftId: reportData.shiftId, date: reportData.date });
                pdfBlob = await reportService.generateShiftReport(reportData.shiftId, reportData.date);
            } else if (reportType === 'day') {
                if (!reportData.date) {
                    setReportError('Por favor selecciona una fecha');
                    setGeneratingReport(false);
                    return;
                }
                console.log('Generating day report with:', { date: reportData.date });
                pdfBlob = await reportService.generateDayReport(reportData.date);
            } else if (reportType === 'range') {
                if (!reportData.startDate || !reportData.endDate) {
                    setReportError('Por favor selecciona ambas fechas');
                    setGeneratingReport(false);
                    return;
                }
                if (reportData.startDate > reportData.endDate) {
                    setReportError('La fecha de inicio debe ser anterior a la fecha de fin');
                    setGeneratingReport(false);
                    return;
                }
                console.log('Generating range report with:', { startDate: reportData.startDate, endDate: reportData.endDate });
                pdfBlob = await reportService.generateRangeReport(reportData.startDate, reportData.endDate);
            }

            // Descargar el PDF
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;

            // Nombre del archivo según el tipo de reporte
            let fileName = 'reporte';
            if (reportType === 'shift') {
                fileName = `reporte_turno_${reportData.date}.pdf`;
            } else if (reportType === 'day') {
                fileName = `reporte_dia_${reportData.date}.pdf`;
            } else if (reportType === 'range') {
                fileName = `reporte_${reportData.startDate}_${reportData.endDate}.pdf`;
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Cerrar modal después de generar
            handleCloseReportModal();
        } catch (error) {
            console.error('Error generating report:', error);
            setReportError(error.message || 'Error al generar el reporte. Por favor, intenta de nuevo.');
        } finally {
            setGeneratingReport(false);
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
                <div className="flex items-center space-x-3 mb-4">
                    <img
                        src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                        alt="RewardsHub Logo"
                        className="h-12 w-auto object-contain"
                    />
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                        ¡Hola, {business?.name || 'Negocio'}! 👋
                    </h2>
                </div>
                <p className="text-gray-600 text-base">
                    Bienvenido a tu panel de gestión de RewardsHub
                </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-brand-primary to-accent-gold rounded-xl shadow-card p-6 text-white">
                <h3 className="text-2xl font-bold mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    <button
                        onClick={handleOpenReportModal}
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Generar Reporte</p>
                                <p className="text-sm text-white/80">Exportar transacciones</p>
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

            {/* Modal de Configuración de Turno (No se puede cerrar) */}
            {showShiftModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-popover max-w-md w-full p-6">
                        <div className="mb-6">
                            <div className="flex items-center justify-center w-16 h-16 bg-brand-muted rounded-full mx-auto mb-4">
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
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
                                Configurar Turno de Trabajo
                            </h3>
                            <p className="text-gray-600 text-center text-sm">
                                Para continuar, necesitas configurar al menos un turno de trabajo para tu negocio
                            </p>
                        </div>

                        <form onSubmit={handleShiftFormSubmit} className="space-y-4">
                            {/* Nombre del turno */}
                            <div>
                                <label htmlFor="shift-name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre del Turno *
                                </label>
                                <input
                                    id="shift-name"
                                    type="text"
                                    name="name"
                                    value={shiftFormData.name}
                                    onChange={handleShiftFormChange}
                                    placeholder="Ej: Turno Matutino, Turno Vespertino"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                    disabled={savingShift}
                                />
                            </div>

                            {/* Hora de inicio */}
                            <div>
                                <label htmlFor="shift-start" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Hora de Inicio *
                                </label>
                                <input
                                    id="shift-start"
                                    type="time"
                                    name="startTime"
                                    value={shiftFormData.startTime}
                                    onChange={handleShiftFormChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                    disabled={savingShift}
                                />
                            </div>

                            {/* Hora de fin */}
                            <div>
                                <label htmlFor="shift-end" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Hora de Fin *
                                </label>
                                <input
                                    id="shift-end"
                                    type="time"
                                    name="endTime"
                                    value={shiftFormData.endTime}
                                    onChange={handleShiftFormChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                    disabled={savingShift}
                                />
                            </div>

                            {/* Error message */}
                            {shiftError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    {shiftError}
                                </div>
                            )}

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={savingShift}
                                className="w-full bg-brand-primary text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-180 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {savingShift ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Turno'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Generación de Reportes */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-popover max-w-2xl w-full p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-6 h-6 text-brand-primary"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.75}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">Generar Reporte</h3>
                                        <p className="text-sm text-gray-600">Exporta las transacciones en PDF</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseReportModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={generatingReport}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Tipo de Reporte */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Tipo de Reporte *
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReportType('shift')}
                                    className={`p-4 rounded-lg border-2 transition-all ${reportType === 'shift'
                                        ? 'border-brand-primary bg-brand-muted text-brand-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    disabled={generatingReport}
                                >
                                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-semibold">Por Turno</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReportType('day')}
                                    className={`p-4 rounded-lg border-2 transition-all ${reportType === 'day'
                                        ? 'border-brand-primary bg-brand-muted text-brand-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    disabled={generatingReport}
                                >
                                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm font-semibold">Por Día</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReportType('range')}
                                    className={`p-4 rounded-lg border-2 transition-all ${reportType === 'range'
                                        ? 'border-brand-primary bg-brand-muted text-brand-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    disabled={generatingReport}
                                >
                                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm font-semibold">Por Rango</p>
                                </button>
                            </div>
                        </div>

                        {/* Campos según el tipo de reporte */}
                        <div className="space-y-4 mb-6">
                            {reportType === 'shift' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Turno *
                                        </label>
                                        <select
                                            value={reportData.shiftId}
                                            onChange={(e) => setReportData({ ...reportData, shiftId: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                            disabled={generatingReport}
                                        >
                                            <option value="">Selecciona un turno</option>
                                            {availableShifts.map((shift) => (
                                                <option key={shift.id} value={shift.id}>
                                                    {shift.name} ({shift.startTime} - {shift.endTime})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Fecha *
                                        </label>
                                        <input
                                            type="date"
                                            value={reportData.date}
                                            onChange={(e) => setReportData({ ...reportData, date: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                            disabled={generatingReport}
                                        />
                                    </div>
                                </>
                            )}

                            {reportType === 'day' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        value={reportData.date}
                                        onChange={(e) => setReportData({ ...reportData, date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                        disabled={generatingReport}
                                    />
                                </div>
                            )}

                            {reportType === 'range' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Fecha de Inicio *
                                        </label>
                                        <input
                                            type="date"
                                            value={reportData.startDate}
                                            onChange={(e) => setReportData({ ...reportData, startDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                            disabled={generatingReport}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Fecha de Fin *
                                        </label>
                                        <input
                                            type="date"
                                            value={reportData.endDate}
                                            onChange={(e) => setReportData({ ...reportData, endDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                            disabled={generatingReport}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {reportError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                                {reportError}
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCloseReportModal}
                                disabled={generatingReport}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGenerateReport}
                                disabled={generatingReport}
                                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {generatingReport ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Generar PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessHome;
