from fastapi.testclient import TestClient

from app.main import app


def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_read_generate_publish_and_review_flow() -> None:
    with TestClient(app) as client:
        headers = auth_headers(client)

        listing = client.get("/api/posts")
        assert listing.status_code == 200
        assert listing.json()["total"] >= 1

        generated = client.post(
            "/api/ai/generate",
            headers=headers,
            json={
                "raw_note": "আজ পড়লাম ছোট কাজ নিয়মিত করলে বড় পরিবর্তন আসে। ফলের চেয়ে system গুরুত্বপূর্ণ। কাল দশ মিনিট পড়ব।",
                "book_title": "Test Book",
                "book_author": "Test Author",
                "chapter": "Chapter 1",
                "category": "Habits",
                "language": "bn",
                "tone": "story",
            },
        )
        assert generated.status_code == 200, generated.text
        generated_body = generated.json()
        assert generated_body["provider"] == "offline-structured"
        assert "## আজকের গল্প" in generated_body["content_markdown"]

        created = client.post(
            "/api/posts",
            headers=headers,
            json={
                "title": generated_body["title"],
                "excerpt": generated_body["excerpt"],
                "raw_note": "test note for permanent storage",
                "content_markdown": generated_body["content_markdown"],
                "key_insight": generated_body["main_concept"],
                "personal_reflection": generated_body["personal_reflection"],
                "action_step": generated_body["action_step"],
                "one_minute_recap": generated_body["one_minute_recap"],
                "book_title": "Test Book",
                "book_author": "Test Author",
                "chapter": "Chapter 1",
                "category": "Habits",
                "tags": generated_body["tags"],
                "cover_url": "",
                "accent": "amber",
                "status": "published",
                "featured": False,
                "is_applied": False,
                "saved_for_review": False,
            },
        )
        assert created.status_code == 201, created.text
        post = created.json()

        opened = client.get(f"/api/posts/{post['slug']}")
        assert opened.status_code == 200
        assert opened.json()["book_title"] == "Test Book"

        scheduled = client.post(f"/api/reviews/{post['id']}/schedule", headers=headers)
        assert scheduled.status_code == 200
        assert scheduled.json()["saved_for_review"] is True

        progress = client.post(
            "/api/progress",
            headers=headers,
            json={
                "book_title": "Test Book",
                "book_author": "Test Author",
                "cover_url": "",
                "current_chapter": 3,
                "total_chapters": 10,
                "status": "reading",
            },
        )
        assert progress.status_code == 200, progress.text
        assert progress.json()["progress_percent"] == 30.0

        exported = client.get("/api/admin/export", headers=headers)
        assert exported.status_code == 200, exported.text
        backup = exported.json()
        assert backup["format"] == "readmark-os-backup"
        assert any(item["id"] == post["id"] for item in backup["posts"])
        assert backup["reading_progress"]

        stats = client.get("/api/stats", headers=headers)
        assert stats.status_code == 200
        assert len(stats.json()["daily_activity"]) == 30

        changed = client.post(
            "/api/auth/change-password",
            headers=headers,
            json={"current_password": "ChangeMe123!", "new_password": "NewLocalPass123!"},
        )
        assert changed.status_code == 200, changed.text
        relogin = client.post(
            "/api/auth/login",
            json={"email": "admin@example.com", "password": "NewLocalPass123!"},
        )
        assert relogin.status_code == 200, relogin.text
