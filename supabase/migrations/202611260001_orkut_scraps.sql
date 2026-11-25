create table if not exists public.orkut_scraps (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  sender_name text not null default 'Anonymous' check (char_length(sender_name) between 1 and 40),
  message text not null check (char_length(message) between 1 and 180),
  created_at timestamptz not null default now()
);

alter table public.orkut_scraps enable row level security;
revoke all on table public.orkut_scraps from public, anon, authenticated;

create or replace function public.orkut_scrapbook(action text, payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  visitor uuid := auth.uid();
  raw_msg text := btrim(coalesce(payload->>'message', ''));
  raw_name text := coalesce(nullif(btrim(payload->>'sender_name'), ''), 'Anonymous');
  inserted_row orkut_scraps%rowtype;
  items jsonb;
begin
  if visitor is null then raise exception 'Session required'; end if;

  if action = 'list' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', s.id,
      'from', s.sender_name,
      'msg', s.message,
      'created_at', s.created_at
    ) order by s.created_at desc), '[]'::jsonb)
    into items
    from (select * from orkut_scraps order by created_at desc limit 50) s;
    return items;
  elsif action = 'post' then
    if char_length(raw_msg) not between 1 and 180 then
      raise exception 'Scrap must be 1 to 180 characters';
    end if;
    if char_length(raw_name) > 40 then
      raw_name := left(raw_name, 40);
    end if;
    if exists(select 1 from orkut_scraps where author_id = visitor and created_at > now() - interval '15 seconds') then
      raise exception 'Wait a moment before posting another scrap';
    end if;
    insert into orkut_scraps(author_id, sender_name, message)
    values (visitor, raw_name, raw_msg)
    returning * into inserted_row;

    return jsonb_build_object(
      'id', inserted_row.id,
      'from', inserted_row.sender_name,
      'msg', inserted_row.message,
      'created_at', inserted_row.created_at
    );
  end if;

  raise exception 'Unknown scrapbook operation';
end $$;

revoke all on function public.orkut_scrapbook(text, jsonb) from public, anon;
grant execute on function public.orkut_scrapbook(text, jsonb) to authenticated;
