-- Tabla de perfiles de usuarios (vinculada a auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  full_name text,
  avatar_url text,
  workspace text,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para users
alter table public.users enable row level security;

create policy "Usuarios pueden ver su propio perfil"
on public.users for select
using ( auth.uid() = id );

create policy "Usuarios pueden actualizar su propio perfil"
on public.users for update
using ( auth.uid() = id );

create policy "Permitir inserción (para hook o autocompletado)"
on public.users for insert
with check ( auth.uid() = id );
