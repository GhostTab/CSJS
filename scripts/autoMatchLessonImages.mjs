import fs from 'node:fs/promises'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const LESSONS_ROOT = path.join(PROJECT_ROOT, 'src', 'data', 'lessons')
const REPORT_PATH = path.join(PROJECT_ROOT, 'reports', 'image-match-report.json')

const GRADES = ['grade7', 'grade8', 'grade9', 'grade10']
const SUBJECTS = ['math', 'science', 'english', 'filipino']
const MIN_SCORE = 55

const UNRELATED = ['newton', 'motion', 'basketball', 'gaming', 'celebrity']
const TITLE_OVERRIDES = {
  'pangungusap at bahagi nito': ['pangungusap', 'simuno', 'panaguri', 'grammar'],
  'noli me tangere: paksa': ['noli', 'rizal', 'novel', 'philippines'],
  'pagsusuri ng nobela': ['novel', 'literature', 'analysis', 'book'],
  'cells and organization': ['cell', 'nucleus', 'cytoplasm', 'organism'],
  'plant and animal adaptations': ['plant', 'animal', 'adaptation', 'biome'],
}

const CURATED_IMAGE_CATALOG = [
  { label: 'Cell biology microscope', keywords: ['cell', 'nucleus', 'cytoplasm', 'organism', 'biology'], src: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg' },
  { label: 'Plant leaves close-up', keywords: ['plant', 'photosynthesis', 'leaf', 'adaptation'], src: 'https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg' },
  { label: 'Animal wildlife habitat', keywords: ['animal', 'adaptation', 'ecosystem', 'organism'], src: 'https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg' },
  { label: 'Weather clouds', keywords: ['weather', 'climate', 'atmosphere', 'rain'], src: 'https://images.pexels.com/photos/531756/pexels-photo-531756.jpeg' },
  { label: 'Heat transfer concept', keywords: ['heat', 'temperature', 'energy', 'transfer'], src: 'https://images.pexels.com/photos/87236/pexels-photo-87236.jpeg' },
  { label: 'Scientific investigation notes', keywords: ['scientific', 'investigation', 'experiment', 'method'], src: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg' },
  { label: 'Geometry board', keywords: ['geometry', 'angle', 'triangle', 'shape'], src: 'https://images.pexels.com/photos/8471835/pexels-photo-8471835.jpeg' },
  { label: 'Fractions and math notes', keywords: ['fraction', 'decimal', 'ratio', 'percent', 'math'], src: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg' },
  { label: 'Algebra equations', keywords: ['algebra', 'expression', 'equation', 'integer'], src: 'https://images.pexels.com/photos/6256/mathematics-blackboard-education-classroom.jpg' },
  { label: 'Book and literature analysis', keywords: ['novel', 'literature', 'analysis', 'reading', 'book'], src: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg' },
  { label: 'Writing and grammar notebook', keywords: ['grammar', 'sentence', 'speech', 'writing', 'english'], src: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg' },
  { label: 'Speech presentation', keywords: ['speech', 'talumpati', 'presentation', 'communication'], src: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg' },
  { label: 'Research workflow', keywords: ['research', 'sources', 'synthesis', 'technical', 'writing'], src: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg' },
  { label: 'Philippine history manuscript', keywords: ['filipino', 'rizal', 'noli', 'filibusterismo', 'kasaysayan'], src: 'https://images.pexels.com/photos/4210789/pexels-photo-4210789.jpeg' },
  { label: 'Map and geography', keywords: ['heograpiya', 'asya', 'mapa', 'geography', 'asia'], src: 'https://images.pexels.com/photos/1098515/pexels-photo-1098515.jpeg' },
  { label: 'Economics and finance', keywords: ['ekonomiks', 'needs', 'wants', 'market', 'resources'], src: 'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg' },
  { label: 'Data and statistics', keywords: ['datos', 'statistics', 'graph', 'analysis'], src: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg' },
  { label: 'Language classroom', keywords: ['wika', 'akademiko', 'filipino', 'language'], src: 'https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg' },
]

function normalize(value) {
  return String(value || '').toLowerCase()
}

function tokens(value) {
  return normalize(value)
    .split(/[^a-z0-9\u00c0-\u017f]+/)
    .filter((token) => token.length >= 4)
}

function unique(arr) {
  return [...new Set(arr)]
}

function lessonKeywords(lesson) {
  const override = TITLE_OVERRIDES[normalize(lesson.title)]
  if (override) return override
  const base = Array.isArray(lesson.video?.keywords) ? lesson.video.keywords : []
  if (base.length > 0) return base.map(String)
  return unique(tokens(lesson.title)).slice(0, 8)
}

function getCuratedCandidates(lesson) {
  return CURATED_IMAGE_CATALOG.map((entry) => ({
    title: entry.label,
    imageUrl: entry.src,
    source: 'curated-catalog',
    keywords: entry.keywords,
  }))
}

function scoreCandidate(lesson, candidate) {
  const title = `${normalize(candidate.title)} ${normalize((candidate.keywords || []).join(' '))}`
  const lessonTitle = normalize(lesson.title)
  const kw = lessonKeywords(lesson).map(normalize)
  const hitCount = kw.filter((k) => title.includes(k)).length
  let score = 0
  const reasons = []

  if (title.includes(lessonTitle)) {
    score += 50
    reasons.push('+50 exact lesson title')
  }
  if (hitCount >= 2) {
    score += 25
    reasons.push('+25 has 2+ lesson keywords')
  }
  if (hitCount >= 1) {
    score += 10
    reasons.push('+10 has lesson keyword')
  }

  const unrelated = UNRELATED.find((word) => {
    const n = normalize(word)
    const wordIsTopic = lessonTitle.includes(n) || kw.some((token) => token.includes(n))
    return !wordIsTopic && title.includes(n)
  })
  if (unrelated) {
    score -= 60
    reasons.push(`-60 unrelated topic: ${unrelated}`)
  }

  return { score, reasons, valid: score >= MIN_SCORE && !unrelated }
}

async function run() {
  const report = []
  for (const grade of GRADES) {
    for (const subject of SUBJECTS) {
      const file = path.join(LESSONS_ROOT, grade, `${subject}.json`)
      const raw = await fs.readFile(file, 'utf8')
      const collection = JSON.parse(raw)
      let changed = false

      for (const lesson of collection.lessons || []) {
        const query = lesson.title
        const candidates = getCuratedCandidates(lesson)
        const scored = candidates
          .map((candidate) => ({ candidate, verdict: scoreCandidate(lesson, candidate) }))
          .sort((a, b) => b.verdict.score - a.verdict.score)

        const selected = scored.find((row) => row.verdict.valid)
        const main = (lesson.sections || []).find((section) => section.type === 'main_discussion')
        if (!main) continue

        if (selected) {
          main.images = [
            {
              src: selected.candidate.imageUrl,
              alt: `${lesson.title} visual aid`,
              caption: `Visual aid for ${lesson.title}.`,
              source: selected.candidate.source,
            },
          ]
          changed = true
          report.push({
            grade: collection.grade,
            subject: collection.subjectId,
            lessonTitle: lesson.title,
            query,
            selectedTitle: selected.candidate.title,
            selectedUrl: selected.candidate.imageUrl,
            score: selected.verdict.score,
            status: 'accepted',
            reason: selected.verdict.reasons.join('; '),
          })
        } else {
          main.images = []
          changed = true
          const top = scored[0]
          report.push({
            grade: collection.grade,
            subject: collection.subjectId,
            lessonTitle: lesson.title,
            query,
            selectedTitle: top?.candidate.title || '',
            selectedUrl: top?.candidate.imageUrl || '',
            score: top?.verdict.score ?? 0,
            status: 'rejected',
            reason: top ? top.verdict.reasons.join('; ') : 'No relevant image candidate found',
          })
        }
      }

      if (changed) await fs.writeFile(file, `${JSON.stringify(collection, null, 2)}\n`)
    }
  }

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Image matching complete. Report: ${REPORT_PATH}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

