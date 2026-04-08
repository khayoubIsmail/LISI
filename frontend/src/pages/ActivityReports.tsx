import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContent from '../components/common/PageContent';
import { useActivityReports } from '../hooks/useActivityReports';
import { useActivityReportsSettings } from '../hooks/useActivityReportsSettings';

const ActivityReports: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openYears, setOpenYears] = useState<number[]>([]);

  // Utiliser les hooks personnalisés
  const {
    reportsByYear,
    isLoading: reportsLoading,
    error: reportsError,
    handleView,
    handleDownload
  } = useActivityReports({
    searchTerm: searchQuery
  });

  const {
    settings,
    isLoading: settingsLoading,
    error: settingsError,
    getLocalizedText
  } = useActivityReportsSettings();

  const toggleYear = (year: number) => {
    setOpenYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  // États de chargement et d'erreur
  const isLoading = reportsLoading || settingsLoading;
  const error = reportsError || settingsError;

  // Textes localisés
  const title = getLocalizedText('titre', 'Rapports d\'Activité');
  const subtitle = getLocalizedText('sous_titre', 'Découvrez les rapports d\'activité annuels de notre laboratoire');
  const description = getLocalizedText('description', 'Le rapport d\'activité du laboratoire présente une sélection des résultats scientifiques des recherches menées, le plus souvent en collaboration avec les universités, les organismes de recherche, les grandes écoles, les entreprises et les institutions de recherche étrangères.');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Chargement...</div>
        </div>
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
    <div className="min-h-screen bg-white">
      <Header />

      <PageContent hero title={title} subtitle={subtitle} backgroundImage={settings.activity_reports_image}>
        <></>
      </PageContent>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg">{description}</p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Barre de recherche */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par année..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Message si aucun rapport */}
          {reportsByYear.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport disponible</h3>
              <p className="text-gray-600">Les rapports d'activité seront disponibles prochainement.</p>
            </div>
          )}

          {/* Liste des rapports par année */}
          <div className="space-y-6">
            {reportsByYear.map(({ year, reports }) => (
              <div key={year} id={`rapport-${year}`} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleYear(year)}
                  className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Rapport d'Activité {year}
                    </h3>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {reports.length} rapport{reports.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      openYears.includes(year) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openYears.includes(year) && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Rapport d'Activité {year}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(report.report_date).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(report);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Voir
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(report);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-transparent rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Télécharger
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation rapide en bas */}
          {reportsByYear.length > 0 && (
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Navigation rapide
              </h3>
              <div className="flex flex-wrap gap-2">
                {reportsByYear.map(({ year }) => (
                  <a
                    key={year}
                    href={`#rapport-${year}`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                  >
                    {year}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ActivityReports;
