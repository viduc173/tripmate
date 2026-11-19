-- Reorder one day of a trip in a single statement. Runs as the caller, so RLS still applies.
create or replace function public.reorder_trip_items(p_trip_id uuid, p_day_index integer, p_item_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.trip_items ti
     set position = o.ord - 1
    from unnest(p_item_ids) with ordinality as o(id, ord)
   where ti.id = o.id
     and ti.trip_id = p_trip_id
     and ti.day_index = p_day_index;
$$;

revoke execute on function public.reorder_trip_items(uuid, integer, uuid[]) from public, anon;
grant execute on function public.reorder_trip_items(uuid, integer, uuid[]) to authenticated;
