import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react'

const themeColors = {
  sql:        { accent: '#3b82f6', accentLight: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)' },
  node:       { accent: '#22c55e', accentLight: '#4ade80', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)' },
  react:      { accent: '#06b6d4', accentLight: '#22d3ee', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.3)' },
  django:     { accent: '#f59e0b', accentLight: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)' },
  typescript: { accent: '#6366f1', accentLight: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.3)' },
}

function renderExplanation(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```')) return null
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <p key={i} className="text-slate-300 text-sm leading-relaxed mb-1">
        {parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} className="text-white font-700">{part}</strong>
            : part
        )}
      </p>
    )
  })
}

export default function QuestionCard({ question, theme, questionNumber, total, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const t = themeColors[theme]
  const isAnswered = selected !== null
  const isCorrect = selected === question.correct

  const handleSelect = (idx) => {
    if (isAnswered) return
    setSelected(idx)
    onAnswer(idx === question.correct)
    setTimeout(() => setShowExplanation(true), 400)
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* Question header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-terminal px-2 py-1 rounded-md"
              style={{ background: t.bg, color: t.accentLight, border: `1px solid ${t.border}` }}
            >
              {question.keyword}
            </span>
            <span className="text-slate-600 text-xs font-mono">
              Q{questionNumber}/{total}
            </span>
          </div>
          {isAnswered && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5"
            >
              {isCorrect
                ? <><CheckCircle2 size={16} color="#4ade80" /><span className="text-green-400 text-xs font-terminal">Correct !</span></>
                : <><XCircle size={16} color="#f87171" /><span className="text-red-400 text-xs font-terminal">Incorrect</span></>
              }
            </motion.div>
          )}
        </div>
        <h3 className="font-display font-700 text-lg text-white leading-snug">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-5">
        {question.options.map((option, idx) => {
          let borderColor = 'rgba(30, 41, 59, 0.8)'
          let bg = 'rgba(15, 20, 35, 0.6)'
          let textColor = '#94a3b8'
          let icon = null

          if (isAnswered) {
            if (idx === question.correct) {
              borderColor = '#22c55e'
              bg = 'rgba(34, 197, 94, 0.08)'
              textColor = '#4ade80'
              icon = <CheckCircle2 size={16} color="#4ade80" className="shrink-0" />
            } else if (idx === selected && !isCorrect) {
              borderColor = '#ef4444'
              bg = 'rgba(239, 68, 68, 0.08)'
              textColor = '#f87171'
              icon = <XCircle size={16} color="#f87171" className="shrink-0" />
            } else {
              textColor = '#475569'
            }
          } else if (selected === idx) {
            borderColor = t.accent
            bg = t.bg
            textColor = t.accentLight
          }

          return (
            <motion.button
              key={`${question.id}-${idx}`}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              whileHover={!isAnswered ? { scale: 1.01, x: 4 } : {}}
              whileTap={!isAnswered ? { scale: 0.99 } : {}}
              className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-3 group"
              style={{
                border: `1px solid ${borderColor}`,
                background: bg,
                cursor: isAnswered ? 'default' : 'pointer',
              }}
            >
              <span
                className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-terminal font-700"
                style={{
                  background: isAnswered && idx === question.correct
                    ? 'rgba(34,197,94,0.2)'
                    : isAnswered && idx === selected && !isCorrect
                    ? 'rgba(239,68,68,0.2)'
                    : `${t.bg}`,
                  color: isAnswered && idx === question.correct
                    ? '#4ade80'
                    : isAnswered && idx === selected && !isCorrect
                    ? '#f87171'
                    : t.accentLight,
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-sm font-mono flex-1" style={{ color: textColor }}>
                {option}
              </span>
              {icon}
            </motion.button>
          )
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-4 mb-4"
              style={{
                background: 'rgba(10, 15, 28, 0.9)',
                border: `1px solid ${t.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} style={{ color: t.accentLight }} />
                <span className="text-xs font-terminal uppercase tracking-wider" style={{ color: t.accentLight }}>
                  Explication
                </span>
              </div>
              <div className="space-y-1">
                {renderExplanation(question.explanation)}
              </div>
              {question.explanation.includes('```') && (
                <div
                  className="mt-3 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {question.explanation
                    .split('\n')
                    .filter((l, i, arr) => {
                      const inBlock = arr.slice(0, i).filter(x => x.startsWith('```')).length % 2 === 1
                      return inBlock && !l.startsWith('```')
                    })
                    .join('\n')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
