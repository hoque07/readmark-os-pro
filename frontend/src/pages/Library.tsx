import { BookOpen, Filter, Grid3X3, List, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { ErrorNotice } from '../components/ErrorNotice'
import { Loading } from '../components/Loading'
import { PostCard } from '../components/PostCard'
import type { Post } from '../types'

export function LibraryPage({ drafts = false }: { drafts?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [category, setCategory] = useState('')
  const query = searchParams.get('q') || ''

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.listPosts({
        page_size: 100,
        search: query,
        category,
        status: drafts ? 'draft' : 'published',
      })
      setPosts(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the library.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [query, category, drafts])
  const categories = useMemo(() => Array.from(new Set(posts.map((post) => post.category))).sort(), [posts])

  return (
    <div>
      <div className="page-title-row">
        <div><span className="eyebrow">DIGITAL BOOKSHELF</span><h1>{drafts ? 'Draft Studio' : 'Your Library'}</h1><p>{drafts ? 'Finish, review and publish unfinished reading notes.' : 'Search every book, lesson, idea and action you have stored.'}</p></div>
        <div className="view-toggle"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Grid3X3 /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List /></button></div>
      </div>

      <div className="library-toolbar panel">
        <form className="library-search" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get('q')?.toString() || ''; setSearchParams(value ? { q: value } : {}) }}>
          <Search size={18} /><input name="q" defaultValue={query} placeholder="Search title, book, lesson or idea…" /><button className="button button-primary button-small">Search</button>
        </form>
        <label className="select-control"><Filter size={16} /><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>

      {loading ? <Loading label="Opening the library…" /> : error ? <ErrorNotice message={error} retry={() => void load()} /> : posts.length === 0 ? (
        <EmptyState icon={BookOpen} title="No lessons found" description={drafts ? 'You have no draft posts right now.' : 'Try a different search or create your first reading note.'} />
      ) : (
        <div className={view === 'grid' ? 'lesson-grid library-grid' : 'lesson-list'}>
          {posts.map((post) => <PostCard key={post.id} post={post} compact={view === 'list'} />)}
        </div>
      )}
    </div>
  )
}
