export type PostStatus = 'draft' | 'published'

export interface User {
  id: number
  email: string
  display_name: string
  role: string
}

export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  raw_note: string
  content_markdown: string
  key_insight: string
  personal_reflection: string
  action_step: string
  one_minute_recap: string
  book_title: string
  book_author: string
  chapter: string
  category: string
  tags: string[]
  cover_url: string
  accent: string
  status: PostStatus
  featured: boolean
  is_applied: boolean
  saved_for_review: boolean
  review_due_at: string | null
  read_time: number
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface PaginatedPosts {
  items: Post[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface Stats {
  total_posts: number
  published_posts: number
  draft_posts: number
  books_count: number
  applied_lessons: number
  review_due: number
  categories: Record<string, number>
  monthly_days: number
  streak_days: number
  daily_activity: Array<{ date: string; count: number }>
}

export interface GenerateRequest {
  raw_note: string
  book_title: string
  book_author: string
  chapter: string
  category: string
  language: 'bn' | 'en'
  tone: 'story' | 'concise' | 'reflective'
}

export interface GeneratedBlog {
  title: string
  excerpt: string
  story: string
  main_concept: string
  practical_example: string
  three_lessons: string[]
  personal_reflection: string
  action_step: string
  one_minute_recap: string
  tags: string[]
  content_markdown: string
  provider: string
  warning: string | null
}

export interface PostInput {
  title: string
  excerpt: string
  raw_note: string
  content_markdown: string
  key_insight: string
  personal_reflection: string
  action_step: string
  one_minute_recap: string
  book_title: string
  book_author: string
  chapter: string
  category: string
  tags: string[]
  cover_url: string
  accent: string
  status: PostStatus
  featured: boolean
  is_applied: boolean
  saved_for_review: boolean
}

export interface ReadingProgress {
  id: number
  book_title: string
  book_author: string
  cover_url: string
  current_chapter: number
  total_chapters: number
  progress_percent: number
  status: 'reading' | 'completed' | 'paused' | 'want-to-read'
  last_opened_at: string
  updated_at: string
}

export interface PublicConfig {
  ai_enabled: boolean
  environment: string
  max_upload_mb: number
}
