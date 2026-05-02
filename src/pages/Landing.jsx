import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import SEO from '../components/SEO';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsBar } from '../components/landing/StatsBar';
import { AudienceSection } from '../components/landing/AudienceSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { PricingSection } from '../components/landing/PricingSection';
import { CtaSection } from '../components/landing/CtaSection';
import { LandingFooter } from '../components/landing/LandingFooter';

const CSS_KEYFRAMES = `
  @keyframes heroFloat1 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(-5px) rotate(-0.5deg); }
  }
  @keyframes heroFloat2 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-14px) rotate(-1deg); }
  }
  @keyframes heroFloat3 {
    0%, 100% { transform: translateY(0px); }
    40% { transform: translateY(-8px); }
    80% { transform: translateY(-4px); }
  }
  @keyframes orbPulse {
    0%, 100% { opacity: 0.08; transform: scale(1); }
    50% { opacity: 0.14; transform: scale(1.08); }
  }
  @keyframes shimmerText {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scrollDot {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(8px); opacity: 0.4; }
  }
`;

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Inject keyframes once
    const styleId = 'landing-keyframes';
    if (!document.getElementById(styleId)) {
      const el = document.createElement('style');
      el.id = styleId;
      el.textContent = CSS_KEYFRAMES;
      document.head.appendChild(el);
    }

    // Auth redirect
    const token = authService.getToken();
    if (token) {
      const userType = localStorage.getItem('userType');
      navigate(userType === 'business' ? '/business/dashboard' : '/client/dashboard');
      return;
    }

    AOS.init({ duration: 900, once: true, offset: 80 });
  }, [navigate]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0D0A05' }}>
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
            }
          ]
        }}
      />

      <LandingNav />
      <HeroSection />
      <StatsBar />
      <AudienceSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}

export default Landing;
