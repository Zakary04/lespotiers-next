-- ============================================================
-- Phase 3.4 — Checkout: RLS policies for order creation
-- Run this in your Supabase SQL editor
-- ============================================================

-- Allow authenticated users to insert their own orders
-- and anonymous users to insert guest orders (user_id IS NULL)
CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR user_id = auth.uid()
  );

-- Allow users to view orders by order_number (for confirmation page)
-- This supplements the existing "Users can view own orders" policy
CREATE POLICY "Users can view orders by email"
  ON public.orders FOR SELECT
  USING (customer_email = auth.email());
