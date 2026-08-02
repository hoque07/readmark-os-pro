from __future__ import annotations

import math
import re


def estimate_read_time(markdown: str, words_per_minute: int = 180) -> int:
    plain = re.sub(r"[#>*_`\[\]()~-]", " ", markdown)
    words = [word for word in plain.split() if word]
    return max(1, math.ceil(len(words) / words_per_minute))


def compose_markdown(
    *,
    story: str,
    main_concept: str,
    practical_example: str,
    three_lessons: list[str],
    personal_reflection: str,
    action_step: str,
    one_minute_recap: str,
) -> str:
    lesson_lines = "\n".join(f"{index}. {item}" for index, item in enumerate(three_lessons, 1))
    return f"""## আজকের গল্প

{story.strip()}

> **Key Insight:** {main_concept.strip()}

## মূল Concept

{main_concept.strip()}

## বাস্তব উদাহরণ

{practical_example.strip()}

## আজকের তিনটি শিক্ষা

{lesson_lines}

## আমার উপলব্ধি

{personal_reflection.strip()}

## আগামীকালের Action

{action_step.strip()}

## One-Minute Recap

{one_minute_recap.strip()}
""".strip()
