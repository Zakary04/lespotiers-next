import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductPageClient from '@/components/ProductPageClient';
import { getProductBySlug, getProductsByArtisanId } from '@/lib/db/products';
import { getArtisans } from '@/lib/db/artisans';

interface Props {
  params: { name: string };
}

export async function generateMetadata({ params }: Props) {
  const product = await getProductBySlug(params.name);
  if (!product) return {};
  return {
    title: `${product.name} - Les Potiers de Tanou-Sakassou`,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.name);
  if (!product) notFound();

  const [artisans, artisanProducts] = await Promise.all([
    getArtisans(),
    getProductsByArtisanId(product.artisanId),
  ]);

  const artisan = artisans.find(a => a.id === product.artisanId) ?? null;
  const relatedProducts = artisanProducts
    .filter(p => String(p.id) !== String(product.id))
    .slice(0, 3);

  return (
    <>
      <Header />
      <ProductPageClient
        product={product}
        artisan={artisan}
        relatedProducts={relatedProducts}
      />
      <Footer />
    </>
  );
}
