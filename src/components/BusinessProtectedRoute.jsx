import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import subscriptionService from '../services/subscriptionService';

function BusinessProtectedRoute({ children }) {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    const isAuthenticated = authService.isAuthenticated();
    const userType = authService.getUserType();

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        const checkSubscription = async () => {
            if (!isAuthenticated || userType !== 'business' || (user && !user.isVerified)) {
                setLoading(false);
                return;
            }

            try {
                const status = await subscriptionService.getSubscriptionStatus();
                setSubscriptionStatus(status);
            } catch (error) {
                console.error('Error checking subscription:', error);
                setSubscriptionStatus({ status: 'inactive' });
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();
    }, [isAuthenticated, userType, user]);

    // Not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Not a business user
    if (userType !== 'business') {
        return <Navigate to="/client/dashboard" replace />;
    }

    if (user && !user.isVerified) {
        return <Navigate to="/verify-pending" replace />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando información del negocio...</p>
                </div>
            </div>
        );
    }

    // Loading subscription status
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando suscripción...</p>
                </div>
            </div>
        );
    }

    // Check if subscription is inactive or cancelled
    // Allow access to subscription page and location setup page without subscription check
    const isLocationSetupPage = location.pathname === '/business/location-setup';
    const isSubscriptionPage = location.pathname === '/business/subscription';
    const needsSubscription = subscriptionStatus &&
        (subscriptionStatus.status === 'inactive' || subscriptionStatus.status === 'cancelled');

    // Allow access to location setup page always (for new businesses)
    if (isLocationSetupPage) {
        return children;
    }

    if (needsSubscription && !isSubscriptionPage) {
        return <Navigate to="/business/subscription" replace />;
    }

    // If already has active subscription and trying to access subscription page, redirect to dashboard
    if (!needsSubscription && isSubscriptionPage) {
        return <Navigate to="/business/dashboard" replace />;
    }

    return children;
}

export default BusinessProtectedRoute;
