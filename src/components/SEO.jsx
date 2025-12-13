import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Maneja meta tags dinámicos para cada página
 * @param {string} title - Título de la página
 * @param {string} description - Descripción meta
 * @param {string} keywords - Palabras clave separadas por comas
 * @param {string} image - URL de la imagen para Open Graph
 * @param {string} type - Tipo de contenido (website, article, etc.)
 * @param {object} structuredData - Datos estructurados JSON-LD
 */
function SEO({
    title = 'RewardsHub - Plataforma de Recompensas y Fidelización',
    description = 'RewardsHub es la plataforma universal para programas de lealtad entre negocios y clientes. Acumula puntos, canjea recompensas y descubre negocios cerca de ti.',
    keywords = 'recompensas, fidelización, puntos, lealtad, negocios, clientes, QR, programa de puntos, descuentos, premios',
    image = 'https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png',
    type = 'website',
    structuredData = null
}) {
    const location = useLocation();
    const siteUrl = 'https://rewards-hub-opal.vercel.app';
    const canonicalUrl = `${siteUrl}${location.pathname}`;

    useEffect(() => {
        // Actualizar título
        document.title = title;

        // Función helper para actualizar o crear meta tags
        const updateMetaTag = (selector, attribute, value) => {
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');
                if (attribute === 'name' || attribute === 'property') {
                    element.setAttribute(attribute, selector.replace(/meta\[.*?="(.*?)"\]/, '$1'));
                }
                document.head.appendChild(element);
            }
            element.setAttribute('content', value);
        };

        // Meta tags básicos
        updateMetaTag('meta[name="description"]', 'name', description);
        updateMetaTag('meta[name="keywords"]', 'name', keywords);
        updateMetaTag('meta[name="author"]', 'name', 'RewardsHub');
        updateMetaTag('meta[name="robots"]', 'name', 'index, follow');

        // Open Graph tags (Facebook, LinkedIn)
        updateMetaTag('meta[property="og:title"]', 'property', title);
        updateMetaTag('meta[property="og:description"]', 'property', description);
        updateMetaTag('meta[property="og:image"]', 'property', image);
        updateMetaTag('meta[property="og:url"]', 'property', canonicalUrl);
        updateMetaTag('meta[property="og:type"]', 'property', type);
        updateMetaTag('meta[property="og:site_name"]', 'property', 'RewardsHub');
        updateMetaTag('meta[property="og:locale"]', 'property', 'es_MX');

        // Twitter Card tags
        updateMetaTag('meta[name="twitter:card"]', 'name', 'summary_large_image');
        updateMetaTag('meta[name="twitter:title"]', 'name', title);
        updateMetaTag('meta[name="twitter:description"]', 'name', description);
        updateMetaTag('meta[name="twitter:image"]', 'name', image);

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalUrl);

        // Structured Data (JSON-LD)
        if (structuredData) {
            let script = document.querySelector('script[type="application/ld+json"]');
            if (!script) {
                script = document.createElement('script');
                script.setAttribute('type', 'application/ld+json');
                document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(structuredData);
        }

        // Cleanup function
        return () => {
            // Opcional: limpiar structured data al desmontar
            const ldScript = document.querySelector('script[type="application/ld+json"]');
            if (ldScript && structuredData) {
                ldScript.remove();
            }
        };
    }, [title, description, keywords, image, type, canonicalUrl, structuredData]);

    return null; // Este componente no renderiza nada visible
}

export default SEO;
