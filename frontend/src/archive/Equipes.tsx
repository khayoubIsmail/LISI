import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react"
import type { Axe } from '../types/membre';
import {useNavigate } from "react-router-dom"
import Header from '../components/Header';
import Footer from '../components/Footer';
import MembreCard from './MembreCard';
import { Users } from "lucide-react"
import TabNavigation from '@/components/common/TabNavigation';
import { axesApi } from '../services/api';

// Lazy load du composant MembreCard pour optimiser le chargement
const LazyMembreCard = lazy(() => import('./MembreCard'));

/**
 * Composant de page Équipe
 * Affiche les membres de l'équipe organisés par axes de recherche avec navigation par onglets
 */
const Equipe: React.FC = () => {
  const [axes, setAxes] = useState<Axe[]>([]);
  const [selectedAxe, setSelectedAxe] = useState<number | null>(null);
  const [axeDetails, setAxeDetails] = useState<Axe | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  // Optimisation avec useCallback pour le chargement des axes
  const loadAxes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axesApi.fetchAll();
      if (response.success && response.data) {
        setAxes(response.data);
        if (response.data.length > 0) {
          setActiveTab(response.data[0].slug);
          setSelectedAxe(response.data[0].id);
        }
      } else {
        setError('Impossible de charger les axes de recherche');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des axes:', err);
      setError('Impossible de charger les axes de recherche');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAxes();
  }, [loadAxes]);

  // Optimisation avec useCallback pour le chargement des détails d'axe
  const loadAxeDetails = useCallback(async () => {
    if (!selectedAxe) return;
    
    try {
      setLoading(true);
      const response = await axesApi.fetchById(selectedAxe);
      if (response.success && response.data) {
        setAxeDetails(response.data);
      } else {
        setError('Erreur lors du chargement des détails de l\'axe');
      }
    } catch (err) {
      setError('Erreur lors du chargement des détails de l\'axe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedAxe]);

  useEffect(() => {
    loadAxeDetails();
  }, [loadAxeDetails]);

  // Optimisation avec useCallback pour la navigation vers un membre
  const handleMembreClick = useCallback((membreId: number) => {
    navigate(`/membres/${membreId}`);
  }, [navigate]);

  // Optimisation avec useMemo pour la configuration des onglets
  const tabItems = useMemo(() => {
    return axes.map((axe) => ({
      value: axe.slug,
      label: axe.title.split(' ')[0],
      content: (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{axe.title}</h3>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {axe.membres.length} membre{axe.membres.length > 1 ? "s" : "" }
              </div>
            </div>

            {axe.membres.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <Suspense fallback={<div className="text-center py-4"><div className="text-sm text-gray-600">Chargement...</div></div>}>
                  {axe.membres.map((membre) => (
                    <LazyMembreCard
                      key={membre.id}
                      membre={membre}
                      onClick={() => handleMembreClick(membre.id)}
                    />
                  ))}
                </Suspense>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Axe en cours de constitution</h4>
                <p className="text-gray-500">Les membres de cet axe seront bientôt annoncés.</p>
              </div>
            )}
          </div>
        </div>
      )
    }));
  }, [axes, handleMembreClick]);

  // Optimisation avec useCallback pour le changement d'onglet
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    const axe = axes.find(a => a.slug === value);
    if (axe) {
      setSelectedAxe(axe.id);
    }
  }, [axes]);



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section 
        className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="block">Notre Équipe</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez les experts qui font avancer l'innovation dans notre laboratoire
            </p>
          </div>
        </div>
      </section>

      {/* Axes Tabs */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
            Axes de Recherche
          </h2>
          <TabNavigation
            tabs={tabItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabsListClassName="grid w-full grid-cols-2 lg:grid-cols-5 mb-8"
            tabsTriggerClassName="text-xs lg:text-sm"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Equipe;