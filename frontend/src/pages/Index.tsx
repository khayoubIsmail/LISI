import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import IconMapper from '@/components/common/IconMapper.tsx'
import { getIconComponent, ICONS } from '@/utils/iconUtils';
import { useIndexSettingsAPI } from '@/hooks/useIndexSettingsAPI';
import DirectorMessage from '@/components/home/DirectorMessage';
import KeyFigures from '@/components/home/KeyFigures';
import AxesRecherche from '@/components/home/Axes_recherche';
import { useTranslation } from 'react-i18next';
import { buildImageUrlWithDefaults } from '@/utils/imageUtils';
import { useLocation } from 'react-router-dom';
import publicationApi from '@/services/publicationApi';

// Interface pour les publications avec support multilingue
interface Publication {
  id: number;
  titre_publication?: string; // Ancienne structure
  titre_publication_fr?: string; // Nouvelle structure
  titre_publication_en?: string;
  titre_publication_ar?: string;
  resume?: string;
  type_publication: string;
  date_publication: string;
  fichier_pdf_url?: string;
  lien_externe_doi?: string;
  reference_complete?: string;
  auteurs?: number[];
}

const ICON_BG_COLORS = [
  "bg-blue-100 group-hover:bg-blue-400 group-hover:text-white",
  "bg-green-100 group-hover:bg-green-400 group-hover:text-white",
  "bg-yellow-100 group-hover:bg-yellow-400 group-hover:text-white",
  "bg-purple-100 group-hover:bg-purple-400 group-hover:text-white",
  "bg-pink-100 group-hover:bg-pink-400 group-hover:text-white",
  "bg-orange-100 group-hover:bg-orange-400 group-hover:text-white",
  "bg-cyan-100 group-hover:bg-cyan-400 group-hover:text-white",
  "bg-indigo-100 group-hover:bg-indigo-400 group-hover:text-white",
];

function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);
}

const Index = () => {
  const { t, i18n } = useTranslation('index');
  useScrollToHash();
  
  const { settings, loading, error, refreshSettings } = useIndexSettingsAPI();
  const [latestPublications, setLatestPublications] = useState<Publication[]>([]);

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.dir = 'rtl';
      document.body.lang = 'ar';
    } else {
      document.body.dir = 'ltr';
      document.body.lang = i18n.language;
    }
  }, [i18n.language]);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await publicationApi.getAll();
        // Trier par date et prendre les 3 plus récentes
        const sorted = response.data.sort((a: Publication, b: Publication) => new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime());
        setLatestPublications(sorted.slice(0, 3));
      } catch (error) {
        console.error("Erreur lors de la récupération des publications:", error);
      }
    };

    fetchPublications();
  }, []);

  // Fonction utilitaire pour récupérer le contenu dans la langue actuelle
  const getContent = (baseKey: string, fallbackKey: string): string => {
    const languageKey = i18n.language as 'fr' | 'ar' | 'en';
    const langSettings = settings[languageKey];
    
    let result = '';
    if (langSettings && typeof langSettings === 'object') {
      const content = langSettings[baseKey as keyof typeof langSettings];
      if (content && content.trim() !== '') {
        result = content;
      }
    }
    
    // Fallback vers la traduction i18n
    if (!result) {
      result = t(fallbackKey);
    }
      return result;
  };

  // Fonction pour récupérer le titre d'une publication selon la langue
  const getPublicationTitle = (publication: Publication): string => {
    const lang = i18n.language as 'fr' | 'ar' | 'en';
    
    // Essayer d'abord avec la nouvelle structure multilingue
    if (publication.titre_publication_fr || publication.titre_publication_en || publication.titre_publication_ar) {
      switch (lang) {
        case 'fr':
          return publication.titre_publication_fr || publication.titre_publication_en || publication.titre_publication_ar || 'Titre non disponible';
        case 'en':
          return publication.titre_publication_en || publication.titre_publication_fr || publication.titre_publication_ar || 'Title not available';
        case 'ar':
          return publication.titre_publication_ar || publication.titre_publication_fr || publication.titre_publication_en || 'العنوان غير متوفر';
        default:
          return publication.titre_publication_fr || publication.titre_publication_en || publication.titre_publication_ar || 'Titre non disponible';
      }
    }
    
    // Fallback vers l'ancienne structure
    return publication.titre_publication || 'Titre non disponible';
  };

  // Statistiques dynamiques
  const stats = [
    { number: settings.nbr_membres, label: t('stats_membres') },
    { number: settings.nbr_publications, label: t('stats_publications') },
    { number: settings.nbr_projets , label: t('stats_projets') },
    { number: settings.nbr_locaux , label: t('stats_locaux') }
  ];

  // Piliers de mission dynamiques avec icônes React
  const dynamicMissionPillars = [
    {
      titleKey: 'pilier_valeur1_titre',
      descriptionKey: 'pilier_valeur1_description',
      icon: ICONS.LIGHTBULB,
      color: 'from-blue-500 to-blue-600'
    },
    {
      titleKey: 'pilier_valeur2_titre',
      descriptionKey: 'pilier_valeur2_description',
      icon: ICONS.USERS,
      color: 'from-purple-500 to-purple-600'
    },
    {
      titleKey: 'pilier_valeur3_titre',
      descriptionKey: 'pilier_valeur3_description',
      icon: ICONS.GLOBE,
      color: 'from-green-500 to-green-600'
    },
    {
      titleKey: 'pilier_valeur4_titre',
      descriptionKey: 'pilier_valeur4_description',
      icon: ICONS.HANDSHAKE,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-gray-600">Chargement...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-lg mx-auto p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {error === 'Request failed with status code 401' 
                ? t('chargement_donnees')
                : t('erreur_chargement')}
            </h2>
            <p className="text-muted-foreground mb-4">
              {error === 'Request failed with status code 401'
                ? t('utilisation_donnees_defaut')
                : error}
            </p>
            {error !== 'Request failed with status code 401' && (
              <button 
                onClick={refreshSettings}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                {t('reessayer')}
              </button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in text-white">
                  {(() => {
                    const titreLigne1 = getContent('hero_titre_principal1', 'hero_titre_principal1');
                    const titreLigne2 = getContent('hero_titre_principal2', 'hero_titre_principal2');
                    const sousTitre = getContent('hero_sous_titre', 'hero_sous_titre');

                  return (
                    <>
                      <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                      <span className="block">{titreLigne1}</span>
                      <span className="block gradient-text">{titreLigne2}</span>
                      </h1>
                      <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-lg">
                        {sousTitre}
                      </p>
                    </>
                  );
                })()}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link
  to="/index#mission"
  className="glass text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl"
  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
>
  {t('decouvrir_mission')}
  <IconMapper
    iconKey="ArrowRight"
    className={`${i18n.language === 'ar' ? 'mr-3' : 'ml-3'} h-5 w-5 group-hover:translate-x-1 transition-transform`}
  />
</Link>

                  <Link
                    to="/axes-recherche"
                    className="border border-[#C2A060] text-[#C2A060] px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-center"
                  >
                    {t('nos_domaines_recherche')}
                  </Link>
                </div>
              </div>

              <div className="relative animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-card rounded-3xl p-8 shadow-2xl border">
                  <img 
                    src={buildImageUrlWithDefaults(settings.hero_image_side)}
                    alt={t('hero_image_side')}
                    className="rounded-2xl w-full h-80 object-cover"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg">
                    <IconMapper iconKey="Microscope" className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DirectorMessage />

        {/* Mission du LISI */}
        <section className="py-20 bg-background" id="mission">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold mb-4">{getContent('mission_sous_titre', 'mission_sous_titre')}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                {getContent('mission_titre', 'mission_titre')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {getContent('mission_description', 'mission_description')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="space-y-6">
                <p className="text-lg text-gray-800 leading-relaxed">
                  {getContent('mission_texte_1', 'mission_texte_1')}
                </p>
                <p className="text-lg text-gray-800 leading-relaxed">
                  {getContent('mission_texte_2', 'mission_texte_2')}
                </p>
              </div>
              <div className="relative ">
                
              <img 
                src={buildImageUrlWithDefaults(settings.mission_image)}
                  alt={t('alt_mission_image')}
                className="relative rounded-2xl shadow-2xl w-full h-85 object-contain border"
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {dynamicMissionPillars.map((pillar, index) => {
                const IconComponent = getIconComponent(pillar.icon);
                return (
                  <div
                  key={index}
                  className="group relative overflow-hidden bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border"
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${ICON_BG_COLORS[index % ICON_BG_COLORS.length]}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{getContent(pillar.titleKey, pillar.titleKey)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{getContent(pillar.descriptionKey, pillar.descriptionKey)}</p>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Chiffres clés */}
        <KeyFigures stats={stats} />

         {/* Actualités */}
         <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <p className="text-primary font-semibold mb-2">{getContent('actualites_sous_titre', 'actualites_sous_titre')}</p>
                <h2 className="text-4xl font-bold text-foreground">{getContent('actualites_titre', 'actualites_titre')}</h2>
              </div>
              <Link
  to="/publications"
  className={`text-primary hover:text-primary/80 flex items-center font-medium group ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}
  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
>
  {t('toutes_actualites')}
  <IconMapper
    iconKey="ArrowRight"
    className={`h-5 w-5 transition-transform ${
      i18n.language === 'ar'
        ? 'mr-1 group-hover:-translate-x-1'
        : 'ml-1 group-hover:translate-x-1'
    }`}
  />
</Link>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPublications.map((item) => (
                <article key={item.id} className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">{new Date(item.date_publication).toLocaleDateString()}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {item.type_publication}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground leading-tight text-lg mb-4">{getPublicationTitle(item)}</h3>

                  <Link to={`/publications/${item.id}`} className={`text-primary hover:text-primary/80 font-medium flex items-center group ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}
  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
>
  {t('lire_suite')}
  <IconMapper
    iconKey="ArrowRight"
    className={`h-5 w-5 transition-transform ${
      i18n.language === 'ar'
        ? 'mr-1 group-hover:-translate-x-1'
        : 'ml-1 group-hover:translate-x-1'
    }`}
  />
</Link>

                  
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Axes de recherche */}
        
          <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold mb-4">
                {getContent('domaines_sous_titre', 'domaines_sous_titre')}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                {getContent('domaines_titre', 'domaines_titre')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {getContent('domaines_description', 'domaines_description')}
              </p>
            </div>
            {<AxesRecherche 
              sousTitre={getContent('domaines_sous_titre', 'domaines_sous_titre')}
              titre={getContent('domaines_titre', 'domaines_titre')}
              description={getContent('domaines_description', 'domaines_description')}
              texteFinal={getContent('domaines_texte_final', 'domaines_texte_final')}
            />}
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-8 max-w-3xl mx-auto">
                {getContent('domaines_texte_final', 'domaines_texte_final')}
              </p>
              <Link 
  to="/axes-recherche" 
  className={`inline-flex items-center bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:scale-105 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}
  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
>
  {t('explorer_recherches')}
  <IconMapper 
    iconKey="ArrowRight" 
    className={`${i18n.language === 'ar' ? 'mr-2' : 'ml-2'} h-5 w-5`} 
  />
</Link>

            </div>
          </div>
        </section>


        {/* Actualités 
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                {getContent('actualites_titre', 'actualites_titre')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {getContent('actualites_description', 'actualites_description')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {DEFAULT_NEWS_ITEMS.map((news, index) => (
                <div key={index} className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border">
                  <div className="w-full h-48 bg-muted rounded-xl mb-4 flex items-center justify-center">
                    <IconMapper iconKey="Newspaper" className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{news.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{news.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{news.date}</span>
                    <Link
                      to="/actualites"
                      className="text-primary hover:text-primary/80 font-medium flex items-center group"
                    >
                      {t('lire_plus')}
                      <IconMapper iconKey="ArrowRight" className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>*/}

      </main>
      <Footer />
    </div>
  );
};

export default Index;