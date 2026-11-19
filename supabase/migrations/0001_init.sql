-- TripMate initial schema. Reference data is public read; trips are owner-only.

create table public.destinations (
  id text primary key,
  name_vi text not null,
  name_en text not null,
  province_vi text not null,
  province_en text not null,
  region text not null check (region in ('bac', 'trung', 'nam')),
  verified boolean not null default false,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180)
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  destination_id text not null references public.destinations (id),
  google_place_id text not null unique,
  category text not null check (category in ('sight', 'food', 'stay', 'cafe', 'market')),
  name_vi text not null,
  name_en text not null,
  price_vnd integer not null default 0 check (price_vnd >= 0),
  price_note_vi text,
  price_note_en text,
  duration_min integer not null check (duration_min > 0),
  indoor boolean not null default false,
  lat double precision not null,
  lng double precision not null,
  coords_checked_at timestamptz,
  price_verified_at date
);
create index places_destination_idx on public.places (destination_id);

create table public.bus_routes (
  id uuid primary key default gen_random_uuid(),
  from_city text not null,
  to_destination_id text not null references public.destinations (id),
  operator text not null,
  kind text not null check (kind in ('sleeper', 'limousine', 'coach')),
  depart_time time not null,
  arrive_time time not null,
  overnight boolean not null default false,
  price_vnd integer not null check (price_vnd >= 0),
  pickup_vi text,
  phone text,
  verified_at date,
  unique (operator, from_city, to_destination_id, depart_time)
);
create index bus_routes_destination_idx on public.bus_routes (to_destination_id);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  destination_id text not null references public.destinations (id),
  start_date date not null,
  days integer not null check (days between 1 and 14),
  nights integer not null check (nights between 0 and 13),
  party_size integer not null check (party_size between 1 and 20),
  budget_vnd integer not null check (budget_vnd > 0),
  budget_scope text not null check (budget_scope in ('group', 'person')),
  transport text not null check (transport in ('motorbike', 'coach_grab')),
  outbound_route_id uuid references public.bus_routes (id),
  return_route_id uuid references public.bus_routes (id),
  created_at timestamptz not null default now(),
  constraint nights_not_more_than_days check (nights <= days)
);
create index trips_owner_idx on public.trips (owner_id);

create table public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_index integer not null check (day_index >= 0),
  position integer not null check (position >= 0),
  place_id uuid not null references public.places (id),
  unique (trip_id, day_index, position) deferrable initially deferred
);
create index trip_items_place_idx on public.trip_items (place_id);

create table public.review_queue (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id text,
  proposed jsonb not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.destinations enable row level security;
alter table public.places enable row level security;
alter table public.bus_routes enable row level security;
alter table public.trips enable row level security;
alter table public.trip_items enable row level security;
alter table public.review_queue enable row level security;

create policy "public read destinations" on public.destinations for select to anon, authenticated using (true);
create policy "public read places" on public.places for select to anon, authenticated using (true);
create policy "public read bus routes" on public.bus_routes for select to anon, authenticated using (true);

create policy "owner reads trips" on public.trips for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "owner inserts trips" on public.trips for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "owner updates trips" on public.trips for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owner deletes trips" on public.trips for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "owner manages trip items" on public.trip_items for all to authenticated
  using (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())));

-- review_queue: no policies, so only the service role (bypasses RLS) can touch it.
