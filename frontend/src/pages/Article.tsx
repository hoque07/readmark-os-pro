import { ArrowLeft, Bookmark, Check, Copy, Edit3, Focus, Share2, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import { api } from '../api/client'
import { ErrorNotice } from '../components/ErrorNotice'
import { Loading } from '../components/Loading'
import { useAuth } from '../contexts/AuthContext'
import type { Post } from '../types'

export function ArticlePage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setLoading(true)
    api.getPost(slug).then(setPost).catch((err) => setError(err instanceof Error ? err.message : 'Article not found.')).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(height > 0 ? Math.min(100, (window.scrollY / height) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const headings = useMemo(() => post?.content_markdown.match(/^##\s+(.+)$/gm)?.map((item) => item.replace(/^##\s+/, '')) || [], [post])

  const patch = async (updates: Partial<Post>) => {
    if (!post || !user) return
    try {
      const updated = await api.updatePost(post.id, updates)
      setPost(updated)
      setMessage('Updated')
      window.setTimeout(() => setMessage(''), 1600)
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Update failed') }
  }

  const toggleReview = async () => {
    if (!post) return
    if (!user) {
      setMessage('Login as owner to sync review items.')
      return
    }
    try {
      const updated = post.saved_for_review
        ? await api.updatePost(post.id, { saved_for_review: false })
        : await api.scheduleReview(post.id)
      setPost(updated)
      setMessage(updated.saved_for_review ? 'Saved for tomorrow’s review' : 'Removed from Review Vault')
      window.setTimeout(() => setMessage(''), 1800)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Review update failed')
    }
  }

  if (loading) return <Loading label="Opening your reading memory…" />
  if (error || !post) return <ErrorNotice message={error || 'Article not found.'} />

  return (
    <div className={focusMode ? 'article-page focus-active' : 'article-page'}>
      <div className="reading-progress"><span style={{ width: `${scrollProgress}%` }} /></div>
      <aside className="article-toc panel">
        <Link className="back-link" to="/library"><ArrowLeft size={16} /> Back to Library</Link>
        <h3>On This Page</h3>
        <ol>{headings.map((heading, index) => <li key={heading}><span>{String(index + 1).padStart(2, '0')}</span>{heading}</li>)}</ol>
      </aside>

      <article className="reader-column">
        <header className="article-header">
          <span className="category-chip">{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.book_title}{post.book_author ? ` · ${post.book_author}` : ''}</p>
          <div className="article-meta"><span>{post.chapter || 'Reading note'}</span><span>{post.read_time} min read</span><span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span></div>
          <div className="article-actions">
            <button className="button button-muted" onClick={() => void toggleReview()}><Bookmark size={17} fill={post.saved_for_review ? 'currentColor' : 'none'} /> {post.saved_for_review ? 'Saved' : 'Save'}</button>
            <button className="button button-muted" onClick={() => user ? void patch({ is_applied: !post.is_applied }) : setMessage('Login as owner to mark lessons applied.')}><Check size={17} /> {post.is_applied ? 'Applied' : 'Apply'}</button>
            <button className="button button-muted" onClick={() => { void navigator.clipboard.writeText(window.location.href); setMessage('Link copied') }}><Share2 size={17} /> Share</button>
            <button className="button button-outline" onClick={() => setFocusMode((value) => !value)}><Focus size={17} /> {focusMode ? 'Exit Focus' : 'Focus Mode'}</button>
            {user && <Link className="button button-muted" to={`/edit/${post.id}`}><Edit3 size={17} /> Edit</Link>}
          </div>
          {message && <div className="toast-inline">{message}</div>}
        </header>

        {post.key_insight && <div className="key-insight"><Sparkles size={20} /><div><strong>KEY INSIGHT</strong><p>{post.key_insight}</p></div></div>}

        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_markdown}</ReactMarkdown>
        </div>

        <footer className="article-footer-panel panel">
          <div><span className="eyebrow">ONE-MINUTE RECAP</span><h3>{post.one_minute_recap || post.excerpt}</h3></div>
          <button className="button button-primary" onClick={() => { void navigator.clipboard.writeText(post.one_minute_recap || post.excerpt); setMessage('Recap copied') }}><Copy size={17} /> Copy recap</button>
        </footer>
      </article>

      <aside className="article-side panel">
        <h3>Quick Actions</h3>
        <button onClick={() => void toggleReview()}><Bookmark size={17} /> Save for Review</button>
        <button onClick={() => user && void patch({ is_applied: true })}><Check size={17} /> Mark as Applied</button>
        <button onClick={() => void navigator.clipboard.writeText(post.one_minute_recap)}><Copy size={17} /> Copy Summary</button>
        <button onClick={() => setFocusMode(true)}><Focus size={17} /> Focus Mode</button>
        <div className="side-divider" />
        <small>Book</small><strong>{post.book_title}</strong><p>{post.book_author}</p>
      </aside>
    </div>
  )
}
