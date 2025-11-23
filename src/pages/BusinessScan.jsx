import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';
import systemService from '../services/systemService';
import rewardService from '../services/rewardService';

const BusinessScan = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // 'form', 'scanning', 'processing', 'success', 'error', 'rewards-preview'
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [stampQuantity, setStampQuantity] = useState('');
    const [rewardType, setRewardType] = useState('points'); // 'points', 'stamps', 'both'
    const [error, setError] = useState(null);
    const [business, setBusiness] = useState(null);
    const [rewardSystems, setRewardSystems] = useState({ points: null, stamps: [] });
    const [selectedStampSystem, setSelectedStampSystem] = useState(null);
    const [productIdentifier, setProductIdentifier] = useState('');
    const [rewards, setRewards] = useState([]);
    const [userPoints, setUserPoints] = useState(null);
    const [availableRewards, setAvailableRewards] = useState([]);
    const [scannedUserId, setScannedUserId] = useState(null);
    const [redeemingReward, setRedeemingReward] = useState(null); // Reward being redeemed
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const scannerRef = useRef(null);
    const qrReaderRef = useRef(null);

    useEffect(() => {
        // Fetch business details and reward systems
        const fetchBusinessData = async () => {
            try {
                const businessData = await businessService.getMyBusiness();
                setBusiness(businessData);

                // Fetch reward systems
                const systems = await systemService.getBusinessSystems();
                const pointsSystem = systems.find(sys => sys.type === 'points' && sys.isActive);
                const stampSystems = systems.filter(sys => sys.type === 'stamps' && sys.isActive);

                setRewardSystems({
                    points: pointsSystem || null,
                    stamps: stampSystems || []
                });

                // Fetch business rewards
                const rewardsData = await rewardService.getBusinessRewards(businessData.id);
                setRewards(rewardsData);

                // Set default stamp system if only one exists
                if (stampSystems.length === 1) {
                    setSelectedStampSystem(stampSystems[0].id);
                }
            } catch (err) {
                console.error('Error fetching business data:', err);
                setError('Error al cargar la información del negocio');
            }
        };
        fetchBusinessData();
    }, []);

    const checkAvailableRewards = async (userId) => {
        try {
            setStep('processing');
            setScannedUserId(userId);

            console.log('Checking rewards for user:', userId);
            console.log('Business ID:', business?.id);

            // Get user's current points for this business
            // The endpoint /user-points/:userId returns only the points for the authenticated business
            const businessPointsData = await userPointsService.getUserPointsById(userId);
            console.log('Business points data received:', businessPointsData);

            // The response from getUserPointsForBusiness has this structure:
            // { userId, businessId, points, stamps, rewardSystems, lastVisit }
            const currentPoints = businessPointsData?.points || 0;
            const currentStamps = businessPointsData?.stamps || 0;

            console.log('Current points:', currentPoints);
            console.log('Current stamps:', currentStamps);

            // Store the data for display in modal
            setUserPoints({
                businessPoints: [{
                    businessId: business?.id,
                    points: currentPoints,
                    stamps: currentStamps
                }]
            });

            console.log('Current points:', currentPoints, 'Current stamps:', currentStamps);
            console.log('Available rewards to check:', rewards);

            // Filter available rewards
            const available = rewards.filter(reward => {
                if (!reward.isActive) {
                    console.log('Reward inactive:', reward.name);
                    return false;
                }

                if (reward.pointsRequired !== undefined && reward.pointsRequired !== null) {
                    const hasEnough = currentPoints >= reward.pointsRequired;
                    console.log(`Reward ${reward.name}: needs ${reward.pointsRequired} points, has ${currentPoints}, available: ${hasEnough}`);
                    if (hasEnough) return true;
                }

                if (reward.stampsRequired !== undefined && reward.stampsRequired !== null) {
                    const hasEnough = currentStamps >= reward.stampsRequired;
                    console.log(`Reward ${reward.name}: needs ${reward.stampsRequired} stamps, has ${currentStamps}, available: ${hasEnough}`);
                    if (hasEnough) return true;
                }

                return false;
            });

            console.log('Available rewards found:', available.length, available);
            setAvailableRewards(available);

            // Show rewards preview if there are available rewards
            if (available.length > 0) {
                console.log('Showing rewards preview modal');
                setStep('rewards-preview');
            } else {
                console.log('No rewards available, proceeding with transaction');
                // No rewards available, proceed with transaction
                await processTransaction(userId);
            }
        } catch (err) {
            console.error('Error checking rewards:', err);
            // If error checking rewards, proceed anyway
            await processTransaction(userId);
        }
    };

    const processTransaction = useCallback(async (userId) => {
        setStep('processing');
        try {
            const requestData = {
                userId: userId
            };

            // Add purchase amount for points
            if ((rewardType === 'points' || rewardType === 'both') && purchaseAmount) {
                requestData.purchaseAmount = parseFloat(purchaseAmount);
            }

            // Add stamp data for stamps
            if ((rewardType === 'stamps' || rewardType === 'both') && stampQuantity) {
                const stampDataItem = {
                    rewardSystemId: selectedStampSystem,
                    stampsCount: parseInt(stampQuantity)
                };

                // Add product identifier if required by the stamp system
                const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
                if (selectedSystem?.productType === 'specific' && productIdentifier) {
                    stampDataItem.productIdentifier = productIdentifier;
                }

                requestData.stampData = [stampDataItem];
            }

            // Call API to add points/stamps to user
            await userPointsService.addPoints(requestData);

            setStep('success');
            setError(null);
        } catch (err) {
            console.error('Error processing transaction:', err);
            setError(err.message || 'Error al procesar la transacción');
            setStep('error');
        }
    }, [rewardType, purchaseAmount, stampQuantity, selectedStampSystem, productIdentifier, rewardSystems, business]);

    useEffect(() => {
        const onScanSuccess = async (decodedText) => {
            console.log('QR Code scanned:', decodedText);

            if (scannerRef.current) {
                await scannerRef.current.clear();
                scannerRef.current = null;
            }

            // Check for available rewards before processing
            await checkAvailableRewards(decodedText);
        };

        const onScanFailure = (error) => {
            // Ignore scan failures (happens continuously while scanning)
            console.debug('Scan failure:', error);
        };

        if (step === 'scanning' && qrReaderRef.current && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                qrReaderRef.current.id,
                {
                    fps: 10,
                    qrbox: { width: 280, height: 280 },
                    aspectRatio: 1.0,
                    rememberLastUsedCamera: true,
                    showTorchButtonIfSupported: true,
                },
                false
            );

            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [step, processTransaction]);

    const handleStartScan = () => {
        // Validate points
        if (rewardType === 'points' || rewardType === 'both') {
            if (!rewardSystems.points) {
                setError('No hay un sistema de puntos activo');
                return;
            }
            if (!purchaseAmount) {
                setError('Por favor ingresa el monto de la compra');
                return;
            }
        }

        // Validate stamps
        if (rewardType === 'stamps' || rewardType === 'both') {
            if (rewardSystems.stamps.length === 0) {
                setError('No hay sistemas de sellos activos');
                return;
            }
            if (!selectedStampSystem) {
                setError('Por favor selecciona un sistema de sellos');
                return;
            }
            if (!stampQuantity) {
                setError('Por favor ingresa la cantidad de sellos');
                return;
            }

            // Validate product identifier for specific product types
            const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
            if (selectedSystem?.productType === 'specific' && !productIdentifier) {
                setError('Por favor ingresa el identificador del producto');
                return;
            }
        }

        setError(null);
        setStep('scanning');
    };

    const handleContinueTransaction = async () => {
        if (scannedUserId) {
            await processTransaction(scannedUserId);
        }
    };

    const handleRedeemClick = (reward) => {
        setRedeemingReward(reward);
        setShowRedeemModal(true);
    };

    const handleConfirmRedeem = async () => {
        if (!redeemingReward || !scannedUserId) return;

        setStep('processing');
        setShowRedeemModal(false);

        try {
            const requestData = {
                userId: scannedUserId
            };

            // Subtract points if reward requires points
            if (redeemingReward.pointsRequired !== undefined && redeemingReward.pointsRequired !== null) {
                requestData.pointsToSubtract = redeemingReward.pointsRequired;
                requestData.rewardSystemId = rewardSystems.points?.id;
            }

            // Subtract stamps if reward requires stamps
            if (redeemingReward.stampsRequired !== undefined && redeemingReward.stampsRequired !== null) {
                // Find the stamp system for this reward
                const stampSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem) || rewardSystems.stamps[0];
                requestData.stampData = [{
                    rewardSystemId: stampSystem?.id,
                    stampsCount: redeemingReward.stampsRequired
                }];
            }

            // Call API to subtract points/stamps
            await userPointsService.subtractPoints(requestData);

            setStep('success');
            setError(null);
            setRedeemingReward(null);
        } catch (err) {
            console.error('Error redeeming reward:', err);
            setError(err.message || 'Error al canjear la recompensa');
            setStep('error');
            setRedeemingReward(null);
        }
    };

    const handleCancelRedeem = () => {
        setShowRedeemModal(false);
        setRedeemingReward(null);
    };

    const handleReset = () => {
        setPurchaseAmount('');
        setStampQuantity('');
        setProductIdentifier('');
        setRewardType('points');
        setError(null);
        setStep('form');
        setUserPoints(null);
        setAvailableRewards([]);
        setScannedUserId(null);

        // Reset to default stamp system if only one exists
        if (rewardSystems.stamps.length === 1) {
            setSelectedStampSystem(rewardSystems.stamps[0].id);
        }
    }; const handleGoBack = () => {
        navigate('/business/dashboard');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                            Escanear Código QR
                        </h2>
                        <p className="text-gray-600 text-base">
                            Registra una compra y otorga puntos/sellos a tus clientes
                        </p>
                    </div>
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-pill font-semibold hover:bg-gray-300 transition-colors duration-180"
                    >
                        ← Volver
                    </button>
                </div>
            </div>

            {/* Form Step */}
            {step === 'form' && (
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">
                            Información de la Compra
                        </h3>

                        {/* Reward Type Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Tipo de Recompensa
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setRewardType('points')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-180 ${rewardType === 'points'
                                        ? 'border-brand-primary bg-brand-muted'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <svg
                                            className={`w-8 h-8 mb-2 ${rewardType === 'points' ? 'text-brand-primary' : 'text-gray-400'
                                                }`}
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
                                        <span className={`text-sm font-semibold ${rewardType === 'points' ? 'text-brand-primary' : 'text-gray-600'
                                            }`}>
                                            Solo Puntos
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setRewardType('stamps')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-180 ${rewardType === 'stamps'
                                        ? 'border-accent-success bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <svg
                                            className={`w-8 h-8 mb-2 ${rewardType === 'stamps' ? 'text-accent-success' : 'text-gray-400'
                                                }`}
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
                                        <span className={`text-sm font-semibold ${rewardType === 'stamps' ? 'text-accent-success' : 'text-gray-600'
                                            }`}>
                                            Solo Sellos
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setRewardType('both')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-180 ${rewardType === 'both'
                                        ? 'border-accent-gold bg-yellow-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <svg
                                            className={`w-8 h-8 mb-2 ${rewardType === 'both' ? 'text-accent-gold' : 'text-gray-400'
                                                }`}
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
                                        <span className={`text-sm font-semibold ${rewardType === 'both' ? 'text-accent-gold' : 'text-gray-600'
                                            }`}>
                                            Ambos
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Purchase Amount */}
                        {(rewardType === 'points' || rewardType === 'both') && (
                            <div className="mb-6">
                                <label htmlFor="purchaseAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Monto de la Compra (MXN)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                        $
                                    </span>
                                    <input
                                        id="purchaseAmount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={purchaseAmount}
                                        onChange={(e) => setPurchaseAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand-muted focus:border-brand-primary transition-all duration-180 text-lg"
                                    />
                                </div>
                                {purchaseAmount && rewardSystems.points && rewardSystems.points.pointsConversion && (() => {
                                    const amount = parseFloat(purchaseAmount);
                                    const conversionRate = rewardSystems.points.pointsConversion.points / rewardSystems.points.pointsConversion.amount;
                                    const pointsToEarn = Math.floor(amount * conversionRate);
                                    return (
                                        <p className="mt-2 text-sm text-brand-primary font-semibold">
                                            Se otorgarán {pointsToEarn} puntos (${amount.toFixed(2)} × {conversionRate.toFixed(2)})
                                        </p>
                                    );
                                })()}
                                {!rewardSystems.points && (
                                    <p className="mt-2 text-sm text-yellow-600 font-semibold">
                                        No hay un sistema de puntos activo
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Stamp System Selection */}
                        {(rewardType === 'stamps' || rewardType === 'both') && (
                            <>
                                {rewardSystems.stamps.length === 0 ? (
                                    <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                                        No hay sistemas de sellos activos. Por favor crea uno primero.
                                    </div>
                                ) : rewardSystems.stamps.length === 1 ? (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sistema de Sellos
                                        </label>
                                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
                                            <p className="font-semibold text-gray-800">{rewardSystems.stamps[0].name}</p>
                                            <p className="text-sm text-gray-600 mt-1">{rewardSystems.stamps[0].description}</p>
                                            {rewardSystems.stamps[0].stampsRequired && (
                                                <p className="text-sm text-brand-primary mt-1">
                                                    Requiere {rewardSystems.stamps[0].stampsRequired} sellos para recompensa
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <label htmlFor="stampSystem" className="block text-sm font-medium text-gray-700 mb-2">
                                            Selecciona Sistema de Sellos
                                        </label>
                                        <select
                                            id="stampSystem"
                                            value={selectedStampSystem || ''}
                                            onChange={(e) => setSelectedStampSystem(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand-muted focus:border-brand-primary transition-all duration-180 text-lg"
                                        >
                                            <option value="">Selecciona un sistema...</option>
                                            {rewardSystems.stamps.map(system => (
                                                <option key={system.id} value={system.id}>
                                                    {system.name} - {system.description}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedStampSystem && (() => {
                                            const system = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
                                            return system?.stampsRequired && (
                                                <p className="mt-2 text-sm text-brand-primary font-semibold">
                                                    Requiere {system.stampsRequired} sellos para recompensa
                                                </p>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Product Identifier (if required) */}
                                {selectedStampSystem && (() => {
                                    const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
                                    return selectedSystem?.productType === 'specific' && (
                                        <div className="mb-6">
                                            <label htmlFor="productIdentifier" className="block text-sm font-medium text-gray-700 mb-2">
                                                Identificador del Producto
                                            </label>
                                            <input
                                                id="productIdentifier"
                                                type="text"
                                                value={productIdentifier}
                                                onChange={(e) => setProductIdentifier(e.target.value)}
                                                placeholder={selectedSystem.productIdentifier || "Ej: SKU-12345"}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand-muted focus:border-brand-primary transition-all duration-180 text-lg"
                                            />
                                            <p className="mt-2 text-sm text-gray-500">
                                                Este sistema requiere un producto específico: {selectedSystem.productIdentifier}
                                            </p>
                                        </div>
                                    );
                                })()}

                                {/* Stamp Quantity */}
                                {rewardSystems.stamps.length > 0 && (
                                    <div className="mb-6">
                                        <label htmlFor="stampQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                                            Cantidad de Sellos
                                        </label>
                                        <input
                                            id="stampQuantity"
                                            type="number"
                                            min="1"
                                            value={stampQuantity}
                                            onChange={(e) => setStampQuantity(e.target.value)}
                                            placeholder="1"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand-muted focus:border-brand-primary transition-all duration-180 text-lg"
                                        />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Ingresa cuántos sellos deseas otorgar al cliente
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Start Scan Button */}
                        <button
                            onClick={handleStartScan}
                            className="w-full px-6 py-4 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card text-lg"
                        >
                            Escanear Código QR del Cliente
                        </button>
                    </div>
                </div>
            )}

            {/* Scanning Step */}
            {step === 'scanning' && (
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight text-center">
                            Escanea el Código QR del Cliente
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Centra el código QR en la cámara para registrar la transacción
                        </p>

                        {/* Resumen de la transacción */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumen de la transacción:</h4>
                            <div className="space-y-2">
                                {(rewardType === 'points' || rewardType === 'both') && purchaseAmount && (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Monto:</span>
                                            <span className="font-bold text-gray-800">${parseFloat(purchaseAmount).toFixed(2)} MXN</span>
                                        </div>
                                        {rewardSystems.points && rewardSystems.points.pointsConversion && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Puntos a otorgar:</span>
                                                <span className="font-bold text-brand-primary">
                                                    {Math.floor(parseFloat(purchaseAmount) * (rewardSystems.points.pointsConversion.points / rewardSystems.points.pointsConversion.amount))}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {(rewardType === 'stamps' || rewardType === 'both') && selectedStampSystem && (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Sistema:</span>
                                            <span className="font-bold text-gray-800">
                                                {rewardSystems.stamps.find(s => s.id === selectedStampSystem)?.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Sellos a otorgar:</span>
                                            <span className="font-bold text-accent-success">{stampQuantity}</span>
                                        </div>
                                        {productIdentifier && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Producto:</span>
                                                <span className="font-bold text-gray-800">{productIdentifier}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* QR Scanner Container */}
                        <div className="bg-gray-100 rounded-xl overflow-hidden mb-6">
                            <div id="qr-reader" ref={qrReaderRef} className="w-full"></div>
                        </div>

                        {/* Instrucciones */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Consejos para un mejor escaneo:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                                        <li>Asegúrate de tener buena iluminación</li>
                                        <li>Mantén el código QR estable y centrado</li>
                                        <li>Evita reflejos en la pantalla del cliente</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-pill font-semibold hover:bg-gray-300 transition-colors duration-180"
                        >
                            Cancelar Escaneo
                        </button>
                    </div>
                </div>
            )}

            {/* Rewards Preview Step */}
            {step === 'rewards-preview' && (
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight text-center">
                            ¡El Cliente Tiene Recompensas Disponibles!
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Antes de agregar los puntos, el cliente puede canjear las siguientes recompensas
                        </p>

                        {/* User Current Points */}
                        {userPoints && (() => {
                            const businessPoints = userPoints?.businessPoints?.find(
                                bp => bp.businessId?.toString() === business?.id?.toString()
                            );
                            return businessPoints && (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-brand-primary to-amber-500 rounded-xl p-4 shadow-md">
                                        <div className="text-white text-sm opacity-90 mb-1">Puntos Actuales</div>
                                        <div className="text-white text-3xl font-bold">{businessPoints.points || 0}</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 shadow-md">
                                        <div className="text-white text-sm opacity-90 mb-1">Sellos Actuales</div>
                                        <div className="text-white text-3xl font-bold">{businessPoints.stamps || 0}</div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Available Rewards */}
                        <div className="mb-6">
                            <h5 className="text-sm font-bold text-green-700 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Recompensas Disponibles ({availableRewards.length})
                            </h5>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {availableRewards.map((reward) => (
                                    <div
                                        key={reward.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-green-50 border-2 border-green-200"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-semibold text-gray-900">{reward.name}</span>
                                                <span className="text-green-600">✓</span>
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">{reward.description}</div>
                                            <div className="flex items-center space-x-2 flex-wrap gap-2">
                                                {reward.pointsRequired !== undefined && reward.pointsRequired !== null && (
                                                    <span className="px-3 py-1 bg-brand-muted text-brand-primary text-xs font-semibold rounded-full">
                                                        {reward.pointsRequired} puntos
                                                    </span>
                                                )}
                                                {reward.stampsRequired !== undefined && reward.stampsRequired !== null && (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        {reward.stampsRequired} sellos
                                                    </span>
                                                )}
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                    {reward.rewardType === 'discount' && '💰 Descuento'}
                                                    {reward.rewardType === 'free_product' && '🎁 Producto Gratis'}
                                                    {reward.rewardType === 'coupon' && '🎟️ Cupón'}
                                                    {reward.rewardType === 'cashback' && '💵 Cashback'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex flex-col gap-2">
                                            <button
                                                onClick={() => handleRedeemClick(reward)}
                                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors duration-180"
                                            >
                                                Canjear
                                            </button>
                                            <span className="px-4 py-1 text-xs font-medium text-center rounded-full bg-green-100 text-green-700">
                                                Disponible
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info message */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Información importante:</p>
                                    <p className="text-blue-700">
                                        El cliente puede canjear estas recompensas antes de agregar los nuevos puntos/sellos.
                                        Presiona "Continuar" para procesar la transacción y agregar los puntos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleContinueTransaction}
                                className="flex-1 px-6 py-4 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card text-lg"
                            >
                                Continuar con Transacción
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-180"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="max-w-2xl mx-auto text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Procesando Transacción...
                        </h3>
                        <p className="text-gray-600">
                            Por favor espera mientras registramos la compra
                        </p>
                    </div>
                </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="max-w-2xl mx-auto text-center py-12">
                        <div className="bg-accent-success rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            ¡Transacción Exitosa!
                        </h3>
                        <p className="text-gray-600 mb-8">
                            Los puntos/sellos han sido registrados correctamente
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <div className="space-y-3">
                                {(rewardType === 'points' || rewardType === 'both') && purchaseAmount && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Monto de compra:</span>
                                            <span className="font-bold text-gray-800">${parseFloat(purchaseAmount).toFixed(2)} MXN</span>
                                        </div>
                                        {rewardSystems.points && rewardSystems.points.pointsConversion && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Puntos otorgados:</span>
                                                <span className="font-bold text-brand-primary">
                                                    {Math.floor(parseFloat(purchaseAmount) * (rewardSystems.points.pointsConversion.points / rewardSystems.points.pointsConversion.amount))}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {(rewardType === 'stamps' || rewardType === 'both') && selectedStampSystem && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Sistema de sellos:</span>
                                            <span className="font-bold text-gray-800">
                                                {rewardSystems.stamps.find(s => s.id === selectedStampSystem)?.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Sellos otorgados:</span>
                                            <span className="font-bold text-accent-success">{stampQuantity}</span>
                                        </div>
                                        {productIdentifier && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Producto:</span>
                                                <span className="font-bold text-gray-800">{productIdentifier}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180"
                            >
                                Nueva Transacción
                            </button>
                            <button
                                onClick={handleGoBack}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-pill font-semibold hover:bg-gray-300 transition-colors duration-180"
                            >
                                Ir al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Step */}
            {step === 'error' && (
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-200">
                    <div className="max-w-2xl mx-auto text-center py-12">
                        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-12 h-12 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={3}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            Error en la Transacción
                        </h3>
                        <p className="text-red-600 mb-8">
                            {error}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-pill font-semibold hover:opacity-90 transition-opacity duration-180"
                            >
                                Intentar de Nuevo
                            </button>
                            <button
                                onClick={handleGoBack}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-pill font-semibold hover:bg-gray-300 transition-colors duration-180"
                            >
                                Ir al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Redeem Confirmation Modal */}
            {showRedeemModal && redeemingReward && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
                        <div className="text-center mb-6">
                            <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎁</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Confirmar Canjeo
                            </h3>
                            <p className="text-gray-600">
                                ¿Estás seguro de que deseas canjear esta recompensa?
                            </p>
                        </div>

                        {/* Reward Details */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="mb-3">
                                <h4 className="font-bold text-gray-900 mb-1">{redeemingReward.name}</h4>
                                <p className="text-sm text-gray-600">{redeemingReward.description}</p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <span className="text-sm text-gray-600">Costo:</span>
                                <div className="flex gap-2">
                                    {redeemingReward.pointsRequired !== undefined && redeemingReward.pointsRequired !== null && (
                                        <span className="px-3 py-1 bg-brand-muted text-brand-primary text-sm font-semibold rounded-full">
                                            {redeemingReward.pointsRequired} puntos
                                        </span>
                                    )}
                                    {redeemingReward.stampsRequired !== undefined && redeemingReward.stampsRequired !== null && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                            {redeemingReward.stampsRequired} sellos
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <p className="text-sm text-amber-800">
                                    Esta acción <strong>restará</strong> los puntos/sellos del cliente. No se pueden agregar puntos en la misma transacción.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelRedeem}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-180"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmRedeem}
                                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-180"
                            >
                                Confirmar Canjeo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessScan;
