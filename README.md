# ARCHI·TACT

אפליקציה לניהול משרד אדריכלים: פרויקטים, לקוחות, משימות ומסמכים.

## הרצה

```bash
npm install
npm run dev
```

בלי קובץ `.env` האפליקציה עובדת על נתוני הדמו שב-`src/data/demo.ts`.

## חיבור ל-Supabase

1. פותחים פרויקט ב-Supabase.
2. ב-SQL Editor מריצים את `supabase/migrations/0001_init.sql`, ואחריו את `supabase/seed.sql`.
3. מעתיקים את `.env.example` לקובץ `.env` וממלאים את שני הערכים מתוך Project Settings > API.
4. מפעילים מחדש. בתחתית סרגל הניווט יופיע "מקור הנתונים: Supabase".

## פריסה ל-Vercel

מחברים את הריפו ב-Vercel ומוסיפים את שני משתני הסביבה. `vercel.json` כבר דואג שרענון בדף פנימי לא יחזיר 404.

## מה עדיין לא נבנה

- התחברות משתמשים (Supabase Auth). עד אז הרשאות הטבלאות פתוחות, כמצוין בקובץ ה-migration.
- חילוץ נתונים אמיתי עם AI. המסך מציג חילוץ לדוגמה.
- שמירת הקובץ עצמו ב-Supabase Storage.
