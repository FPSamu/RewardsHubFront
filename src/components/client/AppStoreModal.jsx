import { useEffect, useState } from 'react';

const APP_STORE_URL = 'https://apps.apple.com/mx/app/rewardshub/id6768108963?l=en-GB';
const STORAGE_KEY   = 'rh_appstore_modal_shown';

const isIphone = () =>
    /iPhone/i.test(navigator.userAgent) && !/iPad/i.test(navigator.userAgent);

export function AppStoreModal() {
    const [visible, setVisible] = useState(false);
    const [animIn,  setAnimIn]  = useState(false);

    useEffect(() => {
        if (!isIphone()) return;
        if (localStorage.getItem(STORAGE_KEY)) return;

        // Small delay so the dashboard loads first
        const t = setTimeout(() => {
            setVisible(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
        }, 900);

        return () => clearTimeout(t);
    }, []);

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, '1');
        setAnimIn(false);
        setTimeout(() => setVisible(false), 350);
    };

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{
                background: animIn ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
                backdropFilter: animIn ? 'blur(2px)' : 'none',
                transition: 'background 0.35s ease, backdrop-filter 0.35s ease',
            }}
            onClick={dismiss}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: animIn ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
                className="w-full max-w-md bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl"
            >
                {/* Handle */}
                <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-6" />

                {/* App identity */}
                <div className="flex items-center gap-4 mb-5">
                    <img
                        src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                        alt="RewardsHub"
                        className="w-16 h-16 rounded-2xl shadow-md object-contain bg-brand-muted p-1"
                    />
                    <div>
                        <p className="text-[11px] font-semibold text-brand-primary uppercase tracking-widest mb-0.5">
                            Ya disponible
                        </p>
                        <h2 className="text-[20px] font-extrabold text-neutral-900 leading-tight">
                            RewardsHub
                        </h2>
                        <p className="text-[13px] text-neutral-500">Disponible en el App Store</p>
                    </div>
                </div>

                <p className="text-[14px] text-neutral-600 leading-relaxed mb-6">
                    Descarga la app para iPhone y disfruta de una experiencia más rápida, tu código QR siempre a mano y notificaciones de tus recompensas.
                </p>

                {/* App Store button */}
                <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={dismiss}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-neutral-950 text-white font-semibold text-[15px] active:opacity-80 transition-opacity mb-3"
                >
                    {/* Apple logo */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    Descargar en el App Store
                </a>

                <button
                    onClick={dismiss}
                    className="w-full py-3 text-[14px] font-medium text-neutral-400 active:text-neutral-600 transition-colors"
                >
                    Quizás después
                </button>
            </div>
        </div>
    );
}
