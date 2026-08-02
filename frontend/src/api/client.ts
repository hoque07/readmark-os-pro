import type {
  GenerateRequest,
  GeneratedBlog,
  PaginatedPosts,
  Post,
  PostInput,
  PublicConfig,
  ReadingProgress,
  Stats,
  User,
} from '../types'
import { demoPosts, demoProgress, demoStats } from '../data/demo'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
const API_DOCS_URL = DEMO_MODE
  ? 'https://github.com/hoque07/readmark-os-pro#api-guidance-for-a-beginner'
  : `${API_URL.replace(/\/api$/, '')}/docs`
const TOKEN_KEY = 'readmark_token'

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status = 0, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (DEMO_MODE) {
    const method = options.method || 'GET'
    if (method !== 'GET') {
      throw new ApiError('This GitHub Pages showcase is read-only. Run the app locally to use owner features.', 403)
    }

    const [pathname, rawQuery = ''] = path.split('?')
    const query = new URLSearchParams(rawQuery)
    if (pathname === '/health') return { status: 'ok', app: 'ReadMark OS Demo', environment: 'demo' } as T
    if (pathname === '/config') return { ai_enabled: false, environment: 'demo', max_upload_mb: 5 } as T
    if (pathname === '/stats') return demoStats as T
    if (pathname === '/progress') return demoProgress as T
    if (pathname === '/posts/featured') return demoPosts.filter((post) => post.featured) as T
    if (pathname === '/posts') {
      const search = (query.get('search') || '').toLocaleLowerCase()
      const category = query.get('category') || ''
      const status = query.get('status') || 'published'
      const page = Number(query.get('page') || 1)
      const pageSize = Number(query.get('page_size') || 20)
      const items = demoPosts.filter((post) => {
        const haystack = [post.title, post.excerpt, post.book_title, post.book_author, ...post.tags].join(' ').toLocaleLowerCase()
        return post.status === status && (!category || post.category === category) && (!search || haystack.includes(search))
      })
      const start = (page - 1) * pageSize
      return {
        items: items.slice(start, start + pageSize),
        total: items.length,
        page,
        page_size: pageSize,
        pages: Math.max(1, Math.ceil(items.length / pageSize)),
      } as T
    }
    if (pathname.startsWith('/posts/id/')) {
      const post = demoPosts.find((item) => item.id === Number(pathname.slice('/posts/id/'.length)))
      if (post) return post as T
    }
    if (pathname.startsWith('/posts/')) {
      const post = demoPosts.find((item) => item.slug === decodeURIComponent(pathname.slice('/posts/'.length)))
      if (post) return post as T
    }
    throw new ApiError('This item is not available in the read-only demo.', 404)
  }

  const token = tokenStore.get()
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch (error) {
    throw new ApiError(
      'Cannot connect to the FastAPI server. Start the backend at http://localhost:8000 and try again.',
      0,
      error,
    )
  }

  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.detail || data?.message || `Request failed with status ${response.status}`
    if (response.status === 401) tokenStore.clear()
    throw new ApiError(message, response.status, data)
  }
  return data as T
}

export const api = {
  health: () => request<{ status: string; app: string; environment: string }>('/health'),
  config: () => request<PublicConfig>('/config'),
  exportData: () => request<Record<string, unknown>>('/admin/export'),
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
  stats: () => request<Stats>('/stats'),
  listPosts: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value))
    })
    return request<PaginatedPosts>(`/posts${query.size ? `?${query}` : ''}`)
  },
  featured: () => request<Post[]>('/posts/featured'),
  getPost: (slug: string) => request<Post>(`/posts/${encodeURIComponent(slug)}`),
  getPostById: (id: number) => request<Post>(`/posts/id/${id}`),
  createPost: (payload: PostInput) =>
    request<Post>('/posts', { method: 'POST', body: JSON.stringify(payload) }),
  updatePost: (id: number, payload: Partial<PostInput>) =>
    request<Post>(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deletePost: (id: number) => request<void>(`/posts/${id}`, { method: 'DELETE' }),
  generate: (payload: GenerateRequest) =>
    request<GeneratedBlog>('/ai/generate', { method: 'POST', body: JSON.stringify(payload) }),
  generateAndSave: (payload: GenerateRequest & {
    status: 'draft' | 'published'
    cover_url: string
    accent: string
    featured: boolean
  }) => request<Post>('/ai/generate-and-save', { method: 'POST', body: JSON.stringify(payload) }),
  upload: async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    return request<{ url: string; filename: string }>('/uploads', { method: 'POST', body })
  },
  progress: () => request<ReadingProgress[]>('/progress'),
  upsertProgress: (payload: Omit<ReadingProgress, 'id' | 'progress_percent' | 'last_opened_at' | 'updated_at'>) =>
    request<ReadingProgress>('/progress', { method: 'POST', body: JSON.stringify(payload) }),
  dueReviews: () => request<Post[]>('/reviews/due'),
  scheduleReview: (id: number) => request<Post>(`/reviews/${id}/schedule`, { method: 'POST' }),
  gradeReview: (id: number, result: 'forgot' | 'partly' | 'easy') =>
    request<{ post: Post; interval_days: number; next_due_at: string }>(`/reviews/${id}/grade`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    }),
}

export { API_DOCS_URL, API_URL, DEMO_MODE }
