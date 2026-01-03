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
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 self-stretch w-full max-w-7xl shadow-2xl rounded-xl px-10 py-4">
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

                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 self-stretch w-full max-w-7xl shadow-2xl rounded-xl px-10 py-4">
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

                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 self-stretch w-full max-w-7xl shadow-2xl rounded-xl px-10 py-4">
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
                <section className="flex p-2.5 flex-col justify-center items-center gap-10 self-stretch">
                    <h2 style={{
                        color: '#FFF',
                        textAlign: 'center',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '40px',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: 'normal',
                        letterSpacing: '1.92px'
                    }}>PLANES PARA TU NEGOCIO</h2>
                    <div className="flex flex-row justify-center items-stretch gap-8 flex-wrap">
                        <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-4 border-[#FFB733] max-w-sm w-full hover:scale-105 transition-transform duration-300 flex flex-col justify-between">
                            {/* Badge de Mejor Valor */}
                            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#FFB733] to-[#EBA626] text-white px-4 py-2 rounded-full shadow-lg transform rotate-12">
                                <span style={{
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px'
                                }}>MEJOR VALOR</span>
                            </div>
                            {/* Header */}
                            <div className="mb-6">
                                <h3 style={{
                                    color: '#352D22',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    marginBottom: '8px'
                                }}>ANUAL</h3>
                                <p style={{
                                    color: '#8E6A28',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    lineHeight: '1.4'
                                }}>Sin compromiso mínimo, cancela en cualquier momento</p>
                            </div>

                            {/* Precio */}
                            <div className="mb-6 pb-6 border-b-2 border-gray-200">
                                <div className="flex items-baseline gap-2">
                                    <span style={{
                                        color: '#352D22',
                                        fontFamily: 'Montserrat, sans-serif',
                                        fontSize: '48px',
                                        fontWeight: 700,
                                        lineHeight: '1'
                                    }}>$299.99</span>
                                    <span style={{
                                        color: '#8E6A28',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '16px',
                                        fontWeight: 400
                                    }}>/ por mes</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-4 mb-8">
                                {[
                                    'Todo lo que incluye el plan mensual',
                                    'Un descuento de $124 mensuales',
                                    'Soporte prioritario',
                                    'Actualizaciones premium',
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                                            <circle cx="10" cy="10" r="10" fill="#FFB733" />
                                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p style={{
                                            color: '#352D22',
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: '15px',
                                            fontWeight: 400
                                        }}>{feature}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Link
                                to="/signup/business"
                                className="w-full py-4 rounded-full bg-[#FFB733] text-white font-semibold hover:bg-[#4a3d2d] transition-colors shadow-lg hover:shadow-xl flex justify-center items-center text-center"
                                style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '16px'
                                }}>
                                Comenzar Ahora
                            </Link>
                        </div>
                        
                        <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-[#FFB733] max-w-sm w-full hover:scale-105 transition-transform duration-300 flex flex-col justify-between">
                            {/* Header */}
                            <div className="mb-6">
                                <h3 style={{
                                    color: '#352D22',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    marginBottom: '8px'
                                }}>MENSUAL</h3>
                                <p style={{
                                    color: '#8E6A28',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    lineHeight: '1.4'
                                }}>Sin compromiso mínimo, cancela en cualquier momento</p>
                            </div>

                            {/* Precio */}
                            <div className="mb-6 pb-6 border-b-2 border-gray-200">
                                <div className="flex items-baseline gap-2">
                                    <span style={{
                                        color: '#352D22',
                                        fontFamily: 'Montserrat, sans-serif',
                                        fontSize: '48px',
                                        fontWeight: 700,
                                        lineHeight: '1'
                                    }}>$399.00</span>
                                    <span style={{
                                        color: '#8E6A28',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '16px',
                                        fontWeight: 400
                                    }}>/ por mes</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-4 mb-8">
                                {[
                                    'Acceso completo',
                                    'Gestión ilimitada de clientes',
                                    'Creación de recompensas personalizadas',
                                    'Sistema de puntos y sellos',
                                    'Escaneo de códigos QR',
                                    'Reportes',
                                    'Soporte por email'
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                                            <circle cx="10" cy="10" r="10" fill="#FFB733" />
                                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p style={{
                                            color: '#352D22',
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: '15px',
                                            fontWeight: 400
                                        }}>{feature}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Link
                                to="/signup/business"
                                className="w-full py-4 rounded-full bg-[#FFB733] text-white font-semibold hover:bg-[#4a3d2d] transition-colors shadow-lg hover:shadow-xl flex justify-center items-center text-center"
                                style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '16px'
                                }}>
                                Comenzar Ahora
                            </Link>
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#FFB733]/10 via-[#EBA626]/10 to-[#FFB733]/10 border-2 border-[#FFB733] rounded-xl sm:rounded-2xl shadow-lg max-w-2xl mx-auto">
                        <p className="text-center flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap" style={{
                            color: '#fff',
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: 'clamp(14px, 4vw, 18px)',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            lineHeight: '1.4'
                        }}>
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFB733] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>Crea una cuenta de cliente <span className="text-[#FFB733]">COMPLETAMENTE GRATIS</span></span>
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFB733] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </p>
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
