/**
 * Seed leaderboard test students + quiz_attempts using the anon key
 * (sign up → sign in → insert own attempts). No service_role required.
 *
 * Usage: npm run seed:leaderboard
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvFile() {
  const envPath = resolve(root, '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile()

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const SEED_PASSWORD = 'SeedPass123!'

const students = [
  {
    email: 'ana.reyes@csjs-seed.test',
    displayName: 'Ana Reyes',
    attempts: [
      { lesson_id: 'integers-and-basic-operations', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
      { lesson_id: 'algebraic-expressions', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
      { lesson_id: 'fractions-and-decimals', grade_id: '7', subject_id: 'math', score: 4, total: 5, points: 20 },
      { lesson_id: 'ratios-and-proportions', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
      { lesson_id: 'percent-and-discount-problems', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
    ],
  },
  {
    email: 'ben.santos@csjs-seed.test',
    displayName: 'Ben Santos',
    attempts: [
      { lesson_id: 'integers-and-basic-operations', grade_id: '7', subject_id: 'math', score: 4, total: 5, points: 20 },
      { lesson_id: 'algebraic-expressions', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
      { lesson_id: 'fractions-and-decimals', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
      { lesson_id: 'basic-geometry-and-angles', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
    ],
  },
  {
    email: 'carla.diaz@csjs-seed.test',
    displayName: 'Carla Diaz',
    attempts: [
      { lesson_id: 'integers-and-basic-operations', grade_id: '7', subject_id: 'math', score: 3, total: 5, points: 15 },
      { lesson_id: 'fractions-and-decimals', grade_id: '7', subject_id: 'math', score: 4, total: 5, points: 20 },
      { lesson_id: 'ratios-and-proportions', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
      { lesson_id: 'algebraic-expressions', grade_id: '7', subject_id: 'math', score: 2, total: 5, points: 10 },
    ],
  },
  {
    email: 'diego.cruz@csjs-seed.test',
    displayName: 'Diego Cruz',
    attempts: [
      { lesson_id: 'integers-and-basic-operations', grade_id: '7', subject_id: 'math', score: 4, total: 5, points: 20 },
      { lesson_id: 'fractions-and-decimals', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
    ],
  },
  {
    email: 'ella.ramos@csjs-seed.test',
    displayName: 'Ella Ramos',
    attempts: [
      { lesson_id: 'integers-and-basic-operations', grade_id: '7', subject_id: 'math', score: 5, total: 5, points: 25 },
    ],
  },
]

function clientFor(key) {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function ensureUser(email, displayName) {
  const anon = clientFor(anonKey)

  // Try sign-in first (re-seed)
  let { data: signInData, error: signInErr } = await anon.auth.signInWithPassword({
    email,
    password: SEED_PASSWORD,
  })

  if (signInErr) {
    const { data: signUpData, error: signUpErr } = await anon.auth.signUp({
      email,
      password: SEED_PASSWORD,
      options: { data: { display_name: displayName } },
    })
    if (signUpErr) {
      return { error: `signUp failed: ${signUpErr.message}` }
    }
    // If email confirmation is required, session may be null
    if (!signUpData.session) {
      // Prefer service role to confirm, else try sign-in
      if (serviceKey) {
        const admin = clientFor(serviceKey)
        const listed = await admin.auth.admin.listUsers({ perPage: 200 })
        const found = listed.data?.users?.find((u) => u.email === email)
        if (found) {
          await admin.auth.admin.updateUserById(found.id, { email_confirm: true })
        }
      }
      ;({ data: signInData, error: signInErr } = await anon.auth.signInWithPassword({
        email,
        password: SEED_PASSWORD,
      }))
      if (signInErr || !signInData.session) {
        return {
          error:
            signInErr?.message ||
            'No session after sign-up. Disable "Confirm email" in Supabase Auth settings, or add SUPABASE_SERVICE_ROLE_KEY.',
        }
      }
    } else {
      signInData = signUpData
    }
  }

  const userId = signInData.user.id
  const authed = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${signInData.session.access_token}` } },
  })

  // Update display name (role stays student; trigger blocks role changes from client)
  await authed
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId)

  // If service role available, upsert display_name forcibly
  if (serviceKey) {
    const admin = clientFor(serviceKey)
    await admin.from('profiles').upsert({
      id: userId,
      email,
      display_name: displayName,
      role: 'student',
    })
  }

  return { userId, accessToken: signInData.session.access_token, error: null }
}

async function seedAttempts(accessToken, userId, attempts) {
  const authed = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })

  const rows = attempts.map((a) => ({
    user_id: userId,
    lesson_id: a.lesson_id,
    grade_id: a.grade_id,
    subject_id: a.subject_id,
    score: a.score,
    total: a.total,
    points: a.points,
    completed_at: new Date().toISOString(),
  }))

  // Upsert on unique (user_id, lesson_id) — no DELETE policy needed
  const { error } = await authed.from('quiz_attempts').upsert(rows, {
    onConflict: 'user_id,lesson_id',
  })
  return error
}

async function main() {
  console.log('Seeding leaderboard test data…\n')

  for (const student of students) {
    const ensured = await ensureUser(student.email, student.displayName)
    if (ensured.error) {
      console.error(`  ✗ ${student.displayName}: ${ensured.error}`)
      continue
    }

    const attemptErr = await seedAttempts(ensured.accessToken, ensured.userId, student.attempts)
    if (attemptErr) {
      console.error(`  ✗ ${student.displayName}: ${attemptErr.message}`)
      continue
    }

    const total = student.attempts.reduce((sum, a) => sum + a.points, 0)
    console.log(`  ✓ ${student.displayName} — ${total} pts (${student.attempts.length} quizzes)`)
  }

  console.log(`
Expected ranking:
  1. Ana Reyes     120 pts
  2. Ben Santos     95 pts
  3. Carla Diaz     70 pts
  4. Diego Cruz     45 pts
  5. Ella Ramos     25 pts

Login: ana.reyes@csjs-seed.test / ${SEED_PASSWORD}
Then open http://localhost:5173/rankings
`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
