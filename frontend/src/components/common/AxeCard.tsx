// Import des dépendances React et types personnalisés
import React from 'react'; 
import { Axe, getAxeContent } from '@/types/axe';

// Import des icônes depuis lucide-react
import {
  Brain, Shield, Network, Database, Smartphone,SatelliteDish,Eye,Mic, MessageCircle,Bot,
  TrendingUp // par défaut si l'icône n'existe pas
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

// Mapping entre une chaîne de caractère (slug) et une icône React
const iconMap: Record<string, React.ComponentType> = {
    Brain,
    Shield,
    Network,
    Database,
    Smartphone,
    SatelliteDish,
    Eye,
    Mic, 
    MessageCircle,
    Bot,
};

// Définition des props du composant
interface AxeCardProps {
  axe: Axe;
  variant?: 'compact' | 'detailed';
  onClick?: () => void;
  className?: string;
}

// Composant principal AxeCard
const AxeCard: React.FC<AxeCardProps> = ({ 
  axe, 
  variant = 'compact', 
  onClick,
  className = ''
}) => {
    const { i18n } = useTranslation();

    // Choisir dynamiquement l’icône selon le champ `icon`
    const Icon = iconMap[axe.icon as string] || TrendingUp;
    
    // Extraire les champs traduits depuis l'objet Axe
    const title = getAxeContent(axe, 'title', i18n.language);
    const problematique = getAxeContent(axe, 'problematique', i18n.language);
    const isArabic = i18n.language === 'ar';
    
    // Fonction de clic personnalisée
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) {
        onClick();
      }
    };
    
  //  Variante "compacte"
  if (variant === 'compact') {
    return (
      <div
        className={`group glass hover-lift rounded-2xl p-6 cursor-pointer animate-fade-in ${className}`}
        onClick={handleClick}
      >
        <div className={`flex items-start ${isArabic ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-2 leading-tight text-lg">
              {title}
            </h3>
            {problematique && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {problematique.length > 100 ? `${problematique.substring(0, 100)}...` : problematique}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
};
export default AxeCard;