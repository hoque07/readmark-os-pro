import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { AddNotePage } from './pages/AddNote'
import { ArticlePage } from './pages/Article'
import { Home } from './pages/Home'
import { LibraryPage } from './pages/Library'
import { LoginPage } from './pages/Login'
import { NotFoundPage } from './pages/NotFound'
import { ProgressPage } from './pages/Progress'
import { ReviewPage } from './pages/Review'
import { SettingsPage } from './pages/Settings'

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="article/:slug" element={<ArticlePage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="add" element={<ProtectedRoute><AddNotePage /></ProtectedRoute>} />
          <Route path="edit/:id" element={<ProtectedRoute><AddNotePage edit /></ProtectedRoute>} />
          <Route path="drafts" element={<ProtectedRoute><LibraryPage drafts /></ProtectedRoute>} />
          <Route path="review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default function App() {
  const useHashRouter = import.meta.env.VITE_USE_HASH_ROUTER === 'true'
  if (useHashRouter) {
    return <HashRouter><AppRoutes /></HashRouter>
  }
  return <BrowserRouter basename={import.meta.env.BASE_URL}><AppRoutes /></BrowserRouter>
}
