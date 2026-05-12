import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw, Trophy, ChevronRight, Home, Shuffle } from 'lucide-react'
import QuestionCard from './QuestionCard'

const themeColors = {
  sql:        { accent: '#3b82f6', light: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)',  text: 'text-sql' },
  node:       { accent: '#22c55e', light: '#4ade80', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',   text: 'text-node' },
  react:      { accent: '#06b6d4', light: '#22d3ee', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.3)',   text: 'text-react' },
  django:     { accent: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  text: 'text-django' },
  typescript: { accent: '#6366f1', light: '#818cf8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.3)',  text: 'text-typescript' },
}

function ResultScreen({ questions, results, onRetry, onHome, onNewSet, theme }) {
  const t = themeColors[theme]
  const total = questions.length
  const correct = Object.values(results).filter(r => r.correct).length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const grade = pct >= 80
    ? { label: 'Prêt pour l\'entretien !', emoji: '🏆', color: '#4ade80' }
    : pct >= 60
    ? { label: 'Presque là !', emoji: '💪', color: '#fbbf24' }
    : { label: 'Continue à réviser', emoji: '📚', color: '#f87171' }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-6xl mb-4"
      >
        {grade.emoji}
      </motion.div>

      <h2 className="font-display font-800 text-3xl text-white mb-2">{grade.label}</h2>
      <p className="text-slate-400 font-mono mb-6">
        {correct} bonne{correct > 1 ? 's' : ''} réponse{correct > 1 ? 's' : ''} sur {total}
      </p>

      {/* Score ring */}
      <div className="flex justify-center mb-8">
        <div
          className="relative w-32 h-32 rounded-full flex items-center justify-center"
          style={{ border: `3px solid ${t.accent}44`, background: t.bg }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: `conic-gradient(${t.accent} ${pct * 3.6}deg, transparent ${pct * 3.6}deg)`,
              mask: 'radial-gradient(circle at center, transparent 52%, black 52%)',
              WebkitMask: 'radial-gradient(circle at center, transparent 52%, black 52%)',
            }}
          />
          <div className="text-center z-10">
            <div className="font-display font-800 text-3xl" style={{ color: grade.color }}>{pct}%</div>
            <div className="text-slate-500 text-xs font-mono">score</div>
          </div>
        </div>
      </div>

      {/* Per-question recap */}
      <div className="space-y-2 mb-8 text-left max-h-64 overflow-y-auto">
        {questions.map((q, i) => {
          const r = results[q.id]
          return (
            <div
              key={q.id}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{
                background: r?.correct ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${r?.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              <span className={`text-lg ${r?.correct ? 'text-green-400' : 'text-red-400'}`}>
                {r?.correct ? '✓' : '✗'}
              </span>
              <p className="text-sm font-mono text-slate-300 truncate flex-1">{q.keyword}</p>
              <span className="text-xs font-terminal text-slate-600 shrink-0">Q{i + 1}</span>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-display font-600 text-xs transition-all hover:scale-[1.02]"
          style={{ background: t.bg, color: t.light, border: `1px solid ${t.border}` }}
        >
          <RotateCcw size={13} />
          Rejouer
        </button>
        <button
          onClick={onNewSet}
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-display font-600 text-xs transition-all hover:scale-[1.02]"
          style={{ background: t.bg, color: t.light, border: `1px solid ${t.border}` }}
        >
          <Shuffle size={13} />
          Autre set
        </button>
        <button
          onClick={onHome}
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-display font-600 text-xs transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(30,41,59,0.6)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.8)' }}
        >
          <Home size={13} />
          Accueil
        </button>
      </div>
    </motion.div>
  )
}

export default function QuizMode({
  category,
  questions,
  sessionLabel,
  initialResults,
  initialQuestionIndex,
  onExit,
  onQuizCompleted,
  onSessionSnapshot,
  onScoreUpdate,
}) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (typeof initialQuestionIndex !== 'number' || Number.isNaN(initialQuestionIndex)) return 0
    return Math.max(0, initialQuestionIndex)
  })
  const [results, setResults] = useState(initialResults || {})
  const [isFinished, setIsFinished] = useState(false)
  const t = themeColors[category.theme]

  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(questions.length - 1)
    }
  }, [questions.length, currentIndex])

  useEffect(() => {
    if (isFinished) onQuizCompleted?.()
  }, [isFinished, onQuizCompleted])

  useEffect(() => {
    if (isFinished || questions.length === 0) return
    onSessionSnapshot?.({ currentIndex })
  }, [currentIndex, isFinished, questions.length, onSessionSnapshot])

  const handleAnswer = useCallback((questionId, correct) => {
    setResults(prev => {
      const newResults = { ...prev, [questionId]: { correct, answered: true } }
      const answered = Object.keys(newResults).length
      const correctCount = Object.values(newResults).filter(r => r.correct).length
      onScoreUpdate(category.id, { answered, correct: correctCount, results: newResults })
      return newResults
    })
  }, [category.id, onScoreUpdate])

  const handleLeavePause = () => {
    onExit({ type: 'pause', currentIndex })
  }

  const handleLeaveFinished = () => {
    onExit({ type: 'finished' })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setIsFinished(true)
    }
  }

  const handleRetry = () => {
    setResults({})
    setCurrentIndex(0)
    setIsFinished(false)
    onScoreUpdate(category.id, { answered: 0, correct: 0, results: {} })
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswered = results[currentQuestion?.id]
  const progressPct = ((currentIndex + (currentAnswered ? 1 : 0)) / questions.length) * 100

  const answeredEntries = Object.values(results)
  const correctCount = answeredEntries.filter(r => r.correct).length
  const wrongCount = answeredEntries.filter(r => !r.correct).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#050810] grid-bg"
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 glass px-4 py-3 flex items-center gap-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={handleLeavePause}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-mono shrink-0"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <div className="flex-1">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.light})` }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Compteurs correct / faux */}
          {answeredEntries.length > 0 && (
            <div className="flex items-center gap-1.5">
              <motion.span
                key={correctCount}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-600"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                ✓ {correctCount}
              </motion.span>
              <motion.span
                key={`w${wrongCount}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-600"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                ✗ {wrongCount}
              </motion.span>
            </div>
          )}

          <span className="text-slate-500 text-xs font-mono hidden sm:block">
            {currentIndex + 1}/{questions.length}
          </span>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ background: t.bg, border: `1px solid ${t.border}` }}
          >
            <span className={`text-xs font-display font-700 ${t.text}`}>{category.label}</span>
            {sessionLabel && (
              <span className="text-slate-500 text-xs font-mono hidden sm:block">· {sessionLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {isFinished ? (
            <ResultScreen
              key="result"
              questions={questions}
              results={results}
              onRetry={handleRetry}
              onHome={handleLeaveFinished}
              onNewSet={handleLeaveFinished}
              theme={category.theme}
            />
          ) : (
            <motion.div key={`q-${currentIndex}`}>
              <QuestionCard
                question={currentQuestion}
                theme={category.theme}
                questionNumber={currentIndex + 1}
                total={questions.length}
                onAnswer={(correct) => handleAnswer(currentQuestion.id, correct)}
              />

              <AnimatePresence>
                {currentAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end mt-2"
                  >
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-600 text-sm transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${t.accent}33, ${t.accent}11)`,
                        color: t.light,
                        border: `1px solid ${t.border}`,
                        boxShadow: `0 0 20px ${t.accent}22`,
                      }}
                    >
                      {currentIndex < questions.length - 1
                        ? <>Question suivante <ChevronRight size={16} /></>
                        : <>Voir les résultats <Trophy size={16} /></>
                      }
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
