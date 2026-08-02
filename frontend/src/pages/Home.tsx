import { ArrowRight, BookOpen, CheckCircle2, Flame, Library, Quote, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { ErrorNotice } from '../components/ErrorNotice'
import { Loading } from '../components/Loading'
import { PostCard } from '../components/PostCard'
import { StatCard } from '../components/StatCard'
import type { Post, ReadingProgress, Stats } from '../types'

export function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsData, postData] = await Promise.all([
        api.stats(),
        api.listPosts({ page_size: 4, status: 'published' }),
      ])
      setStats(statsData)
      setPosts(postData.items)
      try { setProgress(await api.progress()) } catch { setProgress([]) }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  if (loading) return <Loading />
  if (error || !stats) return <ErrorNotice message={error || 'Dashboard data is unavailable.'} retry={() => void load()} />

  const activeBook = progress.find((item) => item.status === 'reading')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const readerName = user?.display_name || 'Reader'
  return (
    <div className="dashboard-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15} /> Personal Reading OS</span>
          <h1>{greeting}, {readerName} 👋</h1>
          <p>আজকের প্রথম ১০ মিনিট পড়া দিয়ে শুরু করো। একটি idea save করলেই ভবিষ্যতের তোমার জন্য একটি memory তৈরি হবে।</p>
          <div className="stats-grid">
            <StatCard icon={Flame} value={stats.streak_days} label="Days Streak" tone="orange" />
            <StatCard icon={BookOpen} value={stats.books_count} label="Books Collected" tone="violet" />
            <StatCard icon={Library} value={stats.published_posts} label="Lessons Saved" tone="amber" />
            <StatCard icon={CheckCircle2} value={stats.applied_lessons} label="Lessons Applied" tone="green" />
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" to={posts[0] ? `/article/${posts[0].slug}` : '/library'}><BookOpen size={18} /> Continue Reading</Link>
            <Link className="button button-outline" to="/add"><Sparkles size={18} /> Add Today’s Note</Link>
          </div>
        </div>
        <div className="hero-library-art" aria-hidden="true">
          <div className="moon" />
          <div className="lamp" />
          <div className="shelf shelf-one" />
          <div className="shelf shelf-two" />
          <div className="chair" />
        </div>
      </section>

      <section className="home-feature-grid">
        <article className="continue-card panel">
          <div className="section-heading"><div><span className="eyebrow">CURRENT JOURNEY</span><h2>Continue Reading</h2></div></div>
          {activeBook ? (
            <div className="continue-content">
              <div className="book-cover-large"><span>{activeBook.book_title.slice(0, 2).toUpperCase()}</span></div>
              <div className="continue-info">
                <h3>{activeBook.book_title}</h3>
                <p>{activeBook.book_author}</p>
                <strong>Chapter {activeBook.current_chapter} of {activeBook.total_chapters}</strong>
                <div className="progress-track"><span style={{ width: `${activeBook.progress_percent}%` }} /></div>
                <small>{activeBook.progress_percent}% completed</small>
                <Link className="button button-muted button-small" to="/progress">View journey <ArrowRight size={15} /></Link>
              </div>
            </div>
          ) : (
            <div className="continue-content">
              <div className="book-cover-large"><span>AH</span></div>
              <div className="continue-info"><h3>Atomic Habits</h3><p>James Clear</p><strong>Start your first tracked book</strong><Link className="button button-muted button-small" to="/progress">Add progress</Link></div>
            </div>
          )}
        </article>

        <article className="quote-panel panel">
          <span className="quote-bookmark" />
          <Quote size={42} />
          <p>তুমি যে লক্ষ্য চাও সেটি নয়, তুমি যে system অনুসরণ করো সেটিই result তৈরি করে।</p>
          <small>Today’s saved idea</small>
        </article>
      </section>

      <section>
        <div className="section-heading">
          <div><span className="eyebrow">YOUR MEMORY LIBRARY</span><h2>Recent Lessons</h2></div>
          <Link className="text-link" to="/library">View all <ArrowRight size={15} /></Link>
        </div>
        <div className="lesson-grid">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </section>
    </div>
  )
}
