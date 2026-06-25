-- ============================================================
-- Les Potiers de Tanou-Sakassou — Database Schema
-- Run this in the Supabase SQL editor (Database > SQL Editor)
-- ============================================================

-- Artisans table
CREATE TABLE IF NOT EXISTS artisans (
  id               INTEGER PRIMARY KEY,
  slug             TEXT    UNIQUE NOT NULL,
  name             TEXT    NOT NULL,
  title            TEXT    NOT NULL,
  experience       TEXT,
  years_experience INTEGER,
  short_bio        TEXT,
  biography        TEXT[]  NOT NULL DEFAULT '{}',
  philosophy       TEXT    NOT NULL,
  techniques       TEXT    NOT NULL,
  portrait_image   TEXT    NOT NULL,
  quote            TEXT,
  specialties      TEXT[]  NOT NULL DEFAULT '{}',
  location         TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id                      TEXT    PRIMARY KEY,
  slug                    TEXT    UNIQUE,
  name                    TEXT    NOT NULL,
  artisan_name            TEXT    NOT NULL,
  artisan_id              INTEGER REFERENCES artisans(id),
  category                TEXT    NOT NULL CHECK (category IN ('vases', 'bowls', 'jars', 'decorative')),
  price                   NUMERIC(10, 2) NOT NULL,
  images                  TEXT[]  NOT NULL DEFAULT '{}',
  description_fr_poetic   TEXT,
  description_fr_technical TEXT,
  description_en_poetic   TEXT,
  description_en_technical TEXT,
  dimensions              TEXT,
  materials               TEXT,
  techniques              TEXT,
  is_new                  BOOLEAN DEFAULT false,
  features                TEXT[],
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE products  ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key can SELECT)
CREATE POLICY "Public artisans are viewable by everyone"
  ON artisans FOR SELECT USING (true);

CREATE POLICY "Public products are viewable by everyone"
  ON products FOR SELECT USING (true);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS products_artisan_id_idx ON products (artisan_id);
CREATE INDEX IF NOT EXISTS products_category_idx   ON products (category);
CREATE INDEX IF NOT EXISTS products_is_new_idx     ON products (is_new);
