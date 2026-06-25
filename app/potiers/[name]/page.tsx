import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArtisanPageClient from '@/components/ArtisanPageClient';
import { getArtisanBySlug } from '@/lib/db/artisans';
import { getProductsByArtisanId } from '@/lib/db/products';

interface Props {
  params: { name: string };
}

export async function generateMetadata({ params }: Props) {
  const artisan = await getArtisanBySlug(params.name);
  if (!artisan) return {};
  return {
    title: `${artisan.name} - ${artisan.title}`,
  };
}

export default async function ArtisanDetailPage({ params }: Props) {
  const artisan = await getArtisanBySlug(params.name);
  if (!artisan) notFound();

  const products = await getProductsByArtisanId(artisan.id);

  return (
    <>
      <Header />
      <ArtisanPageClient artisan={artisan} products={products} />
      <Footer />
    </>
  );
}
