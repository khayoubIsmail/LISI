import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { X, ChevronLeft, ChevronRight, Camera, Calendar } from 'lucide-react';
import { galleryApiService, Gallery as GalleryType } from '@/services/galleryApi';
import { toast } from '@/hooks/use-toast';
import { useGalerieSettings } from '@/hooks/useGalerieSettings';
import { useTranslation } from 'react-i18next';
import { buildImageUrl, buildImageUrlWithDefaults } from '@/utils/imageUtils';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const { settings, loading: settingsLoading, error: settingsError } = useGalerieSettings();
  const { i18n, t } = useTranslation(['galerie', 'translation']);

  const observer = useRef<IntersectionObserver | null>(null);
  const filterCategories = [
    { key: 'all', labelKey: 'all' },
    { key: 'App\\Models\\Partenariat', labelKey: 'partnerships' },
    { key: 'App\\Models\\Projet', labelKey: 'project' },
    { key: 'App\\Models\\PrixDistinction', labelKey: 'prize_distinctions' },
    { key: 'App\\Models\\Publication', labelKey: 'publications' },
    { key: 'App\\Models\\Axe', labelKey: 'axes' },
  ];

  const getCategoryLabel = (type: string | undefined): string => {
    if (!type) return '';
    const category = filterCategories.find(c => c.key === type);
    return category ? t(category.labelKey) : type.split('\\').pop() || '';
  };

  const fetchGalleries = useCallback(async (pageNum: number, category: string, append: boolean) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await galleryApiService.getGalleries(category, pageNum);
      const newGalleries = response.data;

      if (append) {
        setGalleryImages(prev => [...prev, ...newGalleries]);
      } else {
        setGalleryImages(newGalleries);
      }
      
      setHasMore(response.pagination.has_more_pages);
      if (response.pagination.current_page) {
        setPage(response.pagination.current_page + 1);
      }
    } catch (error) {
      toast({
        title: t('translation:toasts.error_title'),
        description: t('galerie:fetch_error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    setGalleryImages([]);
    setPage(1);
    setHasMore(true);
    fetchGalleries(1, selectedType, false);
  }, [selectedType, fetchGalleries]);

  const lastGalleryElementRef = useCallback(node => {
    if (loading || loadingMore || !hasMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchGalleries(page, selectedType, true);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, page, selectedType, fetchGalleries]);  
  
  const handleFilterChange = (key: string) => {
    setSelectedType(key);
    setGalleryImages([]);
    setPage(1);
    setHasMore(true);
    fetchGalleries(1, key, false);
  };

  const getLocalizedContent = useCallback(() => {
    const currentLang = i18n.language;
    let title = '';
    let subtitle = '';

    switch (currentLang) {
      case 'en':
        title = settings.galerie_titre_en || settings.galerie_titre_fr || 'Gallery';
        subtitle = settings.galerie_sous_titre_en || settings.galerie_sous_titre_fr || 'Discover our facilities, projects and memorable moments through this collection of images';
        break;
      case 'ar':
        title = settings.galerie_titre_ar || settings.galerie_titre_fr || 'معرض الصور';
        subtitle = settings.galerie_sous_titre_ar || settings.galerie_sous_titre_fr || 'اكتشف مرافقنا ومشاريعنا واللحظات المهمة من خلال هذه المجموعة من الصور';
        break;
      default: // fr
        title = settings.galerie_titre_fr || 'Galerie';
        subtitle = settings.galerie_sous_titre_fr || 'Découvrez nos installations, projets et moments marquants à travers cette collection d\'images';
        break;
    }

    return { title, subtitle };
  }, [settings, i18n.language]);

  const { title, subtitle } = getLocalizedContent();

  const getLocalizedImageTitle = (image: GalleryType) => {
    const lang = i18n.language;
    if (lang === 'en' && image.title_en) return image.title_en;
    if (lang === 'ar' && image.title_ar) return image.title_ar;
    return image.title_fr || image.title;
  };

  const getLocalizedImageDescription = (image: GalleryType) => {
    const lang = i18n.language;
    if (lang === 'en' && image.description_en) return image.description_en;
    if (lang === 'ar' && image.description_ar) return image.description_ar;
    return image.description_fr || image.description;
  };

  const filteredImages = galleryImages.filter(image => {
    return selectedType === 'all' || image.galleriesable_type === selectedType;
  });

  const openModal = (index: number) => {
    setSelectedImage(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredImages.length - 1 : selectedImage - 1);
    }
  };
  const getLocalizedEntityType = (type: string) => {
    const baseType = type?.split('\\').pop(); // <-- retire le namespace
    const typeMap: { [key: string]: string } = {
      "Projet": "project",
      "Partenariat": "partnerships",
      "Axe": "axes",
      "Publication": "publications",
      "PrixDistinction": "prize_distinctions"
    };
    const translationKey = typeMap[baseType ?? ''] || baseType;
    return t(translationKey ?? '');
  };
  useEffect(() => {
    if (selectedImage !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedImage]);

  useEffect(() => {
    if (selectedImage !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-lg text-gray-600">Chargement...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-red-600">{settingsError}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="bg-gradient-to-br from-green-50 to-indigo-100 py-16"
          style={settings.galerie_image ? {
            backgroundImage: `url(${buildImageUrlWithDefaults(settings.galerie_image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <span className="block">
                  {title}
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
              {filterCategories.map(category => (
                <button
                  key={category.key}
                  onClick={() => handleFilterChange(category.key)}
                  className={`px-4 py-2 rounded-full text-sm md:text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 ${
                    selectedType === category.key
                      ? 'bg-lisiGreen text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-lisiGreen hover:text-white shadow-md'
                  }`}
                >
                  {t(category.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredImages.length === 0 ? (
              <div className="text-center py-16">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('no_images_found')}
                </h3>
                <p className="text-gray-600">
                  {t('no_images_category')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredImages.map((image, index) => (
                  <div
                    key={image.id}
                    ref={index === filteredImages.length - 1 ? lastGalleryElementRef : null}
                    className="group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    onClick={() => openModal(index)}
                  >
                    <div className="relative w-full h-64">
                      <img
                        src={image.image_path}
                        alt={getLocalizedImageTitle(image)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {getCategoryLabel(image.galleriesable_type)}
                      </div>
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h3 className="text-lg font-bold">{getLocalizedImageTitle(image)}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {loadingMore && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
                <div className="text-center">
                  <div className="text-lg text-gray-600">Chargement...</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Modal */}
        {selectedImage !== null && filteredImages[selectedImage] && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full max-h-screen overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                aria-label={t('close_modal')}
              >
                <X className="h-6 w-6 text-white" />
              </button>
              
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                    aria-label={t('previous_image')}
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                    aria-label={t('next_image')}
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}

              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={filteredImages[selectedImage].image_path}
                  alt={getLocalizedImageTitle(filteredImages[selectedImage])}
                  className="w-full max-h-[80vh] object-cover"
                  onError={(e) => {
                    console.error('Erreur de chargement image modal:', filteredImages[selectedImage].image_path);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {getLocalizedImageTitle(filteredImages[selectedImage])}
                    </h3>
                    <span className="bg-lisiGreen text-white px-3 py-1 rounded-full text-sm font-medium">
                      {getLocalizedEntityType(filteredImages[selectedImage].galleriesable_type)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {getLocalizedImageDescription(filteredImages[selectedImage])}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {filteredImages[selectedImage].created_at ? new Date(filteredImages[selectedImage].created_at).toLocaleDateString(i18n.language) : t('unknown_date')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
