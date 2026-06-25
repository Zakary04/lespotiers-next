'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Globe, Search, LogIn, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import SearchOverlay from '@/components/SearchOverlay';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ''}`.toUpperCase()
    : (user?.email?.[0] ?? '?').toUpperCase();

  const dashboardHref = profile?.role === 'admin'
    ? '/admin'
    : profile?.role === 'artisan'
    ? '/artisan/tableau-de-bord'
    : null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) =>
    pathname === path || (path === '/potiers' && pathname.startsWith('/potiers/'));

  const navLinks = [
    { path: '/', label: t.nav.home },
    { path: '/boutique', label: t.nav.shop },
    { path: '/potiers', label: t.nav.potiers },
    { path: '/notre-histoire', label: t.nav.about },
    { path: '/contact', label: t.nav.contact },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <img
              src="/logo_transparent.png"
              alt="Les Potiers de Tanou-Sakassou"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 relative pb-1 ${
                  isActive(link.path) ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-2 rounded-full"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/panier">
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(v => !v)}
                  className="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-sm font-bold text-primary transition-colors"
                  aria-label="Menu utilisateur"
                >
                  {initials}
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {profile?.first_name ? `${profile.first_name} ${profile.last_name ?? ''}`.trim() : user.email}
                      </p>
                      {profile?.role && profile.role !== 'client' && (
                        <span className="text-xs text-primary capitalize">{profile.role}</span>
                      )}
                    </div>
                    <Link
                      href="/compte"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Mon compte
                    </Link>
                    {dashboardHref && (
                      <Link
                        href={dashboardHref}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Tableau de bord
                      </Link>
                    )}
                    <button
                      onClick={() => { setIsUserMenuOpen(false); signOut(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/connexion">
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Connexion">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden pb-6 pt-2 bg-background border-t border-border mt-2 rounded-b-xl shadow-lg px-4 absolute left-0 right-0">
            <nav className="flex flex-col gap-4 mt-4">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-semibold tracking-wide transition-colors duration-200 p-2 rounded-md ${
                    isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 sm:hidden mt-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </Button>
            </nav>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <SearchOverlay onClose={() => setIsSearchOpen(false)} />
        )}
      </AnimatePresence>
    </header>
  );
}
