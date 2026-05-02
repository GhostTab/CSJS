import { useEffect, useState } from 'react'
import { Image as ImageIcon, Plus, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import { isVideoApprovedForDisplay } from '../utils/lessonMediaOverrides'
import { getEmbeddableVideoUrl } from '../utils/videoEmbed'

const IMAGE_SECTION_TYPES = [
  { value: 'main_discussion', label: 'Main discussion' },
  { value: 'guided_examples', label: 'Guided examples' },
  { value: 'key_terms', label: 'Key terms' },
]

function rowsFromImages(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return [{ src: '', alt: '', caption: '' }]
  }
  return images.map((img) => ({
    src: String(img?.src || ''),
    alt: String(img?.alt || ''),
    caption: String(img?.caption || ''),
  }))
}

function getSectionImages(lesson, sectionType) {
  const sec = lesson?.sections?.find((s) => s.type === sectionType)
  return sec?.images
}

export default function LessonMediaReviewPanel({
  lessonStableKey,
  gradeId,
  subjectId,
  lessonId,
  effectiveLesson,
  onApproveVideo,
  onRejectVideo,
  onApplyManualVideo,
  onApplySectionImages,
  onClearSectionImages,
}) {
  const [urlDraft, setUrlDraft] = useState('')
  const [titleDraft, setTitleDraft] = useState('')
  const [manualError, setManualError] = useState('')

  const [imageSection, setImageSection] = useState('main_discussion')
  const [imageRows, setImageRows] = useState([{ src: '', alt: '', caption: '' }])
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    const url = String(effectiveLesson?.video?.url ?? '').trim()
    const title = String(effectiveLesson?.video?.title ?? '').trim()
    setUrlDraft(url)
    setTitleDraft(title)
    setManualError('')
  }, [lessonStableKey, effectiveLesson?.video?.url, effectiveLesson?.video?.title])

  const sectionImagesSig = JSON.stringify(getSectionImages(effectiveLesson, imageSection) || [])
  useEffect(() => {
    const imgs = getSectionImages(effectiveLesson, imageSection)
    setImageRows(rowsFromImages(imgs))
    setImageError('')
  }, [lessonStableKey, imageSection, sectionImagesSig])

  const previewUrl = String(effectiveLesson?.video?.url || '').trim()
  const embeddableUrl = previewUrl ? getEmbeddableVideoUrl(previewUrl) : null
  const studentsSeeVideo = isVideoApprovedForDisplay(effectiveLesson?.video)

  const handleApplyManual = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setManualError('')
    const ok = onApplyManualVideo(urlDraft.trim(), titleDraft.trim())
    if (!ok) {
      setManualError('Enter a valid YouTube or Vimeo URL (e.g. youtube.com/watch?v=… or youtu.be/…).')
    }
  }

  const handleApplyImages = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setImageError('')
    const valid = imageRows.some((r) => String(r.src || '').trim() && /^https?:\/\//i.test(String(r.src).trim()))
    if (!valid) {
      setImageError('Add at least one image URL starting with http:// or https://')
      return
    }
    onApplySectionImages(gradeId, subjectId, lessonId, imageSection, imageRows)
  }

  const handleClearImages = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setImageError('')
    onClearSectionImages(gradeId, subjectId, lessonId, imageSection)
    setImageRows([{ src: '', alt: '', caption: '' }])
  }

  const addImageRow = () => setImageRows((rows) => [...rows, { src: '', alt: '', caption: '' }])
  const removeImageRow = (index) =>
    setImageRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)))

  return (
    <div className="relative z-30 mb-4 isolate space-y-6">
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/95 p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-900">
          <ShieldCheck className="h-4 w-4" />
          Video
        </div>
        <p className="mb-3 text-xs text-amber-900/90">
          Paste a different link if you do not want the auto-matched video. Learners only see a video after you
          approve it.
        </p>

        <form
          className="mb-4 space-y-2 rounded-xl border border-amber-200/80 bg-white/80 p-3"
          onSubmit={handleApplyManual}
        >
          <p className="text-xs font-semibold text-slate-800">Manual video link</p>
          <label className="block text-xs text-slate-600">
            URL
            <input
              type="url"
              autoComplete="off"
              placeholder="https://www.youtube.com/watch?v=…"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:border-amber-400 focus:ring-2"
            />
          </label>
          <label className="block text-xs text-slate-600">
            Title (optional)
            <input
              type="text"
              autoComplete="off"
              placeholder="Iframe title / accessibility"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
          </label>
          {manualError && <p className="text-xs text-rose-600">{manualError}</p>}
          <button
            type="submit"
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 sm:w-auto"
          >
            Use link &amp; preview
          </button>
        </form>

        {embeddableUrl ? (
          <>
            <p className="mb-2 text-xs font-medium text-slate-700">Preview</p>
            <div className="relative mb-3 overflow-hidden rounded-lg border border-amber-200 bg-black">
              <iframe
                key={embeddableUrl}
                src={embeddableUrl}
                title={effectiveLesson?.video?.title || 'Review preview'}
                loading="lazy"
                className="block h-52 w-full md:h-60"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mb-3 line-clamp-2 text-xs font-medium text-slate-700">
              {effectiveLesson?.video?.title || 'Untitled'}
            </p>
          </>
        ) : (
          <p className="mb-3 rounded-lg border border-dashed border-amber-300 bg-white/50 px-3 py-2 text-xs text-slate-600">
            No preview yet. Paste a YouTube or Vimeo URL above and click &quot;Use link &amp; preview&quot;.
          </p>
        )}

        <div className="relative z-40 flex flex-wrap gap-2 pointer-events-auto">
          <button
            type="button"
            disabled={!embeddableUrl}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onApproveVideo()
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Approve video
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRejectVideo()
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 shadow-sm hover:bg-rose-50"
          >
            <ShieldOff className="h-3.5 w-3.5" />
            Reject / Remove video
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Student video:{' '}
          <span className={studentsSeeVideo ? 'font-semibold text-emerald-700' : 'font-semibold text-slate-500'}>
            {studentsSeeVideo ? 'Approved — visible' : 'Not approved — hidden'}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/90 p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-900">
          <ImageIcon className="h-4 w-4" />
          Section images (local links)
        </div>
        <p className="mb-3 text-xs text-sky-900/90">
          Image URLs are stored in this browser only. Use the backup download on the dev page to save a JSON file.
          Applied images replace the lesson JSON for that section on this device until cleared.
        </p>

        <form className="space-y-3 rounded-xl border border-sky-200/80 bg-white/90 p-3" onSubmit={handleApplyImages}>
          <label className="block text-xs font-medium text-slate-700">
            Section
            <select
              value={imageSection}
              onChange={(e) => setImageSection(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {IMAGE_SECTION_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-3">
            {imageRows.map((row, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/80 p-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Image {index + 1}</span>
                  {imageRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageRow(index)}
                      className="rounded p-1 text-slate-500 hover:bg-rose-100 hover:text-rose-700"
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <label className="block text-xs text-slate-600">
                  Image URL
                  <input
                    type="url"
                    placeholder="https://…"
                    value={row.src}
                    onChange={(e) => {
                      const v = e.target.value
                      setImageRows((rows) => rows.map((r, i) => (i === index ? { ...r, src: v } : r)))
                    }}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="mt-2 block text-xs text-slate-600">
                  Alt text
                  <input
                    type="text"
                    placeholder="Short description"
                    value={row.alt}
                    onChange={(e) => {
                      const v = e.target.value
                      setImageRows((rows) => rows.map((r, i) => (i === index ? { ...r, alt: v } : r)))
                    }}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="mt-2 block text-xs text-slate-600">
                  Caption (optional)
                  <input
                    type="text"
                    placeholder="Caption under image"
                    value={row.caption}
                    onChange={(e) => {
                      const v = e.target.value
                      setImageRows((rows) => rows.map((r, i) => (i === index ? { ...r, caption: v } : r)))
                    }}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addImageRow}
            className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-medium text-sky-900 hover:bg-sky-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another image
          </button>

          {imageError && <p className="text-xs text-rose-600">{imageError}</p>}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Apply images to section
            </button>
            <button
              type="button"
              onClick={handleClearImages}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear override (use JSON again)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
