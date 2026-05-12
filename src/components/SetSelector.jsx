import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, BookOpen, X, ChevronRight, PlayCircle } from 'lucide-react'
import { getAllQuestions } from '../data/quizData'
import { loadSessionDraft } from '../sessionDraft'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'

const themeColors = {
  sql:        { accent: '#3b82f6', light: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)' },
  node:       { accent: '#22c55e', light: '#4ade80', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)' },
  react:      { accent: '#06b6d4', light: '#22d3ee', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.3)' },
  django:     { accent: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)' },
  typescript: { accent: '#6366f1', light: '#818cf8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.3)' },
}

export default function SetSelector({ category, scores, onSelect, onResume, onClose }) {
  const open = Boolean(category)
  useBodyScrollLock(open)

  // Réduit le transfert tactile vers l’arrière-plan (Safari / mobile)
  useEffect(() => {
    if (!open) return undefined
    const preventTouchMove = (e) => {
      const target = e.target
      const scrollRegion = typeof target.closest === 'function' ? target.closest('[data-modal-scroll]') : null
      if (scrollRegion) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', preventTouchMove, { passive: false })
    return () => document.removeEventListener('touchmove', preventTouchMove)
  }, [open])

  if (!category) return null
  const t = themeColors[category.theme]
  const draft = loadSessionDraft()
  const canResume = Boolean(onResume && draft?.categoryId === category.id && Array.isArray(draft.questions) && draft.questions.length > 0)
  const resumeIndex = canResume ? Math.min(Math.max(0, draft.currentIndex ?? 0), draft.questions.length - 1) : 0
  const allQuestions = getAllQuestions(category)
  const totalAnswered = scores?.answered || 0
  const totalCorrect = scores?.correct || 0

  const options = [
    {
      id: 'all',
      label: 'Tout mélanger',
      description: `${allQuestions.length} questions — ordre aléatoire à chaque session`,
      icon: Shuffle,
      count: allQuestions.length,
      isSpecial: true,
    },
    ...category.sets.map(set => ({
      id: set.id,
      label: set.label,
      description: `${set.questions.length} questions sur ${set.label.toLowerCase()}`,
      icon: BookOpen,
      count: set.questions.length,
      isSpecial: false,
      correctInSet: set.questions.filter(q => scores?.results?.[q.id]?.correct).length,
    })),
  ]

  return (
    <AnimatePresence>
      <motion.div
        role="presentation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden touch-none"
        style={{ background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
        // Empêche le scroll par molette sur l’overlay (le body est déjà verrouillé)
        onWheel={(e) => e.stopPropagation()}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="set-selector-title"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="touch-auto w-full max-w-md max-h-[min(90vh,32rem)] flex flex-col rounded-2xl relative overflow-hidden"
          style={{
            background: 'rgba(10, 14, 26, 0.98)',
            border: `1px solid ${t.border}`,
            boxShadow: `0 0 60px ${t.accent}22`,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>

          <div
            data-modal-scroll
            className="overflow-y-auto overscroll-contain min-h-0 flex-1 p-6 pt-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="mb-5 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl" aria-hidden>{category.icon}</span>
                <h2 id="set-selector-title" className="font-display font-800 text-xl text-white">
                  {category.label}
                </h2>
              </div>
              <p className="text-slate-500 text-sm font-mono">
                {totalAnswered > 0
                  ? `${totalCorrect}/${totalAnswered} réponses correctes · Choisir un set`
                  : 'Choisir un set de questions'}
              </p>
            </div>

            {canResume && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onResume?.()}
                className="w-full text-left px-4 py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-3 mb-3"
                style={{
                  background: `linear-gradient(135deg, ${t.accent}33, ${t.accent}12)`,
                  border: `1px solid ${t.border}`,
                  boxShadow: `0 0 24px ${t.accent}18`,
                }}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: t.bg, border: `1px solid ${t.border}` }}
                >
                  <PlayCircle size={18} style={{ color: t.light }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-600 text-sm text-white">Reprendre la session</p>
                  <p className="text-slate-500 text-xs font-mono">
                    {draft.sessionLabel || 'En cours'} · question {resumeIndex + 1}/{draft.questions.length} · même ordre / options
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: t.light }} />
              </motion.button>
            )}

            <div className="space-y-3">
              {options.map((opt, i) => {
                const pct = opt.isSpecial ? null
                  : Math.round((opt.correctInSet / opt.count) * 100)
                return (
                  <motion.button
                    type="button"
                    key={opt.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => onSelect(opt.id)}
                    className="w-full text-left px-4 py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-3 group"
                    style={{
                      background: opt.isSpecial
                        ? `linear-gradient(135deg, ${t.accent}22, ${t.accent}08)`
                        : 'rgba(15, 20, 35, 0.6)',
                      border: `1px solid ${opt.isSpecial ? t.border : 'rgba(30,41,59,0.8)'}`,
                    }}
                  >
                    <div
                      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: t.bg, border: `1px solid ${t.border}` }}
                    >
                      <opt.icon size={16} style={{ color: t.light }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-600 text-sm text-white">{opt.label}</p>
                        {opt.isSpecial && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-terminal"
                            style={{ background: t.bg, color: t.light }}
                          >
                            recommandé
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs font-mono">{opt.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!opt.isSpecial && pct !== null && pct > 0 && (
                        <span
                          className="text-xs font-terminal"
                          style={{ color: pct >= 80 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f87171' }}
                        >
                          {pct}%
                        </span>
                      )}
                      <ChevronRight size={14} style={{ color: t.light }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <p className="text-slate-700 text-xs font-mono text-center mt-4">
              {canResume
                ? 'Un brouillon est conservé sur cet appareil si tu quittes avec « Retour ». Choisir un set lance un nouveau tirage.'
                : 'Les questions sont mélangées à chaque session'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
