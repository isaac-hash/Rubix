# app/config.py
# ─────────────────────────────────────────────────────────────────────────────
# All configuration comes from environment variables (loaded from .env locally,
# from Railway/Render env vars in production).
#
# pydantic-settings validates every variable at startup — if DATABASE_URL is
# missing, the app crashes immediately with a clear error instead of failing
# mysteriously on the first DB call.
# ─────────────────────────────────────────────────────────────────────────────

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────────────
    APP_ENV: str = "development"          # "development" | "production"
    SECRET_KEY: str                        # Used to sign JWT tokens
    BASE_URL: str = "http://localhost:8000"

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str                      # postgresql+asyncpg://user:pass@host:port/db

    # ── Redis ────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Paystack ─────────────────────────────────────────────────────────────
    PAYSTACK_SECRET_KEY: str = ""          # sk_test_xxx (dev) | sk_live_xxx (prod)
    PAYSTACK_WEBHOOK_SECRET: str = ""      # Used to verify inbound webhook signatures

    # ── Notifications ────────────────────────────────────────────────────────
    RESEND_API_KEY: str = ""               # Transactional email
    TERMII_API_KEY: str = ""               # SMS (Nigerian DND-compliant)
    TWILIO_ACCOUNT_SID: str = ""           # WhatsApp via Twilio
    TWILIO_AUTH_TOKEN: str = ""
    WHATSAPP_FROM: str = ""                # e.g. "whatsapp:+234xxxxxxxxxx"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Single shared instance — import this everywhere
# e.g.  from app.config import settings
settings = Settings()
