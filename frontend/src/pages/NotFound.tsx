import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <div className="not-found"><BookOpen /><h1>Page not found</h1><p>This bookmark does not point to a saved lesson.</p><Link className="button button-primary" to="/">Return Home</Link></div>
}
