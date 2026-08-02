from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any

from ..config import settings
from ..schemas import GenerateRequest, GeneratedBlog
from .content import compose_markdown


@dataclass
class AIResult:
    data: GeneratedBlog


class BlogGenerator:
    def __init__(self) -> None:
        self.client: Any | None = None
        if settings.openai_api_key:
            try:
                from openai import OpenAI
            except ImportError as exc:
                if not settings.ai_fallback_on_error:
                    raise RuntimeError("The openai package is required when OPENAI_API_KEY is set.") from exc
                return
            kwargs: dict[str, Any] = {"api_key": settings.openai_api_key}
            if settings.openai_base_url:
                kwargs["base_url"] = settings.openai_base_url
            self.client = OpenAI(**kwargs)

    def generate(self, request: GenerateRequest) -> GeneratedBlog:
        if self.client:
            try:
                return self._generate_with_openai(request)
            except Exception as exc:  # noqa: BLE001 - converted into a safe user-facing fallback
                if not settings.ai_fallback_on_error:
                    raise
                fallback = self._generate_offline(request)
                fallback.warning = f"AI provider failed, so the offline generator was used: {type(exc).__name__}"
                return fallback
        fallback = self._generate_offline(request)
        fallback.warning = "OPENAI_API_KEY is not configured. Offline structured generation was used."
        return fallback

    def _generate_with_openai(self, request: GenerateRequest) -> GeneratedBlog:
        assert self.client is not None
        language_name = "natural Bengali" if request.language == "bn" else "clear English"
        system_prompt = f"""
You are the editorial engine for ReadMark OS, a personal reading-memory and self-development journal.
Transform only the reader's supplied notes into a useful, human-sounding blog in {language_name}.
Do not invent claims, quotations, page numbers, author opinions, research evidence, or events not supported by the note.
When the note is incomplete, express uncertainty naturally instead of filling gaps.
The tone is {request.tone}, reflective, practical, and suitable for a public personal blog.
Return only valid JSON with these exact keys:
title, excerpt, story, main_concept, practical_example, three_lessons, personal_reflection, action_step, one_minute_recap, tags.
three_lessons must contain exactly three strings. tags must contain 3 to 8 concise strings.
Do not wrap the JSON in markdown fences.
""".strip()
        user_prompt = f"""
Book: {request.book_title}
Author: {request.book_author or 'Not supplied'}
Chapter: {request.chapter or 'Not supplied'}
Category: {request.category}

Reader's raw note:
{request.raw_note}
""".strip()

        response = self.client.responses.create(
            model=settings.openai_model,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            store=False,
        )
        payload = self._parse_json(response.output_text)
        lessons = [str(item).strip() for item in payload.get("three_lessons", []) if str(item).strip()]
        while len(lessons) < 3:
            lessons.append("এই অংশটি আবার পড়ে নিজের ভাষায় একটি শিক্ষা লিখব।")
        lessons = lessons[:3]
        content = compose_markdown(
            story=str(payload.get("story", "")),
            main_concept=str(payload.get("main_concept", "")),
            practical_example=str(payload.get("practical_example", "")),
            three_lessons=lessons,
            personal_reflection=str(payload.get("personal_reflection", "")),
            action_step=str(payload.get("action_step", "")),
            one_minute_recap=str(payload.get("one_minute_recap", "")),
        )
        return GeneratedBlog(
            title=str(payload.get("title", request.book_title)).strip(),
            excerpt=str(payload.get("excerpt", "")).strip(),
            story=str(payload.get("story", "")).strip(),
            main_concept=str(payload.get("main_concept", "")).strip(),
            practical_example=str(payload.get("practical_example", "")).strip(),
            three_lessons=lessons,
            personal_reflection=str(payload.get("personal_reflection", "")).strip(),
            action_step=str(payload.get("action_step", "")).strip(),
            one_minute_recap=str(payload.get("one_minute_recap", "")).strip(),
            tags=[str(item).strip() for item in payload.get("tags", []) if str(item).strip()][:8],
            content_markdown=content,
            provider=f"openai:{settings.openai_model}",
        )

    @staticmethod
    def _parse_json(text: str) -> dict[str, Any]:
        cleaned = text.strip()
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
            if not match:
                raise ValueError("The AI response did not contain valid JSON.")
            return json.loads(match.group(0))

    def _generate_offline(self, request: GenerateRequest) -> GeneratedBlog:
        note = " ".join(request.raw_note.strip().split())
        sentences = [item.strip() for item in re.split(r"(?<=[.!?।])\s+", note) if item.strip()]
        if not sentences:
            sentences = [note]
        first = sentences[0]
        second = sentences[1] if len(sentences) > 1 else first
        third = sentences[2] if len(sentences) > 2 else second

        if request.language == "en":
            title = f"What {request.book_title} made me reconsider today"
            story = f"Today I paused at one idea: {first}"
            concept = second
            example = f"A practical way to test this idea is to connect it with one small decision in daily life. {third}"
            lessons = [first, second, third]
            reflection = "My note suggests that understanding the idea is not enough; I need to notice where it appears in my own routine."
            action = "Tomorrow I will choose one small, observable action connected to this lesson and record the result."
            recap = "The useful part of today's reading is the shift from passive understanding to a small real-life experiment."
            excerpt = f"A personal reading note from {request.book_title}, turned into one practical lesson and one next action."
        else:
            title = f"{request.book_title} আজ আমাকে যে বিষয়টি নতুন করে ভাবিয়েছে"
            story = f"আজ পড়তে গিয়ে একটি জায়গায় থেমে গেলাম: {first}"
            concept = second
            example = f"এই ধারণাটি বোঝার সবচেয়ে সহজ উপায় হলো নিজের দৈনন্দিন কোনো ছোট সিদ্ধান্তের সঙ্গে মিলিয়ে দেখা। {third}"
            lessons = [first, second, third]
            reflection = "নোটটি আমাকে মনে করিয়ে দেয়, শুধু ধারণা বুঝলেই হবে না; নিজের routine-এর কোথায় এটি কাজ করে সেটাও লক্ষ্য করতে হবে।"
            action = "আগামীকাল এই শিক্ষার সঙ্গে সম্পর্কিত একটি ছোট ও পরিমাপযোগ্য কাজ করব এবং ফল লিখে রাখব।"
            recap = "আজকের পড়ার সবচেয়ে ব্যবহারযোগ্য অংশ হলো, ধারণাটিকে শুধু মনে না রেখে একটি ছোট বাস্তব পরীক্ষায় রূপ দেওয়া।"
            excerpt = f"{request.book_title} থেকে আজকের ব্যক্তিগত শিক্ষা, বাস্তব প্রয়োগ এবং আগামীকালের একটি ছোট action।"

        content = compose_markdown(
            story=story,
            main_concept=concept,
            practical_example=example,
            three_lessons=lessons,
            personal_reflection=reflection,
            action_step=action,
            one_minute_recap=recap,
        )
        return GeneratedBlog(
            title=title,
            excerpt=excerpt,
            story=story,
            main_concept=concept,
            practical_example=example,
            three_lessons=lessons,
            personal_reflection=reflection,
            action_step=action,
            one_minute_recap=recap,
            tags=[request.category, request.book_title, "Daily Reading"],
            content_markdown=content,
            provider="offline-structured",
        )


generator = BlogGenerator()
