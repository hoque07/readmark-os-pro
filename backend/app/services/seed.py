from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Post, ReadingProgress, User
from ..security import hash_password
from .content import estimate_read_time
from .slug import unique_slug


def ensure_owner(db: Session) -> User:
    owner = db.scalar(select(User).where(User.email == settings.admin_email.lower()))
    if owner:
        return owner
    owner = User(
        email=settings.admin_email.lower(),
        display_name=settings.admin_name,
        password_hash=hash_password(settings.admin_password),
        role="owner",
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner


def seed_demo_content(db: Session, owner: User) -> None:
    if not settings.seed_demo_data:
        return
    count = db.scalar(select(func.count()).select_from(Post)) or 0
    if count:
        return

    now = datetime.now(timezone.utc)
    posts = [
        {
            "title": "প্রতিদিন ১% উন্নতি কি সত্যিই জীবন বদলাতে পারে?",
            "excerpt": "Atomic Habits-এর ছোট উন্নতির ধারণাকে নিজের routine-এ প্রয়োগ করার একটি ব্যক্তিগত reading note।",
            "book_title": "Atomic Habits",
            "book_author": "James Clear",
            "chapter": "Chapter 1",
            "category": "Habits",
            "tags": ["Atomic Habits", "Habits", "Consistency"],
            "accent": "amber",
            "key_insight": "ছোট কাজের ফল সঙ্গে সঙ্গে দেখা না গেলেও সময় এগুলোকে বড় ফলাফলে রূপান্তর করে।",
            "personal_reflection": "আমি অনেক সময় একটি বড় perfect routine শুরু করতে চাই। কিন্তু ছোট, repeatable action আমার জন্য বেশি বাস্তবসম্মত।",
            "action_step": "আগামীকাল ঘুম থেকে উঠে ফোন ধরার আগে ১০ মিনিট বই পড়ব।",
            "one_minute_recap": "লক্ষ্য গুরুত্বপূর্ণ, কিন্তু প্রতিদিনের system-ই দীর্ঘমেয়াদে পরিচয় ও ফলাফল গড়ে তোলে।",
            "content_markdown": """## আজকের গল্প

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

## আমার উপলব্ধি

আমি অনেক সময় motivation আসার অপেক্ষা করি। কিন্তু environment এবং ছোট trigger তৈরি করলে motivation ছাড়াও শুরু করা সম্ভব।

## আগামীকালের Action

আগামীকাল ঘুম থেকে উঠে ফোন ধরার আগে ১০ মিনিট বই পড়ব।

## One-Minute Recap

লক্ষ্য গুরুত্বপূর্ণ, কিন্তু প্রতিদিনের system-ই দীর্ঘমেয়াদে পরিচয় ও ফলাফল গড়ে তোলে।""",
        },
        {
            "title": "মনোযোগ রক্ষা করা এখন কেন একটি professional skill",
            "excerpt": "Deep Work থেকে distraction কমিয়ে focused কাজের জন্য একটি practical system।",
            "book_title": "Deep Work",
            "book_author": "Cal Newport",
            "chapter": "Chapter 2",
            "category": "Productivity",
            "tags": ["Deep Work", "Focus", "Productivity"],
            "accent": "violet",
            "key_insight": "মনোযোগ শুধু মানসিক অবস্থা নয়, এটি deliberate practice দিয়ে গড়ে তোলা একটি দক্ষতা।",
            "personal_reflection": "কাজের মাঝখানে notification দেখলে আমি শুধু কয়েক সেকেন্ড হারাই না; পুনরায় focus পেতেও সময় লাগে।",
            "action_step": "আজ একটি ৪৫ মিনিটের notification-free focus block চালাব।",
            "one_minute_recap": "গভীর কাজের জন্য আলাদা সময়, পরিষ্কার boundary এবং distraction-এর friction দরকার।",
            "content_markdown": """## আজকের গল্প

কোনো গুরুত্বপূর্ণ কাজ শুরু করার কয়েক মিনিট পরই আমরা message, notification বা নতুন tab-এর দিকে চলে যাই। কাজ বন্ধ হয় না, কিন্তু তার গভীরতা হারিয়ে যায়।

> **Key Insight:** মনোযোগ deliberate practice দিয়ে গড়ে তোলা একটি দক্ষতা।

## মূল Concept

Deep work হলো এমন uninterrupted concentration যেখানে কঠিন চিন্তা, শেখা এবং সৃষ্টিশীল কাজ সম্ভব হয়।

## বাস্তব উদাহরণ

একটি research section লিখতে বসে প্রতি পাঁচ মিনিটে social media দেখা হলে সময়ের চেয়ে বেশি ক্ষতি হয় context switching-এ।

## আজকের তিনটি শিক্ষা

1. Focus block আগে থেকে calendar-এ রাখতে হয়।
2. Notification off করা একটি productivity decision।
3. কাজের শেষে shutdown ritual পরের দিনের clarity বাড়ায়।

## আমার উপলব্ধি

আমি কাজের সময় available থাকার চেষ্টা করি, কিন্তু সবসময় available থাকা মানেই সবসময় effective থাকা নয়।

## আগামীকালের Action

আজ একটি ৪৫ মিনিটের notification-free focus block চালাব।

## One-Minute Recap

গভীর কাজের জন্য আলাদা সময়, পরিষ্কার boundary এবং distraction-এর friction দরকার।""",
        },
        {
            "title": "Fixed mindset থেকে শেখার mindset-এ যাওয়ার ছোট পরিবর্তন",
            "excerpt": "ভুলকে identity হিসেবে না দেখে feedback হিসেবে ব্যবহার করার personal note।",
            "book_title": "Mindset",
            "book_author": "Carol S. Dweck",
            "chapter": "Chapter 3",
            "category": "Mindset",
            "tags": ["Mindset", "Learning", "Reflection"],
            "accent": "blue",
            "key_insight": "আমি এখনো পারি না এবং আমি পারি না—এই দুই বাক্যের মানসিক প্রভাব এক নয়।",
            "personal_reflection": "কোনো skill-এ দুর্বল হলে আমি দ্রুত নিজেকে বিচার করি। এতে practice-এর আগেই energy কমে যায়।",
            "action_step": "আজ একটি দুর্বলতার পাশে লিখব: এখনো শিখছি।",
            "one_minute_recap": "ক্ষমতা স্থির পরিচয় নয়; strategy, effort এবং feedback দিয়ে তা উন্নত হতে পারে।",
            "content_markdown": """## আজকের গল্প

কোনো কাজ প্রথমবার ভালো না হলে আমরা অনেক সময় বলি, ‘এটা আমার দ্বারা হবে না।’ এই বাক্যটি একটি temporary result-কে permanent identity বানিয়ে দেয়।

> **Key Insight:** ‘এখনো পারি না’ শেখার দরজা খোলা রাখে।

## মূল Concept

Growth mindset ভুলকে অযোগ্যতার প্রমাণ হিসেবে নয়, পরবর্তী practice-এর data হিসেবে দেখে।

## বাস্তব উদাহরণ

IELTS writing-এ grammar ভুল পাওয়া মানে আমি খারাপ writer নই; কোন grammar topic practice করতে হবে তার একটি map পেয়েছি।

## আজকের তিনটি শিক্ষা

1. Feedback identity নয়, information।
2. strategy বদলানো effort বাড়ানোর মতোই গুরুত্বপূর্ণ।
3. progress দেখার জন্য ছোট evidence record করতে হয়।

## আমার উপলব্ধি

নিজেকে বিচার না করে process বিচার করলে উন্নতির জন্য বেশি mental space পাওয়া যায়।

## আগামীকালের Action

আজ একটি দুর্বলতার পাশে লিখব: এখনো শিখছি।

## One-Minute Recap

ক্ষমতা স্থির পরিচয় নয়; strategy, effort এবং feedback দিয়ে তা উন্নত হতে পারে।""",
        },
    ]

    for index, item in enumerate(posts):
        markdown = item["content_markdown"]
        db.add(
            Post(
                slug=unique_slug(db, item["title"]),
                title=item["title"],
                excerpt=item["excerpt"],
                raw_note="Demo seed note",
                content_markdown=markdown,
                key_insight=item["key_insight"],
                personal_reflection=item["personal_reflection"],
                action_step=item["action_step"],
                one_minute_recap=item["one_minute_recap"],
                book_title=item["book_title"],
                book_author=item["book_author"],
                chapter=item["chapter"],
                category=item["category"],
                tags=item["tags"],
                accent=item["accent"],
                status="published",
                featured=index == 0,
                saved_for_review=index != 1,
                review_due_at=now + timedelta(days=index),
                read_time=estimate_read_time(markdown),
                published_at=now - timedelta(days=index * 2),
                created_at=now - timedelta(days=index * 2),
            )
        )
    db.commit()

    progress_count = db.scalar(select(func.count()).select_from(ReadingProgress)) or 0
    if not progress_count:
        db.add_all(
            [
                ReadingProgress(
                    user_id=owner.id,
                    book_title="Atomic Habits",
                    book_author="James Clear",
                    current_chapter=4,
                    total_chapters=12,
                    progress_percent=33.3,
                    status="reading",
                ),
                ReadingProgress(
                    user_id=owner.id,
                    book_title="Deep Work",
                    book_author="Cal Newport",
                    current_chapter=2,
                    total_chapters=8,
                    progress_percent=25,
                    status="reading",
                ),
            ]
        )
        db.commit()
