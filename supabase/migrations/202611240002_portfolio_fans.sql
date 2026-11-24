create table public.portfolio_fans (visitor uuid primary key);
alter table public.portfolio_fans enable row level security;
revoke all on public.portfolio_fans from public, anon, authenticated;

create function public.portfolio_fan_total(become_fan boolean default false)
returns bigint language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if become_fan then
    insert into public.portfolio_fans values (auth.uid()) on conflict do nothing;
  end if;
  return (select count(*) from public.portfolio_fans);
end;
$$;
revoke all on function public.portfolio_fan_total(boolean) from public, anon;
grant execute on function public.portfolio_fan_total(boolean) to authenticated;
