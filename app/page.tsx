export const revalidate = 0

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeClient from '@/components/HomeClient';
import { getProductsBestsellers, getNewProducts } from '@/lib/db/products';
import { getArtisans } from '@/lib/db/artisans';

export default async function HomePage() {
  const [bestsellers, newProducts, artisans] = await Promise.all([
    getProductsBestsellers(6),
    getNewProducts(),
    getArtisans(),
  ]);

  return (
    <>
      <Header />
      <HomeClient bestsellers={bestsellers} newProducts={newProducts} artisans={artisans} />
      <Footer />
    </>
  );
}
