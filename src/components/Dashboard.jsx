import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Target, Zap, BookOpen, Download, Upload, Trash2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import CategoryCard from './CategoryCard'
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
    { icon: BookOpen, label: 'Catégories maîtrisées', value: `${readyCount}/4`, color: '#fbbf24' },
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

function DataPortability({ scores, onExport, onImport, onReset, importStatus }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const totalAnswered = Object.values(scores).reduce((s, sc) => s + (sc?.answered || 0), 0)
  const hasData = totalAnswered > 0

  const handleReset = () => {
    if (showResetConfirm) {
      onReset()
      setShowResetConfirm(false)
    } else {
      setShowResetConfirm(true)
      setTimeout(() => setShowResetConfirm(false), 4000)
    }
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Label */}
          <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-sm font-display font-600">Sauvegarde de la progression</p>
            <p className="text-slate-600 text-xs font-mono mt-0.5">
              {hasData
                ? `${totalAnswered} réponse${totalAnswered > 1 ? 's' : ''} enregistrée${totalAnswered > 1 ? 's' : ''} · exportez pour ne rien perdre`
                : 'Aucune progression à sauvegarder pour l\'instant'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export */}
            <button
              onClick={onExport}
              disabled={!hasData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-terminal transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(34,197,94,0.1)',
                color: '#4ade80',
                border: '1px solid rgba(34,197,94,0.3)',
              }}
              title="Télécharger la progression en JSON"
            >
              <Download size={13} />
              Exporter
            </button>

            {/* Import */}
            <button
              onClick={onImport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-terminal transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(59,130,246,0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
              title="Importer un fichier JSON de progression"
            >
              <Upload size={13} />
              Importer
            </button>

            {/* Reset */}
            {hasData && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-terminal transition-all hover:scale-105 active:scale-95"
                style={{
                  background: showResetConfirm ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  color: showResetConfirm ? '#f87171' : '#475569',
                  border: `1px solid ${showResetConfirm ? 'rgba(239,68,68,0.4)' : 'rgba(71,85,105,0.4)'}`,
                }}
                title="Réinitialiser toute la progression"
              >
                {showResetConfirm ? <AlertTriangle size={13} /> : <Trash2 size={13} />}
                {showResetConfirm ? 'Confirmer ?' : 'Reset'}
              </button>
            )}
          </div>
        </div>

        {/* Status toast */}
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
                  ? <><CheckCircle2 size={13} /> Progression importée avec succès — les scores ont été fusionnés.</>
                  : <><XCircle size={13} /> Fichier invalide. Assure-toi d'importer un fichier exporté depuis cette app.</>
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function Dashboard({ scores, onStartQuiz, onExport, onImport, onReset, importStatus }) {
  return (
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
          onExport={onExport}
          onImport={onImport}
          onReset={onReset}
          importStatus={importStatus}
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
  )
}
