import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import SEO from '../components/SEO';


function Landing() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verificar si hay token, si sí, redirigir
        const token = authService.getToken();
        if (token) {
            const userType = localStorage.getItem('userType');
            if (userType === 'business') {
                navigate('/business/dashboard');
            } else {
                navigate('/client/dashboard');
            }
        }

        // Activar animaciones después de montar
        setTimeout(() => setIsVisible(true), 100);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-100 overflow-hidden">
            {/* SEO Meta Tags */}
            <SEO
                title="RewardsHub - Plataforma de Recompensas y Fidelización para Negocios"
                description="Conecta con tus clientes y fideliza con RewardsHub. Sistema de puntos y recompensas diseñado para pequeños y grandes negocios. Más de 500 negocios y 10K clientes conectados."
                keywords="recompensas, fidelización, puntos, lealtad, negocios, clientes, QR, programa de puntos, descuentos, premios, loyalty program, programa de lealtad"
                image="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                type="website"
                structuredData={{
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "Organization",
                            "name": "RewardsHub",
                            "url": "https://rewards-hub-opal.vercel.app/",
                            "logo": "https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png",
                            "description": "Plataforma universal para programas de lealtad y fidelización entre negocios y clientes",
                            "foundingDate": "2024",
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "contactType": "Customer Service",
                                "availableLanguage": ["Spanish", "English"]
                            }
                        },
                        {
                            "@type": "WebSite",
                            "name": "RewardsHub",
                            "url": "https://rewards-hub-opal.vercel.app/",
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://rewards-hub-opal.vercel.app/client/dashboard/map?search={search_term_string}",
                                "query-input": "required name=search_term_string"
                            }
                        },
                        {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Inicio",
                                    "item": "https://rewards-hub-opal.vercel.app/"
                                }
                            ]
                        }
                    ]
                }}
            />

            {/* Elementos decorativos animados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary opacity-10 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-400 opacity-10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300 opacity-10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-8">
                <nav className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className={`flex items-center space-x-2 sm:space-x-3 transition-all duration-700 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                        <img
                            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                            alt="RewardsHub Logo"
                            className="h-10 sm:h-12 w-auto object-contain"
                        />
                        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            RewardsHub
                        </span>
                    </div>

                    <div className={`flex items-center space-x-2 sm:space-x-4 transition-all duration-700 delay-200 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                        <Link
                            to="/login"
                            className="px-4 sm:px-6 py-2 sm:py-2.5 text-gray-700 font-medium hover:text-gray-900 transition-colors text-sm sm:text-base"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/signup"
                            className="hidden sm:inline-block px-6 py-2.5 bg-brand-primary text-white font-medium rounded-full hover:opacity-90 transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                            Registrarse
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 px-4 sm:px-6 py-8 sm:py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Contenido Principal */}
                        <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white rounded-full shadow-card mb-6 sm:mb-8 animate-bounce-slow">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs sm:text-sm font-medium text-gray-700">¡Más de 500 negocios conectados!</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xAl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                                Recompensas que
                                <span className="block bg-gradient-to-r from-brand-primary via-amber-500 to-orange-500 bg-clip-text text-transparent">
                                    impulsan tu negocio
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                                Conecta con tus clientes, fideliza y crece. Un sistema de puntos y recompensas diseñado para pequeños y grandes negocios.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12">
                                <Link
                                    to="/signup/business"
                                    className="group px-6 sm:px-8 py-3 sm:py-4 bg-brand-primary text-white font-semibold rounded-full hover:opacity-90 transition-all hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-sm sm:text-base"
                                >
                                    <span>Soy Negocio</span>
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    to="/signup/client"
                                    className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-800 font-semibold rounded-full hover:shadow-xl transition-all border-2 border-gray-200 hover:border-brand-primary hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-sm sm:text-base"
                                >
                                    <span>Soy Cliente</span>
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-6">
                                {[
                                    { value: '500+', label: 'Negocios' },
                                    { value: '10K+', label: 'Clientes' },
                                    { value: '50K+', label: 'Recompensas' }
                                ].map((stat, index) => (
                                    <div key={index} className={`transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${600 + index * 100}ms` }}>
                                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tarjetas Animadas */}
                        <div className={`hidden lg:block relative transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="relative w-full h-[600px]">
                                {/* Tarjeta de Cliente */}
                                <div className="absolute top-0 right-0 w-80 bg-white rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-float">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Cliente Premium</div>
                                            <div className="text-sm text-gray-500">María García</div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-brand-primary to-amber-500 rounded-2xl p-4 mb-4">
                                        <div className="text-white text-sm opacity-90 mb-1">Puntos Acumulados</div>
                                        <div className="text-white text-3xl font-bold">2,450</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-700">Café Gratis</span>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Disponible</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-700">15% Descuento</span>
                                            <span className="px-3 py-1 bg-brand-muted text-amber-700 text-xs font-semibold rounded-full">200 pts</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tarjeta de Negocio */}
                                <div className="absolute bottom-0 left-0 w-80 bg-white rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-float animation-delay-2000">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Cafetería Central</div>
                                            <div className="text-sm text-gray-500">Dashboard</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
                                            <div className="text-green-600 text-sm mb-1">Clientes</div>
                                            <div className="text-green-900 text-2xl font-bold">342</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                                            <div className="text-blue-600 text-sm mb-1">Escaneos</div>
                                            <div className="text-blue-900 text-2xl font-bold">1.2K</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-700 font-medium">Actividad Hoy</span>
                                            <span className="text-xs text-green-600 font-semibold">+24%</span>
                                        </div>
                                        <div className="flex space-x-1 h-16 items-end">
                                            {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-gradient-to-t from-brand-primary to-amber-400 rounded-t"
                                                    style={{ height: `${height}%` }}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Ícono flotante */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-brand-primary to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl animate-spin-slow">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 md:py-20 mt-12 sm:mt-16 md:mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className={`text-center mb-10 sm:mb-12 md:mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            ¿Por qué RewardsHub?
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600">
                            La plataforma más completa para gestionar programas de lealtad
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                ),
                                title: 'Fácil de Usar',
                                description: 'Interfaz intuitiva diseñada para que cualquier negocio pueda empezar en minutos.',
                                color: 'from-blue-400 to-blue-600'
                            },
                            {
                                icon: (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                ),
                                title: 'Resultados Rápidos',
                                description: 'Aumenta la retención de clientes y las ventas desde el primer mes de uso.',
                                color: 'from-amber-400 to-orange-500'
                            },
                            {
                                icon: (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                ),
                                title: 'Seguro y Confiable',
                                description: 'Protegemos los datos de tu negocio y tus clientes con los más altos estándares.',
                                color: 'from-green-400 to-green-600'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card hover:shadow-popover transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                                style={{ transitionDelay: `${900 + index * 150}ms` }}
                            >
                                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}>
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {feature.icon}
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
                <div className="max-w-4xl mx-auto">
                    <div className={`bg-gradient-to-r from-brand-primary via-amber-500 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-center shadow-2xl transition-all duration-1000 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                            ¿Listo para comenzar?
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">
                            Únete a cientos de negocios que ya están creciendo con RewardsHub
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center space-x-2 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white text-brand-primary font-bold rounded-full hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
                        >
                            <span>Crear Cuenta Gratis</span>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto text-center text-gray-600 text-xs sm:text-sm">
                    <p>© 2025 RewardsHub. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
