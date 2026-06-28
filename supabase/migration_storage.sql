-- Storage policies for product-images bucket
-- "Public" bucket = publicly readable, but uploads still need an explicit INSERT policy.

-- Admins can upload
create policy "Admin can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update (replace) images
create policy "Admin can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete images
create policy "Admin can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Public read (needed if not already set by the bucket's public setting)
create policy "Public can read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');
