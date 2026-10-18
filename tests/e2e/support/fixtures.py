"""Deterministic fixture data for the mocked backend. Dates are relative to 'now' so freshness ranking is stable."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

IMG = "https://images.example.test/cover-{n}.jpg"


def _ago(hours: float) -> str:
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()


def _post(n, slug, title, category, hours, *, excerpt=None, featured=False, published=True, tags=None, **extra):
    body = (
        f"{title}. ఈ కథనం పరీక్ష కోసం రూపొందించిన నమూనా వార్త. "
        "ఆంధ్రప్రదేశ్ మరియు తెలంగాణ రాష్ట్రాల్లో జరుగుతున్న తాజా పరిణామాలపై పూర్తి వివరాలు ఇక్కడ ఉన్నాయి. " * 6
    )
    return {
        "id": f"00000000-0000-4000-8000-{n:012d}",
        "slug": slug,
        "title": title,
        "excerpt": excerpt or f"{title} — సంక్షిప్త సమాచారం.",
        "content": f"## ముఖ్యాంశాలు\n\n{body}\n\n## వివరాలు\n\n{body}",
        "category": category,
        "tags": tags or [category],
        "meta_title": title,
        "meta_description": excerpt or f"{title} — సంక్షిప్త సమాచారం.",
        "og_image": IMG.format(n=n),
        "video_url": None,
        "audio_url": None,
        "tts_audio_url": None,
        "image_credits": None,
        "ai_assisted": True,
        "review_status": "approved",
        "author_name": "VaartaNow Desk",
        "source_logo": None,
        "language": "te",
        "published": published,
        "featured": featured,
        "reading_time_min": 3,
        "published_at": _ago(hours),
        "created_at": _ago(hours),
        "updated_at": _ago(hours),
        **extra,
    }


def blog_posts():
    return [
        _post(1, "amaravati-capital-works-resume", "అమరావతి రాజధాని పనులు మళ్లీ ప్రారంభం", "andhra-pradesh", 1, featured=True,
              tags=["andhra-pradesh", "amaravati"]),
        _post(2, "hyderabad-metro-phase-two", "హైదరాబాద్ మెట్రో రెండో దశకు ఆమోదం", "telangana", 2, tags=["telangana", "hyderabad"]),
        _post(3, "pushpa-three-shooting-update", "&#8216;పుష్ప 3&#8217; షూటింగ్ అప్‌డేట్ &amp; విడుదల తేదీ", "cinema", 3, featured=True),
        _post(4, "india-wins-vizag-test", "విశాఖ టెస్టులో భారత్ ఘన విజయం", "cricket", 4, tags=["cricket", "vizag"]),
        _post(5, "vizag-beach-festival", "విశాఖ బీచ్ ఉత్సవం ఈ వారాంతం", "vizag", 5, tags=["vizag", "visakhapatnam"]),
        _post(6, "tirumala-darshan-tickets", "తిరుమల దర్శనం టికెట్ల విడుదల", "devotional", 6, tags=["devotional", "tirupati"]),
        _post(7, "ap-dsc-notification", "ఏపీ డీఎస్సీ నోటిఫికేషన్ విడుదల", "jobs", 8, tags=["jobs", "andhra-pradesh"]),
        _post(8, "telangana-budget-highlights", "తెలంగాణ బడ్జెట్ ముఖ్యాంశాలు", "politics", 10, tags=["politics", "telangana"]),
        _post(9, "new-smartphone-launch-india", "భారత్‌లో కొత్త స్మార్ట్‌ఫోన్ విడుదల", "technology", 12),
        _post(10, "monsoon-health-tips", "వర్షాకాలంలో ఆరోగ్య జాగ్రత్తలు", "health", 14),
        _post(11, "sensex-record-high", "సెన్సెక్స్ రికార్డు స్థాయికి", "business", 20),
        _post(12, "inter-results-date", "ఇంటర్ ఫలితాల తేదీ ఖరారు", "education", 30),
        _post(13, "national-railway-budget", "రైల్వే బడ్జెట్‌లో కొత్త రైళ్లు", "national", 40),
        # Must never appear anywhere public.
        _post(90, "draft-unpublished-story", "ప్రచురించని డ్రాఫ్ట్ కథనం XDRAFTX", "andhra-pradesh", 0.5, published=False, review_status="draft"),
        # Different language: the site is Telugu-only, so this must not show either.
        {**_post(91, "english-only-story", "English only story XENGLISHX", "national", 0.5), "language": "en"},
    ]


USERS = {
    "admin@vaartanow.test": {"password": "Admin#12345", "role": "admin", "id": "11111111-1111-4111-8111-111111111111"},
    "editor@vaartanow.test": {"password": "Editor#12345", "role": "editor", "id": "44444444-4444-4444-8444-444444444444"},
    "reader@vaartanow.test": {"password": "Reader#12345", "role": None, "id": "22222222-2222-4222-8222-222222222222"},
}


def _job(n, title, company, *, days=1, approved=True, active=True, mode="On-site", level="Fresher", district="Hyderabad"):
    return {
        "job_id": f"job-{n}", "title": title, "company_name": company, "location": f"{district}, Telangana",
        "district": district, "state": "Telangana", "description_snippet": f"{title} at {company}",
        "full_description": f"{title} at {company}. Apply with your resume.", "apply_link": f"https://jobs.example.test/{n}",
        "source_platform": "VaartaNow", "posted_date": _ago(days * 24), "salary_range": "₹3–5 LPA",
        "skills": ["Excel"], "tags": [], "logo_url": None, "experience_level": level, "work_mode": mode,
        "contract_type": "Full-time", "is_featured": False, "is_approved": approved, "is_active": active,
        "created_at": _ago(days * 24),
    }


def vaartanow_jobs():
    return [
        _job(1, "Data Entry Operator XJOBONE", "Krishna Traders", days=1),
        _job(2, "Remote Python Developer XJOBTWO", "Godavari Tech", days=2, mode="Remote", level="Experienced", district="Vijayawada"),
        _job(3, "Unapproved Listing XJOBPENDING", "Pending Co", approved=False),
        _job(4, "Closed Listing XJOBINACTIVE", "Closed Co", active=False),
        _job(5, "Old Listing XJOBEXPIRED", "Old Co", days=45),
    ]


def tables():
    return {
        "blog_posts": blog_posts(),
        "user_bookmarks": [],
        "comments": [],
        "polls": [],
        "viral_videos": [],
        "vaartanow_jobs": vaartanow_jobs(),
        "classifieds": [],
        "rss_feeds": [],
        "image_library": [],
        "health_questions": [],
        "health_tips": [],
        "citizen_reports": [],
        "citizen_reporters": [],
        "citizen_journalist_applications": [],
        "service_providers": [],
        "staff_roles": [],
        "pipeline_jobs": [],
    }
