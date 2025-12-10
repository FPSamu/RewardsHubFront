import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children, allowedUserTypes }) {
    const isAuthenticated = authService.isAuthenticated();
    const userType = authService.getUserType();

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.isVerified === false) {
        return <Navigate to="/verify-pending" replace />;
    }

    if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;