// מפיק את סרטון דף הבית: מצלם את האפליקציה עצמה מול vite preview, ומחזיר את זמני הסצנות.
// הרצה: node demo/film.cjs <כתובת> <תיקיית עבודה עם n0.mp3..n7.mp3> ; ואחריה demo/mix.sh
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const BASE = process.argv[2], DIR = process.argv[3], SAMPLES = process.argv[4];
const dur = (i) => { try { return Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${DIR}/n${i}.mp3`).toString()); } catch { return 0; } };
const INIT = `(() => {
  const css = document.createElement('style');
  css.textContent = '#f-cur{position:fixed;z-index:99999;width:22px;height:22px;border-radius:50%;background:rgba(255,243,163,.9);box-shadow:0 0 0 2px #2E2E2B,0 4px 12px rgba(0,0,0,.4);pointer-events:none;transform:translate(-50%,-50%);left:640px;top:400px;transition:transform .12s}'
    + '#f-cap{position:fixed;z-index:99998;left:50%;bottom:34px;transform:translateX(-50%);background:#fff;color:#2E2E2B;font:600 27px Heebo Variable,sans-serif;padding:12px 26px;box-shadow:0 10px 34px rgba(0,0,0,.45);border-right:10px solid #FFE45C;direction:rtl;white-space:nowrap;opacity:0;transition:opacity .35s}'
    + '#f-card{position:fixed;z-index:99997;inset:0;background:#fff;color:#2E2E2B;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;direction:rtl;font-family:Heebo Variable,sans-serif;text-align:center;transition:opacity .5s}'
    + '#f-card .k{font-size:30px;font-weight:300;color:#6E6E6A}#f-card .t{font-size:104px;font-weight:300;letter-spacing:.08em;direction:ltr}#f-card .b{font-size:64px;font-weight:300;line-height:1.15}#f-card mark{background:linear-gradient(transparent 58%,#FFF3A3 58%);font-weight:600;color:inherit}#f-card .s{font-size:24px;color:#6E6E6A;direction:ltr}';
  const boot = () => {
    document.head.appendChild(css);
    const cur = document.createElement('div'); cur.id = 'f-cur'; document.body.appendChild(cur);
    const cap = document.createElement('div'); cap.id = 'f-cap'; document.body.appendChild(cap);
    const card = document.createElement('div'); card.id = 'f-card'; document.body.appendChild(card);
    document.addEventListener('mousemove', (e) => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }, true);
    document.addEventListener('mousedown', () => { cur.style.transform = 'translate(-50%,-50%) scale(.7)'; }, true);
    document.addEventListener('mouseup', () => { cur.style.transform = 'translate(-50%,-50%)'; }, true);
    window.__cap = (text) => { cap.style.opacity = text ? 1 : 0; if (text) cap.textContent = text; };
    window.__card = (html) => { card.style.opacity = html ? 1 : 0; cur.style.opacity = html ? 0 : 1; card.style.pointerEvents = html ? 'auto' : 'none'; if (html) card.innerHTML = html; };
    // בצילום מקומי, שורת הכתובת שבמסגרת המדריך מציגה את הכתובת הציבורית
    new MutationObserver(() => document.querySelectorAll('span[dir=ltr]').forEach((el) => { if (el.textContent.includes(location.host)) el.textContent = el.textContent.replace(location.host, 'archi-tact-course.vercel.app'); })).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.__card('<div class="k">לקוחות באקסל. משימות ב-WhatsApp. תאריכים בראש.</div><div class="t">ARCHI·TACT</div><div class="k">ניהול משרד אדריכלים</div>');
  };
  document.body ? boot() : addEventListener('DOMContentLoaded', boot);
})()`;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: DIR, size: { width: 1280, height: 800 } } });
  await ctx.addInitScript(INIT);
  const p = await ctx.newPage(); const created = Date.now();
  await p.goto(BASE + '/dashboard'); await p.waitForTimeout(600);
  const t0 = Date.now(); const marks = [];
  const wait = (ms) => p.waitForTimeout(ms);
  const point = async (sel, opts = {}) => { const box = await p.locator(sel).first().boundingBox(); await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: opts.steps ?? 22 }); return box; };
  const click = async (sel) => { await point(sel); await wait(180); await p.locator(sel).first().click(); await wait(350); };
  const scene = async (i, caption, steps, pad = 0.7) => {
    const start = Date.now(); marks.push({ i, at: (start - t0) / 1000 });
    await p.evaluate((c) => window.__cap(c), caption);
    await steps();
    const left = (dur(i) + pad) * 1000 - (Date.now() - start); if (left > 0) await wait(left);
  };

  await scene(0, '', async () => {}, 0.5);
  await p.evaluate(() => window.__card(''));
  await scene(1, 'תמונת מצב אחת של המשרד', async () => {
    await wait(700); await point('main a:has-text("פרויקטים פעילים")'); await wait(500); await point('main a:has-text("הכנסה צפויה")', { steps: 40 }); await wait(700);
    await point('section:has-text("דורש טיפול") a', { steps: 30 }); await wait(600);
  });
  await scene(2, 'כל פרויקט, דף אחד', async () => {
    await click('a[href="/projects"]');
    await point('input[aria-label="חיפוש פרויקטים"]'); await p.locator('input[aria-label="חיפוש פרויקטים"]').pressSequentially('לוי', { delay: 170 }); await wait(700);
    await click('main a[href^="/projects/"]'); await wait(600);
    await point('main button:has-text("בתכנון")', { steps: 30 }); await wait(400);
  });
  await scene(3, 'ההודעה ללקוח נכתבת לבד', async () => {
    await click('a[href="/tasks"]'); await wait(300);
    await click('main section >> nth=0 >> article >> nth=1 >> button[aria-label^="העברה"]'); await wait(500);
    await click('main section >> nth=1 >> article >> nth=0 >> button[aria-label^="פתיחת"]'); await wait(900);
    await point('[role=dialog] select >> nth=1'); await p.locator('[role=dialog] select').nth(1).selectOption('done'); await wait(1300);
    await point('[role=dialog] a:has-text("WhatsApp")', { steps: 30 }); await wait(700);
  }, 0.9);
  await p.keyboard.press('Escape');
  await scene(4, 'רואים את הזמן, ומה באיחור', async () => {
    await click('a[href="/timeline"]'); await wait(500);
    await p.mouse.move(980, 215, { steps: 20 }); await p.mouse.move(420, 345, { steps: 70 });
  });
  await scene(5, 'מאקסל לנתונים חיים, בגרירה אחת', async () => {
    await click('a[href="/upload"]');
    await point('main button:has-text("גררו לכאן")'); await p.setInputFiles('input[type=file]', SAMPLES + '/clients.xlsx'); await p.waitForSelector('text=לאן לייבא'); await wait(1500);
    await click('main button:has-text("אישור ייבוא")'); await wait(900);
  }, 0);
  await scene(6, 'לצד כל מסך: הפרומפט שבנה אותו', async () => {
    await click('button:has-text("מדריך בנייה")'); await wait(900);
    await click('nav[aria-label="שלבי המדריך"] button >> nth=3'); await wait(1100);
    await click('aside button[aria-controls="guide-prompt"]'); await wait(900);
    await p.locator('aside .overflow-y-auto').first().evaluate((e) => e.scrollTo({ top: 330, behavior: 'smooth' })); await wait(1500);
    await click('nav[aria-label="שלבי המדריך"] button >> nth=5'); await wait(900);
  }, 0.8);
  marks.push({ poster: (Date.now() - t0) / 1000 - 1.2 });
  await p.evaluate(() => { window.__cap(''); window.__card('<div class="b">אפליקציה ש<mark>מלמדת</mark><br>איך בנו אותה</div><div class="s">archi-tact-course.vercel.app</div><div class="k">A&I · אד׳ ענת שטיבלמן</div>'); });
  await scene(7, '', async () => {}, 2.2);
  const total = (Date.now() - t0) / 1000;
  const video = p.video(); await ctx.close(); await b.close();
  fs.renameSync(await video.path(), DIR + '/raw.webm');
  fs.writeFileSync(DIR + '/marks.json', JSON.stringify({ lead: (t0 - created) / 1000, total, marks }, null, 1));
  console.log(JSON.stringify({ lead: (t0 - created) / 1000, total, marks }));
})().catch((e) => { console.log('CRASH', String(e).slice(0, 500)); process.exit(1); });
