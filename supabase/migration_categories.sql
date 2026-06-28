-- Categories table
create table if not exists public.categories (
  id         serial primary key,
  slug       text not null unique,
  label_fr   text not null,
  label_en   text not null,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- Anyone can read categories (needed for public shop)
create policy "Public can read categories"
  on public.categories for select
  using (true);

-- Only admins can insert / update / delete
create policy "Admin can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Seed the 4 existing categories
insert into public.categories (slug, label_fr, label_en) values
  ('vases',      'Vases',      'Vases'),
  ('bowls',      'Bols',       'Bowls'),
  ('jars',       'Jarres',     'Jars'),
  ('decorative', 'Décoratifs', 'Decorative')
on conflict (slug) do nothing;
