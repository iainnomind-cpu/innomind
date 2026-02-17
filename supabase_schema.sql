-- Crear la tabla de clientes
create table public.clientes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nombre text not null,
  email text not null,
  telefono text,
  empresa text,
  estado text default 'prospecto',
  valor_estimado numeric default 0,
  notas text,
  ultima_actualizacion timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
alter table public.clientes enable row level security;

-- Política para permitir lectura a todos (o ajustar según auth)
create policy "Permitir lectura para todos"
on public.clientes for select
using (true);

-- Política para permitir inserción a todos
create policy "Permitir inserción para todos"
on public.clientes for insert
with check (true);

-- Política para permitir actualización a todos
create policy "Permitir actualización para todos"
on public.clientes for update
using (true);

-- Política para permitir eliminación a todos
create policy "Permitir eliminación para todos"
on public.clientes for delete
using (true);
