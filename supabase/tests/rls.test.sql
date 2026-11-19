begin;
select plan(8);

insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.destinations (id, name_vi, name_en, province_vi, province_en, region, verified, lat, lng)
  values ('test-dest', 'Thử', 'Test', 'Tỉnh', 'Province', 'bac', true, 21, 105);
insert into public.trips (id, owner_id, destination_id, start_date, days, nights, party_size, budget_vnd, budget_scope, transport)
  values ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000000b', 'test-dest',
          '2026-11-21', 3, 2, 4, 8000000, 'group', 'coach_grab');

-- anon
set local role anon;
select isnt_empty($$ select 1 from public.destinations $$, 'anon can read destinations');
select lives_ok($$ select 1 from public.places $$, 'anon can read places');
select lives_ok($$ select 1 from public.bus_routes $$, 'anon can read bus routes');
select is_empty($$ select 1 from public.trips $$, 'anon sees no trips');
reset role;

-- user A
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
select is_empty($$ select 1 from public.trips where owner_id = '00000000-0000-0000-0000-00000000000b' $$,
  'user A cannot read user B trip');
select lives_ok($$ insert into public.trips (owner_id, destination_id, start_date, days, nights, party_size, budget_vnd, budget_scope, transport)
  values ('00000000-0000-0000-0000-00000000000a', 'test-dest', '2026-11-21', 3, 2, 2, 5000000, 'person', 'motorbike') $$,
  'user A can insert own trip');
select throws_ok($$ insert into public.trips (owner_id, destination_id, start_date, days, nights, party_size, budget_vnd, budget_scope, transport)
  values ('00000000-0000-0000-0000-00000000000b', 'test-dest', '2026-11-21', 3, 2, 2, 5000000, 'person', 'motorbike') $$,
  '42501', null, 'user A cannot insert a trip for user B');
select throws_ok($$ insert into public.trips (owner_id, destination_id, start_date, days, nights, party_size, budget_vnd, budget_scope, transport)
  values ('00000000-0000-0000-0000-00000000000a', 'test-dest', '2026-11-21', 2, 3, 2, 5000000, 'person', 'motorbike') $$,
  '23514', null, 'nights > days is rejected');
reset role;

select * from finish();
rollback;
