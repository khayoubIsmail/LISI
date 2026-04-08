import React from 'react';
import { useTranslation } from 'react-i18next';

export interface KeyFigure {
  number: string | number;
  label: string;
}

export interface KeyFiguresProps {
  stats: KeyFigure[];
}

const KeyFigures: React.FC<KeyFiguresProps> = ({ stats }) => {
  const { t } = useTranslation('index');
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-purple-100/30"></div>
      {/* CHIFFRES CLÉS */}
      <div className="glass rounded-3xl py-16 px-8 max-w-7xl mx-auto relative">
        <p className="text-primary font-semibold mb-6 text-center text-lg">{t('chiffres_cles_sous_titre')}</p>
        <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-12 text-center">{t('chiffres_cles_titre')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="glass hover-lift p-8 rounded-2xl text-center animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="text-5xl font-bold gradient-text mb-3">{stat.number}</div>
              <div className="text-gray-700 font-semibold text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

  );
};

export default KeyFigures;