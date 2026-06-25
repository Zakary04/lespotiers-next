import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShopClient from '@/components/ShopClient';
import { getProducts } from '@/lib/db/products';
import { getArtisans } from '@/lib/db/artisans';

export const metadata = {
  title: 'Boutique - Les Potiers de Tanou-Sakassou',
};

export default async function ShopPage() {
  const [products, artisans] = await Promise.all([
    getProducts(),
    getArtisans(),
  ]);

  return (
    <>
      <Header />
      <ShopClient products={products} artisans={artisans} />
      <Footer />
    </>
  );
}
