import { CheckCircle2, FileText, Loader2, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { formatDate, formatShekel } from '@/lib/utils'
import type { ExtractedData } from '@/types'

type Step = 'idle' | 'processing' | 'ready' | 'imported'

// שלב ה-layout: החילוץ מדומה. בשלב ה-AI מחליפים את הפונקציה בקריאה ל-Edge Function.
function simulateExtraction(): ExtractedData {
  return { project_name: 'משרדי חברת הייטק, רמת החייל', client_name: 'טרה סופטוור בע"מ', budget: 780000, deadline: '2027-08-15' }
}

export function Upload() {
  const { documents, projects, clients, addClient, addProject, addDocument } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('idle')
  const [fileName, setFileName] = useState('')
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!/\.(pdf|docx?)$/i.test(file.name)) {
      setError('אפשר להעלות רק קובצי PDF או Word.')
      return
    }
    setError(null)
    setFileName(file.name)
    setStep('processing')
    setTimeout(() => {
      setExtracted(simulateExtraction())
      setStep('ready')
    }, 1800)
  }

  async function confirmImport() {
    if (!extracted) return
    try {
      const client = clients.find((c) => c.name === extracted.client_name) ?? (await addClient({ name: extracted.client_name, phone: null, email: null }))
      const project = await addProject({
        name: extracted.project_name,
        client_id: client.id,
        budget: extracted.budget,
        status: 'planning',
        deadline: extracted.deadline,
      })
      await addDocument({ file_url: fileName, project_id: project.id, extracted_data: extracted, status: 'imported' })
      setStep('imported')
    } catch (err) {
      setError(`הייבוא נכשל: ${(err as Error).message}`)
    }
  }

  function reset() {
    setStep('idle')
    setExtracted(null)
    setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>העלאת מסמך</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFile(e.dataTransfer.files[0])
            }}
            disabled={step === 'processing'}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-input px-6 py-10 text-center transition-colors hover:border-primary disabled:opacity-60"
          >
            <UploadCloud className="size-9 text-primary" aria-hidden />
            <span className="font-medium">גררו לכאן קובץ, או לחצו לבחירה</span>
            <span className="text-sm text-muted-foreground">PDF או Word: הסכם, הצעת מחיר או פרוגרמה</span>
          </button>
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          {error && <p className="text-sm text-destructive">{error}</p>}

          {step === 'processing' && (
            <p className="flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
              מעבד את {fileName} ומחלץ נתונים...
            </p>
          )}

          {(step === 'ready' || step === 'imported') && extracted && (
            <div className="space-y-3 rounded-xl bg-muted/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">תצוגה מקדימה</p>
                <Badge variant="secondary">חילוץ לדוגמה</Badge>
              </div>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">קובץ</dt>
                <dd className="truncate">{fileName}</dd>
                <dt className="text-muted-foreground">פרויקט</dt>
                <dd>{extracted.project_name}</dd>
                <dt className="text-muted-foreground">לקוח</dt>
                <dd>{extracted.client_name}</dd>
                <dt className="text-muted-foreground">תקציב</dt>
                <dd className="tabular-nums">{formatShekel(extracted.budget)}</dd>
                <dt className="text-muted-foreground">תאריך יעד</dt>
                <dd>{formatDate(extracted.deadline)}</dd>
              </dl>
              {step === 'ready' ? (
                <div className="flex gap-2">
                  <Button onClick={confirmImport}>אישור ייבוא</Button>
                  <Button variant="ghost" onClick={reset}>ביטול</Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <CheckCircle2 className="size-4" aria-hidden />
                    הפרויקט והלקוח נוספו למערכת
                  </p>
                  <Button variant="secondary" onClick={reset}>העלאת מסמך נוסף</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>מסמכים שיובאו</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...documents].reverse().map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 text-sm">
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.file_url}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {projects.find((p) => p.id === doc.project_id)?.name ?? 'ללא פרויקט'} · {formatDate(doc.created_at)}
                </p>
              </div>
              <Badge variant="secondary">יובא</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
