create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles select" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create table public.estoque (
  codigo text primary key,
  quantidade integer not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.estoque to anon, authenticated;
grant insert, update, delete on public.estoque to authenticated;
grant all on public.estoque to service_role;
alter table public.estoque enable row level security;
create policy "estoque public read" on public.estoque for select to anon, authenticated using (true);
create policy "estoque admin insert" on public.estoque for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "estoque admin update" on public.estoque for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "estoque admin delete" on public.estoque for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where lower(email) = 'marksimportssp@gmail.com'
on conflict do nothing;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  IF lower(COALESCE(NEW.email, '')) = 'marksimportssp@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $function$;