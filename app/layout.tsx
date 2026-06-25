import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Les Potiers de Tanou-Sakassou - Poterie Artisanale',
  description: 'Découvrez les créations uniques des potiers de Tanou-Sakassou, village ancestral de Côte d\'Ivoire. Poterie artisanale façonnée à la main.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
