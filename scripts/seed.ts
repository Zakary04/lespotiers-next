/**
 * Seed script — populates Supabase with data from the static files.
 *
 * Prerequisites:
 *   1. Run `supabase/schema.sql` in the Supabase SQL editor first.
 *   2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (service role bypasses RLS).
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import { artisans } from '../data/artisans';
import { products } from '../data/products';

// Load env vars from .env.local (tsx does not auto-load them)
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedArtisans() {
  console.log('\n→ Seeding artisans…');
  for (const a of artisans) {
    const { error } = await supabase.from('artisans').upsert({
      id: a.id,
      slug: a.slug,
      name: a.name,
      title: a.title,
      experience: a.experience ?? null,
      years_experience: a.yearsExperience ?? null,
      short_bio: a.shortBio ?? a.bio ?? null,
      biography: a.biography,
      philosophy: a.philosophy,
      techniques: a.techniques,
      portrait_image: a.portraitImage,
      quote: a.quote ?? null,
      specialties: a.specialties,
      location: a.location ?? null,
    });
    if (error) {
      console.error(`  ✗ ${a.name}:`, error.message);
    } else {
      console.log(`  ✓ ${a.name}`);
    }
  }
}

async function seedProducts() {
  console.log('\n→ Seeding products…');
  for (const p of products) {
    const { error } = await supabase.from('products').upsert({
      id: String(p.id),
      slug: p.slug ?? null,
      name: p.name,
      artisan_name: p.artisan,
      artisan_id: p.artisanId,
      category: p.category,
      price: p.price,
      images: p.images,
      description_fr_poetic: p.description.fr.poetic,
      description_fr_technical: p.description.fr.technical,
      description_en_poetic: p.description.en.poetic,
      description_en_technical: p.description.en.technical,
      dimensions: p.dimensions,
      materials: p.materials,
      techniques: p.techniques,
      is_new: p.isNew,
      features: p.features ?? null,
    });
    if (error) {
      console.error(`  ✗ ${p.name}:`, error.message);
    } else {
      console.log(`  ✓ ${p.name}`);
    }
  }
}

(async () => {
  await seedArtisans();
  await seedProducts();
  console.log('\nDone.\n');
})();
