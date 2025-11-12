import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children, allowedUserTypes }) {
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedUserTypes && !allowedUserTypes.includes(currentUser?.userType)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
