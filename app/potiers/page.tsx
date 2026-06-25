import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArtisansListClient from '@/components/ArtisansListClient';
import { getArtisans } from '@/lib/db/artisans';
import { getProducts } from '@/lib/db/products';

export const metadata = {
  title: 'Nos Potiers - Les Potiers de Tanou-Sakassou',
};

export default async function ArtisansPage() {
  const [artisans, products] = await Promise.all([
    getArtisans(),
    getProducts(),
  ]);

  const productCounts = artisans.reduce<Record<number, number>>((acc, artisan) => {
    acc[artisan.id] = products.filter(p => p.artisanId === artisan.id).length;
    return acc;
  }, {});

  return (
    <>
      <Header />
      <ArtisansListClient artisans={artisans} productCounts={productCounts} />
      <Footer />
    </>
  );
}
