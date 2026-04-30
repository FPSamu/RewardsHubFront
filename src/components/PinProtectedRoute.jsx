import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminPinService from '../services/adminPinService';
import AdminPinModal from './AdminPinModal';

/**
 * Wraps any route that requires a valid admin PIN token.
 * If the token is already in memory → renders children immediately.
 * If not → shows the PIN modal; on success renders children, on close navigates back to the scanner.
 */
export default function PinProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(adminPinService.hasToken());

  if (!unlocked) {
    return (
      <AdminPinModal
        onSuccess={() => setUnlocked(true)}
        onClose={() => navigate('/business/dashboard', { replace: true })}
      />
    );
  }

  return children;
}
