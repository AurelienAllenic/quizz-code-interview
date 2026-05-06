import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Target,
  Zap,
  BookOpen,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  RotateCcw,
  GraduationCap,
} from 'lucide-react'
import CategoryCard from './CategoryCard'
import CoursesPreview from './CoursesPreview'
import ConfirmModal from './ConfirmModal'
import { CATEGORIES, getAllQuestions } from '../data/quizData'

function GlobalStats({ scores }) {
  const totalQuestions = CATEGORIES.reduce((s, c) => s + getAllQuestions(c).length, 0)
  const totalAnswered = Object.values(scores).reduce((s, sc) => s + (sc?.answered || 0), 0)
  const totalCorrect = Object.values(scores).reduce((s, sc) => s + (sc?.correct || 0), 0)
  const globalPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const readyCount = CATEGORIES.filter(c => {
    const s = scores[c.id]
    if (!s || !s.correct) return false
    return Math.round((s.correct / getAllQuestions(c).length) * 100) >= 80
  }).length

  const stats = [
    { icon: Target, label: 'Questions tentées', value: `${totalAnswered}/${totalQuestions}`, color: '#60a5fa' },
    { icon: Brain, label: 'Taux de réussite', value: `${globalPct}%`, color: '#22d3ee' },
    { icon: Zap, label: 'Score global', value: `${totalCorrect}/${totalAnswered || '—'}`, color: '#4ade80' },
    { icon: BookOpen, label: 'Catégories maîtrisées', value: `${readyCount}/${CATEGORIES.length}`, color: '#fbbf24' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.07 }}
          className="glass rounded-xl p-4"
          style={{ border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <stat.icon size={16} style={{ color: stat.color }} className="mb-2" />
          <div className="font-display font-800 text-xl" style={{ color: stat.color }}>{stat.value}</div>
          <div className="text-slate-500 text-xs font-mono mt-0.5">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function DataPortability({
  scores,
  coursesDone,
  onExport,
  onImport,
  importStatus,
  onOpenResetQuiz,
  onOpenResetCourses,
}) {
  const totalAnswered = Object.values(scores).reduce((s, sc) => s + (sc?.answered || 0), 0)
  const hasQuizData = totalAnswered > 0
  const coursesMarked = Object.keys(coursesDone ?? {}).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mb-8"
    >
      <div
        className="glass rounded-2xl p-4"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-sm font-display font-600">Sauvegarde de la progression</p>
            <p className="text-slate-600 text-xs font-mono mt-0.5 leading-relaxed">
              {hasQuizData
                ? `${totalAnswered} réponse${totalAnswered > 1 ? 's' : ''} quiz enregistrée${totalAnswered > 1 ? 's' : ''}`
                : 'Aucune réponse quiz enregistrée pour l’instant'}
              {coursesMarked > 0 && (
                <>
                  {' · '}
                  <span className="text-slate-500">{coursesMarked} module{coursesMarked > 1 ? 's' : ''} de cours marqué{coursesMarked > 1 ? 's' : ''} terminé{coursesMarked > 1 ? 's' : ''}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0">
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                type="button"
                onClick={onExport}
                disabled={!hasQuizData && coursesMarked === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-terminal transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  color: '#4ade80',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
                title="Exporter scores quiz et progression des cours"
              >
                <Download size={13} />
                Exporter
              </button>

              <button
                type="button"
                onClick={onImport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-terminal transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.3)',
                }}
                title="Importer un fichier JSON"
              >
                <Upload size={13} />
                Importer
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-end sm:border-l sm:border-white/10 sm:pl-3 lg:border-l-0 lg:pl-0 lg:border-t-0 lg:pt-0 pt-3 border-t border-white/[0.07] lg:ml-0">
              <button
                type="button"
                onClick={onOpenResetQuiz}
                disabled={!hasQuizData}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-terminal transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.28)',
                }}
                title="Effacer tous les résultats des quiz"
              >
                <RotateCcw size={13} />
                Reset quiz
              </button>
              <button
                type="button"
                onClick={onOpenResetCourses}
                disabled={coursesMarked === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-terminal transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(129,140,248,0.1)',
                  color: '#818cf8',
                  border: '1px solid rgba(129,140,248,0.35)',
                }}
                title="Effacer les modules de cours terminés"
              >
                <GraduationCap size={13} />
                Reset cours
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {importStatus && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono"
                style={{
                  background: importStatus === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${importStatus === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  color: importStatus === 'success' ? '#4ade80' : '#f87171',
                }}
              >
                {importStatus === 'success'
                  ? <><CheckCircle2 size={13} /> Données importées avec succès (scores et cours fusionnés si présents).</>
                  : <><XCircle size={13} /> Fichier invalide. Importe un JSON exporté depuis cette app.</>
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function Dashboard({
  scores,
  coursesDone,
  onStartQuiz,
  onExport,
  onImport,
  onResetScores,
  onResetCoursesDone,
  onCourseDoneToggle,
  importStatus,
}) {
  const [pendingReset, setPendingReset] = useState(null)

  return (
    <>
      <ConfirmModal
        open={pendingReset === 'quiz'}
        title="Réinitialiser les quiz ?"
        message="Tous les scores et le détail des réponses par question seront effacés sur cet appareil. Les cours marqués comme terminés ne sont pas modifiés."
        confirmLabel="Oui, effacer les quiz"
        cancelLabel="Annuler"
        danger
        onConfirm={() => {
          onResetScores()
          setPendingReset(null)
        }}
        onCancel={() => setPendingReset(null)}
      />
      <ConfirmModal
        open={pendingReset === 'courses'}
        title={"Réinitialiser l'avancée des cours ?"}
        message={
          'Toutes les validations « cours terminé » seront supprimées. Tu pourras les valider à nouveau après relecture.'
        }
        confirmLabel={"Oui, effacer l'avancée cours"}
        cancelLabel="Annuler"
        danger
        onConfirm={() => {
          onResetCoursesDone()
          setPendingReset(null)
        }}
        onCancel={() => setPendingReset(null)}
      />

      <div className="min-h-screen bg-[#050810] grid-bg">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(59,130,246,0.06)' }} />
        <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full blur-[120px]" style={{ background: 'rgba(34,197,94,0.06)' }} />
        <div className="absolute bottom-[-20%] left-[30%] w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(6,182,212,0.04)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full blur-[120px]" style={{ background: 'rgba(245,158,11,0.05)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs font-terminal uppercase tracking-wider">Préparation entretien Fullstack</span>
          </div>

          <h1 className="font-display font-800 text-5xl md:text-6xl text-white mb-3 leading-tight">
            Knowledge{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #22d3ee, #4ade80)' }}>
                Quiz
              </span>
            </span>
          </h1>

          <p className="text-slate-400 text-base font-mono max-w-xl mx-auto">
            Teste tes connaissances sur les 4 piliers du dev Fullstack.
            <br />
            <span className="text-slate-600">SQL · Node.js · React · Python/Django</span>
          </p>
        </motion.div>

        {/* Global stats */}
        <GlobalStats scores={scores} />

        {/* Data portability */}
        <DataPortability
          scores={scores}
          coursesDone={coursesDone}
          onExport={onExport}
          onImport={onImport}
          importStatus={importStatus}
          onOpenResetQuiz={() => setPendingReset('quiz')}
          onOpenResetCourses={() => setPendingReset('courses')}
        />

        <CoursesPreview
          categories={CATEGORIES}
          coursesDone={coursesDone}
          onCourseDoneToggle={onCourseDoneToggle}
        />

        {/* 5-category grid : 2 cols on md, last card centered if odd */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.id}
              className={CATEGORIES.length % 2 !== 0 && i === CATEGORIES.length - 1
                ? 'md:col-span-2 md:max-w-lg md:mx-auto md:w-full'
                : ''}
            >
              <CategoryCard
                category={cat}
                score={scores[cat.id]}
                onStart={() => onStartQuiz(cat.id)}
                index={i}
              />
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-slate-700 text-xs font-mono mt-10"
        >
          80 questions · 5 catégories · 2 sets par catégorie · ordre aléatoire à chaque session
        </motion.p>
      </div>
    </div>
    </>
  )
}
