import { Bookmark } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup" aria-label="ReadMark OS">
      <span className="brand-mark"><Bookmark size={20} fill="currentColor" /></span>
      {!compact && (
        <span>
          <strong>ReadMark OS</strong>
          <small>Your Digital Library</small>
        </span>
      )}
    </div>
  )
}
