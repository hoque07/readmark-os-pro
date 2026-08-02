import { Bookmark, Brain, CalendarClock, Check, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { ErrorNotice } from '../components/ErrorNotice'
import { Loading } from '../components/Loading'
import type { Post } from '../types'

export function ReviewPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState(0)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try { setPosts(await api.dueReviews()) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load review items.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const grade = async (result: 'forgot' | 'partly' | 'easy') => {
    const post = posts[active]
    if (!post) return
    try {
      const outcome = await api.gradeReview(post.id, result)
      setMessage(`Next review in ${outcome.interval_days} day${outcome.interval_days > 1 ? 's' : ''}.`)
      const next = posts.filter((item) => item.id !== post.id)
      setPosts(next)
      setActive(0)
    } catch (err) { setError(err instanceof Error ? err.message : 'Review could not be saved.') }
  }

  if (loading) return <Loading label="Opening Review Vault…" />
  if (error) return <ErrorNotice message={error} retry={() => void load()} />
  const current = posts[active]

  return (
    <div>
      <div className="page-title-row"><div><span className="eyebrow">SPACED MEMORY REVIEW</span><h1>Review Vault</h1><p>Revisit important ideas before they disappear from memory.</p></div><div className="due-badge"><CalendarClock /> <strong>{posts.length}</strong><span>Due today</span></div></div>
      {message && <div className="success-notice"><Check /> {message}</div>}
      {!current ? <EmptyState icon={Brain} title="Your memory is up to date" description="There are no lessons due right now. Save an article for review and it will appear here." /> : (
        <div className="review-layout">
          <aside className="review-list panel"><h3>Due for Review</h3>{posts.map((post, index) => <button key={post.id} className={index === active ? 'active' : ''} onClick={() => setActive(index)}><span className={`mini-cover accent-${post.accent}`}>{post.book_title.slice(0, 2)}</span><span><strong>{post.title}</strong><small>{post.book_title}</small></span></button>)}</aside>
          <article className="review-card panel">
            <span className="category-chip">{current.category}</span>
            <Bookmark className="review-bookmark" fill="currentColor" />
            <h2>{current.title}</h2>
            <p className="review-question">Without opening the full article, what was the main idea?</p>
            <div className="memory-answer"><span>KEY INSIGHT</span><p>{current.key_insight || current.one_minute_recap}</p></div>
            <div className="review-grade"><button onClick={() => void grade('forgot')}><RotateCcw /> Forgot</button><button onClick={() => void grade('partly')}><Brain /> Partly</button><button className="easy" onClick={() => void grade('easy')}><Check /> Easy</button></div>
          </article>
        </div>
      )}
    </div>
  )
}
