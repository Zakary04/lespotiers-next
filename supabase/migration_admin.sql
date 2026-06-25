-- ============================================================
-- Phase 3.3 — Admin: products extensions, orders table,
--             profiles.email column, RLS fixes
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Add stock and is_archived to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock       INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- 2. Add email to profiles (for admin user list)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email for existing users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update the handle_new_user trigger to capture email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, email)
  VALUES (
    NEW.id,
    'client',
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Helper function to get current user role (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- 4. Fix profiles RLS policies (prevent potential recursion)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Profiles: own or admin select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.current_user_role() = 'admin');

CREATE POLICY "Profiles: own non-role update or admin all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.current_user_role() = 'admin')
  WITH CHECK (
    (auth.uid() = id AND role = public.current_user_role())
    OR public.current_user_role() = 'admin'
  );

-- 5. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number     TEXT         UNIQUE NOT NULL,
  user_id          UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email   TEXT         NOT NULL,
  customer_name    TEXT,
  status           TEXT         NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  total_amount     DECIMAL(10,2) NOT NULL,
  items            JSONB        NOT NULL DEFAULT '[]',
  shipping_address JSONB,
  notes            TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ  DEFAULT NOW() NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- 6. Supabase Storage bucket for product images
-- Run these in the Storage section of your Supabase dashboard,
-- or uncomment and run here if using service role key:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Public read product images"
--   ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
--
-- CREATE POLICY "Admins can upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'product-images' AND public.current_user_role() = 'admin');
--
-- CREATE POLICY "Admins can delete product images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'product-images' AND public.current_user_role() = 'admin');
