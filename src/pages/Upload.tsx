import { CheckCircle2, Download, FileSpreadsheet, Loader2, UploadCloud } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TARGET_LABEL, buildRows, fieldsOf, guessTarget, mapColumns, readTable, type ImportTarget } from '@/lib/importer'
import { useStore } from '@/lib/store'
import { cn, formatDate } from '@/lib/utils'
import type { ProjectStatus, TaskStage } from '@/types'

type Step = 'idle' | 'reading' | 'preview' | 'importing' | 'done'
const TARGETS: ImportTarget[] = ['clients', 'projects', 'tasks']
const SAMPLES: [string, string][] = [['לקוחות', '/samples/clients.xlsx'], ['פרויקטים', '/samples/projects.xlsx'], ['משימות', '/samples/tasks.xlsx']]
const PAGE: Record<ImportTarget, string> = { clients: '/clients', projects: '/projects', tasks: '/tasks' }

export function Upload() {
  const { documents, clients, projects, saveClient, saveProject, saveTask, addDocument } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('idle')
  const [fileName, setFileName] = useState('')
  const [sheet, setSheet] = useState<Awaited<ReturnType<typeof readTable>> | null>(null)
  const [target, setTarget] = useState<ImportTarget>('clients')
  const [result, setResult] = useState({ imported: 0, skipped: 0 })
  const [error, setError] = useState<string | null>(null)

  const mapping = useMemo(() => (sheet ? mapColumns(target, sheet.headers) : {}), [sheet, target])
  const built = useMemo(() => (sheet ? buildRows(target, mapping, sheet.rows) : { rows: [], skipped: 0 }), [sheet, target, mapping])
  const fields = fieldsOf(target)
  const missingRequired = fields.find((field) => field.required && mapping[field.key] < 0)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setFileName(file.name)
    setStep('reading')
    try {
      const table = await readTable(file)
      setSheet(table)
      setTarget(guessTarget(table.headers))
      setStep('preview')
    } catch (err) {
      setError((err as Error).message)
      setStep('idle')
    }
  }

  async function confirmImport() {
    setStep('importing')
    let imported = 0
    let skipped = built.skipped
    try {
      // שומרים שם ומזהה של מה שכבר קיים, כדי לא ליצור כפילויות
      const clientIds = new Map(clients.map((c) => [c.name, c.id]))
      const projectIds = new Map(projects.map((p) => [p.name, p.id]))
      for (const row of built.rows) {
        if (target === 'clients') {
          if (clientIds.has(String(row.name))) { skipped++; continue }
          const saved = await saveClient({ name: String(row.name), phone: row.phone as string | null, email: row.email as string | null })
          clientIds.set(saved.name, saved.id)
        }
        if (target === 'projects') {
          if (projectIds.has(String(row.name))) { skipped++; continue }
          let clientId: string | null = null
          if (row.client) {
            clientId = clientIds.get(String(row.client)) ?? null
            if (!clientId) {
              const created = await saveClient({ name: String(row.client), phone: null, email: null })
              clientIds.set(created.name, created.id)
              clientId = created.id
            }
          }
          const saved = await saveProject({
            name: String(row.name), client_id: clientId, budget: Number(row.budget) || 0, status: row.status as ProjectStatus,
            deadline: row.deadline as string | null, address: row.address as string | null, notes: null,
          })
          projectIds.set(saved.name, saved.id)
        }
        if (target === 'tasks') {
          await saveTask({
            title: String(row.title), project_id: row.project ? projectIds.get(String(row.project)) ?? null : null,
            stage: row.stage as TaskStage, due_date: row.due_date as string | null, notes: null,
          })
        }
        imported++
      }
      await addDocument({ file_url: fileName, project_id: null, extracted_data: { target: TARGET_LABEL[target], imported, skipped }, status: 'imported' })
      setResult({ imported, skipped })
      setStep('done')
    } catch (err) {
      setError(`הייבוא נעצר אחרי ${imported} רשומות: ${(err as Error).message}`)
      setStep('preview')
    }
  }

  function reset() {
    setStep('idle')
    setSheet(null)
    setFileName('')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-border">
        <h2 className="font-semibold">ייבוא מקובץ Excel</h2>

        {(step === 'idle' || step === 'reading') && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
              disabled={step === 'reading'}
              className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-input px-6 py-10 text-center transition-colors hover:border-primary disabled:opacity-60"
            >
              {step === 'reading' ? <Loader2 className="size-9 animate-spin text-primary" aria-hidden /> : <UploadCloud className="size-9 text-primary" aria-hidden />}
              <span className="font-medium">{step === 'reading' ? `קורא את ${fileName}...` : 'גררו לכאן קובץ, או לחצו לבחירה'}</span>
              <span className="text-sm text-muted-foreground">Excel (xlsx) או CSV, עם שורת כותרות. למשל: רשימת לקוחות, פרויקטים או משימות</span>
            </button>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>קובץ לדוגמה:</span>
              {SAMPLES.map(([label, href]) => (
                <a key={href} href={href} download className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-foreground hover:bg-accent">
                  <Download className="size-3.5" aria-hidden /> {label}
                </a>
              ))}
            </div>
          </>
        )}
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        {error && <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>}

        {(step === 'preview' || step === 'importing') && sheet && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium"><FileSpreadsheet className="size-4 text-primary" aria-hidden /> {fileName}</span>
              <span className="text-muted-foreground">{sheet.rows.length} שורות</span>
            </div>

            <div>
              <p className="mb-1.5 text-sm text-muted-foreground">לאן לייבא? זיהיתי לפי הכותרות, ואפשר לשנות:</p>
              <div className="inline-flex gap-1 rounded-lg bg-muted p-1 text-sm">
                {TARGETS.map((value) => (
                  <button key={value} onClick={() => setTarget(value)} className={cn('rounded-md px-4 py-1 transition-colors', target === value ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                    {TARGET_LABEL[value]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {fields.map((field) => (
                <span key={field.key} className={cn('rounded-full px-2.5 py-1', mapping[field.key] >= 0 ? 'bg-emerald-950 text-emerald-400' : field.required ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground')}>
                  {field.label}: {mapping[field.key] >= 0 ? `עמודה "${sheet.headers[mapping[field.key]]}"` : 'לא נמצאה'}
                </span>
              ))}
            </div>

            {missingRequired ? (
              <p className="text-sm text-destructive">לא מצאתי עמודה לשדה החובה "{missingRequired.label}". בדקו את שורת הכותרות, או בחרו יעד אחר.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg ring-1 ring-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-right text-muted-foreground">
                      {fields.map((field) => <th key={field.key} className="px-3 py-2 font-medium">{field.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {built.rows.slice(0, 8).map((row, index) => (
                      <tr key={index} className="border-b border-border/60 last:border-0">
                        {fields.map((field) => <td key={field.key} className="px-3 py-2">{row[field.key] ?? ''}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {built.rows.length} רשומות מוכנות לייבוא{built.rows.length > 8 ? ', מוצגות 8 הראשונות' : ''}.
              {built.skipped > 0 && ` ${built.skipped} שורות בלי "${fields.find((f) => f.required)!.label}" ידולגו.`}
            </p>

            <div className="flex gap-2">
              <Button onClick={confirmImport} disabled={Boolean(missingRequired) || built.rows.length === 0 || step === 'importing'}>
                {step === 'importing' ? <><Loader2 className="animate-spin" aria-hidden /> מייבא...</> : `אישור ייבוא של ${built.rows.length} ${TARGET_LABEL[target]}`}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={step === 'importing'}>ביטול</Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-3 rounded-xl bg-muted/50 p-4">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <CheckCircle2 className="size-5" aria-hidden /> יובאו {result.imported} {TARGET_LABEL[target]} מתוך {fileName}
            </p>
            {result.skipped > 0 && <p className="text-sm text-muted-foreground">{result.skipped} שורות דולגו: חסר בהן שדה חובה, או שהן כבר קיימות במערכת.</p>}
            <div className="flex gap-2">
              <Link to={PAGE[target]} className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">מעבר אל {TARGET_LABEL[target]}</Link>
              <Button variant="secondary" onClick={reset}>ייבוא קובץ נוסף</Button>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-2 rounded-xl bg-card p-4 ring-1 ring-border">
        <h2 className="font-semibold">קבצים שיובאו</h2>
        {[...documents].reverse().map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 text-sm">
            <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium"><bdi>{doc.file_url}</bdi></p>
              <p className="truncate text-xs text-muted-foreground">
                {doc.extracted_data ? `${doc.extracted_data.imported} ${doc.extracted_data.target}` : 'יובא'} · {formatDate(doc.created_at)}
              </p>
            </div>
          </div>
        ))}
        {documents.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">עדיין לא יובאו קבצים</p>}
      </section>
    </div>
  )
}
