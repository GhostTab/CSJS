/** Points formula — matches ProgressContext saveQuizScore (score * 5) */
export function lessonQuizPoints(score) {
  return Number(score) * 5
}

/**
 * Upsert a lesson quiz attempt. Keeps the higher points value on retake.
 * Returns { ok, error?, skipped? }
 */
export async function upsertLessonQuizAttempt(supabase, {
  userId,
  lessonId,
  gradeId,
  subjectId,
  score,
  total,
}) {
  if (!supabase || !userId) {
    return { ok: false, skipped: true }
  }

  const points = lessonQuizPoints(score)

  const { data: existing, error: fetchError } = await supabase
    .from('quiz_attempts')
    .select('id, points')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (fetchError) {
    return { ok: false, error: fetchError.message }
  }

  if (existing && existing.points >= points) {
    return { ok: true, skipped: true, reason: 'existing_score_higher' }
  }

  const payload = {
    user_id: userId,
    lesson_id: lessonId,
    grade_id: String(gradeId),
    subject_id: subjectId,
    score,
    total,
    points,
    completed_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await supabase
      .from('quiz_attempts')
      .update(payload)
      .eq('id', existing.id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  const { error } = await supabase.from('quiz_attempts').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/**
 * Fetch overall leaderboard: SUM(points) per user from lesson quizzes.
 */
export async function fetchOverallRankings(supabase) {
  if (!supabase) {
    return { data: [], error: 'Supabase is not configured' }
  }

  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select('user_id, points, profiles(display_name, email)')

  if (error) {
    return { data: [], error: error.message }
  }

  const byUser = new Map()
  for (const row of attempts || []) {
    const key = row.user_id
    const profile = row.profiles
    const current = byUser.get(key) || {
      userId: key,
      displayName:
        profile?.display_name ||
        (profile?.email ? profile.email.split('@')[0] : 'Student'),
      email: profile?.email || '',
      totalPoints: 0,
      quizzesCompleted: 0,
    }
    current.totalPoints += row.points || 0
    current.quizzesCompleted += 1
    byUser.set(key, current)
  }

  const ranked = Array.from(byUser.values())
    .sort((a, b) => b.totalPoints - a.totalPoints || b.quizzesCompleted - a.quizzesCompleted)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return { data: ranked, error: null }
}
