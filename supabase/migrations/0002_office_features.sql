-- תאריכי יעד והערות למשימות, כתובת והערות לפרויקטים
alter table tasks add column if not exists due_date date;
alter table tasks add column if not exists notes text;
alter table projects add column if not exists address text;
alter table projects add column if not exists notes text;

-- Realtime: לוח המשימות מתעדכן אצל כל המשתמשים בלי רענון
alter publication supabase_realtime add table tasks;
