-- ============================================================
-- Phase 3.2 — Cart: cart_items table + RLS
-- Run this in your Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id   TEXT        NOT NULL,
  product_data JSONB       NOT NULL,
  quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own cart
CREATE POLICY "Users can manage own cart"
  ON public.cart_items FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER on_cart_items_updated
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
