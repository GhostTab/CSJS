/**
 * Adds lesson.video.approved: false where missing (one-time migration).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LESSONS_ROOT = path.join(__dirname, '..', 'src', 'data', 'lessons')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...(await walk(p)))
    else if (e.name.endsWith('.json')) files.push(p)
  }
  return files
}

async function main() {
  const files = await walk(LESSONS_ROOT)
  let updated = 0
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const data = JSON.parse(raw)
    let changed = false
    for (const lesson of data.lessons || []) {
      if (!lesson.video || typeof lesson.video !== 'object') continue
      if (typeof lesson.video.approved !== 'boolean') {
        lesson.video.approved = false
        changed = true
      }
    }
    if (changed) {
      await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`)
      updated++
      console.log('updated', path.relative(path.join(__dirname, '..'), file))
    }
  }
  console.log(`Done. Files updated: ${updated}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
