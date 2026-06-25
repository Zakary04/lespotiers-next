'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t.about.title} - Les Artisans de Tanou-Sakassou`;
  }, [t.about.title]);

  return (
    <>
      <Header />

      <div className="pt-32 pb-24 bg-background transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground text-center" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}>
              {t.about.title}
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-16 leading-relaxed">{t.about.subtitle}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="rounded-2xl overflow-hidden shadow-lg border border-border mb-16">
            <img src="https://images.unsplash.com/photo-1685828436575-6c3b5ad01e73" alt="Village de Tanou-Sakassou" className="w-full h-96 object-cover" />
          </motion.div>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>{t.about.historyTitle}</h2>
            <p className="text-lg leading-relaxed text-foreground">{t.about.historyText}</p>
          </motion.section>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-2 gap-6 mb-16">
            <div className="rounded-xl overflow-hidden shadow-lg border border-border">
              <img src="https://images.unsplash.com/photo-1609132400486-87819fecf820" alt="Poterie artisanale" className="w-full h-64 object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg border border-border">
              <img src="https://images.unsplash.com/photo-1633000116322-d7f5cb7d3ebb" alt="Artisan au travail" className="w-full h-64 object-cover" />
            </div>
          </motion.div>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>{t.about.missionTitle}</h2>
            <p className="text-lg leading-relaxed text-foreground">{t.about.missionText}</p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="bg-secondary text-secondary-foreground p-12 rounded-2xl border border-border">
            <h2 className="text-3xl font-bold mb-6 text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>{t.about.ethicsTitle}</h2>
            <p className="text-lg leading-relaxed text-foreground">{t.about.ethicsText}</p>
          </motion.section>
        </div>
      </div>

      <Footer />
    </>
  );
}
