import { useState, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import Dashboard from './components/Dashboard'
import QuizMode from './components/QuizMode'
import SetSelector from './components/SetSelector'
import { CATEGORIES, getAllQuestions, shuffle, prepareQuestionForSession, uniqueQuestionsById } from './data/quizData'

const STORAGE_KEY = 'fullstack-quiz-scores'
const COURSES_DONE_KEY = 'fullstack-quiz-courses-done'
const EXPORT_VERSION = 2

function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveScores(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch {}
}

/** Objet questionId → true lorsque le module de cours est marqué terminé */
function loadCoursesDone() {
  try {
    const raw = localStorage.getItem(COURSES_DONE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function saveCoursesDone(done) {
  try {
    localStorage.setItem(COURSES_DONE_KEY, JSON.stringify(done))
  } catch {}
}

export default function App() {
  const [scores, setScores] = useState(loadScores)
  const [coursesDone, setCoursesDone] = useState(loadCoursesDone)
  const [activeCategory, setActiveCategory] = useState(null)   // category currently being quizzed
  const [pendingCategory, setPendingCategory] = useState(null) // category waiting for set selection
  const [sessionQuestions, setSessionQuestions] = useState([]) // shuffled questions for this session
  const [sessionLabel, setSessionLabel] = useState('')
  const [importStatus, setImportStatus] = useState(null) // 'success' | 'error' | null
  const fileInputRef = useRef(null)

  const handleScoreUpdate = useCallback((categoryId, newScore) => {
    setScores(prev => {
      const updated = { ...prev, [categoryId]: newScore }
      saveScores(updated)
      return updated
    })
  }, [])

  const handleCourseDoneToggle = useCallback((questionId, done) => {
    setCoursesDone((prev) => {
      const next = { ...prev }
      if (done) next[questionId] = true
      else delete next[questionId]
      saveCoursesDone(next)
      return next
    })
  }, [])

  const handleExport = useCallback(() => {
    const payload = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      scores,
      coursesDone,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `fullstack-quiz-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [scores, coursesDone])

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        // accepte le format enveloppé { version, scores } ou directement l'objet scores
        const incoming = parsed.scores ?? parsed
        // validation légère : les clés doivent correspondre à des catégories connues
        const validKeys = CATEGORIES.map(c => c.id)
        const keys = Object.keys(incoming)
        if (keys.length > 0 && !keys.some(k => validKeys.includes(k))) {
          throw new Error('Format invalide')
        }
        const merged = { ...scores, ...incoming }
        setScores(merged)
        saveScores(merged)
        const incomingDone = parsed.coursesDone ?? parsed.completedCourses
        if (incomingDone && typeof incomingDone === 'object' && !Array.isArray(incomingDone)) {
          setCoursesDone((prev) => {
            const next = { ...prev, ...incomingDone }
            saveCoursesDone(next)
            return next
          })
        }
        setImportStatus('success')
      } catch {
        setImportStatus('error')
      } finally {
        // reset input so the same file can be re-imported
        e.target.value = ''
        setTimeout(() => setImportStatus(null), 3500)
      }
    }
    reader.readAsText(file)
  }, [scores])

  const handleResetScores = useCallback(() => {
    setScores({})
    saveScores({})
  }, [])

  const handleResetCoursesDone = useCallback(() => {
    setCoursesDone({})
    saveCoursesDone({})
  }, [])

  const handleStartQuiz = (categoryId) => {
    setPendingCategory(categoryId)
  }

  const handleSetSelect = useCallback((setId) => {
    const category = CATEGORIES.find(c => c.id === pendingCategory)
    if (!category) return

    let raw
    let label
    if (setId === 'all') {
      raw = uniqueQuestionsById(shuffle(getAllQuestions(category)))
      label = 'Tout mélangé'
    } else {
      const set = category.sets.find(s => s.id === setId)
      raw = uniqueQuestionsById(shuffle(set?.questions ?? []))
      label = set?.label ?? setId
    }

    const questions = raw.map(prepareQuestionForSession)
    setSessionQuestions(questions)
    setSessionLabel(label)
    setPendingCategory(null)
    setActiveCategory(pendingCategory)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pendingCategory])

  const handleBack = () => {
    setActiveCategory(null)
    setSessionQuestions([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const category = CATEGORIES.find(c => c.id === activeCategory)
  const pendingCategoryData = CATEGORIES.find(c => c.id === pendingCategory)

  return (
    <div className="min-h-screen">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Set selector modal */}
      {pendingCategoryData && (
        <SetSelector
          category={pendingCategoryData}
          scores={scores[pendingCategory]}
          onSelect={handleSetSelect}
          onClose={() => setPendingCategory(null)}
        />
      )}

      <AnimatePresence mode="wait">
        {activeCategory && category ? (
          <QuizMode
            key={`quiz-${activeCategory}-${sessionLabel}`}
            category={category}
            questions={sessionQuestions}
            sessionLabel={sessionLabel}
            initialResults={scores[activeCategory]?.results || {}}
            onBack={handleBack}
            onScoreUpdate={handleScoreUpdate}
          />
        ) : (
          <Dashboard
            key="dashboard"
            scores={scores}
            coursesDone={coursesDone}
            onStartQuiz={handleStartQuiz}
            onExport={handleExport}
            onImport={handleImportClick}
            onResetScores={handleResetScores}
            onResetCoursesDone={handleResetCoursesDone}
            onCourseDoneToggle={handleCourseDoneToggle}
            importStatus={importStatus}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
