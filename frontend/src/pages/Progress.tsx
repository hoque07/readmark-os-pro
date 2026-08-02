import { BarChart3, BookOpen, CheckCircle2, Flame, Library, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorNotice } from '../components/ErrorNotice'
import { Loading } from '../components/Loading'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../contexts/AuthContext'
import type { ReadingProgress, Stats } from '../types'

export function ProgressPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [book, setBook] = useState({ book_title: '', book_author: '', cover_url: '', current_chapter: 1, total_chapters: 10, status: 'reading' as const })

  const load = async () => {
    setLoading(true)
    try {
      setStats(await api.stats())
      if (user) setProgress(await api.progress())
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load progress.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [user])

  const saveBook = async () => {
    try {
      await api.upsertProgress(book)
      setShowForm(false)
      setBook({ book_title: '', book_author: '', cover_url: '', current_chapter: 1, total_chapters: 10, status: 'reading' })
      await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save book progress.') }
  }

  if (loading) return <Loading />
  if (error || !stats) return <ErrorNotice message={error || 'Progress is unavailable.'} retry={() => void load()} />

  const recentActivity = stats.daily_activity.slice(-14)
  const activityMax = Math.max(1, ...recentActivity.map((item) => item.count))

  return (
    <div>
      <div className="page-title-row"><div><span className="eyebrow">YOUR READING JOURNEY</span><h1>Progress</h1><p>Track consistency, completed lessons and active books without turning reading into pressure.</p></div>{user && <button className="button button-primary" onClick={() => setShowForm(!showForm)}><Plus /> Track Book</button>}</div>
      <div className="stats-grid progress-stats">
        <StatCard icon={Library} value={stats.published_posts} label="Lessons Stored" tone="violet" />
        <StatCard icon={CheckCircle2} value={stats.applied_lessons} label="Lessons Applied" tone="green" />
        <StatCard icon={BookOpen} value={stats.books_count} label="Books Collected" tone="amber" />
        <StatCard icon={Flame} value={stats.streak_days} label="Day Streak" tone="orange" />
      </div>

      {!user && <div className="login-cta panel"><BarChart3 size={32} /><div><h3>Login to sync book progress</h3><p>Public lesson statistics are visible, but current chapter tracking is owner-only.</p></div><Link className="button button-primary" to="/login">Owner Login</Link></div>}

      {showForm && <div className="inline-form panel"><input placeholder="Book title" value={book.book_title} onChange={(e) => setBook({ ...book, book_title: e.target.value })} /><input placeholder="Author" value={book.book_author} onChange={(e) => setBook({ ...book, book_author: e.target.value })} /><input type="number" min="0" placeholder="Current chapter" value={book.current_chapter} onChange={(e) => setBook({ ...book, current_chapter: Number(e.target.value) })} /><input type="number" min="1" placeholder="Total chapters" value={book.total_chapters} onChange={(e) => setBook({ ...book, total_chapters: Number(e.target.value) })} /><button className="button button-primary" onClick={() => void saveBook()}>Save</button></div>}

      <section className="panel chart-panel">
        <div className="section-heading"><div><span className="eyebrow">LAST 30 DAYS</span><h2>Reading Rhythm</h2></div><strong>{stats.monthly_days} active days</strong></div>
        <div className="bar-chart">{recentActivity.map((item) => {
          const height = item.count ? Math.max(10, (item.count / activityMax) * 100) : 4
          return <span key={item.date} className={item.count ? '' : 'empty'} style={{ height: `${height}%` }} title={`${item.date}: ${item.count} note${item.count === 1 ? '' : 's'}`} />
        })}</div>
      </section>

      <section>
        <div className="section-heading"><div><span className="eyebrow">ACTIVE BOOKS</span><h2>Book Journeys</h2></div></div>
        <div className="journey-grid">
          {progress.map((item) => <article className="journey-card panel" key={item.id}><div className="book-cover-large"><span>{item.book_title.slice(0, 2)}</span></div><div><span className="category-chip">{item.status}</span><h3>{item.book_title}</h3><p>{item.book_author}</p><div className="progress-track"><span style={{ width: `${item.progress_percent}%` }} /></div><small>Chapter {item.current_chapter} of {item.total_chapters} · {item.progress_percent}%</small></div></article>)}
          {user && progress.length === 0 && <div className="empty-compact panel">No book progress yet. Add the book you are reading now.</div>}
        </div>
      </section>
    </div>
  )
}
