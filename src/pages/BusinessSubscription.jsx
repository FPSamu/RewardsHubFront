import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import authService from '../services/authService';

const BusinessSubscription = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Verificar si el usuario tiene acceso a la suscripción lifetime
    // Opción 1: Por parámetro en URL (?show_lifetime=true)
    // Opción 2: Por código especial (?code=LIFETIME2024)
    // Opción 3: Por verificación con el backend (usuario elegible)
    const showLifetimeParam = searchParams.get('show_lifetime') === 'true';
    const lifetimeCode = searchParams.get('code');
    const hasLifetimeAccess = showLifetimeParam || lifetimeCode === 'FREE4LIFE';

    const basePlans = [
        {
            id: 'monthly',
            name: 'Plan Mensual',
            price: 500,
            currency: 'MXN',
            interval: 'mes',
            features: [
                'Acceso completo al dashboard',
                'Gestión ilimitada de clientes',
                'Creación de recompensas personalizadas',
                'Sistema de puntos y sellos',
                'Escaneo de códigos QR',
                'Reportes básicos',
                'Soporte por email',
            ],
            recommended: false,
        },
        {
            id: 'yearly',
            name: 'Plan Anual',
            price: 4500,
            currency: 'MXN',
            interval: 'año',
            features: [
                'Todo lo del plan mensual',
                'Ahorra $1,500 MXN al año',
                'Reportes avanzados y analytics',
                'Soporte prioritario',
                'Actualizaciones premium',
                'Capacitación personalizada',
                '2 meses gratis',
            ],
            recommended: !hasLifetimeAccess, // No recomendado si hay lifetime
            savings: '25% de descuento',
        },
    ];

    const lifetimePlan = {
        id: 'lifetime_access',
        name: 'Plan Lifetime',
        price: 0,
        currency: 'MXN',
        interval: 'para siempre',
        features: [
            '🎉 Acceso de por vida GRATIS',
            'Todo lo del plan anual',
            'Sin pagos mensuales ni anuales',
            'Acceso a todas las funcionalidades',
            'Actualizaciones futuras incluidas',
            'Soporte prioritario VIP',
            'Early access a nuevas features',
            'Insignia de miembro fundador',
        ],
        recommended: true,
        special: true,
        badge: 'Exclusivo',
    };

    // Agregar el plan lifetime solo si el usuario tiene acceso
    const plans = hasLifetimeAccess ? [lifetimePlan, ...basePlans] : basePlans;

    const verifyPayment = async () => {
        try {
            await subscriptionService.verifySubscription();
            setSuccess('¡Pago exitoso! Tu suscripción está activa.');
            setTimeout(() => {
                navigate('/business/dashboard');
            }, 2000);
        } catch (err) {
            console.error('Error verifying payment:', err);
            setError('Error al verificar el pago. Por favor, contacta a soporte.');
        } finally {
            setProcessingPayment(false);
        }
    };

    useEffect(() => {
        // Check if coming back from successful payment
        const sessionId = searchParams.get('session_id');
        const status = searchParams.get('status');
        const canceled = searchParams.get('canceled');

        if (sessionId && status === 'success') {
            setProcessingPayment(true);
            verifyPayment();
        } else if (status === 'cancelled' || canceled === 'true') {
            setError('El pago fue cancelado. Por favor, intenta nuevamente.');
            setLoading(false);

            // Limpiar la URL para evitar que se quede en blanco o con parámetros de error
            if (canceled || status) {
                navigate('/business/subscription', { replace: true });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSubscribe = async (plan) => {
        setLoading(true);
        setError(null);

        try {
            // Si es plan lifetime, activar directamente sin pago
            if (plan.id === 'lifetime') {
                // Llamar al backend para activar la suscripción lifetime
                const { url } = await subscriptionService.createCheckoutSession(
                    'lifetime',
                    'lifetime'
                );

                // Si el backend retorna una URL, redirigir (por si requiere confirmación)
                // Si no, verificar directamente
                if (url) {
                    window.location.href = url;
                } else {
                    // Activar directamente
                    await subscriptionService.verifySubscription();
                    setSuccess('¡Suscripción lifetime activada! Redirigiendo...');
                    setTimeout(() => {
                        navigate('/business/dashboard');
                    }, 2000);
                }
            } else {
                // Planes de pago normales - crear checkout session
                const { url } = await subscriptionService.createCheckoutSession(
                    plan.id,
                    plan.id
                );

                // Redirect to Stripe Checkout
                window.location.href = url;
            }
        } catch (err) {
            console.error('Error creating checkout session:', err);
            setError(err.message || 'Error al procesar la suscripción. Por favor, intenta nuevamente.');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (processingPayment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Procesando tu pago...</h2>
                    <p className="text-gray-600">Por favor espera mientras verificamos tu suscripción.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img
                            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                            alt="RewardsHub Logo"
                            className="h-12 w-auto object-contain"
                        />
                        <span className="text-2xl font-bold text-gray-800">RewardsHub Business</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                        Elige tu plan de suscripción
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Activa tu cuenta de negocio y comienza a fidelizar a tus clientes con nuestro sistema de recompensas
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-8 max-w-2xl mx-auto bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-3">
                        <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-800 font-semibold">{success}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 max-w-2xl mx-auto bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3">
                        <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800 font-semibold">{error}</p>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className={`grid ${hasLifetimeAccess ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 max-w-6xl mx-auto mb-12`}>
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${plan.special
                                ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 ring-4 ring-purple-400'
                                : 'bg-white'
                                } ${plan.recommended && !plan.special ? 'ring-4 ring-brand-primary' : ''
                                }`}
                        >
                            {/* Recommended/Special Badge */}
                            {plan.recommended && !plan.special && (
                                <div className="absolute top-0 right-0 bg-brand-primary text-white px-4 py-1 text-sm font-bold rounded-bl-xl">
                                    Recomendado
                                </div>
                            )}

                            {/* Special Badge for Lifetime */}
                            {plan.special && plan.badge && (
                                <div className="absolute top-0 right-0 bg-white text-purple-600 px-4 py-1 text-sm font-bold rounded-bl-xl shadow-lg">
                                    ⭐ {plan.badge}
                                </div>
                            )}

                            {/* Savings Badge */}
                            {plan.savings && (
                                <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-bold rounded-br-xl">
                                    {plan.savings}
                                </div>
                            )}

                            <div className="p-8">
                                {/* Plan Name */}
                                <h3 className={`text-2xl font-bold mb-2 ${plan.special ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h3>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline">
                                        {plan.id === 'lifetime' ? (
                                            <span className={`text-5xl font-extrabold ${plan.special ? 'text-white' : 'text-gray-900'}`}>
                                                GRATIS
                                            </span>
                                        ) : (
                                            <>
                                                <span className={`text-5xl font-extrabold ${plan.special ? 'text-white' : 'text-gray-900'}`}>
                                                    ${plan.price.toLocaleString()}
                                                </span>
                                                <span className={`text-xl ml-2 ${plan.special ? 'text-white/80' : 'text-gray-600'}`}>
                                                    {plan.currency}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className={`mt-1 ${plan.special ? 'text-white/90 font-semibold' : 'text-gray-600'}`}>
                                        {plan.id === 'lifetime' ? '🎉 ' : 'por '}{plan.interval}
                                    </p>
                                    {plan.id === 'annual' && !hasLifetimeAccess && (
                                        <p className="text-sm text-green-600 font-semibold mt-1">
                                            Solo $375 MXN por mes
                                        </p>
                                    )}
                                    {plan.id === 'lifetime' && (
                                        <p className="text-sm text-white font-bold mt-2 bg-white/20 rounded-full px-3 py-1 inline-block">
                                            Valor: $54,000 MXN
                                        </p>
                                    )}
                                </div>

                                {/* Features List */}
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg
                                                className={`w-6 h-6 flex-shrink-0 ${plan.special ? 'text-white' : 'text-green-500'}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span className={`ml-3 ${plan.special ? 'text-white font-medium' : 'text-gray-700'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Subscribe Button */}
                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={loading}
                                    className={`w-full py-4 px-6 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${plan.special
                                        ? 'bg-white text-purple-600 hover:bg-gray-50'
                                        : plan.recommended
                                            ? 'bg-brand-primary text-white hover:opacity-90'
                                            : 'bg-gray-800 text-white hover:bg-gray-700'
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-2"></div>
                                            Procesando...
                                        </span>
                                    ) : plan.id === 'lifetime' ? (
                                        '✨ Activar Acceso Lifetime'
                                    ) : (
                                        'Suscribirse Ahora'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Information */}
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <svg className="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Información importante</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>✓ Pago seguro procesado por Stripe</li>
                                <li>✓ Cancela tu suscripción en cualquier momento</li>
                                <li>✓ Sin cargos ocultos ni compromisos a largo plazo</li>
                                <li>✓ Soporte técnico incluido en todos los planes</li>
                                <li>✓ Acceso inmediato después del pago</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Security Badges */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">Pago seguro con</p>
                    <div className="flex items-center justify-center space-x-6">
                        <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                            <span className="text-2xl font-bold text-[#635BFF]">stripe</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                            🔒 Conexión segura SSL
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessSubscription;
