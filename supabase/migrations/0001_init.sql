-- ARCHI·TACT: ארבע הטבלאות
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid references clients (id) on delete set null,
  budget numeric not null default 0,
  status text not null default 'active' check (status in ('planning', 'active', 'done')),
  deadline date,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  project_id uuid references projects (id) on delete cascade,
  stage text not null default 'todo' check (stage in ('todo', 'doing', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  file_url text not null,
  project_id uuid references projects (id) on delete set null,
  extracted_data jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'ready', 'imported')),
  created_at timestamptz not null default now()
);

-- הרשאות: בשלב הזה אין עדיין התחברות, ולכן הגישה פתוחה למפתח ה-anon.
-- כשמוסיפים Supabase Auth מחליפים את המדיניות ל-authenticated בלבד.
alter table clients enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table documents enable row level security;

create policy "demo open access" on clients for all using (true) with check (true);
create policy "demo open access" on projects for all using (true) with check (true);
create policy "demo open access" on tasks for all using (true) with check (true);
create policy "demo open access" on documents for all using (true) with check (true);
