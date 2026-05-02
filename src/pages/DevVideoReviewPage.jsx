import { useRef, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Download, ShieldCheck, ExternalLink, Upload } from 'lucide-react'
import { useVideoReview } from '../context/VideoReviewContext'
import {
  downloadOverridesBackup,
  importLocalOverridesFromObject,
} from '../utils/lessonMediaOverrides'

/**
 * Hidden route for developers only — bookmark `/dev/video-review`.
 * Not linked from the student-facing navigation.
 */
export default function DevVideoReviewPage() {
  const { isReviewEnabled, reviewMode, setReviewMode } = useVideoReview()
  const fileInputRef = useRef(null)
  const [backupMessage, setBackupMessage] = useState('')

  if (!isReviewEnabled) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 pb-24 pt-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-slate-900">
          <ShieldCheck className="h-6 w-6 text-amber-600" />
          <h1 className="text-xl font-bold">Lesson media review</h1>
        </div>

        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Overrides are saved in your browser (
            <strong className="text-slate-800">localStorage</strong>
            ). They stay after you close the browser or restart the computer, until you clear site data for this site
            or use a different browser/profile.
          </p>
          <p>
            There is still no server database — use <strong className="text-slate-800">Download backup</strong> to save
            a JSON file you can keep in the repo or share. Use <strong className="text-slate-800">Import backup</strong>{' '}
            to restore on another machine or after clearing storage.
          </p>
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-amber-400 text-amber-600"
            checked={reviewMode}
            onChange={(e) => setReviewMode(e.target.checked)}
          />
          <span className="text-sm font-medium text-amber-950">Enable media review on lesson pages</span>
        </label>

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Backup (video + image overrides)</p>
          <button
            type="button"
            onClick={() => {
              downloadOverridesBackup()
              setBackupMessage('Download started. Check your Downloads folder.')
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Download backup JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const text = await file.text()
                const data = JSON.parse(text)
                const result = importLocalOverridesFromObject(data)
                setBackupMessage(result.ok ? 'Imported. Open a lesson to see overrides.' : result.error || 'Failed')
              } catch {
                setBackupMessage('Could not read JSON.')
              }
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" />
            Import backup JSON
          </button>
          {backupMessage && <p className="text-xs text-slate-600">{backupMessage}</p>}
        </div>

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Reject does not search for another video</p>
          <p>
            Reject only updates your local override. To pick another clip, paste a URL or edit{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">lesson.video</code> / run{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">npm run videos:auto-match</code>.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/grade/7/math"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Open a subject
            <ExternalLink className="h-3.5 w-3.5 opacity-90" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
