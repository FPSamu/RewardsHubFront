import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import SEO from '../components/SEO';


function Landing() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const texts = ['premian tu lealtad', 'impulsan tu negocio'];

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

    // Alternar textos cada 3 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#352D22] overflow-hidden">
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
            <div className="absolute inset-0 overflow-x-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-primary opacity-10 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-20 -left-20 w-96 h-96 bg-amber-400 opacity-10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300 opacity-10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-8">
                <nav className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className={`flex items-center space-x-2 sm:space-x-3 transition-all duration-700 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                        <img
                            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/RewardsHub.png"
                            alt="RewardsHub Logo"
                            className="h-8 sm:h-9 md:h-10 w-auto object-contain"
                        />
                    </div>

                    <div className={`flex items-center space-x-2 sm:space-x-4 transition-all duration-700 delay-200 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                        <div className="flex items-center justify-center gap-2.5 px-5 py-4 rounded-full border border-[#FFB733]">
                            <Link
                                to="/login"
                                className="text-[#FFB733] font-medium hover:text-[#f5d18e] transition-colors text-sm sm:text-base"
                            >
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>

            <main className="flex py-[60px] flex-col justify-center items-center gap-[120px]">
                <section className="flex flex-col items-center gap-10 self-stretch">
                    <div className="flex flex-col items-stretch">
                        <h1
                            className="text-center font-medium px-4"
                            style={{
                                WebkitTextStroke: 'clamp(1px, 0.15vw, 2px) #D08700',
                                color: 'transparent',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: 'clamp(32px, 5vw, 48px)',
                                fontWeight: 500,
                                letterSpacing: 'clamp(1px, 0.3vw, 2.88px)',
                                lineHeight: 'normal'
                            }}
                        >
                            Recompensas que
                        </h1>
                        <div className="relative overflow-hidden h-16 sm:h-20 md:h-16 flex justify-center items-center px-4 -mt-2 sm:-mt-1">
                            {texts.map((text, index) => (
                                <h2
                                    key={index}
                                    className={`absolute text-center font-normal transition-all duration-700 ease-in-out whitespace-nowrap ${index === currentTextIndex
                                        ? 'translate-x-0 opacity-100'
                                        : index < currentTextIndex
                                            ? 'sm:-translate-x-20 -translate-x-12 opacity-0'
                                            : 'sm:translate-x-20 translate-x-12 opacity-0'
                                        }`}
                                    style={{
                                        fontFamily: 'Impact, sans-serif',
                                        fontSize: 'clamp(36px, 6vw, 48px)',
                                        fontWeight: 400,
                                        lineHeight: 'normal',
                                        background: index === 0
                                            ? 'linear-gradient(94deg, #72447B 4.26%, #FFB733 86.82%)'
                                            : 'linear-gradient(274deg, #72447B 4.26%, #FFB733 86.82%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {text}
                                </h2>
                            ))}
                        </div>
                        <div
                            className='text-[#D5992B] text-center font-light w-full px-4 sm:px-6'
                            style={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: 'clamp(14px, 3vw, 20px)',
                                lineHeight: 'clamp(1.4, 1.6, 1.8)',
                                maxWidth: '100%',
                                boxSizing: 'border-box'
                            }}
                        >
                            <p
                                className="mb-2"
                                style={{
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word'
                                }}>
                                Convierte cada visita en una recompensa. <br />
                                Un sistema de puntos que motiva a tus clientes y hace crecer tu negocio.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-6 sm:gap-10 self-stretch px-4">
                        <p
                            className="self-stretch text-[#FFB733] text-center text-lg sm:text-xl md:text-2xl font-medium"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            Quiero:
                        </p>
                        <div className="flex max-w-lg mx-auto justify-center items-center content-center gap-4 sm:gap-6 flex-col sm:flex-row px-4">
                            <Link
                                to="/signup/business"
                                className="flex py-3 px-8 justify-center items-center gap-2.5 w-[220px] sm:w-[240px] rounded-full bg-[#EBA626] text-white text-center text-base sm:text-lg md:text-xl font-semibold hover:bg-[#d99520] transition-colors whitespace-nowrap"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Crear recompensas
                            </Link>
                            <Link
                                to="/signup/client"
                                className="flex py-3 px-8 justify-center items-center gap-2.5 w-[220px] sm:w-[240px] rounded-full bg-[#EBA626] text-white text-center text-base sm:text-lg md:text-xl font-semibold hover:bg-[#d99520] transition-colors whitespace-nowrap"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Conseguir puntos
                            </Link>
                        </div>
                    </div>
                    <div className="flex justify-center items-center w-full">
                        <img
                            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/FlyerLanding2.png"
                            alt="RewardsHub - Sistema de recompensas y fidelización"
                            className="object-contain"
                            style={{ width: '1000px', maxWidth: 'none', height: 'auto' }}
                        />
                    </div>
                </section>

                <section className="bg-gradient-to-b from-[#352D22] to-[#8E6A28] min-h-screen flex flex-col items-center gap-12 md:gap-16 lg:gap-20 w-full px-4 sm:px-8 md:px-16 lg:px-32 xl:px-80 py-12 md:py-16 lg:py-20">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 self-stretch w-full max-w-7xl shadow-2xl rounded-xl px-10">
                        <div className="flex flex-col items-start gap-2 w-full md:w-1/2">
                            <div className="flex items-center gap-5">
                                <span style={{
                                    width: '61px',
                                    height: '2px',
                                    backgroundColor: '#FFB733',
                                    display: 'block'
                                }}></span>
                                <p
                                    style={{
                                        color: '#FFB733',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(18px, 4vw, 24px)',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: 'normal'
                                    }}>
                                    ¿Cómo funciona?
                                </p>
                            </div>
                            <div className="flex flex-col items-start gap-4 self-stretch">
                                <h3
                                    className="self-stretch"
                                    style={{
                                        color: '#F5F5DC',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(28px, 6vw, 40px)',
                                        fontStyle: 'normal',
                                        fontWeight: 700,
                                        lineHeight: 'normal'
                                    }}>
                                    Crea recompensas
                                </h3>
                                <p
                                    className="self-stretch"
                                    style={{
                                        color: '#E8DCC4',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(16px, 3.5vw, 20px)',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: '1.6'
                                    }}>
                                    Recompensas a tu manera. Ajusta beneficios y condiciones desde una interfaz diseñada para que tu programa de lealtad sea fácil de gestionar y atractivo para tus clientes.
                                </p>
                            </div>
                        </div>
                        <img
                            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/RewardsManagement.png"
                            alt="Rewards Management"
                            className="w-full md:w-1/2"
                            style={{
                                maxWidth: '600px',
                                height: 'auto',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 self-stretch w-full max-w-7xl shadow-2xl rounded-xl px-10">
                        <div className="flex flex-col items-start gap-2 w-full md:w-1/2 order-1 md:order-2">
                            <div className="flex items-center gap-5">
                                <span style={{
                                    width: '61px',
                                    height: '2px',
                                    backgroundColor: '#FFB733',
                                    display: 'block'
                                }}></span>
                                <p
                                    style={{
                                        color: '#FFB733',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(18px, 4vw, 24px)',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: 'normal'
                                    }}>
                                    Control total
                                </p>
                            </div>
                            <div className="flex flex-col items-start gap-4 self-stretch">
                                <h3
                                    className="self-stretch"
                                    style={{
                                        color: '#F5F5DC',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(28px, 6vw, 40px)',
                                        fontStyle: 'normal',
                                        fontWeight: 700,
                                        lineHeight: 'normal'
                                    }}>
                                    Genera reportes
                                </h3>
                                <p
                                    className="self-stretch"
                                    style={{
                                        color: '#E8DCC4',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(16px, 3.5vw, 20px)',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: '1.6'
                                    }}>
                                    Genera reportes del periodo que necesites y compara ventas contra puntos otorgados para asegurarte de que todo esté en orden. Ideal para llevar un control claro y detectar errores en la asignación de puntos.
                                </p>
                            </div>
                        </div>
                        <img
                            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/GenerateReports.png"
                            alt="Generate Reports"
                            className="w-full md:w-1/2 order-2 md:order-1"
                            style={{
                                maxWidth: '600px',
                                height: 'auto',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 self-stretch w-full max-w-7xl shadow-2xl rounded-xl px-10">
                        <div className="flex flex-col items-start gap-2 w-full md:w-1/2">
                            <div className="flex items-center gap-5">
                                <span style={{
                                    width: '61px',
                                    height: '2px',
                                    backgroundColor: '#FFB733',
                                    display: 'block'
                                }}></span>
                                <p
                                    style={{
                                        color: '#FFB733',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(18px, 4vw, 24px)',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: 'normal'
                                    }}>
                                    Publicidad
                                </p>
                            </div>
                            <div className="flex flex-col items-start gap-4 self-stretch">
                                <h3
                                    className="self-stretch"
                                    style={{
                                        color: '#F5F5DC',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(28px, 6vw, 40px)',
                                        fontStyle: 'normal',
                                        fontWeight: 700,
                                        lineHeight: 'normal'
                                    }}>
                                    Los clientes llegan a ti
                                </h3>
                                <p
                                    className="self-stretch"
                                    style={{
                                        color: '#E8DCC4',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: 'clamp(16px, 3.5vw, 20px)',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: '1.6'
                                    }}>
                                    Tu negocio se muestra en el mapa, donde los clientes pueden explorar opciones cercanas, ver recompensas disponibles y llegar fácilmente hasta ti. Convirtiendo la visibilidad en visitas reales.
                                </p>
                            </div>
                        </div>
                        <img
                            src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/MapFeature.png"
                            alt="Map Feature"
                            className="w-full md:w-1/2"
                            style={{
                                maxWidth: '600px',
                                height: 'auto',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto text-center text-white text-xs sm:text-sm">
                    <p>© 2025 RewardsHub. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
