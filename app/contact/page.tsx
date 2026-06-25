'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = `${t.contact.title} - Les Artisans de Tanou-Sakassou`;
  }, [t.contact.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(t.contact.success);
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <Header />

      <div className="pt-32 pb-24 bg-background transition-colors duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}>
              {t.contact.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t.contact.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <h2 className="text-2xl font-bold mb-8 text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>{t.contact.formTitle}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2 text-foreground">{t.contact.name}</label>
                  <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2 text-foreground">{t.contact.email}</label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2 text-foreground">{t.contact.message}</label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={6} required className="bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary" />
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-none">
                  {isSubmitting ? t.contact.sending : t.contact.send}
                </Button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-8 text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>{t.contact.infoTitle}</h2>
              <div className="space-y-8">
                {[
                  { icon: MapPin, label: 'Adresse', value: t.contact.address },
                  { icon: Phone, label: 'Téléphone', value: t.contact.phone },
                  { icon: Mail, label: 'Email', value: t.contact.email_address },
                  { icon: Clock, label: 'Horaires', value: t.contact.hours },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="bg-muted p-3 rounded-xl border border-border">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1 text-foreground">{label}</p>
                      <p className="text-muted-foreground leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-bold mb-4 text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>{t.contact.findUs}</h3>
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-muted border border-border relative z-0">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-5.0%2C7.5%2C-4.5%2C8.0&layer=mapnik&marker=7.75%2C-4.75"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Map of Tanou-Sakassou"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
