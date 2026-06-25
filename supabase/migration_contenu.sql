-- ==========================================
-- Phase 3.4 — Editable site content (CMS)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public reads — needed so server-rendered pages can fetch content without auth
CREATE POLICY "Public can read settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can write settings (uses SECURITY DEFINER helper from migration_admin.sql)
CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING  (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- Reuse the generic updated_at trigger from migration_auth.sql
CREATE TRIGGER on_site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ---- Seed default values (no-op on conflict so re-running is safe) ----
INSERT INTO public.site_settings (key, value) VALUES
  ('home_hero_title_fr',    'L''art de la terre, façonné à la main depuis des générations'),
  ('home_hero_title_en',    'The art of earth, handcrafted through generations'),
  ('home_hero_subtitle_fr', 'Découvrez les créations uniques des potiers de Tanou-Sakassou, village ancestral de Côte d''Ivoire'),
  ('home_hero_subtitle_en', 'Discover the unique creations of the potters of Tanou-Sakassou, an ancestral village in Côte d''Ivoire'),
  ('home_hero_bg_image',    'https://images.unsplash.com/photo-1563468069504-4bb77fa253a1'),
  ('home_story_text_fr',    ''),
  ('home_story_text_en',    ''),
  ('about_title_fr',        'Notre Histoire'),
  ('about_title_en',        'Our Story'),
  ('about_text_fr',         ''),
  ('about_text_en',         ''),
  ('about_cover_image',     'https://images.unsplash.com/photo-1685828436575-6c3b5ad01e73'),
  ('contact_address',       'Tanou-Sakassou, Côte d''Ivoire'),
  ('contact_email',         'contact@lespotiers.ci'),
  ('contact_phone',         '+225 00 00 00 00')
ON CONFLICT (key) DO NOTHING;
