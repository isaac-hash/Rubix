# tests/conftest.py
# ─────────────────────────────────────────────────────────────────────────────
# Shared pytest fixtures used across all test files.
#
# Test database strategy:
#   We create a real PostgreSQL test database (subpay_test) and wipe it between
#   test runs. This ensures JSONB, UUID, and ENUM types work exactly as they
#   do in production. SQLite is NOT suitable here.
#
# Test client:
#   We use httpx.AsyncClient pointed at the FastAPI app. This goes through the
#   full HTTP stack (middleware, routing, validation) just like a real client.
#
# Merchant fixture:
#   Every test that hits a protected endpoint gets a pre-created merchant and
#   their raw API key injected automatically.
# ─────────────────────────────────────────────────────────────────────────────

import asyncio
import sys
import hmac
import hashlib
import json
import pytest
import pytest_asyncio

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.main import app
from app.database import Base, get_db
from app.config import settings

# ── Test database ─────────────────────────────────────────────────────────────
# Use a separate DB so tests never touch your dev data.
# We only replace the last occurrence of the DB name to avoid breaking the credentials.
TEST_DATABASE_URL = settings.DATABASE_URL.rsplit("/", 1)[0] + "/subpay_test"


from sqlalchemy.pool import NullPool

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
TestSession = async_sessionmaker(test_engine, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    """
    Force a single event loop for the entire test session.
    On Windows, we use SelectorEventLoop to avoid Proactor bugs.
    """
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_tables(event_loop):
    """Create all tables once per test session, drop them at the end."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture()
async def db():
    """
    Provide a DB session per test that is TIED to a transaction.
    We start a transaction, yield the session, and ALWAYS roll back.
    This is the gold standard for fast, isolated DB tests.
    """
    async with test_engine.connect() as connection:
        transaction = await connection.begin()
        async with TestSession(bind=connection) as session:
            yield session
            await session.close()
        
        await transaction.rollback()



@pytest_asyncio.fixture()
async def client(db):
    """
    HTTP test client.
    We override the app's get_db to use the SAME session as the 'db' fixture.
    Because they share a transaction, the app sees what the test created.
    """
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture()
async def merchant_and_key(client):
    """
    Create a merchant and return (merchant_data, api_key, auth_headers).
    Inject into any test that needs an authenticated merchant.
    """
    r = await client.post("/v1/auth/signup", json={
        "name": "Test Merchant",
        "email": "merchant@test.com",
        "password": "testpassword",
    })
    assert r.status_code == 201
    data = r.json()
    api_key = data["api_key"]
    return data["merchant"], api_key, {"Authorization": f"Bearer {api_key}"}


@pytest_asyncio.fixture()
async def customer(client, merchant_and_key):
    """Pre-created customer belonging to the test merchant."""
    _, _, headers = merchant_and_key
    r = await client.post("/v1/customers", json={
        "name": "Ade Bello",
        "email": "ade@example.com",
        "phone": "08012345678",
    }, headers=headers)
    assert r.status_code == 201
    return r.json()


@pytest_asyncio.fixture()
async def plan(client, merchant_and_key):
    """Pre-created plan belonging to the test merchant."""
    _, _, headers = merchant_and_key
    r = await client.post("/v1/plans", json={
        "name": "Basic Monthly",
        "amount": 500000,   # ₦5,000 in kobo
        "currency": "NGN",
        "interval": "monthly",
    }, headers=headers)
    assert r.status_code == 201
    return r.json()


def make_paystack_webhook_body(account_number: str, amount: int, reference: str) -> tuple[bytes, str]:
    """
    Build a realistic Paystack charge.success payload and sign it.
    Returns (body_bytes, x-paystack-signature header value).
    """
    payload = {
        "event": "charge.success",
        "data": {
            "amount": amount,
            "reference": reference,
            "authorization": {
                "receiver_bank_account_number": account_number,
            },
        }
    }
    body = json.dumps(payload).encode()
    sig = hmac.new(
        settings.PAYSTACK_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha512,
    ).hexdigest()
    return body, sig
