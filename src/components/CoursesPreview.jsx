import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Markdown from 'react-markdown'
import { BookMarked, ChevronRight, CheckCircle2 } from 'lucide-react'

const THEME = {
  sql: {
    border: 'rgba(59,130,246,0.25)',
    tabActive: 'rgba(59,130,246,0.2)',
    accent: '#60a5fa',
    summaryHover: 'rgba(59,130,246,0.08)',
  },
  node: {
    border: 'rgba(34,197,94,0.25)',
    tabActive: 'rgba(34,197,94,0.2)',
    accent: '#4ade80',
    summaryHover: 'rgba(34,197,94,0.08)',
  },
  react: {
    border: 'rgba(34,211,238,0.25)',
    tabActive: 'rgba(34,211,238,0.15)',
    accent: '#22d3ee',
    summaryHover: 'rgba(34,211,238,0.08)',
  },
  django: {
    border: 'rgba(245,158,11,0.3)',
    tabActive: 'rgba(245,158,11,0.15)',
    accent: '#fbbf24',
    summaryHover: 'rgba(245,158,11,0.08)',
  },
  typescript: {
    border: 'rgba(129,140,248,0.3)',
    tabActive: 'rgba(129,140,248,0.15)',
    accent: '#818cf8',
    summaryHover: 'rgba(129,140,248,0.08)',
  },
}

function markdownComponents(catTheme) {
  return {
    h2(props) {
      return <h2 className="course-md-heading" {...props} />
    },
    p(props) {
      return <p className="course-md-p" {...props} />
    },
    strong(props) {
      return <strong className="course-md-strong" {...props} />
    },
    ul(props) {
      return <ul className="course-md-ul" {...props} />
    },
    li(props) {
      return <li className="course-md-li" {...props} />
    },
    pre(props) {
      return <pre className="course-md-pre" {...props} />
    },
    code(props) {
      const { className, children, ...rest } = props
      const inline = !className
      if (inline) {
        return (
          <code
            className="rounded px-1 py-px font-mono text-[0.8em]"
            style={{ background: 'rgba(255,255,255,0.06)', color: catTheme.accent }}
            {...rest}
          >
            {children}
          </code>
        )
      }
      return (
        <code className={`${className || ''} font-mono text-[0.72rem] leading-relaxed text-slate-300`} {...rest}>
          {children}
        </code>
      )
    },
  }
}

/**
 * Bloc d’accueil : modules de cours (Markdown) par catégorie / set, avant la grille des quiz.
 *
 * @param {object} props
 * @param {typeof import('../data/quizData').CATEGORIES} props.categories
 * @param {Record<string, boolean>} props.coursesDone — id question → cours marqué terminé
 * @param {(questionId: string, done: boolean) => void} props.onCourseDoneToggle
 */
export default function CoursesPreview({ categories, coursesDone = {}, onCourseDoneToggle }) {
  const courseCategories = useMemo(
    () =>
      categories.filter((cat) =>
        cat.sets.some((s) => s.questions.some((q) => q.courseContent)),
      ),
    [categories],
  )

  const courseStats = useMemo(() => {
    let total = 0
    let done = 0
    for (const cat of courseCategories) {
      for (const set of cat.sets) {
        for (const q of set.questions) {
          if (!q.courseContent) continue
          total += 1
          if (coursesDone[q.id]) done += 1
        }
      }
    }
    return { total, done }
  }, [courseCategories, coursesDone])

  const [activeId, setActiveId] = useState(() => courseCategories[0]?.id ?? '')

  if (courseCategories.length === 0) return null

  const active = courseCategories.find((c) => c.id === activeId) ?? courseCategories[0]
  const theme = THEME[active.theme] ?? THEME.sql

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="mb-8"
      aria-labelledby="courses-heading"
    >
      <div
        className="glass rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${theme.border}` }}
      >
        <div className="px-4 py-4 md:px-5 md:py-5 border-b border-white/5">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: theme.tabActive, color: theme.accent }}
            >
              <BookMarked size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 id="courses-heading" className="font-display font-800 text-lg text-white">
                Modules de cours
              </h2>
              <p className="text-slate-500 text-xs font-mono mt-1 leading-relaxed">
                Cours pour les 5 parcours (SQL, Node.js, React, Django, TypeScript) · ouvre un set puis une notion · à
                lire avant de lancer le quiz correspondant
              </p>
              {courseStats.total > 0 && (
                <p className="text-slate-500/90 text-xs font-mono mt-2 tabular-nums">
                  Modules terminés :{' '}
                  <span style={{ color: theme.accent }} className="font-600">
                    {courseStats.done}/{courseStats.total}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {courseCategories.map((cat) => {
              const t = THEME[cat.theme] ?? THEME.sql
              const isOn = cat.id === active.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveId(cat.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-terminal transition-all"
                  style={{
                    background: isOn ? t.tabActive : 'rgba(255,255,255,0.04)',
                    color: isOn ? t.accent : '#64748b',
                    border: `1px solid ${isOn ? t.border : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4 md:p-5 max-h-[min(68vh,720px)] overflow-y-auto">
          {active.sets.map((set) => {
            const withCourse = set.questions.filter((q) => q.courseContent)
            if (withCourse.length === 0) return null

            return (
              <details
                key={set.id}
                className="group/set mb-2 rounded-xl border border-white/[0.07] bg-white/[0.02]"
              >
                <summary
                  className="cursor-pointer select-none list-none flex items-center gap-2 px-3 py-2.5 font-display font-700 text-sm text-slate-200 rounded-xl transition-colors hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden"
                >
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-slate-500 transition-transform group-open/set:rotate-90"
                  />
                  <span style={{ color: theme.accent }}>{set.label}</span>
                  <span className="text-slate-600 font-mono font-400 text-xs ml-auto">
                    {withCourse.length} notion{withCourse.length > 1 ? 's' : ''}
                  </span>
                </summary>

                <div className="px-3 pb-3 pt-0 space-y-2 border-t border-white/5">
                  {withCourse.map((q) => {
                    const isDone = !!coursesDone[q.id]
                    return (
                    <details
                      key={q.id}
                      className={`group/q rounded-lg border bg-[#070b14]/80 ${
                        isDone ? 'border-emerald-500/35' : 'border-white/[0.05]'
                      }`}
                    >
                      <summary className="cursor-pointer select-none list-none flex items-center gap-2 px-3 py-2 text-xs font-mono text-slate-300 rounded-lg [&::-webkit-details-marker]:hidden hover:bg-white/[0.04]">
                        <ChevronRight
                          size={14}
                          className="text-slate-600 shrink-0 transition-transform group-open/q:rotate-90"
                        />
                        {isDone ? (
                          <CheckCircle2 size={14} className="shrink-0 text-emerald-400" aria-hidden />
                        ) : null}
                        <span className={`truncate ${isDone ? 'text-emerald-100/90' : ''}`}>{q.keyword || q.id}</span>
                      </summary>
                      <div className="course-md px-3 pb-3 pt-1 border-t border-white/[0.04]">
                        <Markdown components={markdownComponents(theme)}>{q.courseContent}</Markdown>
                        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                          {isDone ? (
                            <>
                              <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400/95">
                                <CheckCircle2 size={15} strokeWidth={2.25} aria-hidden />
                                Cours terminé
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onCourseDoneToggle(q.id, false)
                                }}
                                className="text-xs font-terminal px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10 text-slate-400 hover:text-white"
                                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                Annuler la validation
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onCourseDoneToggle(q.id, true)
                              }}
                              className="text-xs font-terminal px-3 py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] font-600 ml-auto sm:ml-0"
                              style={{
                                background: theme.tabActive,
                                color: theme.accent,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              Marquer ce cours comme terminé
                            </button>
                          )}
                        </div>
                      </div>
                    </details>
                    )
                  })}
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
