import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, CheckCircle, MapPin, Phone, Mail } from "lucide-react";
import { contactAPI, ContactFormData } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildImageUrl } from '@/utils/imageUtils';
import { useTranslation } from 'react-i18next';
import { ContactSettings, getMultilingualContent, DEFAULT_CONTACT_SETTINGS } from '@/types/contactSettings';
import GoogleMap from "@/components/common/GoogleMap";
import { useContactSettings } from '@/hooks/useContactSettings';
/**
 * Composant de page Contact
 * Affiche un formulaire de contact avec les informations de l'organisation
 */
const Contact = () => {
  const { i18n,t } = useTranslation('contact');
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const { settings: apiSettings, loading, error, refetch } = useContactSettings();
const [settings, setSettings] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);

useEffect(() => {
  if (apiSettings) {
    setSettings(prev => ({
      ...DEFAULT_CONTACT_SETTINGS,
      ...apiSettings,
    }));
  }
}, [apiSettings]);

  

  const sendMessageMutation = useMutation({
    mutationFn: contactAPI.sendMessage,
    onSuccess: () => {
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast({
        title: t('successTitle'),
        description: t('successDescription'),
      });
    },
    onError: (error) => {
      console.error("Erreur lors de l'envoi:", error);
      toast({
        title: t('errorTitle'),
        description: t('errorDescription'),
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: t('requiredFields'),
        description: t('requiredFieldsDescription'),
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate(formData);
  };

  // Fonction pour récupérer le contenu dans la langue actuelle
  const getContent = (baseKey: string, fallback?: string) => {
    if (!settings) return fallback || '';
    return getMultilingualContent(settings, baseKey, i18n.language, fallback);
  };
  

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={refetch} className="mt-4">
  {t('retry')}
</Button>

            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">{t('successTitle')}</CardTitle>
            <CardDescription>
              {t('successDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setIsSubmitted(false)} 
              variant="outline" 
              className="w-full"
            >
              {t('sendAnotherMessage')}
            </Button>
            <Link to="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToHome')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100">
      <Header />
    
<section 
        className="bg-gradient-to-br from-green-50 to-indigo-100 py-16"
        style={settings.contact_image ? {
          backgroundImage: `url(${buildImageUrl(settings.contact_image)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
      
      {/* Contact Form */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            {getContent('contact_titre', "Contactez-nous")}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            {getContent('contact_sous_titre', "Nous sommes à votre disposition pour répondre à vos questions, discuter de collaborations ou explorer de nouvelles opportunités de recherche.")}
                        </p>
                    </div>
                </div>

        </section>

        {/* Informations de contact et formulaire */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Informations de contact */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                  {getContent('contact_titre2', "Informations de Contact")}
                </h2>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Adresse')}</h3>
                      <p className="text-gray-600" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                        {getContent('contact_adresse', "Av Abdelkrim Khattabi, B.P. 511 - 40000 –Marrakech")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Téléphone')}</h3>
                      <p className="text-gray-600">
                        {settings['contact_telephone'] || "06 70 09 85 53 / 06 70 09 89 50"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Email')}</h3>
                      <p className="text-gray-600">
                        {settings['contact_email'] || "contact@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Carte */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Localisation')}</h3>
                  <GoogleMap 
                    location={settings['contact_location'] || 'Marrakech, Maroc'} 
                    className="w-full h-64 rounded-lg overflow-hidden"
                  />
                </div>
              </div>

              {/* Formulaire de contact */}
              <div>
                <div className="bg-gray-50 rounded-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    {t('sendMessageTitle')}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('name')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('namePlaceholder')}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('email')}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('form.emailPlaceholder')}
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('form.subject')}
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder={t('form.subjectPlaceholder')}
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gren-500 focus:border-transparent"
                      />
                    </div>          
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('form.message')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={t('form.messagePlaceholder')}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {t('form.send')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
     
      <Footer />
    </div>
  );
};

export default Contact; 