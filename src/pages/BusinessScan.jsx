import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';
import systemService from '../services/systemService';
import rewardService from '../services/rewardService';
import deliveryService from '../services/deliveryService';
import * as membershipService from '../services/membershipService';

const BusinessScan = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // 'form', 'scanning', 'processing', 'success', 'error', 'rewards-preview', 'membership-result'
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [stampQuantity, setStampQuantity] = useState('');
    const [rewardType, setRewardType] = useState('both'); // 'both', 'redeem', 'membership', 'delivery'
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
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Membership state
    const [membershipPlans, setMembershipPlans] = useState([]);
    const [clientMemberships, setClientMemberships] = useState(undefined); // undefined=loading, array=loaded
    const [membershipAction, setMembershipAction] = useState(null); // null | 'activating' | 'activated' | 'redeeming' | 'redeem-success' | 'redeem-error'
    const [membershipMessage, setMembershipMessage] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [redeemingMembershipId, setRedeemingMembershipId] = useState(null);

    const scannerRef = useRef(null);
    const qrReaderRef = useRef(null);

    useEffect(() => {
        // Fetch business details and reward systems
        const fetchBusinessData = async () => {
            try {
                const businessData = await businessService.getMyBusiness();
                setBusiness(businessData);

                // Auto-select location by proximity, falling back to main or only location
                const locations = businessData.locations || [];
                if (locations.length === 1) {
                    setSelectedLocation(locations[0]._id);
                } else if (locations.length > 1) {
                    const selectByProximity = () => new Promise((resolve) => {
                        if (!navigator.geolocation) return resolve(null);
                        navigator.geolocation.getCurrentPosition(
                            ({ coords }) => {
                                const closest = locations.reduce((best, loc) => {
                                    const dLat = coords.latitude - loc.latitude;
                                    const dLng = coords.longitude - loc.longitude;
                                    const dist = dLat * dLat + dLng * dLng; // no need for sqrt, comparing only
                                    return dist < best.dist ? { loc, dist } : best;
                                }, { loc: null, dist: Infinity });
                                resolve(closest.loc);
                            },
                            () => resolve(null), // denied or error → fallback
                            { timeout: 5000, maximumAge: 60000 }
                        );
                    });

                    const nearest = await selectByProximity();
                    if (nearest) {
                        setSelectedLocation(nearest._id);
                    } else {
                        // Fallback: use main location if geolocation unavailable
                        const main = locations.find(l => l.isMain);
                        if (main) setSelectedLocation(main._id);
                    }
                }

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

                // Fetch membership plans
                const plans = await membershipService.getMyPlans().catch(() => []);
                setMembershipPlans(plans.filter(p => p.isActive));

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
            setClientMemberships(undefined);
            setMembershipAction(null);
            setMembershipMessage('');
            setSelectedPlanId('');

            // Membership mode: skip points/rewards processing entirely
            if (rewardType === 'membership') {
                try {
                    const memberships = await membershipService.getClientMembership(userId);
                    setClientMemberships(Array.isArray(memberships) ? memberships : []);
                } catch {
                    setClientMemberships([]);
                }
                setMembershipAction(null);
                setStep('membership-result');
                return;
            }

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

            // Show rewards-preview if: redeem mode or there are available rewards to show
            if (rewardType === 'redeem' || available.length > 0) {
                setStep('rewards-preview');
            } else {
                await processTransaction(userId);
            }
        } catch (err) {
            console.error('Error checking rewards:', err);
            // If error checking rewards, only proceed with transaction in 'both' mode
            if (rewardType === 'both') {
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

            // Include the selected branch/location
            if (selectedLocation) {
                requestData.locationId = selectedLocation;
            }

            // Build transaction notes for better tracking
            const transactionNotes = [];

            // Add purchase amount for points
            if (rewardType === 'both' && purchaseAmount) {
                const amount = parseFloat(purchaseAmount);
                requestData.purchaseAmount = amount;
                transactionNotes.push(`Compra de $${amount.toFixed(2)}`);
            }

            // Add stamp data for stamps
            if (rewardType === 'both' && stampQuantity) {
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
    }, [rewardType, purchaseAmount, stampQuantity, selectedStampSystem, productIdentifier, rewardSystems, business, selectedLocation]);

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

        // 2. Validar sucursal cuando hay múltiples
        if (business?.locations?.length > 1 && !selectedLocation) {
            setError('Por favor selecciona una sucursal');
            return;
        }

        // 3. Casos de Escaneo (Validaciones)
        if (rewardType === 'redeem' || rewardType === 'membership') {
            setError(null);
            setStep('scanning');
            return;
        }

        if (rewardType === 'both') {
            if (!purchaseAmount && !stampQuantity) {
                setError('Ingresa el monto o la cantidad de sellos');
                return;
            }
        }

        setError(null);
        setStep('scanning');
    };

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

    const handleActivateMembership = async () => {
        if (!selectedPlanId || !scannedUserId) return;
        setMembershipAction('activating');
        setMembershipMessage('');
        try {
            const result = await membershipService.activateMembership(scannedUserId, selectedPlanId);
            setClientMemberships(prev => [...(prev ?? []), result.membership]);
            setMembershipAction('activated');
            setMembershipMessage(result.message);
            setSelectedPlanId('');
        } catch (err) {
            setMembershipAction(null);
            setMembershipMessage(err.response?.data?.message || 'Error al activar la membresía');
        }
    };

    const handleRedeemMembership = async (membershipId) => {
        if (!membershipId || !scannedUserId) return;
        setRedeemingMembershipId(membershipId);
        setMembershipMessage('');
        try {
            const result = await membershipService.redeemDailyBenefit(scannedUserId, membershipId);
            setClientMemberships(prev => prev.map(m =>
                m._id === membershipId ? { ...m, redeemedToday: true } : m
            ));
            setMembershipAction('redeem-success');
            setMembershipMessage(result.benefit || result.message || '');
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al canjear';
            if (err.response?.data?.redeemedToday) {
                setClientMemberships(prev => prev.map(m =>
                    m._id === membershipId ? { ...m, redeemedToday: true } : m
                ));
            } else {
                setMembershipAction('redeem-error');
                setMembershipMessage(msg);
            }
        } finally {
            setRedeemingMembershipId(null);
        }
    };

    const handleReset = () => {
        setPurchaseAmount('');
        setStampQuantity('');
        setProductIdentifier('');
        setRewardType('both');
        setError(null);
        setStep('form');
        setUserPoints(null);
        setAvailableRewards([]);
        setScannedUserId(null);
        setDeliveryCodeData(null);
        setClientMemberships(undefined);
        setMembershipAction(null);
        setMembershipMessage('');
        setSelectedPlanId('');
        setRedeemingMembershipId(null);

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

    // ─── Type selector config ─────────────────────────────────────────────────
    const typeOptions = [
        {
            value: 'both',
            label: 'Puntos o Sellos',
            icon: (
                <svg className={`w-5 h-5 ${rewardType === 'both' ? 'text-brand-onColor' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            iconBg: 'bg-brand-primary/20',
            selected: 'bg-brand-primary text-brand-onColor border-brand-primary',
        },
        {
            value: 'redeem',
            label: 'Canjear',
            icon: (
                <svg className={`w-5 h-5 ${rewardType === 'redeem' ? 'text-white' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
            ),
            iconBg: 'bg-purple-200',
            selected: 'bg-purple-600 text-white border-purple-600',
        },
        {
            value: 'delivery',
            label: 'Delivery',
            icon: (
                <svg className={`w-5 h-5 ${rewardType === 'delivery' ? 'text-white' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
            ),
            iconBg: 'bg-blue-200',
            selected: 'bg-accent-info text-white border-accent-info',
        },
    ];

    const submitLabel = () => {
        if (rewardType === 'delivery') return 'Generar Código Delivery';
        if (rewardType === 'redeem') return 'Escanear para Canjear';
        if (rewardType === 'membership') return 'Escanear para Membresía';
        return 'Escanear Código QR';
    };

    const submitColorClass = () => {
        if (rewardType === 'delivery') return 'bg-accent-info text-white hover:opacity-90';
        if (rewardType === 'redeem') return 'bg-purple-600 text-white hover:opacity-90';
        if (rewardType === 'membership') return 'bg-brand-primary text-brand-onColor hover:opacity-90';
        return 'bg-brand-primary text-brand-onColor hover:opacity-90';
    };

    return (
        <div className="space-y-4 pb-8">

            {/* ── Header card ────────────────────────────────────────────────── */}
            <div className="relative bg-brand-primary rounded-xl overflow-hidden shadow-card">
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                <div className="relative px-6 py-5">
                    <p className="text-[11px] font-semibold text-brand-onColor/60 uppercase tracking-widest mb-0.5">
                        {rewardType === 'delivery' ? 'Delivery' : 'Transacciones'}
                    </p>
                    <h2 className="text-[22px] font-extrabold text-brand-onColor leading-tight">
                        {rewardType === 'delivery' ? 'Generar Código Delivery' : 'Escanear QR'}
                    </h2>
                    <p className="text-[13px] text-brand-onColor/70 mt-1">
                        {business?.name || 'Registra transacciones fácilmente'}
                    </p>
                </div>
            </div>

            {/* ── Form Step ──────────────────────────────────────────────────── */}
            {step === 'form' && (
                <div className="space-y-4">
                    {/* Transaction type selector */}
                    <div className="bg-surface rounded-xl shadow-card p-5">
                        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">Tipo de transacción</p>
                        <div className="grid grid-cols-2 gap-3">
                            {typeOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setRewardType(opt.value)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                        rewardType === opt.value
                                            ? opt.selected
                                            : 'bg-surface text-neutral-500 border-neutral-200 hover:border-neutral-300'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rewardType === opt.value ? opt.iconBg : 'bg-neutral-100'}`}>
                                        {opt.icon}
                                    </div>
                                    <span className="text-[13px] font-semibold leading-tight text-center">{opt.label}</span>
                                </button>
                            ))}

                            {/* Membership — conditional */}
                            {membershipPlans.length > 0 && (
                                <button
                                    onClick={() => setRewardType('membership')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                        rewardType === 'membership'
                                            ? 'border-brand-primary bg-brand-muted text-brand-primary'
                                            : 'bg-surface text-neutral-500 border-neutral-200 hover:border-neutral-300'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rewardType === 'membership' ? 'bg-brand-primary/10' : 'bg-neutral-100'}`}>
                                        <svg className={`w-5 h-5 ${rewardType === 'membership' ? 'text-brand-primary' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    </div>
                                    <span className="text-[13px] font-semibold leading-tight text-center">Membresía</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Fields card */}
                    {(rewardType === 'both' || rewardType === 'delivery') && (
                        <div className="bg-surface rounded-xl shadow-card p-5 space-y-5">
                            {/* Purchase amount */}
                            <div>
                                <label htmlFor="purchaseAmount" className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                    Monto de compra (MXN)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-lg">$</span>
                                    <input
                                        id="purchaseAmount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={purchaseAmount}
                                        onChange={(e) => setPurchaseAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-3 border border-neutral-200 rounded-xl text-[18px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                    />
                                </div>
                                {purchaseAmount && rewardSystems.points?.pointsConversion && (() => {
                                    const amount = parseFloat(purchaseAmount);
                                    const conversionRate = rewardSystems.points.pointsConversion.points / rewardSystems.points.pointsConversion.amount;
                                    const pointsToEarn = Math.floor(amount * conversionRate);
                                    return (
                                        <p className="mt-2 text-[12px] text-brand-primary font-semibold">
                                            Se otorgarán {pointsToEarn} puntos
                                        </p>
                                    );
                                })()}
                            </div>

                            {/* Stamps section */}
                            {rewardSystems.stamps.length > 0 && (
                                <>
                                    {/* Stamp system selector (multiple systems) */}
                                    {rewardSystems.stamps.length > 1 && (
                                        <div>
                                            <label htmlFor="stampSystem" className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                                Sistema de sellos
                                            </label>
                                            <select
                                                id="stampSystem"
                                                value={selectedStampSystem || ''}
                                                onChange={(e) => setSelectedStampSystem(e.target.value)}
                                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
                                            >
                                                <option value="">Selecciona un sistema...</option>
                                                {rewardSystems.stamps.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Stamp quantity */}
                                    <div>
                                        <label htmlFor="stampQuantity" className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                            Cantidad de sellos
                                        </label>
                                        <input
                                            id="stampQuantity"
                                            type="number"
                                            min="1"
                                            value={stampQuantity}
                                            onChange={(e) => setStampQuantity(e.target.value)}
                                            placeholder="1"
                                            className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-[18px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                        />
                                        {selectedStampSystem && (() => {
                                            const system = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
                                            return system?.stampsRequired ? (
                                                <p className="mt-1.5 text-[12px] text-brand-primary font-semibold">
                                                    Requiere {system.stampsRequired} sellos para recompensa
                                                </p>
                                            ) : null;
                                        })()}
                                    </div>

                                    {/* Product identifier */}
                                    {selectedStampSystem && (() => {
                                        const selectedSystem = rewardSystems.stamps.find(s => s.id === selectedStampSystem);
                                        return selectedSystem?.productType === 'specific' ? (
                                            <div>
                                                <label htmlFor="productIdentifier" className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                                    Identificador del producto
                                                </label>
                                                <input
                                                    id="productIdentifier"
                                                    type="text"
                                                    value={productIdentifier}
                                                    onChange={(e) => setProductIdentifier(e.target.value)}
                                                    placeholder={selectedSystem.productIdentifier || 'Ej: SKU-12345'}
                                                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                                />
                                                <p className="mt-1.5 text-[12px] text-neutral-400">
                                                    Producto específico requerido: {selectedSystem.productIdentifier}
                                                </p>
                                            </div>
                                        ) : null;
                                    })()}
                                </>
                            )}
                        </div>
                    )}

                    {/* Redeem info banner */}
                    {rewardType === 'redeem' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-[13px] font-semibold text-purple-800 mb-0.5">Modo Canjear</p>
                                <p className="text-[12px] text-purple-700">
                                    Escanea el QR del cliente para ver y canjear sus recompensas disponibles. No se agregarán puntos ni sellos.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Membership info banner */}
                    {rewardType === 'membership' && (
                        <div className="bg-brand-muted border border-brand-border rounded-xl p-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <div>
                                <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">Modo Membresía</p>
                                <p className="text-[12px] text-neutral-600">
                                    Escanea el QR del cliente para activar una membresía o canjear el beneficio del día. No se agregarán puntos ni sellos.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Location selector */}
                    {business?.locations?.length > 1 && (
                        <div className="bg-surface rounded-xl shadow-card p-5">
                            <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                Sucursal
                            </label>
                            <select
                                value={selectedLocation || ''}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
                            >
                                <option value="">Selecciona una sucursal</option>
                                {business.locations.map(loc => (
                                    <option key={loc._id} value={loc._id}>
                                        {loc.name || loc.formattedAddress || loc.address}
                                        {loc.isMain ? ' (Principal)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-accent-dangerBg border border-accent-danger/30 text-accent-danger rounded-xl px-4 py-3 text-[13px]">
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        onClick={handleStartAction}
                        className={`w-full py-3.5 rounded-pill text-[14px] font-bold transition-all shadow-card ${submitColorClass()}`}
                    >
                        {submitLabel()}
                    </button>
                </div>
            )}

            {/* ── Scanning Step ──────────────────────────────────────────────── */}
            {step === 'scanning' && (
                <div className="bg-surface rounded-xl shadow-card overflow-hidden">
                    {/* Summary bar */}
                    <div className="px-5 py-3 border-b border-neutral-100 flex flex-wrap gap-2 items-center">
                        <span className="text-[12px] font-semibold text-neutral-500">Registrando:</span>
                        {(rewardType === 'both') && purchaseAmount && (
                            <span className="px-3 py-1 rounded-pill bg-brand-muted text-brand-primary text-[12px] font-semibold">
                                ${parseFloat(purchaseAmount).toFixed(2)} MXN
                            </span>
                        )}
                        {(rewardType === 'both') && stampQuantity && (
                            <span className="px-3 py-1 rounded-pill bg-accent-successBg text-accent-success text-[12px] font-semibold">
                                {stampQuantity} sello{parseInt(stampQuantity) !== 1 ? 's' : ''}
                            </span>
                        )}
                        {rewardType === 'redeem' && (
                            <span className="px-3 py-1 rounded-pill bg-purple-100 text-purple-700 text-[12px] font-semibold">Canjear recompensa</span>
                        )}
                        {rewardType === 'membership' && (
                            <span className="px-3 py-1 rounded-pill bg-brand-muted text-brand-primary text-[12px] font-semibold">Membresía</span>
                        )}
                    </div>

                    {/* QR Reader */}
                    <div className="bg-neutral-50">
                        <div id="qr-reader" ref={qrReaderRef} className="w-full" />
                    </div>

                    {/* Hint + cancel */}
                    <div className="px-5 py-4 space-y-3">
                        <p className="text-[12px] text-neutral-400 text-center">
                            Centra el código QR del cliente en el recuadro
                        </p>
                        <button
                            onClick={handleReset}
                            className="w-full py-2.5 rounded-pill bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-[13px] font-semibold transition-all"
                        >
                            Cancelar escaneo
                        </button>
                    </div>
                </div>
            )}

            {/* ── Rewards Preview Step ───────────────────────────────────────── */}
            {step === 'rewards-preview' && (
                <div className="space-y-4">
                    {/* Client balance */}
                    {userPoints && (() => {
                        const bp = userPoints?.businessPoints?.find(
                            b => b.businessId?.toString() === business?.id?.toString()
                        );
                        return bp ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-brand-primary p-4">
                                    <p className="text-[11px] font-semibold text-brand-onColor/70 uppercase tracking-wider mb-1">Puntos</p>
                                    <p className="text-[28px] font-extrabold text-brand-onColor leading-none">{bp.points || 0}</p>
                                </div>
                                <div className="rounded-xl bg-accent-success p-4">
                                    <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1">Sellos</p>
                                    <p className="text-[28px] font-extrabold text-white leading-none">{bp.stamps || 0}</p>
                                </div>
                            </div>
                        ) : null;
                    })()}

                    {/* Available rewards */}
                    <div className="bg-surface rounded-xl shadow-card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-accent-success flex-shrink-0" />
                            <h4 className="text-[14px] font-bold text-neutral-800">Recompensas disponibles</h4>
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-accent-successBg text-accent-success text-[11px] font-bold">
                                {availableRewards.length}
                            </span>
                        </div>

                        {availableRewards.length > 0 ? (
                            <div className="space-y-3">
                                {availableRewards.map((reward) => (
                                    <div
                                        key={reward.id}
                                        className="flex items-center gap-3 p-4 rounded-xl bg-accent-successBg border border-accent-successBorder"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-accent-success/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-neutral-800 line-clamp-1">{reward.name}</p>
                                            <p className="text-[12px] text-neutral-600 line-clamp-1">{reward.description}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {reward.pointsRequired != null && (
                                                    <span className="px-2 py-0.5 bg-brand-muted text-brand-primary text-[11px] font-semibold rounded-full">
                                                        {reward.pointsRequired} pts
                                                    </span>
                                                )}
                                                {reward.stampsRequired != null && (
                                                    <span className="px-2 py-0.5 bg-accent-successBg text-accent-success text-[11px] font-semibold rounded-full border border-accent-successBorder">
                                                        {reward.stampsRequired} sellos
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRedeemClick(reward)}
                                            className="px-3 py-1.5 rounded-pill bg-accent-success text-white text-[12px] font-bold flex-shrink-0 hover:opacity-90 transition-all"
                                        >
                                            Canjear
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[13px] text-neutral-400 text-center py-2">
                                {rewardType === 'redeem'
                                    ? 'El cliente no tiene recompensas disponibles para canjear.'
                                    : 'Sin recompensas disponibles aún. Continúa para registrar la transacción.'}
                            </p>
                        )}
                    </div>


                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {rewardType === 'redeem' ? (
                            <button
                                onClick={handleReset}
                                className="flex-1 py-3 rounded-pill bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-[14px] font-bold transition-all"
                            >
                                Listo
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleContinueTransaction}
                                    className="flex-1 py-3 rounded-pill bg-brand-primary text-brand-onColor hover:opacity-90 text-[14px] font-bold transition-all shadow-card"
                                >
                                    Continuar con transacción
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="py-3 px-5 rounded-pill bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-[14px] font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Membership Result Step ─────────────────────────────────────── */}
            {step === 'membership-result' && (
                <div className="bg-surface rounded-xl shadow-card overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                        <div>
                            <h3 className="text-[14px] font-bold text-neutral-800">Membresías del cliente</h3>
                            <p className="text-[12px] text-neutral-400 mt-0.5">Selecciona la membresía a canjear</p>
                        </div>
                        <button onClick={handleReset} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Loading */}
                        {clientMemberships === undefined && (
                            <div className="flex items-center justify-center py-10 gap-3 text-neutral-400">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-200 border-t-brand-primary" />
                                <span className="text-[13px]">Cargando membresías...</span>
                            </div>
                        )}

                        {/* Redeem success banner */}
                        {membershipAction === 'redeem-success' && membershipMessage && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-successBg border border-accent-successBorder">
                                <div className="w-8 h-8 rounded-full bg-accent-success flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p className="text-[13px] font-semibold text-accent-success">{membershipMessage}</p>
                            </div>
                        )}

                        {/* Activated banner */}
                        {membershipAction === 'activated' && membershipMessage && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-muted border border-brand-border">
                                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-brand-onColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p className="text-[13px] font-semibold text-brand-primary">{membershipMessage}</p>
                            </div>
                        )}

                        {/* Error banner */}
                        {membershipAction === 'redeem-error' && membershipMessage && (
                            <div className="px-4 py-3 rounded-xl bg-accent-dangerBg border border-accent-danger/30 text-[13px] text-accent-danger">
                                {membershipMessage}
                            </div>
                        )}

                        {/* Active memberships list */}
                        {Array.isArray(clientMemberships) && clientMemberships.length > 0 && (
                            <div className="space-y-3">
                                {clientMemberships.map(m => (
                                    <div key={m._id} className="rounded-xl border-2 border-neutral-100 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[14px] font-bold text-neutral-800 truncate">{m.planSnapshot?.name}</p>
                                                <p className="text-[12px] text-brand-primary font-medium mt-0.5">{m.planSnapshot?.benefit}</p>
                                                <p className="text-[11px] text-neutral-400 mt-1">
                                                    Vence: {new Date(m.endDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {m.redeemedToday ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-500 text-[11px] font-semibold rounded-lg whitespace-nowrap">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Ya canjeado hoy
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRedeemMembership(m._id)}
                                                        disabled={redeemingMembershipId !== null}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-brand-onColor text-[12px] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                                    >
                                                        {redeemingMembershipId === m._id ? (
                                                            <><div className="animate-spin rounded-full h-3 w-3 border-2 border-brand-onColor/30 border-t-brand-onColor" />Canjeando...</>
                                                        ) : 'Canjear beneficio'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No memberships — offer activation */}
                        {Array.isArray(clientMemberships) && clientMemberships.length === 0 && membershipAction !== 'activated' && (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 rounded-full bg-brand-muted flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                </div>
                                <p className="text-[13px] font-semibold text-neutral-700">Sin membresías activas</p>
                                <p className="text-[12px] text-neutral-400 mt-0.5">El cliente no tiene membresías en este negocio</p>
                            </div>
                        )}

                        {/* Activate new membership — always available if plans exist */}
                        {Array.isArray(clientMemberships) && membershipPlans.length > 0 && (() => {
                            const activePlanIds = new Set(clientMemberships.map(m => m.planId ?? m.planSnapshot?._id));
                            const availablePlans = membershipPlans.filter(p => p.isActive && !activePlanIds.has(p._id));
                            if (availablePlans.length === 0) return null;
                            return (
                                <div className="border-t border-neutral-100 pt-4">
                                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Activar nueva membresía</p>
                                    <div className="space-y-2">
                                        {availablePlans.map(plan => (
                                            <label key={plan._id} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedPlanId === plan._id ? 'border-brand-primary bg-brand-muted/30' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="plan"
                                                    value={plan._id}
                                                    checked={selectedPlanId === plan._id}
                                                    onChange={e => setSelectedPlanId(e.target.value)}
                                                    className="mt-0.5 accent-brand-primary"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-neutral-800 text-[13px]">{plan.name}</p>
                                                    <p className="text-[11px] text-neutral-500 mt-0.5">{plan.benefit}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[11px] text-neutral-400">{plan.durationDays} días</span>
                                                        <span className="text-[11px] font-semibold text-brand-primary">${plan.price} MXN</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleActivateMembership}
                                        disabled={!selectedPlanId || membershipAction === 'activating'}
                                        className="w-full mt-3 py-2.5 bg-brand-primary text-brand-onColor rounded-pill text-[13px] font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {membershipAction === 'activating' && <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-onColor/30 border-t-brand-onColor" />}
                                        Activar membresía
                                    </button>
                                    {membershipMessage && membershipAction !== 'activated' && (
                                        <p className="text-[11px] text-accent-danger mt-2 text-center">{membershipMessage}</p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Footer */}
                    <div className="px-5 pb-5">
                        <button onClick={handleReset} className="w-full py-3 rounded-pill bg-neutral-100 text-neutral-700 font-bold hover:bg-neutral-200 transition-all text-[14px]">
                            Listo
                        </button>
                    </div>
                </div>
            )}

            {/* ── Processing Step ────────────────────────────────────────────── */}
            {step === 'processing' && (
                <div className="bg-surface rounded-xl shadow-card p-10 flex flex-col items-center justify-center text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-100 border-t-brand-primary mb-5" />
                    <p className="text-[15px] font-semibold text-neutral-800">Procesando...</p>
                </div>
            )}

            {/* ── Success Step ───────────────────────────────────────────────── */}
            {step === 'success' && (
                <div className="bg-surface rounded-xl shadow-card p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-accent-success flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-[20px] font-extrabold text-neutral-900">¡Transacción exitosa!</h3>
                        <p className="text-[13px] text-neutral-500 mt-1">Los puntos/sellos han sido registrados</p>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-4 space-y-2 mb-6">
                        {rewardType === 'both' && purchaseAmount && (
                            <>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-neutral-500">Monto de compra</span>
                                    <span className="font-semibold text-neutral-800">${parseFloat(purchaseAmount).toFixed(2)} MXN</span>
                                </div>
                                {rewardSystems.points?.pointsConversion && (
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-neutral-500">Puntos otorgados</span>
                                        <span className="font-semibold text-brand-primary">
                                            +{Math.floor(parseFloat(purchaseAmount) * (rewardSystems.points.pointsConversion.points / rewardSystems.points.pointsConversion.amount))}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                        {rewardType === 'both' && selectedStampSystem && stampQuantity && (
                            <>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-neutral-500">Sistema de sellos</span>
                                    <span className="font-semibold text-neutral-800">
                                        {rewardSystems.stamps.find(s => s.id === selectedStampSystem)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-neutral-500">Sellos otorgados</span>
                                    <span className="font-semibold text-accent-success">+{stampQuantity}</span>
                                </div>
                                {productIdentifier && (
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-neutral-500">Producto</span>
                                        <span className="font-semibold text-neutral-800">{productIdentifier}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3 rounded-pill bg-brand-primary text-brand-onColor font-bold hover:opacity-90 transition-all text-[14px]"
                        >
                            Nueva Transacción
                        </button>
                        <button
                            onClick={handleGoBack}
                            className="flex-1 py-3 rounded-pill bg-neutral-100 text-neutral-700 font-bold hover:bg-neutral-200 transition-all text-[14px]"
                        >
                            Ir al Inicio
                        </button>
                    </div>
                </div>
            )}

            {/* ── Error Step ─────────────────────────────────────────────────── */}
            {step === 'error' && (
                <div className="bg-surface rounded-xl shadow-card p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-accent-dangerBg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-[20px] font-extrabold text-neutral-900">Error en la transacción</h3>
                    </div>

                    {error && (
                        <div className="bg-accent-dangerBg rounded-xl p-3 text-[13px] text-accent-danger mb-6">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3 rounded-pill bg-brand-primary text-brand-onColor font-bold hover:opacity-90 transition-all text-[14px]"
                        >
                            Intentar de Nuevo
                        </button>
                        <button
                            onClick={handleGoBack}
                            className="flex-1 py-3 rounded-pill bg-neutral-100 text-neutral-700 font-bold hover:bg-neutral-200 transition-all text-[14px]"
                        >
                            Ir al Inicio
                        </button>
                    </div>
                </div>
            )}

            {/* ── Delivery Success Step ──────────────────────────────────────── */}
            {step === 'delivery-success' && deliveryCodeData && (
                <div className="bg-surface rounded-xl shadow-card overflow-hidden">
                    {/* Header */}
                    <div className="bg-accent-info rounded-t-xl p-4 text-white text-center">
                        <h3 className="font-bold text-[16px]">Código generado exitosamente</h3>
                        <p className="text-white/80 text-[12px] mt-0.5">Anota este código en el ticket de compra</p>
                    </div>

                    <div className="p-6 space-y-5 text-center">
                        {/* Code display */}
                        <div className="inline-block w-full">
                            <div className="border-2 border-dashed border-neutral-200 rounded-xl py-6 px-4">
                                <p className="font-mono text-[48px] font-black tracking-widest text-neutral-900 select-all leading-none">
                                    {deliveryCodeData.code}
                                </p>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {deliveryCodeData.points !== undefined && (
                                <span className="px-4 py-2 rounded-pill bg-brand-muted text-brand-primary text-[13px] font-bold">
                                    +{deliveryCodeData.points} puntos
                                </span>
                            )}
                            {deliveryCodeData.amount !== undefined && (
                                <span className="px-4 py-2 rounded-pill bg-neutral-100 text-neutral-700 text-[13px] font-bold">
                                    ${deliveryCodeData.amount} MXN
                                </span>
                            )}
                            {deliveryCodeData.stamps?.length > 0 && (
                                <span className="px-4 py-2 rounded-pill bg-accent-successBg text-accent-success text-[13px] font-bold">
                                    +{deliveryCodeData.stamps.reduce((total, s) => total + s.count, 0)} sellos
                                </span>
                            )}
                        </div>

                        <p className="text-[11px] text-neutral-400">Este código expira en 7 días. El cliente debe canjearlo en su app.</p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyCode}
                                className="flex-1 py-3 rounded-pill bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-bold text-[13px] transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Copiar código
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 py-3 rounded-pill bg-brand-primary text-brand-onColor hover:opacity-90 font-bold text-[13px] transition-all"
                            >
                                Generar Otro
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Redeem Confirmation Modal ──────────────────────────────────── */}
            {showRedeemModal && redeemingReward && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
                    <div className="bg-surface w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-lg p-6">
                        {/* Handle bar (mobile) */}
                        <div className="w-10 h-1 rounded-full bg-neutral-200 mx-auto mb-5 sm:hidden" />

                        <h3 className="text-[18px] font-extrabold text-neutral-900 mb-1 text-center">Confirmar canjeo</h3>
                        <p className="text-[13px] text-neutral-500 text-center mb-5">¿Seguro que deseas canjear esta recompensa?</p>

                        {/* Reward details */}
                        <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                            <h4 className="font-bold text-neutral-900 text-[14px] mb-0.5">{redeemingReward.name}</h4>
                            <p className="text-[12px] text-neutral-600 mb-3">{redeemingReward.description}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                                <span className="text-[12px] text-neutral-500">Costo:</span>
                                <div className="flex gap-2">
                                    {redeemingReward.pointsRequired != null && (
                                        <span className="px-2.5 py-1 bg-brand-muted text-brand-primary text-[11px] font-semibold rounded-full">
                                            {redeemingReward.pointsRequired} puntos
                                        </span>
                                    )}
                                    {redeemingReward.stampsRequired != null && (
                                        <span className="px-2.5 py-1 bg-accent-successBg text-accent-success text-[11px] font-semibold rounded-full">
                                            {redeemingReward.stampsRequired} sellos
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[13px] text-amber-800 mb-5 flex items-start gap-2">
                            <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Esta acción <strong className="mx-0.5">restará</strong> los puntos/sellos del cliente. No se pueden agregar puntos en la misma transacción.
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelRedeem}
                                className="flex-1 py-3 rounded-pill bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-bold text-[14px] transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmRedeem}
                                className="flex-1 py-3 rounded-pill bg-accent-success text-white hover:opacity-90 font-bold text-[14px] transition-all"
                            >
                                Confirmar canjeo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessScan;
