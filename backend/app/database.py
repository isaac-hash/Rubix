# app/database.py
# ─────────────────────────────────────────────────────────────────────────────
# Sets up the async SQLAlchemy engine and session factory.
#
# We use async SQLAlchemy so that database calls don't block the event loop —
# this is essential for a FastAPI app handling concurrent webhook events.
#
# get_db() is a FastAPI dependency that:
#   1. Opens a DB session
#   2. Yields it to the route handler
#   3. Closes it automatically when the request ends
#
# WHAT COMES NEXT:
#   - Define your ORM models in app/models/ (they all import Base from here)
#   - Run `alembic init alembic` then configure alembic/env.py to use this engine
#   - Create your first migration with `alembic revision --autogenerate`
# ─────────────────────────────────────────────────────────────────────────────

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# asyncpg is the async PostgreSQL driver — note the +asyncpg in the URL
# The DATABASE_URL in .env should be: postgresql+asyncpg://user:pass@host:port/db
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_ENV == "development",  # Log SQL queries in dev only
    pool_pre_ping=True,                       # Test connections before using them
)

# Session factory — creates AsyncSession objects
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


# All ORM models inherit from this Base
# e.g.  class Merchant(Base): ...
class Base(DeclarativeBase):
    pass


# FastAPI dependency — inject this into route handlers
async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
