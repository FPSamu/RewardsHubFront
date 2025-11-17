import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const ClientLayout = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const handleSettings = () => {
        setIsMenuOpen(false);
        // TODO: Navigate to settings page
        console.log('Navigating to settings...');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-card border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-brand-primary">RewardsHub</h1>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex space-x-2">
                            <NavLink
                                to="/client/dashboard"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-pill text-sm font-medium transition-all duration-180 ${isActive
                                        ? 'bg-brand-muted text-brand-onColor'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                    }`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/client/dashboard/points"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-pill text-sm font-medium transition-all duration-180 ${isActive
                                        ? 'bg-brand-muted text-brand-onColor'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                    }`
                                }
                            >
                                Mis Puntos
                            </NavLink>
                            <NavLink
                                to="/client/dashboard/map"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-pill text-sm font-medium transition-all duration-180 ${isActive
                                        ? 'bg-brand-muted text-brand-onColor'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                    }`
                                }
                            >
                                Mapa
                            </NavLink>
                        </div>

                        {/* Right side - Mobile Menu Button + User Menu */}
                        <div className="flex items-center space-x-3">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-brand-primary hover:bg-gray-100 focus:outline-none focus:ring-3 focus:ring-brand-muted transition-all duration-180"
                            >
                                <span className="sr-only">Abrir menú</span>
                                {!isMobileMenuOpen ? (
                                    <svg
                                        className="block h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="block h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}
                            </button>

                            {/* User Menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white hover:opacity-96 transition-all duration-180 focus:outline-none focus:ring-3 focus:ring-brand-muted focus:ring-offset-2"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-popover py-1 z-50 border border-gray-200">
                                        <button
                                            onClick={handleSettings}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3 text-gray-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            Configuración
                                        </button>
                                        <div className="border-t border-gray-100"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3 text-red-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden pb-3 pt-2 border-t border-gray-200">
                            <div className="space-y-1">
                                <NavLink
                                    to="/client/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 rounded-lg text-base font-medium transition-all duration-180 ${isActive
                                            ? 'bg-brand-muted text-brand-onColor'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                        }`
                                    }
                                >
                                    Home
                                </NavLink>
                                <NavLink
                                    to="/client/dashboard/points"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 rounded-lg text-base font-medium transition-all duration-180 ${isActive
                                            ? 'bg-brand-muted text-brand-onColor'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                        }`
                                    }
                                >
                                    Mis Puntos
                                </NavLink>
                                <NavLink
                                    to="/client/dashboard/map"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 rounded-lg text-base font-medium transition-all duration-180 ${isActive
                                            ? 'bg-brand-muted text-brand-onColor'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-primary'
                                        }`
                                    }
                                >
                                    Mapa
                                </NavLink>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default ClientLayout;
