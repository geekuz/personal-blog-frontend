import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import StatusMessage from '../components/ui/StatusMessage'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import MarkdownContent from '../components/blog/MarkdownContent'
import CoverImage from '../components/blog/CoverImage'

const emptyPost = { slug: '', title: '', summary: '', content: '', coverImageUrl: '', coverImageAlt: '', status: 'DRAFT', scheduledAt: '', tags: [] }
const AUTOSAVE_DELAY_MS = 500

function draftKey(post) {
  return `admin-post-draft:${post.originalSlug ?? 'new'}`
}

function postValues(post) {
  return {
    title: post.title, slug: post.slug, summary: post.summary, content: post.content,
    coverImageUrl: post.coverImageUrl ?? '', coverImageAlt: post.coverImageAlt ?? '',
    tags: post.tags.map((tag) => tag.name).join(', '), status: post.status,
    scheduledAt: toLocalDateTime(post.scheduledAt),
  }
}

function toLocalDateTime(instant) {
  if (!instant) return ''
  const date = new Date(instant)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function loadAutosave(post) {
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey(post)))
    return saved?.values ? { ...postValues(post), ...saved.values } : null
  } catch {
    return null
  }
}

function Admin() {
  useDocumentMeta({ title: 'Admin — otabek.dev' })
  const { user, isLoading, loadDashboard, saveAdminPost, deleteAdminPost, uploadAdminImage } = useAuth()
  const [dashboard, setDashboard] = useState({ status: 'loading', data: null, message: '' })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [editorDirty, setEditorDirty] = useState(false)

  function startEditing(post) {
    if (editorDirty && !window.confirm('Discard your unsaved changes?')) return
    setEditorDirty(false)
    setEditing(post)
  }

  function refresh() {
    setDashboard((current) => ({ ...current, status: 'loading', message: '' }))
    return loadDashboard().then((data) => setDashboard({ status: 'ready', data, message: '' }))
      .catch((error) => setDashboard({ status: 'error', data: null, message: error.message }))
  }

  useEffect(() => {
    if (!user?.roles.includes('ADMIN')) return
    let active = true
    loadDashboard().then((data) => { if (active) setDashboard({ status: 'ready', data, message: '' }) })
      .catch((error) => { if (active) setDashboard({ status: 'error', data: null, message: error.message }) })
    return () => { active = false }
  }, [loadDashboard, user])

  if (isLoading) return <StatusMessage title="Loading admin…">Checking your permissions.</StatusMessage>
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />
  if (!user.roles.includes('ADMIN')) return <Navigate to="/account" replace />
  if (dashboard.status === 'loading' && !dashboard.data) return <StatusMessage title="Loading dashboard…">Fetching posts and newsletter status.</StatusMessage>
  if (dashboard.status === 'error') return <StatusMessage title="Dashboard unavailable" action={<button onClick={refresh}>Try again</button>}>{dashboard.message}</StatusMessage>

  async function submit(event) {
    event.preventDefault(); setSaving(true); setNotice('')
    const form = new FormData(event.currentTarget)
    const tags = String(form.get('tags')).split(',').map((name) => name.trim()).filter(Boolean)
      .map((name) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))
      .filter((tag) => tag.slug)
    const details = {
      slug: form.get('slug'), title: form.get('title'), summary: form.get('summary'), content: form.get('content'),
      coverImageUrl: form.get('coverImageUrl')?.trim() || null,
      coverImageAlt: form.get('coverImageAlt')?.trim() || null,
      status: form.get('status'),
      scheduledAt: form.get('status') === 'SCHEDULED' ? new Date(form.get('scheduledAt')).toISOString() : null,
      tags,
    }
    try {
      await saveAdminPost(editing?.originalSlug ?? null, details)
      localStorage.removeItem(draftKey(editing))
      setEditorDirty(false)
      setEditing(null); setNotice(details.status === 'PUBLISHED' ? 'Post saved. New subscribers are being emailed.' : details.status === 'SCHEDULED' ? 'Post scheduled.' : 'Draft saved.')
      await refresh()
    } catch (error) { setNotice(error.message) } finally { setSaving(false) }
  }

  async function remove(post) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return
    setNotice('')
    try { await deleteAdminPost(post.slug); setEditing(null); setNotice('Post deleted.'); await refresh() }
    catch (error) { setNotice(error.message) }
  }

  const data = dashboard.data
  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-accent">Administration</p><h1 className="text-3xl font-bold text-heading">Publishing dashboard</h1></div>
        <button onClick={() => startEditing({ ...emptyPost, originalSlug: null })} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white">New post</button>
      </div>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Metric label="Published" value={data.publishedPosts} /><Metric label="Drafts" value={data.draftPosts} />
        <Metric label="Scheduled" value={data.scheduledPosts} /><Metric label="Subscribers" value={data.subscribers} /><Metric label="Emails queued" value={data.pendingDeliveries} />
        <Metric label="Email failures" value={data.failedDeliveries} />
      </dl>
      {notice && <p role="status" className="mt-6 rounded-lg border border-border bg-surface p-3 text-sm text-heading">{notice}</p>}
      {editing && <PostEditor key={editing.originalSlug ?? 'new'} post={editing} saving={saving} onSubmit={submit} onUploadImage={uploadAdminImage} onDirtyChange={setEditorDirty} onCancel={() => { setEditorDirty(false); setEditing(null) }} />}
      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface">
        {data.posts.length === 0 ? <p className="p-6 text-sm text-muted">No posts yet.</p> : (
          <table className="w-full text-left text-sm"><thead className="border-b border-border text-muted"><tr><th className="p-4">Title</th><th className="p-4">Status</th><th className="p-4">Updated</th><th className="p-4"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{data.posts.map((post) => <tr key={post.id} className="border-b border-border last:border-0"><td className="p-4 font-medium text-heading">{post.title}<span className="mt-1 block text-xs font-normal text-muted">/{post.slug}</span></td><td className="p-4 text-muted">{post.status}{post.scheduledAt && <span className="mt-1 block text-xs">{new Date(post.scheduledAt).toLocaleString()}</span>}</td><td className="p-4 text-muted">{new Date(post.updatedAt).toLocaleDateString()}</td><td className="p-4"><div className="flex justify-end gap-3"><button onClick={() => startEditing({ ...post, originalSlug: post.slug })} className="text-accent">Edit</button><button onClick={() => remove(post)} className="text-red-600 dark:text-red-400">Delete</button></div></td></tr>)}</tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function Metric({ label, value }) { return <div className="rounded-xl border border-border bg-surface p-4"><dt className="text-xs uppercase tracking-wide text-muted">{label}</dt><dd className="mt-2 text-2xl font-bold text-heading">{value}</dd></div> }

function PostEditor({ post, saving, onSubmit, onCancel, onDirtyChange, onUploadImage }) {
  const [initial] = useState(() => {
    const server = postValues(post)
    return { server, recovered: loadAutosave(post) }
  })
  const [values, setValues] = useState(() => initial.recovered ?? initial.server)
  const [editorMode, setEditorMode] = useState('write')
  const [autosaveStatus, setAutosaveStatus] = useState(initial.recovered ? 'Recovered locally saved changes.' : '')
  const [upload, setUpload] = useState({ status: 'idle', message: '' })
  const dirty = JSON.stringify(values) !== JSON.stringify(initial.server)

  useEffect(() => {
    onDirtyChange(dirty)
    if (!dirty) return
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey(post), JSON.stringify({ values, savedAt: new Date().toISOString() }))
      setAutosaveStatus('Changes saved locally.')
    }, AUTOSAVE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [dirty, onDirtyChange, post, values])

  useEffect(() => {
    const warnBeforeUnload = (event) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    const warnBeforeNavigation = (event) => {
      const link = event.target.closest?.('a[href]')
      if (!dirty || !link || link.target === '_blank' || event.defaultPrevented) return
      if (!window.confirm('Leave this page? Your changes are saved locally but not published.')) event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    document.addEventListener('click', warnBeforeNavigation, true)
    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload)
      document.removeEventListener('click', warnBeforeNavigation, true)
    }
  }, [dirty])

  const change = (name) => (event) => {
    setAutosaveStatus('Saving locally…')
    setValues((current) => ({ ...current, [name]: event.target.value }))
  }

  const cancel = () => {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return
    localStorage.removeItem(draftKey(post))
    onCancel()
  }

  const uploadCover = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUpload({ status: 'uploading', message: 'Uploading image…' })
    try {
      const uploaded = await onUploadImage(file)
      setValues((current) => ({ ...current, coverImageUrl: uploaded.url }))
      setAutosaveStatus('Saving locally…')
      setUpload({ status: 'ready', message: 'Image uploaded.' })
    } catch (error) {
      setUpload({ status: 'error', message: error.message })
    } finally {
      event.target.value = ''
    }
  }

  return <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-xl border border-border bg-surface p-6">
    <h2 className="text-xl font-semibold text-heading">{post.originalSlug ? 'Edit post' : 'New post'}</h2>
    {autosaveStatus && <p role="status" className="text-sm text-muted">{autosaveStatus}</p>}
    <Field label="Title" name="title" value={values.title} onChange={change('title')} maxLength="200" />
    <Field label="Slug" name="slug" value={values.slug} onChange={change('slug')} maxLength="160" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
    <label className="block text-sm font-medium text-heading">Summary<textarea name="summary" required maxLength="500" value={values.summary} onChange={change('summary')} rows="3" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-heading" /></label>
    <div className="rounded-lg border border-border bg-background p-4">
      <label className="block text-sm font-medium text-heading">Upload cover image
        <input type="file" accept="image/jpeg,image/png,image/gif" onChange={uploadCover} disabled={upload.status === 'uploading'} className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-60" />
      </label>
      <p className="mt-2 text-xs text-muted">JPEG, PNG, or GIF; maximum 5 MB and 6000 × 6000 pixels.</p>
      {upload.message && <p role="status" className={`mt-2 text-sm ${upload.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-muted'}`}>{upload.message}</p>}
    </div>
    <label className="block text-sm font-medium text-heading">Cover image URL (optional)<input type="url" name="coverImageUrl" value={values.coverImageUrl} onChange={change('coverImageUrl')} maxLength="2048" required={Boolean(values.coverImageAlt.trim())} placeholder="Upload an image or paste an HTTPS URL" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-heading" /></label>
    <label className="block text-sm font-medium text-heading">Cover image alt text<input name="coverImageAlt" value={values.coverImageAlt} onChange={change('coverImageAlt')} maxLength="300" required={Boolean(values.coverImageUrl.trim())} placeholder="Describe the image for screen readers" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-heading" /></label>
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-heading">Content (Markdown)</span>
        <div className="flex rounded-lg border border-border bg-background p-1" aria-label="Editor view">
          <button type="button" aria-pressed={editorMode === 'write'} onClick={() => setEditorMode('write')} className={`rounded-md px-3 py-1.5 text-sm ${editorMode === 'write' ? 'bg-accent text-white' : 'text-muted hover:text-heading'}`}>Write</button>
          <button type="button" aria-pressed={editorMode === 'preview'} onClick={() => setEditorMode('preview')} className={`rounded-md px-3 py-1.5 text-sm ${editorMode === 'preview' ? 'bg-accent text-white' : 'text-muted hover:text-heading'}`}>Preview</button>
        </div>
      </div>
      {editorMode === 'write' ? (
        <textarea aria-label="Content (Markdown)" name="content" required value={values.content} onChange={change('content')} rows="16" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-heading" />
      ) : (
        <>
          <input type="hidden" name="content" value={values.content} />
          <div aria-label="Post preview" className="mt-2 min-h-96 rounded-lg border border-border bg-background p-5">
            <CoverImage src={values.coverImageUrl.trim()} alt={values.coverImageAlt.trim()} className="mb-6 aspect-video w-full rounded-lg object-cover" />
            {values.content.trim() ? <MarkdownContent>{values.content}</MarkdownContent> : <p className="text-sm text-muted">Start writing to see a preview.</p>}
          </div>
        </>
      )}
    </div>
    <Field label="Tags (comma separated)" name="tags" value={values.tags} onChange={change('tags')} />
    <label className="block text-sm font-medium text-heading">Status<select name="status" value={values.status} onChange={change('status')} className="mt-2 block rounded-lg border border-border bg-background px-3 py-2 text-heading"><option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option><option value="PUBLISHED">Published</option></select></label>
    {values.status === 'SCHEDULED' && <label className="block text-sm font-medium text-heading">Publish date and time<input type="datetime-local" name="scheduledAt" value={values.scheduledAt} onChange={change('scheduledAt')} min={toLocalDateTime(new Date())} required className="mt-2 block rounded-lg border border-border bg-background px-3 py-2 text-heading" /></label>}
    <p className="text-sm text-muted">Publishing now or at the scheduled time queues one email for every current subscriber.</p>
    <div className="flex gap-3"><button disabled={saving} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save post'}</button><button type="button" onClick={cancel} className="rounded-lg border border-border px-4 py-2.5 text-sm text-heading">Cancel</button></div>
  </form>
}

function Field({ label, ...props }) { return <label className="block text-sm font-medium text-heading">{label}<input required className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-heading" {...props} /></label> }

export default Admin
