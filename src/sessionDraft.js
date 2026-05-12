const SESSION_DRAFT_KEY = 'fullstack-quiz-session-draft'
const SESSION_DRAFT_VERSION = 1

/**
 * Brouillon de quiz : ordre des questions après prepareQuestionForSession (indices `correct` figés).
 * Permet de reprendre avec le même tirage et la même question courante.
 */
export function loadSessionDraft() {
  try {
    const raw = localStorage.getItem(SESSION_DRAFT_KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (d?.version !== SESSION_DRAFT_VERSION || !d.categoryId || !Array.isArray(d.questions)) return null
    return d
  } catch {
    return null
  }
}

export function saveSessionDraft(draft) {
  try {
    const payload = {
      version: SESSION_DRAFT_VERSION,
      ...draft,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(payload))
  } catch {}
}

export function clearSessionDraft() {
  try {
    localStorage.removeItem(SESSION_DRAFT_KEY)
  } catch {}
}
