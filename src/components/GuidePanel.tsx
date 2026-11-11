import { Check, ChevronDown, Copy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GUIDE_STEPS } from '@/data/guideSteps'
import { useGuide } from '@/lib/guide'

// לוח המדריך. העיצוב שלו בהיר, שחור ולבן עם צהוב, כדי להיבדל מהאפליקציה הכהה שלצידו.
export function GuidePanel() {
  const guide = useGuide()
  const step = GUIDE_STEPS[guide.step]
  const [copied, setCopied] = useState(false)
  // הפרומפט סגור כברירת מחדל, ונסגר שוב בכל מעבר שלב
  const [promptOpen, setPromptOpen] = useState(false)
  useEffect(() => setPromptOpen(false), [guide.step])

  async function copy() {
    try {
      await navigator.clipboard.writeText(step.prompt)
    } catch {
      const area = document.createElement('textarea')
      area.value = step.prompt
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside className="flex max-h-[46dvh] shrink-0 flex-col border-b border-[#d9d9d9] bg-white text-[#111] lg:max-h-none lg:w-[390px] lg:border-b-0 lg:border-l" aria-label="מדריך בנייה">
      <header className="flex items-center justify-between gap-3 bg-[#111] px-4 py-3 text-white">
        <div>
          <p className="text-sm font-bold tracking-wide">איך בונים</p>
          <p className="text-[11px] text-[#9a9a9a]">מדריך בנייה לאפליקציית ARCHI·TACT</p>
        </div>
        <button onClick={guide.close} aria-label="סגירת המדריך" className="rounded p-1 text-[#9a9a9a] hover:bg-[#2a2a2a] hover:text-white">
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <nav className="flex gap-1.5 overflow-x-auto border-b border-[#e6e6e6] px-4 py-2.5" aria-label="שלבי המדריך">
        {GUIDE_STEPS.map((item, index) => (
          <button
            key={item.title}
            onClick={() => guide.go(index)}
            title={item.title}
            aria-label={`שלב ${index}: ${item.title}`}
            aria-current={index === guide.step}
            className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
              index === guide.step ? 'bg-[#f0d060] text-[#111]' : index < guide.step ? 'bg-[#111] text-white' : 'bg-[#ececec] text-[#777] hover:bg-[#dcdcdc]'
            }`}
          >
            {index}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-[#888]">שלב {guide.step} מתוך {GUIDE_STEPS.length - 1}</p>
          <h2 className="text-xl font-bold">{step.title}</h2>
          <p className="text-sm text-[#777]">{step.subtitle}</p>
        </div>

        <p className="text-sm leading-relaxed text-[#333]">{step.learn}</p>

        {step.tryIt && (
          <section>
            <h3 className="mb-1.5 text-[11px] font-bold tracking-widest text-[#888]">נסו עכשיו באפליקציה</h3>
            <ol className="space-y-1 text-sm text-[#333]">
              {step.tryIt.map((item, index) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#f0d060] text-[10px] font-bold">{index + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="rounded-md border border-[#e0e0e0] bg-[#f8f8f8]">
          <div className={`flex items-center justify-between gap-2 px-3 py-2 ${promptOpen ? 'border-b border-[#e0e0e0]' : ''}`}>
            <button
              onClick={() => setPromptOpen((open) => !open)}
              aria-expanded={promptOpen}
              aria-controls="guide-prompt"
              className="flex min-w-0 flex-1 items-center gap-1.5 text-right text-[11px] font-bold tracking-widest text-[#888] hover:text-[#111]"
            >
              <ChevronDown className={`size-4 shrink-0 transition-transform ${promptOpen ? 'rotate-180' : ''}`} aria-hidden />
              פרומפט ל-Claude Code
              <span className="font-normal tracking-normal">{promptOpen ? '· סגירה' : '· פתיחה'}</span>
            </button>
            <button onClick={copy} className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-white ${copied ? 'bg-[#2a7a2a]' : 'bg-[#111] hover:bg-[#333]'}`}>
              {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? 'הועתק' : 'העתקה'}
            </button>
          </div>
          {promptOpen && (
            <pre id="guide-prompt" className="max-h-64 overflow-y-auto whitespace-pre-wrap px-3 py-3 font-sans text-[13px] leading-relaxed text-[#333] lg:max-h-none">{step.prompt}</pre>
          )}
        </section>

        <p className="rounded-md border border-[#f0d060] bg-[#fffbea] px-3 py-2.5 text-sm leading-relaxed text-[#444]">
          <strong className="text-[#111]">שימו לב: </strong>
          {step.tip}
        </p>
      </div>

      <footer className="flex gap-2 border-t border-[#e6e6e6] px-4 py-3">
        <button onClick={() => guide.go(guide.step - 1)} disabled={guide.step === 0} className="flex-1 rounded border border-[#d0d0d0] px-3 py-2 text-sm hover:bg-[#f3f3f3] disabled:opacity-40">
          הקודם
        </button>
        <button onClick={() => guide.go(guide.step + 1)} disabled={guide.step === GUIDE_STEPS.length - 1} className="flex-1 rounded bg-[#111] px-3 py-2 text-sm font-medium text-white hover:bg-[#333] disabled:opacity-40">
          השלב הבא
        </button>
      </footer>
    </aside>
  )
}
