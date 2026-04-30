import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import businessService from '../services/businessService';
import authService from '../services/authService';
import * as adminPinService from '../services/adminPinService';
import AdminPinModal from './AdminPinModal';
import { BusinessHeader } from './business/layout/BusinessHeader';
import { BusinessDrawer } from './business/layout/BusinessDrawer';

const BusinessLayout = () => {
  const navigate = useNavigate();
  const [business, setBusiness]         = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    businessService.getMyBusiness().then(setBusiness).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => setBusiness((prev) => ({ ...prev, ...e.detail }));
    window.addEventListener('businessUpdated', handler);
    return () => window.removeEventListener('businessUpdated', handler);
  }, []);

  // Show PIN modal whenever a 403/PIN event is dispatched by api.js
  useEffect(() => {
    const handler = () => setShowPinModal(true);
    window.addEventListener('adminPinRequired', handler);
    return () => window.removeEventListener('adminPinRequired', handler);
  }, []);

  const requirePin = useCallback((action) => {
    if (adminPinService.hasToken()) {
      action();
    } else {
      setPendingAction(() => action);
      setShowPinModal(true);
    }
  }, []);

  const handlePinSuccess = useCallback(() => {
    setShowPinModal(false);
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  const handlePinClose = useCallback(() => {
    setShowPinModal(false);
    setPendingAction(null);
  }, []);

  const { pathname } = useLocation();
  const isWide = pathname.startsWith('/business/dashboard/admin') ||
                 pathname.startsWith('/business/dashboard/clients') ||
                 pathname.startsWith('/business/dashboard/locations') ||
                 pathname.startsWith('/business/dashboard/rewards');

  const handleAdminClick = () => {
    requirePin(() => navigate('/business/dashboard/admin'));
  };

  const handleClientsClick = () => {
    requirePin(() => navigate('/business/dashboard/clients'));
  };

  const handleRewardsClick = () => {
    requirePin(() => navigate('/business/dashboard/rewards'));
  };

  const handleMembershipsClick = () => {
    requirePin(() => navigate('/business/dashboard/rewards'));
  };

  const handleLocationsClick = () => {
    requirePin(() => navigate('/business/dashboard/locations'));
  };

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <BusinessHeader business={business} onMenuOpen={() => setIsDrawerOpen(true)} />

      <BusinessDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        business={business}
        onAdminClick={handleAdminClick}
        onClientsClick={handleClientsClick}
        onRewardsClick={handleRewardsClick}
        onMembershipsClick={handleMembershipsClick}
        onLocationsClick={handleLocationsClick}
        onSettings={() => navigate('/business/dashboard/settings')}
        onLogout={handleLogout}
      />

      <main className={`flex-1 mx-auto w-full px-4 py-6 ${isWide ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <Outlet />
      </main>

      {showPinModal && (
        <AdminPinModal
          onSuccess={handlePinSuccess}
          onClose={handlePinClose}
        />
      )}
    </div>
  );
};

export default BusinessLayout;
