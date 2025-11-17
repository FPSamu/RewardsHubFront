import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children, allowedUserTypes }) {
    const isAuthenticated = authService.isAuthenticated();
    const userType = authService.getUserType();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
