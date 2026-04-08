// src/pages/Recherche.tsx
import  { useState, useEffect, useCallback, useMemo } from 'react';
import { axesApi } from '@/services/api';
import axiosClient from "@/services/axiosClient";
import { Axe, getAxeContent } from '@/types/axe';
import { RechercheSettings, DEFAULT_RECHERCHE_SETTINGS, mergeSettingsWithDefaults,getMultilingualContent } from '@/types/rechercheSettings';
import { Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import { buildImageUrl } from '@/utils/imageUtils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from "react-router-dom";
import TabNavigation from '@/components/common/TabNavigation';
import AxeCard from '@/components/common/AxeCard';
import { useTranslation } from 'react-i18next';


/**
 * Composant de page Recherche
 * Affiche les axes de recherche avec leurs détails et le processus de recherche
 */

const Recherche= () => {
  const { t, i18n } = useTranslation('recherche');
  const [axes, setAxes] = useState<Axe[]>([]);
  const [active, setActive] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<RechercheSettings>(DEFAULT_RECHERCHE_SETTINGS);

   // Fonction utilitaire pour récupérer le contenu dans la langue actuelle
   const getContent = (baseKey: string, fallbackKey: string): string => {
    const result = getMultilingualContent(settings, baseKey, i18n.language, fallbackKey);
    return result !== null ? result : t(fallbackKey);
  };

  // Optimisation avec useCallback pour le chargement des données
  const loadData = useCallback(async () => {
    try {
      setLoading(true); 
      const [settingsRes, axesRes] = await Promise.all([
        axiosClient.get('/api/pages/recherche/settings', {
          headers: { 'Accept': 'application/json' }
        }),
        axesApi.getAxes()
      ]);
  
      // Traitement settings
      if (settingsRes.data) {
        const settingsData = settingsRes.data.data || settingsRes.data;
        const mergedSettings = mergeSettingsWithDefaults(settingsData);
        setSettings(mergedSettings);
      } else {
        setSettings(DEFAULT_RECHERCHE_SETTINGS);
      }
  
      // Traitement axes
      const axesData = Array.isArray(axesRes) ? axesRes : (Array.isArray((axesRes as { data: unknown[] })?.data) ? (axesRes as { data: unknown[] }).data : []);
      if (Array.isArray(axesData)) {
        setAxes(axesData as Axe[]);
        if (axesData.length) setActive((axesData[0] as Axe).slug);
      } else {
        console.error('Format de données invalide pour les axes:', axesRes);
      }
  
    } catch (err: unknown) {
      console.error('Erreur lors du chargement Recherche:', err);
      setError((err as Error).message || 'Erreur lors du chargement des données');
      setSettings(DEFAULT_RECHERCHE_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    loadData()
  }, [loadData])

  // Optimisation avec useMemo pour les cartes des domaines
  const domainCards = useMemo(() => {
    return axes.map((axe) => {
      return (
        <AxeCard 
          key={axe.id} 
          axe={axe} 
          variant="compact"
          onClick={() => {
            setActive(axe.slug);
            // Défilement vers la section des onglets
            setTimeout(() => {
              const tabsSection = document.getElementById('tabs-section');
              if (tabsSection) {
                tabsSection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }, 100);
          }}
          className={active === axe.slug ? 'ring-2 ring-primary' : ''}
        />
      );
    });
  }, [axes, active]);

  // Optimisation avec useMemo pour les onglets de contenu détaillé
  const tabItems = useMemo(() => {
    return axes.map(a => {
      return {
        value: a.slug,
        label: getAxeContent(a, 'title', i18n.language).split(' ')[0],
        content: (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {getAxeContent(a, 'title', i18n.language)}
              </h3>
            </div>
      
            {/* Problématique */}
            <Card>
  <CardHeader className="mb-6">
    <CardTitle className="text-lg text-center">
      {t('cards.problematique')}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-slate-800 leading-relaxed text-lg whitespace-pre-line">
      {getAxeContent(a, 'problematique', i18n.language)}
    </p>
  </CardContent>
</Card>      
            {/* Objectif */}
            <Card>
              <CardHeader className="mb-6">
              <CardTitle className="text-lg text-center">
                  {t('cards.objectif')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-800 leading-relaxed text-lg whitespace-pre-line">
                  {getAxeContent(a, 'objectif', i18n.language)}
                </p>
              </CardContent>
            </Card>
      
            {/* Approche */}
            <Card>
              <CardHeader className="mb-6">
              <CardTitle className="text-lg text-center">
                  {t('cards.approche')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-800 leading-relaxed text-lg whitespace-pre-line">
                  {getAxeContent(a, 'approche', i18n.language)}
                </p>
              </CardContent>
            </Card>
      
            {/* Résultats attendus */}
            <Card>
              <CardHeader className="mb-6">
              <CardTitle className="text-lg text-center">
                  {t('cards.resultats_attendus')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-800 leading-relaxed text-lg whitespace-pre-line">
                  {getAxeContent(a, 'resultats_attendus', i18n.language)}
                </p>
              </CardContent>
            </Card>
          </div>
        )
      };      
    });
  }, [axes, t, i18n.language]);

  // Optimisation avec useMemo pour les étapes du processus
  const processSteps = useMemo(() => {
    const stepCount = 5;
    return Array.from({ length: 5 }).map((_, index) => {
      const stepNumber = (index + 1).toString();
  
      const stepTitle = getContent(
        `step_${stepNumber}_title`,
        `process_steps.step${stepNumber}.title`
      );
      const stepDesc = getContent(
        `step_${stepNumber}_desc`,
        `process_steps.step${stepNumber}.description`
      );
        // Position horizontale en pourcentage
    const positionPercent = (index / (stepCount - 1)) * 100;

      return (
        <div key={stepNumber} className="text-center  h-60 px-2"
        >
          <div className="w-16 h-16 bg-[#3ea666] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
            {stepNumber}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{stepTitle}</h3>
          <p className="text-gray-600 text-sm">{stepDesc}</p>
          {index < 5 && (
            <div className="hidden md:block mt-4">
              <div className="w-full h-0.5 bg-gray-300 relative">
                <div className="absolute right-0 top-0 w-2 h-2 bg-green-600 rounded-full transform translate-x-1 -translate-y-0.75"
                style={{
                  left: i18n.language === 'ar' ? undefined : `${positionPercent}%`,
                  right: i18n.language === 'ar' ? `${positionPercent}%` : undefined,
                  transform: 'translateX(-50%)',
                  position: 'absolute',
                }}
              ></div>
              </div>
            </div>
          )}
        </div>
      );
    });
  }, [settings, t, getContent]);

  // Optimisation avec useCallback pour le changement d'onglet
  const handleTabChange = useCallback((value: string) => {
    setActive(value);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <section 
        className="bg-gradient-to-br from-green-50 to-indigo-100 py-16"
        style={settings.recherche_image ? {
          backgroundImage: `url(${buildImageUrl(settings.recherche_image)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {getContent('titre', 'titre')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {getContent('texte_intro', 'texte_intro')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {getContent('title_strategic', 'strategic.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getContent('subtitle_strategic', 'strategic.subtitle')}
            </p>
          </div>

          <div
  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 items-stretch"
  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
>
            {domainCards}
          </div>
        </div>
      </section>

      <section id="tabs-section" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
            {getContent('title_analysis', 'analysis.title')}
          </h2>

          <TabNavigation
            tabs={tabItems}
            activeTab={active}
            onTabChange={handleTabChange}
            tabsListClassName="grid w-full grid-cols-2 lg:grid-cols-5 mb-8"
            tabsTriggerClassName="text-xs lg:text-sm"
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild size="lg">
              <Link to="/projects">{t('buttons.view_projects')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/publications">{t('buttons.view_publications')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {getContent('title_process', 'process.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {getContent('subtitle_process', 'process.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {processSteps}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Recherche;
