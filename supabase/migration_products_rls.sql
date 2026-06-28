-- RLS write policies for the products table.
-- The SELECT policy ("Public products are viewable by everyone") already exists in schema.sql.
-- RLS is already enabled on the table — no need to re-run ALTER TABLE.

-- Admins can insert new products
create policy "Admin can insert products"
  on public.products for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update existing products
create policy "Admin can update products"
  on public.products for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete products
create policy "Admin can delete products"
  on public.products for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Drop the hardcoded category CHECK constraint.
-- It blocks any category created via /admin/categories that isn't one of the original 4.
-- Referential integrity is now enforced at the application layer via the categories table.
alter table public.products
  drop constraint if exists products_category_check;
