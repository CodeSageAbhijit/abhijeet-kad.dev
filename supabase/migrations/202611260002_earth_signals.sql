create table if not exists public.earth_signals (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  city text not null default 'Unknown' check (char_length(city) between 1 and 64),
  country text not null default 'EARTH' check (char_length(country) between 1 and 32),
  continent text not null default 'Global' check (char_length(continent) between 1 and 32),
  lat double precision not null check (lat between -90 and 90),
  lon double precision not null check (lon between -180 and 180),
  kind text not null default 'ping' check (kind in ('ping', 'contact')),
  created_at timestamptz not null default now()
);

alter table public.earth_signals enable row level security;
revoke all on table public.earth_signals from public, anon, authenticated;

create or replace function public.earth_relay(action text, payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  visitor uuid := auth.uid();
  v_city text := coalesce(nullif(btrim(payload->>'city'), ''), 'Unknown');
  v_country text := coalesce(nullif(btrim(payload->>'country'), ''), 'EARTH');
  v_continent text := coalesce(nullif(btrim(payload->>'continent'), ''), 'Global');
  v_lat double precision := coalesce((payload->>'lat')::double precision, 0);
  v_lon double precision := coalesce((payload->>'lon')::double precision, 0);
  v_kind text := case when payload->>'kind' = 'contact' then 'contact' else 'ping' end;
  inserted_row earth_signals%rowtype;
  recent_items jsonb;
  total_count bigint;
  continent_count bigint;
begin
  if visitor is null then raise exception 'Session required'; end if;

  if action = 'list' then
    select count(*), count(distinct continent) into total_count, continent_count from earth_signals;
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', s.id,
      'city', s.city,
      'country', s.country,
      'continent', s.continent,
      'lat', s.lat,
      'lon', s.lon,
      'kind', s.kind,
      'created_at', s.created_at
    ) order by s.created_at desc), '[]'::jsonb)
    into recent_items
    from (select * from earth_signals order by created_at desc limit 24) s;

    return jsonb_build_object(
      'total', total_count,
      'continents', continent_count,
      'signals', recent_items
    );
  elsif action = 'send' then
    v_lat := greatest(-85, least(85, v_lat));
    v_lon := greatest(-180, least(180, v_lon));
    v_city := left(v_city, 64);
    v_country := left(v_country, 32);
    v_continent := left(v_continent, 32);

    if exists(
      select 1 from earth_signals
      where sender_id = visitor and created_at > now() - interval '8 seconds'
    ) then
      raise exception 'Relay cooldown active';
    end if;

    insert into earth_signals(sender_id, city, country, continent, lat, lon, kind)
    values (visitor, v_city, v_country, v_continent, v_lat, v_lon, v_kind)
    returning * into inserted_row;

    return jsonb_build_object(
      'id', inserted_row.id,
      'city', inserted_row.city,
      'country', inserted_row.country,
      'continent', inserted_row.continent,
      'lat', inserted_row.lat,
      'lon', inserted_row.lon,
      'kind', inserted_row.kind,
      'created_at', inserted_row.created_at
    );
  end if;

  raise exception 'Unknown earth relay operation';
end $$;

revoke all on function public.earth_relay(text, jsonb) from public, anon;
grant execute on function public.earth_relay(text, jsonb) to authenticated;
