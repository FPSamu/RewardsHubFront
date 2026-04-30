import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SettingsModal from './SettingsModal';
import authService from '../services/authService';
import { ClientHeader } from './client/layout/ClientHeader';
import { ClientDrawer } from './client/layout/ClientDrawer';

const ClientLayout = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen]     = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser]       = useState(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    navigate('/login');
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="min-h-dvh bg-neutral-50">
      <ClientHeader user={currentUser} onMenuOpen={() => setIsDrawerOpen(true)} />

      <ClientDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={currentUser}
        onSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-2xl mx-auto pb-24">
        <Outlet />
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default ClientLayout;
