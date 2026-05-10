# tests/test_auth.py
# Tests for merchant signup (POST /v1/auth/signup)

import pytest


@pytest.mark.asyncio
async def test_merchant_signup_success(client):
    """Happy path: create a new merchant and get an API key."""
    r = await client.post("/v1/auth/signup", json={
        "name": "Acme Corp",
        "email": "acme@example.com",
        "password": "strongpassword",
    })
    assert r.status_code == 201
    data = r.json()

    # API key must be present and have the right prefix
    assert "api_key" in data
    assert data["api_key"].startswith("sk_live_")

    # Merchant fields
    assert data["merchant"]["email"] == "acme@example.com"
    assert data["merchant"]["name"] == "Acme Corp"
    assert data["merchant"]["is_active"] is True

    # Raw key must NOT equal the hash stored in DB
    # (we can't check the hash directly here, but we verify the key works)


@pytest.mark.asyncio
async def test_merchant_signup_duplicate_email(client):
    """Duplicate email returns 409 Conflict."""
    payload = {"name": "Biz A", "email": "dupe@example.com", "password": "pass"}
    r1 = await client.post("/v1/auth/signup", json=payload)
    assert r1.status_code == 201

    r2 = await client.post("/v1/auth/signup", json=payload)
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_api_key_authenticates(client, merchant_and_key):
    """The API key returned on signup actually works for authenticated routes."""
    _, _, headers = merchant_and_key
    r = await client.get("/v1/plans", headers=headers)
    assert r.status_code == 200  # Not 401


@pytest.mark.asyncio
async def test_invalid_api_key_returns_401(client):
    """A random or malformed key is rejected."""
    r = await client.get("/v1/plans", headers={"Authorization": "Bearer sk_live_fake"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_missing_auth_header_returns_401(client):
    """No Authorization header at all returns 401."""
    r = await client.get("/v1/plans")
    assert r.status_code in [401, 422]  # 422 if header is required param
