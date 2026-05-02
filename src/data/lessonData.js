import { validateLessonBySubject } from './lessonValidation'

const lessonModules = import.meta.glob('./lessons/**/*.json', {
  eager: true,
})

const collections = Object.values(lessonModules)
  .map((module) => module.default)
  .map((collection) => {
    const lessons = (collection.lessons || []).map((lesson, lessonIndex) => {
      const errors = validateLessonBySubject(collection.subjectId, lesson, lessonIndex)
      if (errors.length > 0) {
        console.warn(
          `[lesson-validation] ${collection.grade}/${collection.subjectId}/${lesson.id}: ${errors.join(', ')}`,
        )
      }
      return lesson
    })
    return {
      ...collection,
      lessons,
    }
  })
  .sort((a, b) => a.grade - b.grade || a.subject.localeCompare(b.subject))

export function getAllLessonCollections() {
  return collections
}

export function getLessonsByGradeAndSubject(gradeId, subjectId) {
  return collections.find(
    (item) => String(item.grade) === String(gradeId) && item.subjectId === subjectId,
  )
}

export function getLessonById(gradeId, subjectId, lessonId) {
  return getLessonsByGradeAndSubject(gradeId, subjectId)?.lessons.find(
    (lesson) => lesson.id === lessonId,
  )
}
