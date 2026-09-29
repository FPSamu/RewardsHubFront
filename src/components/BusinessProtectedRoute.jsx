import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import subscriptionService from '../services/subscriptionService';
import businessService from '../services/businessService';

function BusinessProtectedRoute({ children }) {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [hasLocations, setHasLocations] = useState(false);

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
                const [status, business] = await Promise.all([
                    subscriptionService.getSubscriptionStatus().catch((error) => {
                        console.error('Error checking subscription:', error);
                        return { status: 'inactive' };
                    }),
                    businessService.getMyBusiness().catch((error) => {
                        console.error('Error checking business locations:', error);
                        return { locations: [] };
                    }),
                ]);
                setSubscriptionStatus(status);
                setHasLocations((business?.locations?.length ?? 0) > 0);
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
    // Allow access to the onboarding wizard and the subscription page without these checks
    const isOnboardingPage = location.pathname === '/business/onboarding';
    const isSubscriptionPage = location.pathname === '/business/subscription';
    const ACTIVE_STATUSES    = ['active', 'lifetime', 'trialing'];
    const ACTIVE_MEMBERSHIPS = ['active', 'lifetime'];
    const hasActiveSubscription = subscriptionStatus && (
        ACTIVE_STATUSES.includes(subscriptionStatus.status) ||
        ACTIVE_MEMBERSHIPS.includes(subscriptionStatus.membershipStatus) ||
        subscriptionStatus.planType === 'lifetime_access'
    );
    const needsSubscription = subscriptionStatus && !hasActiveSubscription;

    // The onboarding wizard is always reachable — it's where a business without a
    // branch is sent, and it must stay visible even before they have a subscription.
    if (isOnboardingPage) {
        return children;
    }

    // A business with no branch yet hasn't finished the minimum setup — send it to
    // onboarding before it can reach the dashboard or the subscription page.
    if (!hasLocations) {
        return <Navigate to="/business/onboarding" replace />;
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
