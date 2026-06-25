'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import NewsletterForm from '@/components/NewsletterForm';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted text-foreground border-t border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">{t.footer.about}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground mb-6">{t.footer.aboutText}</p>
            <div className="flex gap-4 text-foreground">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">{t.footer.quickLinks}</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.nav.home}</Link>
              <Link href="/boutique" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.nav.shop}</Link>
              <Link href="/potiers" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.nav.potiers}</Link>
              <Link href="/notre-histoire" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.nav.about}</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.nav.contact}</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">{t.footer.contact}</h3>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                <span className="leading-relaxed">{t.footer.address}<br />{t.footer.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>+225 07 12 34 56 78</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>contact@potiers-tanou.ci</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">{t.footer.newsletter}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.footer.newsletterText}</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 Les Potiers de Tanou-Sakassou. {t.footer.rights}.</p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="hover:text-primary transition-colors duration-200">{t.footer.legal}</Link>
            <Link href="/politique-confidentialite" className="hover:text-primary transition-colors duration-200">{t.footer.privacy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
