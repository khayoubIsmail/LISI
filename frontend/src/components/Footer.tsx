import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLogoConfig } from '@/config/logos';
import { ArrowLeft, Send, CheckCircle, MapPin, Phone, Mail } from "lucide-react";
import Logo from '@/components/ui/Logo';
import { useContactSettings } from '@/hooks/useContactSettings';
import {  getMultilingualContent } from '@/types/contactSettings';

// Types
interface Language {
  code: string;
  flag: string;
  name: string;
}

interface NavigationItem {
  key: string;
  path: string;
  label: string;
  hasDropdown?: boolean;
  dropdownItems?: NavigationItem[];
}
 
const Footer = () => {
  const { t, i18n } = useTranslation('header');
  const { t: tContact } = useTranslation('contact');
  
  const location = useLocation();
  const logoConfig = getLogoConfig(i18n.language);
  const { settings, loading, error, refetch } = useContactSettings();
  const { settings: contactSettings, loading: contactLoading } = useContactSettings();
  


  const handleLogoError = (e) => {
    if (i18n.language === 'ar') {
      e.currentTarget.src = "/images/logoen.png";
    }
  };
    // Fonction pour récupérer le contenu dans la langue actuelle
    const getContent = (baseKey: string, fallback?: string) => {
      if (!settings) return fallback || '';
      return getMultilingualContent(settings, baseKey, i18n.language, fallback);
    };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
      <div className="relative container mx-auto px-6">
        {/* Haut du footer : logo + navigation */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-12 gap-6 lg:gap-12">
  <div className="w-full max-w-sm lg:max-w-xs shrink-0">
    <Link to="/index" className="block w-fit">
      <Logo currentLanguage={i18n.language} getLogoConfig={getLogoConfig} onError={handleLogoError} />
    </Link>
  </div>

  <nav className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-base">
      <div className="flex flex-col space-y-2">
        <Link to="/" className="hover:underline">{t("Accueil")}</Link>
        <Link to="/axes-recherche" className="hover:underline">{t("research")}</Link>
        <Link to="/membres" className="hover:underline">{t("Membres")}</Link>
      </div>
      <div className="flex flex-col space-y-2">
        <Link to="/projects" className="hover:underline">{t("projects")}</Link>
        <Link to="/prix-distinctions" className="hover:underline">{t("prix-distinctions")}</Link>
        <Link to="/partenaires" className="hover:underline">{t("partners")}</Link>
        <Link to="/galerie" className="hover:underline">{t("gallery")}</Link>
        
      </div>
      <div className="flex flex-col space-y-2">
        <Link to="/publications" className="hover:underline">{t("publications")}</Link>
        <Link to="/rapports-activite" className="hover:underline">{t("activity-reports")}</Link>
        <Link to="/contact" className="hover:underline">{t("contact")}</Link>
      </div>
    </nav>   
</div>
  
        {/* Section contact + réseaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-8 border-t border-white/20">
  <div>
    <h4 className="text-lg font-medium mb-4">{tContact("Contact")}</h4>

    {contactLoading ? (
      <div className="space-y-2">
        <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-white/20 rounded animate-pulse w-1/2"></div>
        <div className="h-4 bg-white/20 rounded animate-pulse w-2/3"></div>
      </div>
    ) : contactSettings ? (
      <>
        <div className="flex items-center text-white mb-2 space-x-2">
          <MapPin className="h-5 w-5 text-white shrink-0" />
          <span>{getContent('contact_adresse', "Av Abdelkrim Khattabi, B.P. 511 - 40000 – Marrakech")}</span>
        </div>

        <div className="flex items-center text-white mb-2 space-x-2">
          <Phone className="h-5 w-5 text-white shrink-0" />
          <span>{getContent('contact_telephone', "06 70 09 85 53 / 06 70 09 89 50")}</span>
        </div>

        <div className="flex items-center text-white mb-2 space-x-2">
          <Mail className="h-5 w-5 text-white shrink-0" />
          <span>{getContent('contact_email', "contact@example.com")}</span>
        </div>
      </>
    ) : (
      <p className="text-white/60">Informations de contact non disponibles</p>
    )}
  </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Suivez-nous</h4>
            <div className="flex gap-4">
              <a href="#" aria-label="LinkedIn" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-amber-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-amber-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-amber-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
  
        {/* Bas de page */}
        <div className="pt-6 border-t border-white/10 text-center text-white text-sm">
          &copy; 2025 LISI - Laboratoire d'Informatique et de Systèmes Intelligents. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
  

  
}
export default Footer;
