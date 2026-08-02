import { Bookmark, Check, Clock, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Post } from '../types'

const bookFallbacks: Record<string, string> = {
  'Atomic Habits': 'AH',
  'Deep Work': 'DW',
  Mindset: 'MS',
}

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <article className={`lesson-card accent-${post.accent} ${compact ? 'lesson-card-compact' : ''}`}>
      <span className="bookmark-ribbon"><Bookmark size={14} fill="currentColor" /></span>
      <div className="lesson-card-top">
        <span className="category-chip">{post.category}</span>
        <button className="icon-button subtle" aria-label="More actions"><MoreHorizontal size={17} /></button>
      </div>
      <div className="lesson-card-body">
        <div className="mini-cover" style={post.cover_url ? { backgroundImage: `url(${post.cover_url})` } : undefined}>
          {!post.cover_url && <span>{bookFallbacks[post.book_title] || post.book_title.slice(0, 2).toUpperCase()}</span>}
        </div>
        <div>
          <h3><Link to={`/article/${post.slug}`}>{post.title}</Link></h3>
          <p className="book-meta">{post.book_title}{post.chapter ? ` · ${post.chapter}` : ''}</p>
          {!compact && <p className="card-excerpt">{post.excerpt}</p>}
        </div>
      </div>
      <footer className="lesson-card-footer">
        <span><Clock size={14} /> {post.read_time} min read</span>
        {post.is_applied && <span className="applied-label"><Check size={14} /> Applied</span>}
        <Link className="text-link" to={`/article/${post.slug}`}>Read story →</Link>
      </footer>
    </article>
  )
}
