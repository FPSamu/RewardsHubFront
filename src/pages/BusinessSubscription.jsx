import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import authService from '../services/authService';

import { SubscriptionHeader }  from '../components/subscription/SubscriptionHeader';
import { SubscriptionHero }    from '../components/subscription/SubscriptionHero';
import { PlanCard }            from '../components/subscription/PlanCard';
import { TrustBar }            from '../components/subscription/TrustBar';
import { ProcessingScreen }    from '../components/subscription/ProcessingScreen';
import { AlertBanner }         from '../components/subscription/AlertBanner';

// ── Plan data ──────────────────────────────────────────────────────────────────

const BASE_PLANS = [
  {
    id: 'monthly',
    name: 'Plan Mensual',
    price: 399,
    currency: 'MXN',
    interval: 'mes',
    features: [
      'Acceso completo a la plataforma',
      'Gestión ilimitada de clientes',
      'Creación de recompensas personalizadas',
      'Sistema de puntos y sellos',
      'Escaneo de códigos QR',
      'Reportes de ventas y puntos',
      'Soporte por email',
    ],
  },
  {
    id: 'yearly',
    name: 'Plan Anual',
    price: 3599,
    currency: 'MXN',
    interval: 'año',
    features: [
      'Todo lo del plan mensual',
      'Equivale a $299 al mes',
      'Ahorro de $1,188 vs mensual',
      'Soporte prioritario',
      'Actualizaciones premium anticipadas',
    ],
    savings: '33% de descuento',
  },
];

const LIFETIME_PLAN = {
  id: 'lifetime_access',
  name: 'Plan Lifetime',
  price: 0,
  currency: 'MXN',
  interval: 'para siempre',
  features: [
    'Acceso de por vida completamente gratis',
    'Todo lo del plan anual incluido',
    'Sin pagos mensuales ni anuales',
    'Actualizaciones futuras incluidas',
    'Soporte prioritario VIP',
    'Early access a nuevas funcionalidades',
    'Insignia de miembro fundador',
  ],
  special: true,
};

// ── Page ───────────────────────────────────────────────────────────────────────

const BusinessSubscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const lifetimeCode = searchParams.get('code');
  const showLifetimeParam = searchParams.get('show_lifetime') === 'true';
  const hasLifetimeAccess = showLifetimeParam || lifetimeCode === 'FREE4LIFE';

  const plans = hasLifetimeAccess ? [LIFETIME_PLAN, ...BASE_PLANS] : BASE_PLANS;

  // ── Payment return handling ──────────────────────────────────────────────────
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status');
    const canceled = searchParams.get('canceled');

    if (sessionId && status === 'success') {
      setProcessingPayment(true);
      verifyPayment();
    } else if (status === 'cancelled' || canceled === 'true') {
      setError('El pago fue cancelado. Por favor, intenta nuevamente.');
      navigate('/business/subscription', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifyPayment = async () => {
    try {
      await subscriptionService.verifySubscription();
      setSuccess('¡Pago exitoso! Tu suscripción está activa.');
      setTimeout(() => navigate('/business/dashboard'), 2000);
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Error al verificar el pago. Por favor, contacta a soporte.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // ── Subscribe handler ────────────────────────────────────────────────────────
  const handleSubscribe = async (plan) => {
    setLoading(true);
    setError(null);

    try {
      if (plan.id === 'lifetime_access') {
        const { url } = await subscriptionService.createCheckoutSession('lifetime', 'lifetime');
        if (url) {
          window.location.href = url;
        } else {
          await subscriptionService.verifySubscription();
          setSuccess('¡Suscripción lifetime activada! Redirigiendo...');
          setTimeout(() => navigate('/business/dashboard'), 2000);
        }
      } else {
        const { url } = await subscriptionService.createCheckoutSession(plan.id, plan.id);
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

  // ── Processing screen ────────────────────────────────────────────────────────
  if (processingPayment) return <ProcessingScreen />;

  // ── Grid layout: lifetime spans full width, monthly+yearly side by side ──────
  // With lifetime: 1-col on mobile, 2-col on md (lifetime spans both via col-span-2)
  // Without lifetime: 1-col on mobile, 2-col on md
  const gridCols = hasLifetimeAccess
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0D0A05' }}>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-5"
          style={{ background: hasLifetimeAccess ? '#a855f7' : '#EBA626' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-4"
          style={{ background: hasLifetimeAccess ? '#ec4899' : '#d99520' }} />
      </div>

      <SubscriptionHeader onLogout={handleLogout} />

      <main className="relative z-10 max-w-5xl mx-auto px-5 pt-16 pb-20">

        <SubscriptionHero hasLifetimeAccess={hasLifetimeAccess} />

        {/* Alerts */}
        {success && <AlertBanner type="success" message={success} />}
        {error   && <AlertBanner type="error"   message={error}   />}

        {/* Plan grid */}
        <div className={`grid ${gridCols} gap-5`}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              loading={loading}
            />
          ))}
        </div>

        <TrustBar />
      </main>
    </div>
  );
};

export default BusinessSubscription;
