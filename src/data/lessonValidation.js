const REQUIRED_SECTION_TYPES = [
  'introduction',
  'main_discussion',
  'animated_explanation',
  'guided_examples',
  'key_terms',
  'summary',
]

const SUBJECT_KEYWORDS = {
  filipino: ['paksa', 'akda', 'nobela', 'talumpati', 'panitikan', 'wika'],
  english: ['main idea', 'detail', 'reading', 'text', 'inference', 'writing'],
  science: ['evidence', 'observation', 'variable', 'system', 'scientific'],
  math: ['equation', 'expression', 'solve', 'value', 'operation', 'mathematical'],
  ap: ['lipunan', 'kasaysayan', 'ekonomiya', 'mamamayan', 'panahon'],
  ict: ['digital', 'computer', 'file', 'software', 'online', 'technology'],
  mapeh: ['music', 'arts', 'fitness', 'health', 'performance', 'wellness'],
  tle: ['tool', 'procedure', 'safety', 'workplace', 'project', 'entrepreneurship'],
}

const GENERIC_TEACHING_PHRASES = [
  'you will analyze key concepts',
  'analyze key concepts',
  'explore practical applications',
  'understand examples',
  'identify key ideas',
  'connect the concept to real life',
  'evaluate one practical application',
  'this lesson focuses on',
  'this lesson introduces',
  'covered the key ideas',
]

const GENERIC_ASSESSMENT_PHRASES = [
  'core idea in',
  'real-world connection',
  'key evidence',
  'lesson application',
  'main concept discussed in the lesson',
  'how the concept appears in daily life',
  'information that supports understanding',
  'how learners apply what they studied',
  'what is a key focus in',
  'understanding the concept and applying it',
  'why are guided examples important',
  'they show how ideas work',
  'feedback helps improve answers',
  'what should you do after answering a question',
  'which habit supports better learning',
  'use evidence in your explanation',
  'identify given information',
  'choose the correct method',
  'apply steps carefully',
  'check and interpret the result',
]

const GENERIC_NARRATION_PHRASES = [
  'listen to this narration while reviewing the examples from the discussion',
  'audio explanation for',
  'listen while reviewing the examples and key terms',
]

const STOP_WORDS = new Set([
  'about',
  'also',
  'because',
  'between',
  'cannot',
  'could',
  'different',
  'example',
  'examples',
  'helps',
  'important',
  'lesson',
  'means',
  'should',
  'their',
  'there',
  'these',
  'thing',
  'things',
  'through',
  'understand',
  'where',
  'which',
  'while',
  'with',
  'without',
])

function toBlob(lesson) {
  return JSON.stringify({
    title: lesson.title,
    description: lesson.description,
    objectives: lesson.objectives,
    sections: lesson.sections,
    activity: lesson.activity,
    quiz: lesson.quiz,
  }).toLowerCase()
}

function getMainDiscussion(lesson) {
  return lesson.sections?.find((section) => section.type === 'main_discussion')
}

function getLessonVideoErrors(lesson) {
  const errors = []
  const video = lesson.video
  if (!video || typeof video !== 'object') {
    errors.push('Missing lesson.video metadata')
    return errors
  }

  const url = String(video.url || '').trim()
  const title = String(video.title || '').trim()
  const keywords = Array.isArray(video.keywords) ? video.keywords : []
  if (!Array.isArray(keywords) || keywords.length === 0) {
    errors.push('lesson.video.keywords must include at least one keyword')
  }
  if (url) {
    if (!/^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|player\.vimeo\.com\/video\/|vimeo\.com\/)/i.test(url)) {
      errors.push('lesson.video.url must be a valid YouTube/Vimeo URL')
    }
    if (!title) {
      errors.push('lesson.video.title is required when lesson.video.url is set')
    }
    const relevanceBlob = `${title} ${url}`.toLowerCase()
    const hasKeywordMatch = keywords.some((keyword) =>
      relevanceBlob.includes(String(keyword || '').toLowerCase()),
    )
    if (!hasKeywordMatch) {
      errors.push('Lesson video does not match lesson keywords')
    }
  }
  return errors
}

function getSectionMediaErrors(section, sectionIndex) {
  const errors = []
  const label = `Section ${sectionIndex + 1} (${section.type || 'unknown'})`
  const images = Array.isArray(section.images) ? section.images : []

  images.forEach((image, imageIndex) => {
    if (!image || typeof image !== 'object') {
      errors.push(`${label} image ${imageIndex + 1} must be an object`)
      return
    }
    if (!String(image.src || '').trim()) {
      errors.push(`${label} image ${imageIndex + 1} is missing src`)
    }
    if (!String(image.alt || '').trim()) {
      errors.push(`${label} image ${imageIndex + 1} is missing alt text`)
    }
  })

  if (section.audioNarration && typeof section.audioNarration === 'object') {
    if (!String(section.audioNarration.src || '').trim()) {
      errors.push(`${label} audio narration is missing src`)
    }
    const transcript = String(section.audioNarration.transcript || '').toLowerCase()
    if (GENERIC_NARRATION_PHRASES.some((phrase) => transcript.includes(phrase))) {
      errors.push(`${label} audio narration transcript is too generic`)
    }
  }

  return errors
}

function getMainDiscussionMediaPayload(mainDiscussion, lesson) {
  if (!mainDiscussion || typeof mainDiscussion !== 'object') {
    return { hasMediaPayload: false, mediaBlob: '' }
  }

  const images = Array.isArray(mainDiscussion.images) ? mainDiscussion.images : []
  const hasImages = images.length > 0
  const hasAudio = Boolean(String(mainDiscussion.audioNarration?.src || '').trim())
  const hasVideo = Boolean(String(lesson.video?.url || '').trim())
  const mediaBlob = [
    ...images.flatMap((image) => [image?.alt, image?.caption]),
    mainDiscussion.audioNarration?.transcript,
    lesson.video?.title,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return {
    hasMediaPayload: hasImages || hasAudio || hasVideo,
    mediaBlob,
  }
}

function getTeachingParagraphs(content) {
  return String(content || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length >= 80)
}

function getTitleTokens(title) {
  return String(title || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4)
}

function containsGenericTeachingOnly(content) {
  const normalized = String(content || '').toLowerCase()
  return GENERIC_TEACHING_PHRASES.some((phrase) => normalized.includes(phrase))
}

function containsGenericAssessment(content) {
  const normalized = String(content || '').toLowerCase()
  return GENERIC_ASSESSMENT_PHRASES.some((phrase) => normalized.includes(phrase))
}

function getDiscussionConceptTokens(content, title) {
  const titleTokens = new Set(getTitleTokens(title))
  return [
    ...new Set(
      String(content || '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 5)
        .filter((token) => !STOP_WORDS.has(token))
        .filter((token) => !titleTokens.has(token)),
    ),
  ]
}

function hasDiscussionGrounding(assessmentContent, discussionContent, title) {
  const normalizedAssessment = String(assessmentContent || '').toLowerCase()
  const conceptTokens = getDiscussionConceptTokens(discussionContent, title)
  const matchedTokens = conceptTokens.filter((token) => normalizedAssessment.includes(token))
  return matchedTokens.length >= 3
}

export function getLessonTeachingContentErrors(lesson) {
  const errors = []
  const mainDiscussion = getMainDiscussion(lesson)
  const content = mainDiscussion?.content || ''
  const paragraphs = getTeachingParagraphs(content)
  const { hasMediaPayload, mediaBlob } = getMainDiscussionMediaPayload(mainDiscussion, lesson)

  if (!mainDiscussion) {
    errors.push('Missing main discussion')
    return errors
  }

  if (paragraphs.length < 2 && !hasMediaPayload) {
    errors.push('Main discussion must contain at least 2 teaching paragraphs')
  }

  if (containsGenericTeachingOnly(content)) {
    errors.push('Main discussion contains generic placeholder text')
  }

  const titleTokens = getTitleTokens(lesson.title)
  const normalizedContent = `${String(content).toLowerCase()} ${mediaBlob}`.trim()
  const hasTopicSpecificContent = titleTokens.some((token) => normalizedContent.includes(token))
  const hasTeachingSignals = [
    'is ',
    'are ',
    'means',
    'refers to',
    'example',
    'for example',
    'halimbawa',
    'ay ',
    'ang ',
    'dahil',
    'because',
  ].some((signal) => normalizedContent.includes(signal))

  if (!hasTopicSpecificContent || !hasTeachingSignals) {
    errors.push('Main discussion must teach topic-specific definitions, examples, or explanations')
  }

  return errors
}

export function getLessonPracticeContentErrors(lesson) {
  const errors = []
  const discussionContent = getMainDiscussion(lesson)?.content || ''
  const activityContent = JSON.stringify(lesson.activity || {})
  const quizContent = JSON.stringify(lesson.quiz || [])

  if (containsGenericAssessment(activityContent)) {
    errors.push('Activity contains generic placeholder content')
  }

  if (containsGenericAssessment(quizContent)) {
    errors.push('Quiz contains generic placeholder content')
  }

  if (lesson.activity?.type && !hasDiscussionGrounding(activityContent, discussionContent, lesson.title)) {
    errors.push('Activity must practice concepts taught in the main discussion')
  }

  if (Array.isArray(lesson.quiz) && !hasDiscussionGrounding(quizContent, discussionContent, lesson.title)) {
    errors.push('Quiz must assess concepts taught in the main discussion')
  }

  return errors
}

function getStructureErrors(lesson, lessonIndex = 0) {
  const errors = []
  const expectsMixedQuiz = lessonIndex % 2 === 1 // even-numbered lesson (1-based)
  const trueFalseQuestions = (lesson.quiz || []).filter((question) => question.type === 'true_false')
  const mismatchedTrueFalseText = (lesson.quiz || []).filter((question) => {
    const hasTrueFalsePrefix = /^\\s*true\\s*or\\s*false\\s*:/i.test(String(question.question || ''))
    return hasTrueFalsePrefix && question.type !== 'true_false'
  })

  if (expectsMixedQuiz && trueFalseQuestions.length === 0) {
    errors.push('Even-numbered lessons must include at least one true/false quiz item')
  }

  if (!expectsMixedQuiz && trueFalseQuestions.length > 0) {
    errors.push('Odd-numbered lessons must use multiple-choice only')
  }

  if (mismatchedTrueFalseText.length > 0) {
    errors.push('Questions prefixed with "True or False:" must use type "true_false"')
  }

  for (const question of trueFalseQuestions) {
    if (!['True', 'False'].includes(question.answer)) {
      errors.push('True/false answers must be either "True" or "False"')
      break
    }
    if (Array.isArray(question.choices) && question.choices.length > 0) {
      errors.push('True/false questions must not include multiple-choice options array')
      break
    }
  }

  if (expectsMixedQuiz && lesson.activity?.type !== 'sequence') {
    errors.push('Even-numbered lessons must use sequence activity (drag-and-drop style)')
  }

  if (lesson.activity?.type === 'sequence') {
    const items = lesson.activity.items || []
    const correctOrder = lesson.activity.correctOrder || []
    if (!Array.isArray(items) || items.length < 3) {
      errors.push('Sequence activity must include at least 3 ordered steps')
    }
    if (!Array.isArray(correctOrder) || correctOrder.length !== items.length) {
      errors.push('Sequence activity correctOrder must match items length')
    }
    const activityContent = JSON.stringify(lesson.activity || {})
    const discussionContent = getMainDiscussion(lesson)?.content || ''
    if (!hasDiscussionGrounding(activityContent, discussionContent, lesson.title)) {
      errors.push('Sequence activity must be grounded in lesson discussion concepts')
    }
  }

  return errors
}

export function validateLessonBySubject(subjectId, lesson, lessonIndex = 0) {
  const errors = []
  if (!lesson || typeof lesson !== 'object') return ['Invalid lesson object']
  if (!Array.isArray(lesson.sections) || lesson.sections.length === 0) {
    errors.push('Missing sections')
  } else {
    for (const required of REQUIRED_SECTION_TYPES) {
      if (!lesson.sections.some((section) => section.type === required)) {
        errors.push(`Missing required section: ${required}`)
      }
    }
    lesson.sections.forEach((section, sectionIndex) => {
      errors.push(...getSectionMediaErrors(section, sectionIndex))
    })
  }
  errors.push(...getLessonTeachingContentErrors(lesson))
  errors.push(...getLessonVideoErrors(lesson))
  if (!lesson.activity?.type) errors.push('Missing activity')
  if (!Array.isArray(lesson.quiz) || lesson.quiz.length < 5) {
    errors.push('Quiz must contain at least 5 questions')
  }
  errors.push(...getLessonPracticeContentErrors(lesson))
  errors.push(...getStructureErrors(lesson, lessonIndex))
  const keywords = SUBJECT_KEYWORDS[subjectId] || []
  if (keywords.length > 0) {
    const blob = toBlob(lesson)
    const hasKeyword = keywords.some((keyword) => blob.includes(keyword))
    if (!hasKeyword) {
      errors.push(`No subject-specific keyword found for ${subjectId}`)
    }
    const activityBlob = JSON.stringify(lesson.activity || {}).toLowerCase()
    const quizBlob = JSON.stringify(lesson.quiz || []).toLowerCase()
    const titleTokens = String(lesson.title || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 4)
    const hasTopicInActivity = titleTokens.some((token) => activityBlob.includes(token))
    const hasTopicInQuiz = titleTokens.some((token) => quizBlob.includes(token))
    const hasActivityKeyword = keywords.some((keyword) => activityBlob.includes(keyword))
    const hasQuizKeyword = keywords.some((keyword) => quizBlob.includes(keyword))
    if (!hasActivityKeyword && !hasTopicInActivity) {
      errors.push(`Activity is not specific enough for ${subjectId}`)
    }
    if (!hasQuizKeyword && !hasTopicInQuiz) {
      errors.push(`Quiz is not specific enough for ${subjectId}`)
    }
  }
  return errors
}
