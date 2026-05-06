import { motion } from 'framer-motion'
import { ChevronRight, CheckCircle2, Circle, Layers } from 'lucide-react'
import { getAllQuestions } from '../data/quizData'

const themeConfig = {
  sql: {
    glow: 'glow-sql', border: 'border-sql', text: 'text-sql', bg: 'bg-sql',
    gradient: 'gradient-sql', accent: '#3b82f6', orb: 'rgba(59,130,246,0.15)',
  },
  node: {
    glow: 'glow-node', border: 'border-node', text: 'text-node', bg: 'bg-node',
    gradient: 'gradient-node', accent: '#22c55e', orb: 'rgba(34,197,94,0.15)',
  },
  react: {
    glow: 'glow-react', border: 'border-react', text: 'text-react', bg: 'bg-react',
    gradient: 'gradient-react', accent: '#06b6d4', orb: 'rgba(6,182,212,0.15)',
  },
  django: {
    glow: 'glow-django', border: 'border-django', text: 'text-django', bg: 'bg-django',
    gradient: 'gradient-django', accent: '#f59e0b', orb: 'rgba(245,158,11,0.15)',
  },
  typescript: {
    glow: 'glow-typescript', border: 'border-typescript', text: 'text-typescript', bg: 'bg-typescript',
    gradient: 'gradient-typescript', accent: '#6366f1', orb: 'rgba(99,102,241,0.15)',
  },
}

export default function CategoryCard({ category, score, onStart, index }) {
  const t = themeConfig[category.theme]
  const allQuestions = getAllQuestions(category)
  const total = allQuestions.length
  const answered = score?.answered || 0
  const correct = score?.correct || 0
  const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0
  const readiness = pct >= 80 ? 'Prêt ✓' : pct >= 50 ? 'En progrès' : answered > 0 ? 'Débutant' : 'Non commencé'
  const readinessColor = pct >= 80 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#94a3b8'

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl border ${t.border} ${t.glow} glass cursor-pointer group`}
      onClick={onStart}
      style={{ background: 'rgba(8, 12, 22, 0.85)' }}
    >
      {/* Ambient orb */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
        style={{ background: t.orb }}
      />

      {/* Header */}
      <div className={`${t.gradient} p-5 pb-4`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{category.icon}</span>
              <h2 className={`font-display font-800 text-2xl ${t.text}`}>{category.label}</h2>
            </div>
            <p className="text-slate-400 text-sm font-terminal">{category.subtitle}</p>
          </div>
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full border-2"
            style={{ borderColor: t.accent + '66' }}
          >
            <span className={`font-display font-800 text-lg ${t.text}`}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-1 pb-2">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-mono">Progression</span>
          <span style={{ color: readinessColor }} className="font-terminal">{readiness}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.accent}aa)` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 text-slate-600 font-mono">
          <span>{correct}/{answered} correctes</span>
          <span>{total} questions · {category.sets.length} sets</span>
        </div>
      </div>

      {/* Sets */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers size={11} className="text-slate-500" />
          <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Sets disponibles</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {category.sets.map(set => {
            const setCorrect = set.questions.filter(q => score?.results?.[q.id]?.correct).length
            const setAnswered = set.questions.filter(q => score?.results?.[q.id]).length
            const setPct = setAnswered > 0 ? Math.round((setCorrect / set.questions.length) * 100) : null
            return (
              <div
                key={set.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: t.bg, border: `1px solid ${t.accent}33` }}
              >
                <span className={`text-xs font-mono ${t.text}`}>{set.label}</span>
                {setPct !== null && (
                  <span
                    className="text-xs font-terminal"
                    style={{ color: setPct >= 80 ? '#4ade80' : setPct >= 50 ? '#fbbf24' : '#f87171' }}
                  >
                    {setPct}%
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Questions dots */}
      <div className="px-5 pb-4">
        <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mb-2">{total} questions au total</p>
        <div className="grid grid-cols-8 gap-1">
          {allQuestions.slice(0, 16).map((q, i) => {
            const wasAnswered = score?.results?.[q.id]
            const wasCorrect = wasAnswered?.correct
            return (
              <div key={q.id} className="flex items-center">
                {wasAnswered ? (
                  wasCorrect
                    ? <CheckCircle2 size={11} color="#4ade80" />
                    : <CheckCircle2 size={11} color="#f87171" />
                ) : (
                  <Circle size={11} color="#1e293b" />
                )}
              </div>
            )
          })}
          {total > 16 && (
            <span className="text-slate-700 text-xs font-mono col-span-2">+{total - 16}</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div
        className={`mx-5 mb-5 flex items-center justify-between px-4 py-3 rounded-xl ${t.bg} transition-all duration-300`}
        style={{ border: `1px solid ${t.accent}44` }}
      >
        <span className={`font-display font-600 text-sm ${t.text}`}>
          {answered === 0 ? 'Choisir un set' : 'Continuer / Nouveau set'}
        </span>
        <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronRight size={16} color={t.accent} />
        </motion.div>
      </div>
    </motion.div>
  )
}
