import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage('es')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentLanguage === 'es'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                aria-label="Cambiar a Español"
            >
                🇪🇸 ES
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentLanguage === 'en'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                aria-label="Switch to English"
            >
                🇺🇸 EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
