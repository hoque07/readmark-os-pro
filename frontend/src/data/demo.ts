import type { Post, ReadingProgress, Stats } from '../types'

const publishedAt = '2026-07-28T08:00:00.000Z'

export const demoPosts: Post[] = [
  {
    id: 1,
    slug: 'one-percent-better-every-day',
    title: 'প্রতিদিন ১% উন্নতি কি সত্যিই জীবন বদলাতে পারে?',
    excerpt: 'Atomic Habits-এর ছোট উন্নতির ধারণাকে নিজের routine-এ প্রয়োগ করার একটি ব্যক্তিগত reading note।',
    raw_note: 'Demo seed note',
    content_markdown: `## আজকের গল্প

আমরা অনেক সময় একদিনেই জীবন বদলে ফেলার চেষ্টা করি। নতুন routine বানাই, বড় target ঠিক করি, কিন্তু কয়েকদিন পর আগের অবস্থায় ফিরে যাই।

> **Key Insight:** ছোট কাজের ফল সঙ্গে সঙ্গে দেখা না গেলেও সময় এগুলোকে বড় ফলাফলে রূপান্তর করে।

## মূল Concept

প্রতিদিনের মাত্র ১% উন্নতি আলাদা দিনে খুব ছোট মনে হয়। কিন্তু একই direction-এ বারবার কাজ করলে সময়ের সঙ্গে তার cumulative effect বড় হয়ে ওঠে।

## বাস্তব উদাহরণ

একদিন দুই ঘণ্টা gym করে পরে পাঁচদিন বাদ দেওয়ার চেয়ে প্রতিদিন ২০ মিনিটের একটি sustainable routine বেশি কার্যকর হতে পারে।

## আজকের তিনটি শিক্ষা

1. ছোট পরিবর্তনকে অবহেলা করা যাবে না।
2. ফলের আগে system তৈরি করতে হয়।
3. repeat করা যায় না এমন plan দীর্ঘমেয়াদে কাজে আসে না।

## আগামীকালের Action

আগামীকাল ঘুম থেকে উঠে ফোন ধরার আগে ১০ মিনিট বই পড়ব।`,
    key_insight: 'ছোট কাজের ফল সঙ্গে সঙ্গে দেখা না গেলেও সময় এগুলোকে বড় ফলাফলে রূপান্তর করে।',
    personal_reflection: 'ছোট, repeatable action আমার জন্য একটি বড় perfect routine-এর চেয়ে বেশি বাস্তবসম্মত।',
    action_step: 'আগামীকাল ঘুম থেকে উঠে ফোন ধরার আগে ১০ মিনিট বই পড়ব।',
    one_minute_recap: 'লক্ষ্য গুরুত্বপূর্ণ, কিন্তু প্রতিদিনের system-ই দীর্ঘমেয়াদে পরিচয় ও ফলাফল গড়ে তোলে।',
    book_title: 'Atomic Habits',
    book_author: 'James Clear',
    chapter: 'Chapter 1',
    category: 'Habits',
    tags: ['Atomic Habits', 'Habits', 'Consistency'],
    cover_url: '',
    accent: 'amber',
    status: 'published',
    featured: true,
    is_applied: true,
    saved_for_review: true,
    review_due_at: null,
    read_time: 3,
    created_at: publishedAt,
    updated_at: publishedAt,
    published_at: publishedAt,
  },
  {
    id: 2,
    slug: 'focus-is-a-professional-skill',
    title: 'মনোযোগ রক্ষা করা এখন কেন একটি professional skill',
    excerpt: 'Deep Work থেকে distraction কমিয়ে focused কাজের জন্য একটি practical system।',
    raw_note: 'Demo seed note',
    content_markdown: `## আজকের গল্প

কোনো গুরুত্বপূর্ণ কাজ শুরু করার কয়েক মিনিট পরই আমরা message, notification বা নতুন tab-এর দিকে চলে যাই। কাজ বন্ধ হয় না, কিন্তু তার গভীরতা হারিয়ে যায়।

> **Key Insight:** মনোযোগ deliberate practice দিয়ে গড়ে তোলা একটি দক্ষতা।

## মূল Concept

Deep work হলো এমন uninterrupted concentration যেখানে কঠিন চিন্তা, শেখা এবং সৃষ্টিশীল কাজ সম্ভব হয়।

## বাস্তব উদাহরণ

একটি research section লিখতে বসে প্রতি পাঁচ মিনিটে social media দেখা হলে সময়ের চেয়ে বেশি ক্ষতি হয় context switching-এ।

## আজকের তিনটি শিক্ষা

1. Focus block আগে থেকে calendar-এ রাখতে হয়।
2. Notification off করা একটি productivity decision।
3. কাজের শেষে shutdown ritual পরের দিনের clarity বাড়ায়।`,
    key_insight: 'মনোযোগ শুধু মানসিক অবস্থা নয়, এটি deliberate practice দিয়ে গড়ে তোলা একটি দক্ষতা।',
    personal_reflection: 'Notification দেখলে আমি শুধু কয়েক সেকেন্ড নয়, focus ফিরে পাওয়ার সময়ও হারাই।',
    action_step: 'আজ একটি ৪৫ মিনিটের notification-free focus block চালাব।',
    one_minute_recap: 'গভীর কাজের জন্য আলাদা সময়, পরিষ্কার boundary এবং distraction-এর friction দরকার।',
    book_title: 'Deep Work',
    book_author: 'Cal Newport',
    chapter: 'Chapter 2',
    category: 'Productivity',
    tags: ['Deep Work', 'Focus', 'Productivity'],
    cover_url: '',
    accent: 'violet',
    status: 'published',
    featured: false,
    is_applied: false,
    saved_for_review: false,
    review_due_at: null,
    read_time: 3,
    created_at: '2026-07-26T08:00:00.000Z',
    updated_at: '2026-07-26T08:00:00.000Z',
    published_at: '2026-07-26T08:00:00.000Z',
  },
  {
    id: 3,
    slug: 'from-fixed-to-learning-mindset',
    title: 'Fixed mindset থেকে শেখার mindset-এ যাওয়ার ছোট পরিবর্তন',
    excerpt: 'ভুলকে identity হিসেবে না দেখে feedback হিসেবে ব্যবহার করার personal note।',
    raw_note: 'Demo seed note',
    content_markdown: `## আজকের গল্প

কোনো কাজ প্রথমবার ভালো না হলে আমরা অনেক সময় বলি, “এটা আমার দ্বারা হবে না।” এই বাক্যটি একটি temporary result-কে permanent identity বানিয়ে দেয়।

> **Key Insight:** “এখনো পারি না” শেখার দরজা খোলা রাখে।

## মূল Concept

Growth mindset ভুলকে অযোগ্যতার প্রমাণ হিসেবে নয়, পরবর্তী practice-এর data হিসেবে দেখে।

## বাস্তব উদাহরণ

IELTS writing-এ grammar ভুল পাওয়া মানে আমি খারাপ writer নই; কোন topic practice করতে হবে তার একটি map পেয়েছি।

## আজকের তিনটি শিক্ষা

1. Feedback identity নয়, information।
2. Strategy বদলানো effort বাড়ানোর মতোই গুরুত্বপূর্ণ।
3. Progress দেখার জন্য ছোট evidence record করতে হয়।`,
    key_insight: 'আমি এখনো পারি না এবং আমি পারি না—এই দুই বাক্যের মানসিক প্রভাব এক নয়।',
    personal_reflection: 'নিজেকে বিচার না করে process বিচার করলে উন্নতির জন্য বেশি mental space পাওয়া যায়।',
    action_step: 'আজ একটি দুর্বলতার পাশে লিখব: এখনো শিখছি।',
    one_minute_recap: 'ক্ষমতা স্থির পরিচয় নয়; strategy, effort এবং feedback দিয়ে তা উন্নত হতে পারে।',
    book_title: 'Mindset',
    book_author: 'Carol S. Dweck',
    chapter: 'Chapter 3',
    category: 'Mindset',
    tags: ['Mindset', 'Learning', 'Reflection'],
    cover_url: '',
    accent: 'blue',
    status: 'published',
    featured: false,
    is_applied: false,
    saved_for_review: true,
    review_due_at: null,
    read_time: 3,
    created_at: '2026-07-24T08:00:00.000Z',
    updated_at: '2026-07-24T08:00:00.000Z',
    published_at: '2026-07-24T08:00:00.000Z',
  },
]

export const demoProgress: ReadingProgress[] = [
  {
    id: 1,
    book_title: 'Atomic Habits',
    book_author: 'James Clear',
    cover_url: '',
    current_chapter: 4,
    total_chapters: 12,
    progress_percent: 33.3,
    status: 'reading',
    last_opened_at: publishedAt,
    updated_at: publishedAt,
  },
]

export const demoStats: Stats = {
  total_posts: 3,
  published_posts: 3,
  draft_posts: 0,
  books_count: 3,
  applied_lessons: 1,
  review_due: 2,
  categories: { Habits: 1, Productivity: 1, Mindset: 1 },
  monthly_days: 9,
  streak_days: 4,
  daily_activity: [
    { date: '2026-07-15', count: 0 }, { date: '2026-07-16', count: 1 },
    { date: '2026-07-17', count: 0 }, { date: '2026-07-18', count: 1 },
    { date: '2026-07-19', count: 2 }, { date: '2026-07-20', count: 0 },
    { date: '2026-07-21', count: 1 }, { date: '2026-07-22', count: 1 },
    { date: '2026-07-23', count: 0 }, { date: '2026-07-24', count: 1 },
    { date: '2026-07-25', count: 0 }, { date: '2026-07-26', count: 1 },
    { date: '2026-07-27', count: 1 }, { date: '2026-07-28', count: 1 },
  ],
}
