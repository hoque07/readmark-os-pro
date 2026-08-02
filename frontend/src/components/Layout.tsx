import {
  BarChart3,
  Bookmark,
  BookOpen,
  FileText,
  Home,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { API_DOCS_URL, DEMO_MODE } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { Logo } from './Logo'

const nav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/review', label: 'Review Vault', icon: Bookmark },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
]

export function Layout() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => setMobileMenu(false), [location.pathname])
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/library?q=${encodeURIComponent(value)}` : '/library')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="sidebar-head"><Logo /><button className="icon-button mobile-only" onClick={() => setMobileMenu(false)}><X /></button></div>
        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/add" className={({ isActive }) => isActive ? 'active' : ''}><Sparkles size={19} /><span>AI Note Studio</span></NavLink>
          <NavLink to="/drafts" className={({ isActive }) => isActive ? 'active' : ''}><FileText size={19} /><span>Drafts</span></NavLink>
          {user && <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}><Settings size={19} /><span>Settings & Data</span></NavLink>}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-secondary">
          <a href={API_DOCS_URL} target="_blank" rel="noreferrer"><Settings size={18} /> API Docs</a>
          {user ? (
            <button onClick={() => { logout(); navigate('/') }}><LogOut size={18} /> Logout</button>
          ) : (
            <NavLink to="/login"><LogIn size={18} /> Owner Login</NavLink>
          )}
        </div>
        <div className="profile-mini">
          <span className="avatar">{(user?.display_name || 'T').slice(0, 1)}</span>
          <div><strong>{user?.display_name || 'Tanvir'}</strong><small>{user ? 'Owner workspace' : 'Public reader'}</small></div>
        </div>
      </aside>

      <main className="main-area">
        {DEMO_MODE && <div className="demo-banner"><strong>Live showcase</strong><span>Read-only sample content · run locally for the complete owner workspace</span></div>}
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileMenu(true)}><Menu /></button>
          <div className="mobile-brand mobile-only"><Logo compact /></div>
          <form className="global-search" onSubmit={submitSearch}>
            <Search size={17} />
            <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search books, lessons or ideas…" />
            <kbd>Ctrl K</kbd>
          </form>
          <div className="topbar-actions">
            <Link className="icon-button" to="/library" aria-label="Search"><Search size={19} /></Link>
            <Link className="button button-primary top-add" to="/add"><Plus size={18} /> Add Today’s Note</Link>
          </div>
        </header>
        <div className="page-container"><Outlet /></div>
      </main>

      <nav className="mobile-bottom-nav">
        <NavLink to="/" end><Home /><span>Home</span></NavLink>
        <NavLink to="/library"><BookOpen /><span>Library</span></NavLink>
        <NavLink className="mobile-add" to="/add"><Plus /></NavLink>
        <NavLink to="/review"><Bookmark /><span>Saved</span></NavLink>
        <NavLink to="/progress"><BarChart3 /><span>Progress</span></NavLink>
      </nav>
    </div>
  )
}
