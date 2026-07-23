import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Video,
  Plus,
  Trash2,
  Pencil,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Save,
  X,
  Upload,
} from 'lucide-react'
import gradesData from '../data/grades.json'
import { getLessonsByGradeAndSubject } from '../data/lessonData'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { resolvePlayableVideo } from '../utils/videoEmbed'
import {
  addExtraVideo,
  addExtraVideoFromFile,
  deleteExtraVideo,
  fetchAllExtraVideos,
  groupExtrasByLessonKey,
  MAX_UPLOAD_BYTES,
  updateExtraVideo,
} from '../utils/lessonExtraVideos'

function lessonKey(gradeId, subjectId, lessonId) {
  return `${gradeId}:${subjectId}:${lessonId}`
}

export default function TeacherAdmin() {
  const { user, loading, isAuthenticated, isTeacher, isConfigured } = useAuth()
  const [extras, setExtras] = useState([])
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedKey, setExpandedKey] = useState(null)
  const [form, setForm] = useState({ url: '', title: '', file: null })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ url: '', title: '' })
  const [uploadProgress, setUploadProgress] = useState('')

  const loadExtras = useCallback(async () => {
    if (!isConfigured) return
    setLoadError('')
    const { data, error } = await fetchAllExtraVideos(supabase)
    if (error) {
      setLoadError(error)
      setExtras([])
      return
    }
    setExtras(data)
  }, [isConfigured])

  useEffect(() => {
    if (isTeacher) loadExtras()
  }, [isTeacher, loadExtras])

  const allLessons = useMemo(() => {
    const rows = []
    for (const grade of gradesData) {
      for (const subject of grade.subjects) {
        const collection = getLessonsByGradeAndSubject(grade.grade, subject.id)
        for (const lesson of collection?.lessons || []) {
          rows.push({
            gradeId: String(grade.grade),
            subjectId: subject.id,
            subjectName: subject.name,
            lessonId: lesson.id,
            title: lesson.title,
            description: lesson.description || '',
            staticVideo: lesson.video || null,
          })
        }
      }
    }
    return rows
  }, [])

  const subjectsForFilter = useMemo(() => {
    const set = new Map()
    for (const row of allLessons) {
      if (gradeFilter !== 'all' && row.gradeId !== String(gradeFilter)) continue
      set.set(row.subjectId, row.subjectName)
    }
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }))
  }, [allLessons, gradeFilter])

  const extrasByLesson = useMemo(() => groupExtrasByLessonKey(extras), [extras])

  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allLessons.filter((row) => {
      if (gradeFilter !== 'all' && row.gradeId !== String(gradeFilter)) return false
      if (subjectFilter !== 'all' && row.subjectId !== subjectFilter) return false
      if (!q) return true
      return (
        row.title.toLowerCase().includes(q) ||
        row.lessonId.toLowerCase().includes(q) ||
        row.subjectName.toLowerCase().includes(q)
      )
    })
  }, [allLessons, gradeFilter, subjectFilter, search])

  if (loading) {
    return (
      <div className="min-h-screen px-4 pb-20 pt-24 text-center text-slate-500">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isTeacher) {
    return (
      <div className="min-h-screen px-4 pb-20 pt-24 md:px-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-amber-600" />
          <h1 className="text-xl font-bold text-slate-900">Teacher access required</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your account is a student account. Ask an administrator to set your profile role to{' '}
            <code className="rounded bg-white px-1 font-mono text-xs">teacher</code> in Supabase.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleAdd = async (row) => {
    setBusy(true)
    setMessage('')
    setUploadProgress('')

    let result
    if (form.file) {
      setUploadProgress('Uploading video to storage…')
      result = await addExtraVideoFromFile(supabase, {
        gradeId: row.gradeId,
        subjectId: row.subjectId,
        lessonId: row.lessonId,
        file: form.file,
        title: form.title,
        userId: user?.id,
      })
    } else {
      result = await addExtraVideo(supabase, {
        gradeId: row.gradeId,
        subjectId: row.subjectId,
        lessonId: row.lessonId,
        url: form.url,
        title: form.title,
        userId: user?.id,
      })
    }

    setBusy(false)
    setUploadProgress('')
    if (result.error) {
      setMessage(result.error)
      return
    }
    const wasUpload = Boolean(form.file)
    setForm({ url: '', title: '', file: null })
    setMessage(
      wasUpload
        ? 'Local video uploaded and saved. Students can play it in the Media Learning Hub.'
        : 'Video link added. Students will see it in the Media Learning Hub.',
    )
    await loadExtras()
  }

  const handleDelete = async (videoId, storagePath = null) => {
    if (!window.confirm('Remove this teacher-added video from the lesson?')) return
    setBusy(true)
    setMessage('')
    const result = await deleteExtraVideo(supabase, videoId, storagePath)
    setBusy(false)
    if (result.error) {
      setMessage(result.error)
      return
    }
    setMessage('Video removed.')
    if (editingId === videoId) setEditingId(null)
    await loadExtras()
  }

  const handleSaveEdit = async (videoId) => {
    setBusy(true)
    setMessage('')
    const result = await updateExtraVideo(supabase, videoId, editForm)
    setBusy(false)
    if (result.error) {
      setMessage(result.error)
      return
    }
    setEditingId(null)
    setMessage('Video updated.')
    await loadExtras()
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-24 pt-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="icon-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Teacher Admin</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
                  Add or remove extra videos for any lesson. Paste a YouTube/Vimeo link{' '}
                  <strong>or upload a video from your laptop</strong> (MP4/WebM/MOV, up to 100 MB).
                  Curriculum videos from the lesson files stay in place.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">{filteredLessons.length} lessons</p>
              <p>{extras.length} teacher-added videos</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Grade</span>
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value)
                setSubjectFilter('all')
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800"
            >
              <option value="all">All grades</option>
              {[7, 8, 9, 10].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Subject</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800"
            >
              <option value="all">All subjects</option>
              {subjectsForFilter.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-600">Search lessons</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, subject, or lesson id…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-800 outline-none ring-blue-500/30 focus:ring-2"
              />
            </div>
          </label>
        </div>

        {loadError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {loadError}
            <p className="mt-1 text-xs">
              If tables/storage are missing, run{' '}
              <code className="font-mono">supabase/schema_teacher_videos.sql</code> then{' '}
              <code className="font-mono">supabase/schema_lesson_video_storage.sql</code> in the SQL
              Editor.
            </p>
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {message}
          </div>
        )}

        {/* Lesson list */}
        <div className="space-y-3">
          {filteredLessons.map((row) => {
            const key = lessonKey(row.gradeId, row.subjectId, row.lessonId)
            const open = expandedKey === key
            const lessonExtras = extrasByLesson[key] || []
            const staticOk =
              Boolean(resolvePlayableVideo(row.staticVideo?.url)) &&
              row.staticVideo?.approved === true

            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => {
                    setExpandedKey(open ? null : key)
                    setForm({ url: '', title: '', file: null })
                    setEditingId(null)
                    setMessage('')
                    setUploadProgress('')
                  }}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 sm:items-center"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">{row.title}</h2>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        G{row.gradeId} · {row.subjectName}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{row.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          staticOk ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        Curriculum video: {staticOk ? 'available' : 'none / not approved'}
                      </span>
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 font-medium text-violet-700">
                        Teacher videos: {lessonExtras.length}
                      </span>
                    </div>
                  </div>
                  {open ? (
                    <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-slate-100"
                    >
                      <div className="space-y-5 p-4 sm:p-5">
                        {/* Static video (read-only) */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <Video className="h-4 w-4 text-emerald-600" />
                            Curriculum video (from lesson file)
                          </h3>
                          {staticOk ? (
                            <div className="space-y-2">
                              <p className="text-sm text-slate-700">{row.staticVideo.title || 'Untitled'}</p>
                              <a
                                href={row.staticVideo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                              >
                                Open source <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                              <p className="text-xs text-slate-500">
                                This video cannot be deleted here. It ships with the app content.
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              No approved curriculum video for this lesson yet.
                            </p>
                          )}
                        </div>

                        {/* Teacher extras */}
                        <div>
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <Video className="h-4 w-4 text-violet-600" />
                            Teacher-added videos
                          </h3>
                          {lessonExtras.length === 0 ? (
                            <p className="mb-4 text-sm text-slate-500">No extra videos yet.</p>
                          ) : (
                            <ul className="mb-4 space-y-3">
                              {lessonExtras.map((video) => (
                                <li
                                  key={video.id}
                                  className="rounded-xl border border-violet-100 bg-violet-50/50 p-3 sm:p-4"
                                >
                                  {editingId === video.id ? (
                                    <div className="space-y-3">
                                      <input
                                        type="url"
                                        value={editForm.url}
                                        onChange={(e) =>
                                          setEditForm((f) => ({ ...f, url: e.target.value }))
                                        }
                                        placeholder="YouTube or Vimeo URL"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                      />
                                      <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) =>
                                          setEditForm((f) => ({ ...f, title: e.target.value }))
                                        }
                                        placeholder="Title"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                      />
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          disabled={busy}
                                          onClick={() => handleSaveEdit(video.id)}
                                          className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                        >
                                          <Save className="h-4 w-4" />
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingId(null)}
                                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                                        >
                                          <X className="h-4 w-4" />
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="min-w-0">
                                        <p className="font-medium text-slate-900">
                                          {video.title}
                                          {video.source_type === 'upload' && (
                                            <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                                              Uploaded file
                                            </span>
                                          )}
                                        </p>
                                        <a
                                          href={video.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-blue-600 hover:underline"
                                        >
                                          {video.url}
                                          <ExternalLink className="h-3 w-3 shrink-0" />
                                        </a>
                                      </div>
                                      <div className="flex shrink-0 gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingId(video.id)
                                            setEditForm({ url: video.url, title: video.title })
                                          }}
                                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          disabled={busy}
                                          onClick={() => handleDelete(video.id, video.storage_path)}
                                          className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Add form */}
                          <div className="rounded-xl border border-dashed border-violet-300 bg-white p-4">
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                              <Plus className="h-4 w-4 text-violet-600" />
                              Add video to this lesson
                            </h4>
                            <div className="grid gap-3">
                              <label className="block text-sm">
                                <span className="mb-1 block font-medium text-slate-600">
                                  Option A — paste a link (YouTube / Vimeo)
                                </span>
                                <input
                                  type="url"
                                  value={form.url}
                                  onChange={(e) =>
                                    setForm((f) => ({ ...f, url: e.target.value, file: null }))
                                  }
                                  placeholder="https://www.youtube.com/watch?v=…"
                                  disabled={Boolean(form.file)}
                                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                              </label>

                              <div className="relative flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                  or
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                              </div>

                              <label className="block text-sm">
                                <span className="mb-1 block font-medium text-slate-600">
                                  Option B — upload from this laptop
                                </span>
                                <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
                                  <Upload className="hidden h-5 w-5 text-violet-600 sm:block" />
                                  <input
                                    type="file"
                                    accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov,.m4v"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null
                                      if (file && file.size > MAX_UPLOAD_BYTES) {
                                        setMessage('Video must be 100 MB or smaller.')
                                        e.target.value = ''
                                        return
                                      }
                                      setForm((f) => ({
                                        ...f,
                                        file,
                                        url: '',
                                        title: f.title || (file ? file.name.replace(/\.[^.]+$/, '') : ''),
                                      }))
                                    }}
                                    className="w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-violet-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-violet-800"
                                  />
                                </div>
                                {form.file && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Selected: {form.file.name} (
                                    {(form.file.size / (1024 * 1024)).toFixed(1)} MB)
                                  </p>
                                )}
                                <p className="mt-1 text-xs text-slate-500">
                                  MP4, WebM, OGG, or MOV · max 100 MB · stored in Supabase
                                </p>
                              </label>

                              <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="Video title (optional)"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
                              />
                            </div>
                            {uploadProgress && (
                              <p className="mt-2 text-sm font-medium text-violet-700">{uploadProgress}</p>
                            )}
                            <button
                              type="button"
                              disabled={busy || (!form.url.trim() && !form.file)}
                              onClick={() => handleAdd(row)}
                              className="btn-gradient mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
                            >
                              {form.file ? (
                                <>
                                  <Upload className="h-4 w-4" />
                                  {busy ? 'Uploading…' : 'Upload & save video'}
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  {busy ? 'Saving…' : 'Add video link'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <Link
                          to={`/grade/${row.gradeId}/${row.subjectId}/${row.lessonId}`}
                          className="inline-flex text-sm font-semibold text-blue-600 hover:underline"
                        >
                          Open lesson as student →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}

          {filteredLessons.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              No lessons match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
