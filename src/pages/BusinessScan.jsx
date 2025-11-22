import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';

const BusinessScan = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // 'form', 'scanning', 'processing', 'success', 'error'
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [stampQuantity, setStampQuantity] = useState('');
    const [rewardType, setRewardType] = useState('points'); // 'points', 'stamps', 'both'
    const [error, setError] = useState(null);
    const [business, setBusiness] = useState(null);
    const scannerRef = useRef(null);
    const qrReaderRef = useRef(null);

    useEffect(() => {
        // Fetch business details
        const fetchBusiness = async () => {
            try {
                const businessData = await businessService.getMyBusiness();
                setBusiness(businessData);
            } catch (err) {
                console.error('Error fetching business:', err);
            }
        };
        fetchBusiness();
    }, []);

    const processTransaction = useCallback(async (userId) => {
        setStep('processing');
        try {
            // Calculate points/stamps based on purchase amount
            const pointsToAdd = rewardType === 'points' || rewardType === 'both'
                ? Math.floor(parseFloat(purchaseAmount) / 10) || 0
                : 0;
            const stampsToAdd = rewardType === 'stamps' || rewardType === 'both'
                ? parseInt(stampQuantity) || 0
                : 0;

            // Call API to add points/stamps to user
            await userPointsService.addPoints({
                userId: userId,
                businessId: business.id,
                points: pointsToAdd,
                stamps: stampsToAdd,
                purchaseAmount: parseFloat(purchaseAmount) || 0
            });

            setStep('success');
            setError(null);
        } catch (err) {
            console.error('Error processing transaction:', err);
            setError(err.message || 'Error al procesar la transacción');
            setStep('error');
        }
    }, [rewardType, purchaseAmount, stampQuantity, business]);

    useEffect(() => {
        const onScanSuccess = async (decodedText) => {
            console.log('QR Code scanned:', decodedText);

            if (scannerRef.current) {
                await scannerRef.current.clear();
                scannerRef.current = null;
            }

            await processTransaction(decodedText);
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
        if (rewardType === 'points' && !purchaseAmount) {
            setError('Por favor ingresa el monto de la compra');
            return;
        }
        if ((rewardType === 'stamps' || rewardType === 'both') && !stampQuantity) {
            setError('Por favor ingresa la cantidad de sellos');
            return;
        }
        setError(null);
        setStep('scanning');
    };

    const handleReset = () => {
        setPurchaseAmount('');
        setStampQuantity('');
        setRewardType('points');
        setError(null);
        setStep('form');
    };

    const handleGoBack = () => {
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
                                {purchaseAmount && (
                                    <p className="mt-2 text-sm text-brand-primary font-semibold">
                                        Se otorgarán {Math.floor(parseFloat(purchaseAmount) / 10)} puntos
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Stamp Quantity */}
                        {(rewardType === 'stamps' || rewardType === 'both') && (
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
                                    Ingresa cuántos productos especiales compró el cliente
                                </p>
                            </div>
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
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Monto:</span>
                                        <span className="font-bold text-gray-800">${parseFloat(purchaseAmount).toFixed(2)} MXN</span>
                                    </div>
                                )}
                                {(rewardType === 'points' || rewardType === 'both') && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Puntos a otorgar:</span>
                                        <span className="font-bold text-brand-primary">{Math.floor(parseFloat(purchaseAmount || 0) / 10)}</span>
                                    </div>
                                )}
                                {(rewardType === 'stamps' || rewardType === 'both') && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Sellos a otorgar:</span>
                                        <span className="font-bold text-accent-success">{stampQuantity}</span>
                                    </div>
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
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Monto de compra:</span>
                                        <span className="font-bold text-gray-800">${parseFloat(purchaseAmount).toFixed(2)} MXN</span>
                                    </div>
                                )}
                                {(rewardType === 'points' || rewardType === 'both') && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Puntos otorgados:</span>
                                        <span className="font-bold text-brand-primary">{Math.floor(parseFloat(purchaseAmount) / 10)}</span>
                                    </div>
                                )}
                                {(rewardType === 'stamps' || rewardType === 'both') && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Sellos otorgados:</span>
                                        <span className="font-bold text-accent-success">{stampQuantity}</span>
                                    </div>
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
        </div>
    );
};

export default BusinessScan;
