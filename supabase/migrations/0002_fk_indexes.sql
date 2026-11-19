-- Cover foreign keys flagged by the Supabase performance advisor.
create index if not exists trips_destination_idx on public.trips (destination_id);
create index if not exists trips_outbound_route_idx on public.trips (outbound_route_id);
create index if not exists trips_return_route_idx on public.trips (return_route_id);
