-- Track who last edited each restaurant listing

alter table public.restaurants
  add column if not exists updated_at timestamptz,
  add column if not exists updated_by uuid references auth.users (id) on delete set null;

notify pgrst, 'reload schema';
