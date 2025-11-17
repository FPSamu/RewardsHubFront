import { Link } from 'react-router-dom';

function SignUpChoice() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <h2 className="text-[32px] leading-[40px] font-extrabold text-[#0F172A] tracking-tight mb-4">
                        Únete a RewardsHub
                    </h2>
                    <p className="text-[20px] leading-7 font-semibold text-[#495057]">
                        ¿Cómo te gustaría registrarte?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Tarjeta Cliente */}
                    <Link to="/signup/client" className="group">
                        <div className="bg-white rounded-3xl p-8 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)] border border-[#E9ECEF] transform transition-all duration-180 hover:shadow-[0_16px_32px_-12px_rgba(2,6,23,0.20)] hover:scale-[1.02]">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFF4E0] rounded-full mb-6 group-hover:bg-[#FFE8C6] transition-colors duration-180">
                                    <span className="text-4xl">👤</span>
                                </div>
                                <h3 className="text-[24px] leading-8 font-bold text-[#0F172A] mb-4">
                                    Soy Cliente
                                </h3>
                                <p className="text-[14px] leading-5 font-medium text-[#6C757D] mb-6">
                                    Acumula puntos en tus negocios favoritos y canjea increíbles recompensas
                                </p>
                                <ul className="text-left space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#FFB733] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] leading-5 font-medium text-[#495057]">Genera tu código QR único</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#FFB733] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] leading-5 font-medium text-[#495057]">Acumula puntos automáticamente</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#FFB733] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] leading-5 font-medium text-[#495057]">Descubre negocios cerca de ti</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#FFB733] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] leading-5 font-medium text-[#495057]">Canjea recompensas exclusivas</span>
                                    </li>
                                </ul>
                                <div className="bg-[#FFB733] text-white h-11 px-6 rounded-full text-[16px] leading-6 font-semibold inline-flex items-center justify-center group-hover:opacity-95 transition-all duration-180 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)]">
                                    Registrarme como Cliente
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Tarjeta Negocio */}
                    <Link to="/signup/business" className="group">
                        <div className="bg-white rounded-3xl p-8 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)] border border-[#E9ECEF] transform transition-all duration-180 hover:shadow-[0_16px_32px_-12px_rgba(2,6,23,0.20)] hover:scale-[1.02]">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F0FDF4] rounded-full mb-6 group-hover:bg-[#E6F7E8] transition-colors duration-180">
                                    <span className="text-4xl">🏢</span>
                                </div>
                                <h3 className="text-[24px] leading-8 font-bold text-[#0F172A] mb-4">
                                    Soy Negocio
                                </h3>
                                <p className="text-[14px] leading-5 font-medium text-[#6C757D] mb-6">
                                    Fideliza a tus clientes con un sistema de recompensas personalizado
                                </p>
                                <ul className="text-left space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#74D680] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] leading-5 font-medium text-[#495057]">Escanea códigos QR de clientes</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#74D680] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] leading-5 font-medium text-[#495057]">Configura tu sistema de puntos</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#74D680] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] leading-5 font-medium text-[#495057]">Crea recompensas atractivas</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#74D680] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[14px] leading-5 font-medium text-[#495057]">Gestiona tu base de clientes</span>
                                    </li>
                                </ul>
                                <div className="bg-[#74D680] text-white h-11 px-6 rounded-full text-[16px] leading-6 font-semibold inline-flex items-center justify-center group-hover:opacity-95 transition-all duration-180 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)]">
                                    Registrarme como Negocio
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="text-center mt-10">
                    <p className="text-[16px] leading-6 font-medium text-[#495057]">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="font-semibold text-[#FFB733] hover:text-[#EAB000] transition-colors duration-180">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUpChoice;
