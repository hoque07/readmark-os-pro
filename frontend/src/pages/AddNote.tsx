import { BookOpen, Check, Image, LoaderCircle, Mic, Save, Send, Sparkles, WandSparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorNotice } from '../components/ErrorNotice'
import type { GenerateRequest, GeneratedBlog, Post, PostInput } from '../types'

const initialRequest: GenerateRequest = {
  raw_note: '',
  book_title: '',
  book_author: '',
  chapter: '',
  category: 'Self Development',
  language: 'bn',
  tone: 'story',
}

export function AddNotePage({ edit = false }: { edit?: boolean }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<GenerateRequest>(initialRequest)
  const [generated, setGenerated] = useState<GeneratedBlog | null>(null)
  const [existing, setExisting] = useState<Post | null>(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [accent, setAccent] = useState('amber')
  const [featured, setFeatured] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!edit || !id) return
    api.getPostById(Number(id)).then((post) => {
      setExisting(post)
      setForm({
        raw_note: post.raw_note,
        book_title: post.book_title,
        book_author: post.book_author,
        chapter: post.chapter,
        category: post.category,
        language: 'bn',
        tone: 'story',
      })
      setGenerated({
        title: post.title,
        excerpt: post.excerpt,
        story: '',
        main_concept: post.key_insight,
        practical_example: '',
        three_lessons: ['', '', ''],
        personal_reflection: post.personal_reflection,
        action_step: post.action_step,
        one_minute_recap: post.one_minute_recap,
        tags: post.tags,
        content_markdown: post.content_markdown,
        provider: 'existing-post',
        warning: null,
      })
      setCoverUrl(post.cover_url)
      setAccent(post.accent)
      setFeatured(post.featured)
    }).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load post.'))
  }, [edit, id])

  const updateForm = <K extends keyof GenerateRequest>(key: K, value: GenerateRequest[K]) => setForm((current) => ({ ...current, [key]: value }))

  const generate = async () => {
    setError('')
    if (form.raw_note.trim().length < 20) {
      setError('Write at least 20 characters from today’s reading before generating the blog.')
      return
    }
    setBusy(true)
    try {
      const result = await api.generate(form)
      setGenerated(result)
      setNotice(result.provider.startsWith('openai') ? 'AI draft generated.' : 'Offline structured draft generated. Add an OpenAI key for richer writing.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Blog generation failed.')
    } finally {
      setBusy(false)
    }
  }

  const upload = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const result = await api.upload(file)
      setCoverUrl(result.url)
      setNotice('Cover uploaded successfully.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Upload failed.') }
    finally { setBusy(false) }
  }

  const save = async (status: 'draft' | 'published') => {
    if (!generated) {
      setError('Generate a blog first, then review and save it.')
      return
    }
    setBusy(true)
    setError('')
    const payload: PostInput = {
      title: generated.title,
      excerpt: generated.excerpt,
      raw_note: form.raw_note,
      content_markdown: generated.content_markdown,
      key_insight: generated.main_concept,
      personal_reflection: generated.personal_reflection,
      action_step: generated.action_step,
      one_minute_recap: generated.one_minute_recap,
      book_title: form.book_title || 'Untitled Book',
      book_author: form.book_author,
      chapter: form.chapter,
      category: form.category,
      tags: generated.tags,
      cover_url: coverUrl,
      accent,
      status,
      featured,
      is_applied: existing?.is_applied || false,
      saved_for_review: existing?.saved_for_review || false,
    }
    try {
      const post = existing ? await api.updatePost(existing.id, payload) : await api.createPost(payload)
      navigate(status === 'published' ? `/article/${post.slug}` : '/drafts')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save the post.') }
    finally { setBusy(false) }
  }

  return (
    <div className="studio-page">
      <div className="page-title-row">
        <div><span className="eyebrow"><WandSparkles size={14} /> AI NOTE STUDIO</span><h1>{edit ? 'Edit Reading Memory' : 'Turn today’s text into a story'}</h1><p>Paste rough thoughts, use phone voice typing, generate a structured blog, edit it, then publish.</p></div>
        <span className="studio-status"><span className="status-dot" /> Backend-connected editor</span>
      </div>
      {error && <ErrorNotice message={error} />}
      {notice && <div className="success-notice"><Check size={17} /> {notice}</div>}

      <div className="studio-grid">
        <section className="studio-form panel">
          <div className="form-section-title"><span><BookOpen /></span><div><h2>Reading context</h2><p>Only book name and your note are needed.</p></div></div>
          <div className="form-grid two">
            <label><span>Book name</span><input value={form.book_title} onChange={(e) => updateForm('book_title', e.target.value)} placeholder="Atomic Habits" /></label>
            <label><span>Author</span><input value={form.book_author} onChange={(e) => updateForm('book_author', e.target.value)} placeholder="James Clear" /></label>
            <label><span>Chapter</span><input value={form.chapter} onChange={(e) => updateForm('chapter', e.target.value)} placeholder="Chapter 4" /></label>
            <label><span>Category</span><select value={form.category} onChange={(e) => updateForm('category', e.target.value)}><option>Self Development</option><option>Habits</option><option>Productivity</option><option>Mindset</option><option>Psychology</option><option>Communication</option><option>Money Mindset</option></select></label>
          </div>

          <label className="note-field"><span>What did you learn today?</span><textarea value={form.raw_note} onChange={(e) => updateForm('raw_note', e.target.value)} placeholder="Write naturally. You can paste bullet points, mixed Bangla-English notes, or use your phone keyboard microphone…" /><small><Mic size={14} /> On iPhone/Android, tap the keyboard microphone and speak your note.</small></label>

          <div className="form-grid two">
            <label><span>Output language</span><select value={form.language} onChange={(e) => setForm((current) => ({ ...current, language: e.target.value as 'bn' | 'en' }))}><option value="bn">Bangla</option><option value="en">English</option></select></label>
            <label><span>Writing style</span><select value={form.tone} onChange={(e) => setForm((current) => ({ ...current, tone: e.target.value as 'story' | 'concise' | 'reflective' }))}><option value="story">Story-focused</option><option value="reflective">Reflective</option><option value="concise">Concise</option></select></label>
          </div>

          <div className="cover-row">
            <label className="upload-box"><Image size={22} /><span>{coverUrl ? 'Replace cover image' : 'Upload optional cover'}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void upload(e.target.files?.[0])} /></label>
            <label><span>Accent</span><select value={accent} onChange={(e) => setAccent(e.target.value)}><option value="amber">Amber</option><option value="violet">Violet</option><option value="blue">Blue</option><option value="green">Green</option></select></label>
            <label className="check-control"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /><span>Featured lesson</span></label>
          </div>

          <button className="button button-primary button-wide" disabled={busy} onClick={() => void generate()}>{busy ? <LoaderCircle className="spin" /> : <Sparkles />} {edit ? 'Regenerate from note' : 'Generate Blog Draft'}</button>
        </section>

        <section className="generated-preview panel">
          <div className="preview-header"><div><span className="eyebrow">LIVE EDITABLE DRAFT</span><h2>Blog Preview</h2></div>{generated && <span className="provider-label">{generated.provider}</span>}</div>
          {!generated ? (
            <div className="preview-placeholder"><WandSparkles size={42} /><h3>Your generated story will appear here</h3><p>The offline generator works immediately. Add an OpenAI key later for richer editorial output.</p></div>
          ) : (
            <div className="generated-fields">
              {generated.warning && <div className="warning-box">{generated.warning}</div>}
              <label><span>Title</span><input value={generated.title} onChange={(e) => setGenerated({ ...generated, title: e.target.value })} /></label>
              <label><span>Excerpt</span><textarea className="small-textarea" value={generated.excerpt} onChange={(e) => setGenerated({ ...generated, excerpt: e.target.value })} /></label>
              <label><span>Full Markdown article</span><textarea className="markdown-editor" value={generated.content_markdown} onChange={(e) => setGenerated({ ...generated, content_markdown: e.target.value })} /></label>
              <div className="form-grid two">
                <label><span>Key insight</span><textarea className="small-textarea" value={generated.main_concept} onChange={(e) => setGenerated({ ...generated, main_concept: e.target.value })} /></label>
                <label><span>Action step</span><textarea className="small-textarea" value={generated.action_step} onChange={(e) => setGenerated({ ...generated, action_step: e.target.value })} /></label>
              </div>
              <label><span>Tags, comma separated</span><input value={generated.tags.join(', ')} onChange={(e) => setGenerated({ ...generated, tags: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></label>
              <div className="publish-actions">
                <button className="button button-muted" disabled={busy} onClick={() => void save('draft')}><Save size={17} /> Save Draft</button>
                <button className="button button-primary" disabled={busy} onClick={() => void save('published')}><Send size={17} /> Publish Now</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
