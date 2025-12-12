import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';
import systemService from '../services/systemService';
import rewardService from '../services/rewardService';
import deliveryService from '../services/deliveryService';

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
    const [deliveryCodeData, setDeliveryCodeData] = useState(null);

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

            // If in redeem-only mode, always show rewards preview (even if no rewards available)
            if (rewardType === 'redeem') {
                setStep('rewards-preview');
            } else if (available.length > 0) {
                // Show rewards preview if there are available rewards
                console.log('Showing rewards preview modal');
                setStep('rewards-preview');
            } else {
                console.log('No rewards available, proceeding with transaction');
                // No rewards available, proceed with transaction
                await processTransaction(userId);
            }
        } catch (err) {
            console.error('Error checking rewards:', err);
            // If error checking rewards and not in redeem mode, proceed anyway
            if (rewardType !== 'redeem') {
                await processTransaction(userId);
            } else {
                setError('Error al obtener información del cliente');
                setStep('error');
            }
        }
    };

    const processTransaction = useCallback(async (userId) => {
        setStep('processing');
        try {
            const requestData = {
                userId: userId
            };

            // Build transaction notes for better tracking
            const transactionNotes = [];

            // Add purchase amount for points
            if ((rewardType === 'points' || rewardType === 'both') && purchaseAmount) {
                const amount = parseFloat(purchaseAmount);
                requestData.purchaseAmount = amount;
                transactionNotes.push(`Compra de $${amount.toFixed(2)}`);
            }

            // Add stamp data for stamps
            if ((rewardType === 'stamps' || rewardType === 'both') && stampQuantity) {
                const quantity = parseInt(stampQuantity);
                const stampDataItem = {
                    rewardSystemId: selectedStampSystem,
                    stampsCount: quantity
                };

                // Add product identifier if required by the stamp system
                const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
                if (selectedSystem?.productType === 'specific' && productIdentifier) {
                    stampDataItem.productIdentifier = productIdentifier;
                    transactionNotes.push(`Producto: ${productIdentifier}`);
                }

                requestData.stampData = [stampDataItem];
                transactionNotes.push(`${quantity} sello${quantity !== 1 ? 's' : ''} agregado${quantity !== 1 ? 's' : ''}`);
            }

            // Add notes to help track the transaction
            if (transactionNotes.length > 0) {
                requestData.notes = transactionNotes.join(' - ');
            }

            console.log('Processing transaction with data:', requestData);

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

    const handleGenerateDeliveryCode = async () => {
        // Validaciones dinámicas
        if (!purchaseAmount && !stampQuantity) {
            setError('Ingresa el monto, la cantidad de sellos, o ambos');
            return;
        }
        if (purchaseAmount && isNaN(parseFloat(purchaseAmount))) {
            setError('El monto debe ser un número válido');
            return;
        }
        if (stampQuantity && (isNaN(parseInt(stampQuantity)) || parseInt(stampQuantity) < 1)) {
            setError('La cantidad de sellos debe ser un número válido');
            return;
        }
        if (stampQuantity && !selectedStampSystem) {
            setError('Selecciona un sistema de sellos');
            return;
        }
        // Validar identificador de producto si aplica
        if (stampQuantity && selectedStampSystem) {
            const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
            if (selectedSystem?.productType === 'specific' && !productIdentifier) {
                setError('Por favor ingresa el identificador del producto');
                return;
            }
        }

        setStep('processing');
        setError(null);

        try {
            // Construir payload dinámico
            const payload = {};
            if (purchaseAmount) {
                const amountVal = parseFloat(purchaseAmount);
                if (amountVal > 0) {
                    payload.amount = amountVal;
                }
            }
            
            if (stampQuantity) {
                const stampsVal = parseInt(stampQuantity);
                if (stampsVal > 0 && selectedStampSystem) {
                    payload.stamps = [{
                        systemId: selectedStampSystem,
                        count: stampsVal
                    }];
                }
            }

            if (!payload.amount && (!payload.stamps || payload.stamps.length === 0)) {
                setError('Ingresa un monto válido o sellos válidos');
                setStep('form');
                return;
            }

            const data = await deliveryService.generateCode(payload);
            setDeliveryCodeData(data);
            setStep('delivery-success');
        } catch (err) {
            console.error('Error generating code:', err);
            setError(err.message || 'Error al generar código');
            setStep('error');
        }
    };

    const handleStartAction = () => {
        // Lógica unificada para el botón principal

        // 1. Caso Delivery (Generar código)
        if (rewardType === 'delivery') {
            handleGenerateDeliveryCode();
            return;
        }

        // 2. Casos de Escaneo (Validaciones)
        if (rewardType === 'redeem') {
            setError(null);
            setStep('scanning');
            return;
        }

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
            const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
            if (selectedSystem?.productType === 'specific' && !productIdentifier) {
                setError('Por favor ingresa el identificador del producto');
                return;
            }
        }

        setError(null);
        setStep('scanning');
    };


    // const handleStartScan = () => {
    //     // If redeem only mode, skip validation and go straight to scanning
    //     if (rewardType === 'redeem') {
    //         setError(null);
    //         setStep('scanning');
    //         return;
    //     }

    //     // Validate points
    //     if (rewardType === 'points' || rewardType === 'both') {
    //         if (!rewardSystems.points) {
    //             setError('No hay un sistema de puntos activo');
    //             return;
    //         }
    //         if (!purchaseAmount) {
    //             setError('Por favor ingresa el monto de la compra');
    //             return;
    //         }
    //     }

    //     // Validate stamps
    //     if (rewardType === 'stamps' || rewardType === 'both') {
    //         if (rewardSystems.stamps.length === 0) {
    //             setError('No hay sistemas de sellos activos');
    //             return;
    //         }
    //         if (!selectedStampSystem) {
    //             setError('Por favor selecciona un sistema de sellos');
    //             return;
    //         }
    //         if (!stampQuantity) {
    //             setError('Por favor ingresa la cantidad de sellos');
    //             return;
    //         }

    //         // Validate product identifier for specific product types
    //         const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
    //         if (selectedSystem?.productType === 'specific' && !productIdentifier) {
    //             setError('Por favor ingresa el identificador del producto');
    //             return;
    //         }
    //     }

    //     setError(null);
    //     setStep('scanning');
    // };

    const handleContinueTransaction = async () => {
        if (scannedUserId)
            await processTransaction(scannedUserId);
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
                userId: scannedUserId,
                // Include reward information for transaction history
                rewardId: redeemingReward.id,
                rewardName: redeemingReward.name,
                notes: `Canje de recompensa: ${redeemingReward.name} - ${redeemingReward.description || ''}`
            };

            // Subtract points if reward requires points
            if (redeemingReward.pointsRequired !== undefined && redeemingReward.pointsRequired !== null && redeemingReward.pointsRequired > 0) {
                requestData.pointsToSubtract = redeemingReward.pointsRequired;
                requestData.rewardSystemId = rewardSystems.points?.id;
            }

            // Subtract stamps if reward requires stamps
            if (redeemingReward.stampsRequired !== undefined && redeemingReward.stampsRequired !== null && redeemingReward.stampsRequired > 0) {
                // Find the stamp system for this reward
                const stampSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem) || rewardSystems.stamps[0];
                if (stampSystem) {
                    requestData.stampData = [{
                        rewardSystemId: stampSystem.id,
                        stampsCount: redeemingReward.stampsRequired
                    }];
                }
            }

            console.log('Redeeming reward with data:', requestData);

            // Call API to subtract points/stamps
            await userPointsService.subtractPoints(requestData);

            setShowRedeemModal(false);
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
        setDeliveryCodeData(null);

        // Reset to default stamp system if only one exists
        if (rewardSystems.stamps.length === 1) {
            setSelectedStampSystem(rewardSystems.stamps[0].id);
        }
    };

    const handleGoBack = () => {
        navigate('/business/dashboard');
    };

    const handleCopyCode = () => {
        if (deliveryCodeData?.code) {
            navigator.clipboard.writeText(deliveryCodeData.code);
        }
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
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                        {rewardType === 'delivery' ? 'Generar Código Delivery' : 'Escanear Código QR'}
                    </h2>
                </div>
                <p className="text-gray-600 text-base">
                    {rewardType === 'delivery'
                        ? 'Genera un código único para enviar en pedidos a domicilio'
                        : 'Registra una compra y otorga puntos/sellos a tus clientes'}
                </p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Transacción</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

                                <button
                                    onClick={() => setRewardType('redeem')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-180 ${rewardType === 'redeem'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <svg
                                            className={`w-8 h-8 mb-2 ${rewardType === 'redeem' ? 'text-purple-600' : 'text-gray-400'
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
                                        <span className={`text-sm font-semibold ${rewardType === 'redeem' ? 'text-purple-600' : 'text-gray-600'
                                            }`}>
                                            Canjear
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setRewardType('delivery')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-180 flex flex-col items-center ${rewardType === 'delivery'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <svg
                                        className={`w-8 h-8 mb-2 ${rewardType === 'delivery' ? 'text-blue-600' : 'text-gray-400'}`}
                                        fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.75}><path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                    <span
                                        className={`text-sm font-semibold ${rewardType === 'delivery'
                                            ? 'text-blue-600'
                                            : 'text-gray-600'}`}
                                    >
                                        Delivery
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Delivery Message */}
                        {rewardType === 'delivery' && (
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <div>
                                        <p className="text-sm font-semibold text-blue-800 mb-1">Modo Delivery</p>
                                        <p className="text-xs text-blue-700">Genera un código que puedes escribir en el ticket. El cliente podrá canjear los puntos desde su aplicación.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Redeem Only Message */}
                        {rewardType === 'redeem' && (
                            <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-semibold text-purple-800 mb-1">Modo: Solo Canjear Recompensa</p>
                                        <p className="text-xs text-purple-700">
                                            Escanea el código QR del cliente para ver y canjear sus recompensas disponibles. No se agregarán puntos ni sellos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Purchase Amount Input (Used for Points, Both, and Delivery) */}
                        {(rewardType === 'points' || rewardType === 'both' || rewardType === 'delivery') && (
                            <div className="mb-6">
                                <label htmlFor="purchaseAmount" className="block text-sm font-medium text-gray-700 mb-2">Monto de la Compra (MXN)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                                    <input id="purchaseAmount" type="number" step="0.01" min="0" value={purchaseAmount} onChange={(e) => setPurchaseAmount(e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand-muted focus:border-brand-primary transition-all duration-180 text-lg" />
                                </div>
                                {purchaseAmount && rewardSystems.points && rewardSystems.points.pointsConversion && (() => {
                                    const amount = parseFloat(purchaseAmount);
                                    const conversionRate = rewardSystems.points.pointsConversion.points / rewardSystems.points.pointsConversion.amount;
                                    const pointsToEarn = Math.floor(amount * conversionRate);
                                    return (
                                        <p className="mt-2 text-sm text-brand-primary font-semibold">
                                            Se otorgarán {pointsToEarn} puntos
                                        </p>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Stamp Quantity Input for Delivery Mode */}
                        {rewardType === 'delivery' && rewardSystems.stamps.length > 0 && (
                            <div className="mb-6">
                                {selectedStampSystem && (() => {
                                    const system = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
                                    return system?.stampsRequired && (
                                        <p className="mt-2 text-sm text-brand-primary font-semibold">
                                            Requiere {system.stampsRequired} sellos para recompensa
                                        </p>
                                    );
                                })()}
                                {/* Product Identifier (if required) */}
                                {selectedStampSystem && (() => {
                                    const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
                                    return selectedSystem?.productType === 'specific' && (
                                        <div className="mt-4">
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
                                <div className="mt-4">
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
                            onClick={handleStartAction} // Cambiado a la función unificada
                            className={`w-full px-6 py-4 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity duration-180 shadow-card text-lg ${rewardType === 'delivery' ? 'bg-blue-600' : 'bg-brand-primary'
                                }`}
                        >
                            {rewardType === 'delivery'
                                ? 'Generar Código de Puntos'
                                : rewardType === 'redeem'
                                    ? 'Escanear para Canjear'
                                    : 'Escanear Código QR'}
                        </button>
                    </div>
                </div>
            )}

            {/* Delivery Success Step (New View) */}
            {step === 'delivery-success' && deliveryCodeData && (
                <div className="bg-white rounded-xl shadow-card border-2 border-blue-500 overflow-hidden animate-fade-in max-w-2xl mx-auto">
                    <div className="bg-blue-600 p-4 text-white text-center">
                        <h3 className="font-bold text-lg">Código Generado Exitosamente</h3>
                        <p className="text-blue-100 text-sm">Anota este código en el ticket de compra</p>
                    </div>
                    <div className="p-8 text-center space-y-6">
                        <div className="bg-gray-100 p-6 rounded-2xl border-2 border-dashed border-gray-300 inline-block">
                            <p className="text-5xl md:text-6xl font-black text-gray-800 tracking-widest font-mono select-all">
                                {deliveryCodeData.code}
                            </p>
                        </div>
                        <div className="flex justify-center gap-8 border-t border-b border-gray-100 py-4">
                            {deliveryCodeData.points !== undefined && (
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-semibold">Puntos</p>
                                    <p className="text-2xl font-bold text-accent-success">+{deliveryCodeData.points} pts</p>
                                </div>
                            )}
                            {deliveryCodeData.amount !== undefined && (
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-semibold">Monto</p>
                                    <p className="text-2xl font-bold text-gray-800">${deliveryCodeData.amount}</p>
                                </div>
                            )}
                            {deliveryCodeData.stamps && deliveryCodeData.stamps.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-semibold">Sellos</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        +{deliveryCodeData.stamps.reduce((total, s) => total + s.count, 0)}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handleCopyCode}
                                className="w-full py-3 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Copiar al portapapeles
                            </button>
                            <button
                                onClick={handleReset}
                                className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                            >
                                Generar Otro Pedido
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Este código expira en 7 días. El cliente debe canjearlo en su app.
                        </p>
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
                            Recompensas del cliente
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
                        {availableRewards.length === 0 ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
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
                                    <div className="text-sm text-amber-800">
                                        <p className="font-semibold mb-1">Sin recompensas disponibles</p>
                                        <p className="text-amber-700">
                                            {rewardType === 'redeem'
                                                ? 'Este cliente no tiene recompensas disponibles para canjear en este momento.'
                                                : 'El cliente no tiene recompensas disponibles. Presiona "Continuar" para procesar la transacción.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
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
                                            {rewardType === 'redeem'
                                                ? 'El cliente puede canjear cualquiera de las recompensas disponibles. Presiona "Canjear" en la recompensa deseada.'
                                                : 'El cliente puede canjear estas recompensas antes de agregar los nuevos puntos/sellos. Presiona "Continuar" para procesar la transacción y agregar los puntos.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-4">
                            {rewardType !== 'redeem' ? (
                                <>
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
                                </>
                            ) : (
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-180"
                                >
                                    {availableRewards.length > 0 ? 'Finalizar' : 'Volver'}
                                </button>
                            )}
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
