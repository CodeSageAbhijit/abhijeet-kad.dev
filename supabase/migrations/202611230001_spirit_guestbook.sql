create schema if not exists spirit_private;
revoke all on schema spirit_private from public, anon, authenticated;

create table spirit_private.homes (
  id text primary key,
  section text not null,
  active boolean not null default true
);
insert into spirit_private.homes (id, section) values
  ('hero','Welcome'), ('search','Computer'), ('overview','Overview'), ('work','Experience'),
  ('projects','Projects'), ('contact','Contact'), ('retro','XP portfolio');

create table spirit_private.notes (
  id uuid primary key,
  author_id uuid not null,
  home text not null references spirit_private.homes(id),
  body text not null check (char_length(trim(body)) between 1 and 180),
  created_at timestamptz not null default now()
);
create index on spirit_private.notes(home);
create index on spirit_private.notes(author_id, created_at);
create table spirit_private.reads (
  reader_id uuid not null,
  note_id uuid not null references spirit_private.notes(id),
  primary key(reader_id, note_id)
);
create index on spirit_private.reads(note_id);

-- The RPC exposes messages and aggregate counts, never visitor identifiers.
create function public.spirit_guestbook(action text, payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = pg_catalog, spirit_private as $$
declare
  visitor uuid := auth.uid();
  place text := payload->>'home';
  note notes%rowtype;
  message text := trim(payload->>'body');
  result jsonb;
begin
  if visitor is null then raise exception 'Session required'; end if;
  if action = 'release' then
    if message is null or char_length(message) not between 1 and 180 then raise exception 'Write 1 to 180 characters'; end if;
    -- Serialize the short placement decision so simultaneous releases stay balanced.
    perform pg_advisory_xact_lock(691823014);
    select * into note from notes where id = (payload->>'id')::uuid and author_id = visitor;
    if not found then
      if exists(select 1 from notes where author_id = visitor and created_at > now() - interval '30 seconds') then
        raise exception 'Give your last spark a moment before sending another';
      end if;
      select h.id into place from homes h left join notes n on n.home=h.id
        where h.active group by h.id order by count(n.id), random() limit 1;
      insert into notes(id,author_id,home,body) values ((payload->>'id')::uuid,visitor,place,message) returning * into note;
    end if;
    return jsonb_build_object('home',note.home);
  elsif action = 'read' then
    insert into reads select visitor,n.id from notes n where n.id=(payload->>'id')::uuid and n.author_id<>visitor
      on conflict do nothing;
    return '{}'::jsonb;
  elsif action = 'open' then
    select n.* into note from notes n where n.home=place
      and (payload->>'exclude' is null or n.id<>(payload->>'exclude')::uuid)
      and (coalesce((payload->>'revisit')::boolean,false) or
        (n.author_id<>visitor and not exists(select from reads r where r.note_id=n.id and r.reader_id=visitor)))
      order by (select count(*) from reads r where r.note_id=n.id), random() limit 1;
    if not found then return 'null'::jsonb; end if;
    return jsonb_build_object('id',note.id,'body',note.body);
  elsif action = 'homes' then
    with counts as (
      select n.home,n.author_id, (select count(*) from reads r where r.note_id=n.id) as discoveries,
        not exists(select from reads r where r.note_id=n.id and r.reader_id=visitor) and n.author_id<>visitor as unread
        from notes n
    )
    select jsonb_object_agg(id,stats) into result from (
      select h.id,jsonb_build_object('total',count(c.home),'unread',count(*) filter(where c.unread),
        'priority',min(c.discoveries) filter(where c.unread)) stats
      from homes h left join counts c on c.home=h.id where h.active group by h.id
    ) s;
    return result;
  end if;
  raise exception 'Unknown guestbook operation';
end $$;
revoke all on function public.spirit_guestbook(text,jsonb) from public, anon;
grant execute on function public.spirit_guestbook(text,jsonb) to authenticated;
