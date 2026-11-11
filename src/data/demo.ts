import type { Client, DocumentRecord, Project, Task } from '@/types'

// נתוני דמו: מוצגים כשאין חיבור ל-Supabase, ומשמשים גם כזריעה ראשונית (supabase/seed.sql)
export const demoClients: Client[] = [
  { id: 'c1', name: 'משפחת לוי', phone: '052-4417788', email: 'levi.family@example.co.il', created_at: '2026-01-12' },
  { id: 'c2', name: 'קבוצת אורבן נדל"ן', phone: '03-6120045', email: 'office@urban-nadlan.example.co.il', created_at: '2026-02-03' },
  { id: 'c3', name: 'עיריית רמת השרון', phone: '03-5483900', email: 'handasa@ramat-hasharon.example.co.il', created_at: '2026-02-20' },
  { id: 'c4', name: 'ד"ר מיכל ברק', phone: '054-9902311', email: 'michal.barak@example.co.il', created_at: '2026-03-08' },
  { id: 'c5', name: 'יקב הגליל העליון', phone: '04-6987712', email: 'info@galil-winery.example.co.il', created_at: '2026-04-15' },
  { id: 'c6', name: 'רשת מלונות כרמל', phone: '04-8301166', email: 'projects@carmel-hotels.example.co.il', created_at: '2026-05-02' },
]

export const demoProjects: Project[] = [
  { id: 'p1', name: 'בית פרטי בכרמי יוסף', client_id: 'c1', budget: 420000, status: 'active', deadline: '2027-03-15', address: 'הזית 12, כרמי יוסף', notes: null, created_at: '2026-01-15' },
  { id: 'p2', name: 'מגדל מגורים, רחוב הרצל 48', client_id: 'c2', budget: 1850000, status: 'active', deadline: '2027-09-30', address: 'הרצל 48, רמת גן', notes: null, created_at: '2026-02-05' },
  { id: 'p3', name: 'שיפוץ ספריית העירייה', client_id: 'c3', budget: 640000, status: 'planning', deadline: '2027-06-01', address: 'סוקולוב 52, רמת השרון', notes: null, created_at: '2026-02-22' },
  { id: 'p4', name: 'מרפאה פרטית בהרצליה פיתוח', client_id: 'c4', budget: 275000, status: 'active', deadline: '2027-01-20', address: 'משכית 22, הרצליה פיתוח', notes: null, created_at: '2026-03-10' },
  { id: 'p5', name: 'מרכז מבקרים ליקב', client_id: 'c5', budget: 910000, status: 'planning', deadline: '2027-11-10', address: 'דרך היקב 1, דלתון', notes: null, created_at: '2026-04-18' },
  { id: 'p6', name: 'לובי מלון כרמל, חיפה', client_id: 'c6', budget: 530000, status: 'done', deadline: '2026-10-05', address: 'שדרות הנשיא 89, חיפה', notes: null, created_at: '2026-05-04' },
]

export const demoTasks: Task[] = [
  { id: 't1', title: 'הגשת בקשה להיתר בנייה', project_id: 'p1', stage: 'doing', due_date: '2026-11-20', notes: null, created_at: '2026-10-01' },
  { id: 't2', title: 'תיאום עם קונסטרוקטור', project_id: 'p1', stage: 'todo', due_date: '2026-11-09', notes: null, created_at: '2026-10-03' },
  { id: 't3', title: 'תוכנית קומה טיפוסית, גרסה 3', project_id: 'p2', stage: 'doing', due_date: '2026-11-25', notes: null, created_at: '2026-10-05' },
  { id: 't4', title: 'הדמיות חזית לוועדה המקומית', project_id: 'p2', stage: 'todo', due_date: '2026-12-03', notes: null, created_at: '2026-10-08' },
  { id: 't5', title: 'סקר מצב קיים ומדידות', project_id: 'p3', stage: 'done', due_date: '2026-10-01', notes: null, created_at: '2026-09-20' },
  { id: 't6', title: 'פגישת פרוגרמה עם מנהלת הספרייה', project_id: 'p3', stage: 'todo', due_date: '2026-11-17', notes: null, created_at: '2026-10-12' },
  { id: 't7', title: 'בחירת חומרי גמר לחדרי טיפול', project_id: 'p4', stage: 'doing', due_date: '2026-11-14', notes: null, created_at: '2026-10-14' },
  { id: 't8', title: 'אישור נגישות מיועץ', project_id: 'p4', stage: 'todo', due_date: '2026-11-30', notes: null, created_at: '2026-10-16' },
  { id: 't9', title: 'סקיצות ראשוניות למרכז המבקרים', project_id: 'p5', stage: 'todo', due_date: '2026-12-10', notes: null, created_at: '2026-10-20' },
  { id: 't10', title: 'מסירת תיק מתקן ללקוח', project_id: 'p6', stage: 'done', due_date: '2026-10-05', notes: null, created_at: '2026-10-02' },
]

export const demoDocuments: DocumentRecord[] = [
  { id: 'd1', file_url: 'לקוחות-2026.xlsx', project_id: null, extracted_data: { target: 'לקוחות', imported: 6, skipped: 0 }, status: 'imported', created_at: '2026-01-14' },
  { id: 'd2', file_url: 'רשימת-פרויקטים.xlsx', project_id: null, extracted_data: { target: 'פרויקטים', imported: 6, skipped: 0 }, status: 'imported', created_at: '2026-03-09' },
]
