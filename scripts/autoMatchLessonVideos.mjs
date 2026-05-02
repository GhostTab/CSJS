import fs from 'node:fs/promises'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const LESSONS_ROOT = path.join(PROJECT_ROOT, 'src', 'data', 'lessons')
const REPORT_PATH = path.join(PROJECT_ROOT, 'reports', 'video-match-report.json')

const GRADES = ['grade7', 'grade8', 'grade9', 'grade10']
const SUBJECTS = ['math', 'science', 'english', 'filipino']
const MIN_RELEVANCE_SCORE = 70
const MAX_CANDIDATES = 6
const REQUEST_DELAY_MS = 1200

const UNRELATED_KEYWORDS = [
  'newton',
  'motion',
  'algebra',
  'basketball',
  'minecraft',
  'music video',
  'vlog',
  'prank',
]

const HARD_REJECT_KEYWORDS = ['pagsusuri ng nobela']

const LESSON_KEYWORD_OVERRIDES = {
  'pangungusap at bahagi nito': ['pangungusap', 'bahagi', 'simuno', 'panaguri'],
  cells: ['cells', 'cell structure', 'nucleus', 'cytoplasm'],
  'plants and animals': ['plants', 'animals', 'living things', 'organisms'],
}

function normalize(value) {
  return String(value || '').toLowerCase()
}

function tokenize(value) {
  return normalize(value)
    .split(/[^a-z0-9\u00c0-\u017f]+/)
    .filter((token) => token.length >= 4)
}

function unique(arr) {
  return [...new Set(arr)]
}

function ensureKeywords(lesson) {
  const override = LESSON_KEYWORD_OVERRIDES[normalize(lesson.title)]
  if (override) return override
  const existing = Array.isArray(lesson.video?.keywords) ? lesson.video.keywords : []
  if (existing.length > 0) return existing
  return unique(tokenize(lesson.title)).slice(0, 10)
}

function buildQuery(_collection, lesson) {
  return lesson.title
}

async function fetchYouTubeSearchResults(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  const response = await fetch(url, {
    headers: {
      'accept-language': 'en-US,en;q=0.9',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  })
  if (!response.ok) {
    if (response.status === 429) {
      return []
    }
    throw new Error(`Search request failed with status ${response.status}`)
  }
  const html = await response.text()
  const marker = 'var ytInitialData = '
  const start = html.indexOf(marker)
  if (start === -1) return []
  const from = start + marker.length
  const end = html.indexOf(';</script>', from)
  if (end === -1) return []
  const jsonChunk = html.slice(from, end)
  let data
  try {
    data = JSON.parse(jsonChunk)
  } catch {
    return []
  }

  const videos = []
  function walk(node) {
    if (!node || typeof node !== 'object') return
    if (node.videoRenderer) {
      videos.push(node.videoRenderer)
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) walk(item)
      } else if (value && typeof value === 'object') {
        walk(value)
      }
    }
  }
  walk(data)

  return videos.slice(0, MAX_CANDIDATES).map((video) => {
    const videoId = video.videoId
    const title =
      video.title?.runs?.map((run) => run.text).join('') ||
      video.title?.simpleText ||
      ''
    const description =
      video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((run) => run.text).join('') ||
      video.descriptionSnippet?.runs?.map((run) => run.text).join('') ||
      ''
    return {
      videoId,
      url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : '',
      title,
      description,
    }
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function scoreCandidate({ lesson, collection, candidate }) {
  const reasons = []
  let score = 0

  const lessonTitle = normalize(lesson.title)
  const title = normalize(candidate.title)
  const description = normalize(candidate.description)
  const lessonKeywords = ensureKeywords(lesson).map((keyword) => normalize(keyword))

  if (title.includes(lessonTitle)) {
    score += 50
    reasons.push('+50 exact lesson title in video title')
  }

  const titleKeywordHits = lessonKeywords.filter((keyword) => keyword && title.includes(keyword))
  if (titleKeywordHits.length >= 2) {
    score += 25
    reasons.push('+25 title contains 2+ lesson keywords')
  }

  const descriptionKeywordHits = lessonKeywords.filter(
    (keyword) => keyword && description.includes(keyword),
  )
  if (descriptionKeywordHits.length > 0) {
    score += 15
    reasons.push('+15 description contains lesson keyword(s)')
  }

  const unrelatedHit = UNRELATED_KEYWORDS.find((keyword) => {
    const normalizedKeyword = normalize(keyword)
    const keywordIsLessonTopic =
      lessonTitle.includes(normalizedKeyword) || lessonKeywords.some((token) => token.includes(normalizedKeyword))
    return !keywordIsLessonTopic && (title.includes(normalizedKeyword) || description.includes(normalizedKeyword))
  })

  if (unrelatedHit) {
    score -= 60
    reasons.push(`-60 unrelated keyword found: ${unrelatedHit}`)
  }

  const hardRejectHit = HARD_REJECT_KEYWORDS.find((keyword) => {
    const normalizedKeyword = normalize(keyword)
    const keywordIsLessonTopic =
      lessonTitle.includes(normalizedKeyword) || lessonKeywords.some((token) => token.includes(normalizedKeyword))
    return (
      !keywordIsLessonTopic && (title.includes(normalizedKeyword) || description.includes(normalizedKeyword))
    )
  })
  if (hardRejectHit) {
    reasons.push(`Hard reject keyword found: ${hardRejectHit}`)
  }

  const titleRulePassed = title.includes(lessonTitle) || titleKeywordHits.length >= 2
  if (!titleRulePassed) reasons.push('Title rule failed: no exact title and <2 keyword hits')

  const valid =
    score >= MIN_RELEVANCE_SCORE &&
    titleRulePassed &&
    !unrelatedHit &&
    !hardRejectHit

  return {
    score,
    valid,
    reasons,
    titleKeywordHits,
    descriptionKeywordHits,
  }
}

async function main() {
  const report = []

  for (const grade of GRADES) {
    for (const subject of SUBJECTS) {
      const file = path.join(LESSONS_ROOT, grade, `${subject}.json`)
      const raw = await fs.readFile(file, 'utf8')
      const collection = JSON.parse(raw)
      let changed = false

      for (const lesson of collection.lessons || []) {
        const query = buildQuery(collection, lesson)
        const candidates = await fetchYouTubeSearchResults(query)
        await sleep(REQUEST_DELAY_MS)
        const evaluated = candidates
          .filter((candidate) => candidate.videoId && candidate.url && candidate.title)
          .map((candidate) => ({
            candidate,
            verdict: scoreCandidate({ lesson, collection, candidate }),
          }))
          .sort((a, b) => b.verdict.score - a.verdict.score)

        console.log(`\n[video-auto] Lesson searched: "${lesson.title}"`)
        console.log(`[video-auto] Query: "${query}"`)
        console.log(`[video-auto] Candidates found: ${evaluated.length}`)
        for (const entry of evaluated) {
          console.log(
            `[video-auto] score=${entry.verdict.score} valid=${entry.verdict.valid} title="${entry.candidate.title}"`,
          )
        }

        const best = evaluated.find((entry) => entry.verdict.valid)
        lesson.video = lesson.video || {}
        lesson.video.keywords = ensureKeywords(lesson)

        if (best) {
          lesson.video.url = best.candidate.url
          lesson.video.title = best.candidate.title
          lesson.video.approved = false
          changed = true
          console.log(`[video-auto] selected="${best.candidate.title}"`)

          report.push({
            grade: collection.grade,
            subject: collection.subjectId,
            lessonTitle: lesson.title,
            searchQuery: query,
            selectedVideoTitle: best.candidate.title,
            selectedVideoUrl: best.candidate.url,
            relevanceScore: best.verdict.score,
            status: 'accepted',
            reason: best.verdict.reasons.join('; '),
          })
        } else {
          lesson.video.url = ''
          lesson.video.title = ''
          lesson.video.approved = false
          changed = true
          console.log('[video-auto] rejected: no candidate passed validation')
          const top = evaluated[0]
          report.push({
            grade: collection.grade,
            subject: collection.subjectId,
            lessonTitle: lesson.title,
            searchQuery: query,
            selectedVideoTitle: top?.candidate.title || '',
            selectedVideoUrl: top?.candidate.url || '',
            relevanceScore: top?.verdict.score ?? 0,
            status: 'rejected',
            reason: top
              ? `Best candidate rejected: ${top.verdict.reasons.join('; ')}`
              : 'No candidate videos returned from YouTube search',
          })
        }
      }

      if (changed) {
        await fs.writeFile(file, `${JSON.stringify(collection, null, 2)}\n`)
      }
    }
  }

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Video matching complete. Report written to: ${REPORT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
