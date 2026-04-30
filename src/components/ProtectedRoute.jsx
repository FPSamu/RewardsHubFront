import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const VALID_ROLES = ['client', 'business'];

function ProtectedRoute({ children }) {
    const isAuthenticated = authService.isAuthenticated();
    const userType        = authService.getUserType();
    const user            = authService.getCurrentUser();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Session exists but role is missing or corrupt — wipe and force re-login
    if (!VALID_ROLES.includes(userType)) {
        authService.clearStorage();
        return <Navigate to="/login" replace />;
    }

    if (user && !user.isVerified) {
        return <Navigate to="/verify-pending" replace />;
    }

    // Business accounts must stay in the business interface
    if (userType === 'business') {
        return <Navigate to="/business/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
