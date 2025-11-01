create extension if not exists pgcrypto;
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  type text not null check (type in ('income','expense')),
  category text not null,
  method text,
  note text,
  amount numeric not null check (amount >= 0),
  created_at timestamptz default now()
);
create table if not exists public.payment_methods (
  id bigserial primary key,
  user_id uuid not null,
  name text not null,
  note text,
  created_at timestamptz default now(),
  unique(user_id, name)
);
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  sku text not null,
  name text not null,
  category text,
  cost numeric,
  price numeric,
  qty integer default 0,
  created_at timestamptz default now()
);
do $$ begin
  alter table public.transactions drop constraint if exists transactions_user_fk;
  alter table public.transactions add constraint transactions_user_fk
  foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.payment_methods drop constraint if exists payment_methods_user_fk;
  alter table public.payment_methods add constraint payment_methods_user_fk
  foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.inventory drop constraint if exists inventory_user_fk;
  alter table public.inventory add constraint inventory_user_fk
  foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;
alter table public.transactions enable row level security;
alter table public.payment_methods enable row level security;
alter table public.inventory enable row level security;
do $$ begin
  create policy own_rows_select_tx on public.transactions for select using (auth.uid() = user_id);
  create policy own_rows_mod_tx on public.transactions for insert with check (auth.uid() = user_id);
  create policy own_rows_update_tx on public.transactions for update using (auth.uid() = user_id);
  create policy own_rows_delete_tx on public.transactions for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy own_rows_select_pm on public.payment_methods for select using (auth.uid() = user_id);
  create policy own_rows_mod_pm on public.payment_methods for insert with check (auth.uid() = user_id);
  create policy own_rows_update_pm on public.payment_methods for update using (auth.uid() = user_id);
  create policy own_rows_delete_pm on public.payment_methods for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy own_rows_select_inv on public.inventory for select using (auth.uid() = user_id);
  create policy own_rows_mod_inv on public.inventory for insert with check (auth.uid() = user_id);
  create policy own_rows_update_inv on public.inventory for update using (auth.uid() = user_id);
  create policy own_rows_delete_inv on public.inventory for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
create index if not exists transactions_user_date_idx on public.transactions (user_id, date);
create index if not exists inventory_user_sku_idx on public.inventory (user_id, sku);
create or replace function public.set_user_id()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id is null then new.user_id := auth.uid(); end if;
  return new;
end$$;
drop trigger if exists set_user_id_trg on public.transactions;
create trigger set_user_id_trg before insert on public.transactions for each row execute procedure public.set_user_id();
drop trigger if exists set_user_id_trg on public.payment_methods;
create trigger set_user_id_trg before insert on public.payment_methods for each row execute procedure public.set_user_id();
drop trigger if exists set_user_id_trg on public.inventory;
create trigger set_user_id_trg before insert on public.inventory for each row execute procedure public.set_user_id();
