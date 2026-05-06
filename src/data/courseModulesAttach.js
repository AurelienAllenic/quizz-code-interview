import { SQL_COURSE_MODULES } from './courses/sqlCourses.js'
import { NODE_COURSE_MODULES } from './courses/nodeCourses.js'
import { REACT_COURSE_MODULES } from './courses/reactCourses.js'

import { DJANGO_COURSE_MODULES } from './courses/djangoCourses.js'
import { TYPESCRIPT_COURSE_MODULES } from './courses/typescriptCourses.js'

const WITH_COURSES = new Set(['sql', 'node', 'react', 'django', 'typescript'])
const MERGED = {
  ...SQL_COURSE_MODULES,
  ...NODE_COURSE_MODULES,
  ...REACT_COURSE_MODULES,
  ...DJANGO_COURSE_MODULES,
  ...TYPESCRIPT_COURSE_MODULES,
}

/**
 * Attache `courseContent` (Markdown) à chaque question des catégories concernées.
 */
export function attachCourseModules(categories) {
  return categories.map((cat) => {
    if (!WITH_COURSES.has(cat.id)) return cat
    return {
      ...cat,
      sets: cat.sets.map((set) => ({
        ...set,
        questions: set.questions.map((q) => ({
          ...q,
          courseContent: MERGED[q.id]
            ?? '## Module en cours de rédaction\n\nAjoute une entrée pour cet `id` dans `src/data/courses/`.',
        })),
      })),
    }
  })
}
