import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Link, useLocation  } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLogoConfig } from '@/config/logos';
import { navigationItems, languages } from '@/config/navigation';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Logo from '@/components/ui/Logo';
import { useRTL } from '@/hooks/useRTL';
import '@/styles/header.css';

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

const Header: React.FC = () => {
  const { t, i18n } = useTranslation('header');
  const { isRTL, direction, getTextAlignClass, getFlexDirectionClass, getMarginClass } = useRTL();

  // États
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMembresOpen, setIsMembresOpen] = useState(false);
  const [isLaboratoireOpen, setIsLaboratoireOpen] = useState(false);
  const [isRessourcesOpen, setIsRessourcesOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'fr');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  // Effets
  useEffect(() => {
    setCurrentLanguage(i18n.language || 'fr');
  }, [i18n.language]);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollThreshold = 50;
          
          if (currentScrollY > lastScrollY + scrollThreshold && currentScrollY > 100) {
            setIsHeaderVisible(false);
          } else if (currentScrollY < lastScrollY - scrollThreshold) {
            setIsHeaderVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMenuOpen]);

  // Fonctions
  const toggleLanguageDropdown = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };
  
  const handleLanguageChange = (code: string) => {
    setCurrentLanguage(code);
    i18n.changeLanguage(code);
    setIsLanguageOpen(false);
  };

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentLanguage === 'ar') {
      e.currentTarget.src = "/images/logoen.png";
    }
  };

  const logoConfig = getLogoConfig(currentLanguage);

  // Composants internes
  const TopBar = React.memo(() => (
    <div className="bg-gradient-to-r from-[#3f7949] to-green-800 text-white top-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 text-sm">
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline font-medium">
              {/* Espace pour contenu futur */}
            </span>
          </div>
          
          <LanguageSelector currentLanguage={currentLanguage} onChange={handleLanguageChange} languages={languages} />
        </div>
      </div>
    </div>
  ));

  const DesktopNavigation = () => (
    <nav className={`hidden lg:flex items-center space-x-8 ${currentLanguage === 'ar' ? 'space-x-reverse' : ''} nav-desktop`}>
      {navigationItems.map((item) => (
        <NavigationItem key={item.key} item={item} />
      ))}
    </nav>
  );

  const NavigationItem = ({ item }: { item: NavigationItem }) => {
    if (item.hasDropdown && item.dropdownItems) {
      return (
        <div className="relative group">
          <button className="flex items-center text-gray-700 hover:text-[#3ea666] transition-colors font-medium text-base nav-linkk">
            {t(item.label)} 
            <ChevronDown className={`${currentLanguage === 'ar' ? 'mr-1' : 'ml-1'} h-4 w-4 icon-rotate`} />
          </button>
          <div className={`absolute top-full ${currentLanguage === 'ar' ? 'right-0' : 'left-0'} mt-2 w-56 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 dropdown-menu glass-effect`}>
            {item.dropdownItems.map((dropdownItem) => (
              <Link 
                key={dropdownItem.key}
                to={dropdownItem.path} 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium"
              >
                {t(dropdownItem.label)}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link 
        to={item.path} 
        className={`text-gray-700 hover:text-[#3ea666] transition-colors font-medium text-base nav-link ${location.pathname === item.path ? 'text-green-600' : ''}`}
      >
        {t(item.label)}
      </Link>
    );
  };

  const LoginButton = () => (
    <div className="hidden lg:block">
      <Link 
        to="/auth/login" 
        className="bg-[#3ea666] text-white px-4 py-2 rounded-md hover:bg-[#3ea666]/90 transition-colors text-center block font-medium text-sm shadow hover:shadow-md"
      >
        {t('login')}
      </Link>
    </div>
  );

  const MobileMenuButton = () => (
    <button
    aria-haspopup="true" aria-expanded={isMenuOpen}
      className="lg:hidden p-2"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );

  const MobileNavigation = () => (
    isMenuOpen && (
      <div className="lg:hidden border-t py-6 bg-gray-50 mobile-menu nav-mobile">
        <div className="flex flex-col space-y-4">
          <Link to="/index" className="text-gray-700 hover:text-[#3ea666] py-3 font-medium text-base">
            {t('Accueil')}
          </Link>
          
          <Link to="/recherche" className="text-gray-700 hover:text-[#3ea666] py-3 font-medium text-base">
            {t('research')}
          </Link>

          <Link to="/Membres" className="text-gray-700 hover:text-[#3ea666] py-3 font-medium text-base">
            {t('Membres')}
          </Link>
          
          <MobileDropdownMenu
            isOpen={isRessourcesOpen}
            setIsOpen={setIsRessourcesOpen}
            label={t('resources')}
            items={[
              { path: '/projects', label: t('projects') },
              {path: '/prix-distinctions', label: 'prix-distinctions' },               
              { path: '/partenaires', label:t('partners') },
              { path: '/galerie', label: t('gallery') },
              {path: '/rapports-activite', label: t('activity-reports' )}

            ]}
          />
          
          <Link to="/publications" className="text-gray-700 hover:text-[#3ea666] py-3 font-medium text-base">
            {t('publications')}
          </Link>

          <div className="pt-2 border-t border-gray-200"> 
  <Link
    to="/contact"
    className="text-gray-700 hover:text-[#3ea666] py-3 font-medium text-base"
  >
    {t('contact')}
  </Link>
  
  <Link
    to="/auth/login"
    className="bg-[#3ea666] text-white px-3 py-1.5 rounded hover:bg-[#3ea666]/90 transition-colors text-center block font-normal text-xs mt-1.5 shadow-sm"
  >
    {t('login')}
  </Link>
</div>
        </div>
      </div>
    )
  );

  const MobileDropdownMenu = ({ 
    isOpen, 
    setIsOpen, 
    label, 
    items 
  }: { 
    isOpen: boolean; 
    setIsOpen: (open: boolean) => void; 
    label: string; 
    items: { path: string; label: string }[] 
  }) => (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-700 hover:text-green-600 py-3 w-full font-medium text-base"
      >
        {label} 
        <ChevronDown className={`${currentLanguage === 'ar' ? 'mr-1' : 'ml-1'} h-4 w-4 icon-rotate ${isOpen ? 'rotated' : ''}`} />
      </button>
      {isOpen && (
        <div className={`${currentLanguage === 'ar' ? 'mr-4' : 'ml-4'} mt-2 space-y-2`}>
          {items.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className="block text-gray-600 hover:text-[#3ea666] py-2 font-medium"
            >
              {t(item.label)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className={`glass sticky top-0 z-50 transition-all duration-300 ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-2 ">
          <Logo currentLanguage={currentLanguage} getLogoConfig={getLogoConfig} onError={handleLogoError} />
          <DesktopNavigation />
          <LoginButton />
          <MobileMenuButton />
        </div>

        <MobileNavigation />
      </div>
    </header>
  );
};

export default Header;
