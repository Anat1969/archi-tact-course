-- נתוני דמו בעברית. להריץ אחרי 0001_init.sql

insert into clients (id, name, phone, email, created_at) values ('00000000-0000-4000-8000-000100000001', 'משפחת לוי', '052-4417788', 'levi.family@example.co.il', '2026-01-12');
insert into clients (id, name, phone, email, created_at) values ('00000000-0000-4000-8000-000100000002', 'קבוצת אורבן נדל"ן', '03-6120045', 'office@urban-nadlan.example.co.il', '2026-02-03');
insert into clients (id, name, phone, email, created_at) values ('00000000-0000-4000-8000-000100000003', 'עיריית רמת השרון', '03-5483900', 'handasa@ramat-hasharon.example.co.il', '2026-02-20');
insert into clients (id, name, phone, email, created_at) values ('00000000-0000-4000-8000-000100000004', 'ד"ר מיכל ברק', '054-9902311', 'michal.barak@example.co.il', '2026-03-08');
insert into clients (id, name, phone, email, created_at) values ('00000000-0000-4000-8000-000100000005', 'יקב הגליל העליון', '04-6987712', 'info@galil-winery.example.co.il', '2026-04-15');
insert into clients (id, name, phone, email, created_at) values ('00000000-0000-4000-8000-000100000006', 'רשת מלונות כרמל', '04-8301166', 'projects@carmel-hotels.example.co.il', '2026-05-02');

insert into projects (id, name, client_id, budget, status, deadline, created_at) values ('00000000-0000-4000-8000-000200000001', 'בית פרטי בכרמי יוסף', '00000000-0000-4000-8000-000100000001', 420000, 'active', '2027-03-15', '2026-01-15');
insert into projects (id, name, client_id, budget, status, deadline, created_at) values ('00000000-0000-4000-8000-000200000002', 'מגדל מגורים, רחוב הרצל 48', '00000000-0000-4000-8000-000100000002', 1850000, 'active', '2027-09-30', '2026-02-05');
insert into projects (id, name, client_id, budget, status, deadline, created_at) values ('00000000-0000-4000-8000-000200000003', 'שיפוץ ספריית העירייה', '00000000-0000-4000-8000-000100000003', 640000, 'planning', '2027-06-01', '2026-02-22');
insert into projects (id, name, client_id, budget, status, deadline, created_at) values ('00000000-0000-4000-8000-000200000004', 'מרפאה פרטית בהרצליה פיתוח', '00000000-0000-4000-8000-000100000004', 275000, 'active', '2027-01-20', '2026-03-10');
insert into projects (id, name, client_id, budget, status, deadline, created_at) values ('00000000-0000-4000-8000-000200000005', 'מרכז מבקרים ליקב', '00000000-0000-4000-8000-000100000005', 910000, 'planning', '2027-11-10', '2026-04-18');
insert into projects (id, name, client_id, budget, status, deadline, created_at) values ('00000000-0000-4000-8000-000200000006', 'לובי מלון כרמל, חיפה', '00000000-0000-4000-8000-000100000006', 530000, 'done', '2026-10-05', '2026-05-04');

insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000001', 'הגשת בקשה להיתר בנייה', '00000000-0000-4000-8000-000200000001', 'doing', '2026-10-01');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000002', 'תיאום עם קונסטרוקטור', '00000000-0000-4000-8000-000200000001', 'todo', '2026-10-03');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000003', 'תוכנית קומה טיפוסית, גרסה 3', '00000000-0000-4000-8000-000200000002', 'doing', '2026-10-05');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000004', 'הדמיות חזית לוועדה המקומית', '00000000-0000-4000-8000-000200000002', 'todo', '2026-10-08');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000005', 'סקר מצב קיים ומדידות', '00000000-0000-4000-8000-000200000003', 'done', '2026-09-20');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000006', 'פגישת פרוגרמה עם מנהלת הספרייה', '00000000-0000-4000-8000-000200000003', 'todo', '2026-10-12');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000007', 'בחירת חומרי גמר לחדרי טיפול', '00000000-0000-4000-8000-000200000004', 'doing', '2026-10-14');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000008', 'אישור נגישות מיועץ', '00000000-0000-4000-8000-000200000004', 'todo', '2026-10-16');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000009', 'סקיצות ראשוניות למרכז המבקרים', '00000000-0000-4000-8000-000200000005', 'todo', '2026-10-20');
insert into tasks (id, title, project_id, stage, created_at) values ('00000000-0000-4000-8000-000300000010', 'מסירת תיק מתקן ללקוח', '00000000-0000-4000-8000-000200000006', 'done', '2026-10-02');
