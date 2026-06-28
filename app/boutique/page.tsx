import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShopClient from '@/components/ShopClient';
import { getProducts } from '@/lib/db/products';
import { getArtisans } from '@/lib/db/artisans';
import { getCategories } from '@/lib/db/categories';

export const metadata = {
  title: 'Boutique - Les Potiers de Tanou-Sakassou',
};

export default async function ShopPage() {
  const [products, artisans, categories] = await Promise.all([
    getProducts(),
    getArtisans(),
    getCategories(),
  ]);

  return (
    <>
      <Header />
      <ShopClient products={products} artisans={artisans} categories={categories} />
      <Footer />
    </>
  );
}
