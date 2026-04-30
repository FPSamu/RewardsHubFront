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

    // Use the raw string as dependency — avoids a new object on every render
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    const user = userString ? (() => { try { return JSON.parse(userString); } catch { return null; } })() : null;
    const isVerified = user?.isVerified ?? true;

    useEffect(() => {
        const checkSubscription = async () => {
            if (!isAuthenticated || userType !== 'business' || !isVerified) {
                setLoading(false);
                return;
            }

            try {
                // getSubscriptionStatus reads from localStorage cache when available
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount — cache handles subsequent navigations

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
