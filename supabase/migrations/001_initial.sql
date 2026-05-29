-- Restaurants and happy-hour specials for STA Happy Hour

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  website text not null,
  logo_url text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create table public.specials (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  title text not null,
  description text not null,
  days jsonb not null default '[]'::jsonb,
  all_day boolean not null default false,
  start_time text,
  end_time text
);

create index specials_restaurant_id_idx on public.specials (restaurant_id);
create index restaurants_name_idx on public.restaurants (name);

alter table public.restaurants enable row level security;
alter table public.specials enable row level security;

-- Public read
create policy "restaurants_select_public"
  on public.restaurants for select
  using (true);

create policy "specials_select_public"
  on public.specials for select
  using (true);

-- Authenticated write
create policy "restaurants_insert_authenticated"
  on public.restaurants for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "restaurants_update_authenticated"
  on public.restaurants for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "restaurants_delete_authenticated"
  on public.restaurants for delete
  to authenticated
  using (auth.uid() is not null);

create policy "specials_insert_authenticated"
  on public.specials for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "specials_update_authenticated"
  on public.specials for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "specials_delete_authenticated"
  on public.specials for delete
  to authenticated
  using (auth.uid() is not null);
