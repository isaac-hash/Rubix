# tests/test_plans.py
# Tests for plan endpoints (POST, GET /v1/plans, PATCH /v1/plans/{id}/archive)

import pytest


@pytest.mark.asyncio
async def test_create_plan_success(client, merchant_and_key):
    """Create a valid plan."""
    _, _, headers = merchant_and_key
    r = await client.post("/v1/plans", json={
        "name": "Gold Monthly",
        "amount": 1000000,   # ₦10,000
        "interval": "monthly",
    }, headers=headers)

    assert r.status_code == 201
    data = r.json()
    assert data["amount"] == 1000000
    assert data["interval"] == "monthly"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_create_plan_zero_amount_rejected(client, merchant_and_key):
    """Amount of 0 or negative is rejected."""
    _, _, headers = merchant_and_key
    r = await client.post("/v1/plans", json={
        "name": "Free", "amount": 0, "interval": "monthly"
    }, headers=headers)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_create_plan_invalid_interval(client, merchant_and_key):
    """Invalid interval enum value is rejected."""
    _, _, headers = merchant_and_key
    r = await client.post("/v1/plans", json={
        "name": "X", "amount": 100, "interval": "biweekly"
    }, headers=headers)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_list_plans(client, merchant_and_key, plan):
    """List returns plans belonging to this merchant."""
    _, _, headers = merchant_and_key
    r = await client.get("/v1/plans", headers=headers)
    assert r.status_code == 200
    ids = [p["id"] for p in r.json()]
    assert plan["id"] in ids


@pytest.mark.asyncio
async def test_list_plans_active_filter(client, merchant_and_key):
    """?is_active=false filter returns only archived plans."""
    _, _, headers = merchant_and_key

    # Create + archive a plan
    r1 = await client.post("/v1/plans", json={
        "name": "Old Plan", "amount": 200000, "interval": "monthly"
    }, headers=headers)
    plan_id = r1.json()["id"]
    await client.patch(f"/v1/plans/{plan_id}/archive", headers=headers)

    r = await client.get("/v1/plans?is_active=false", headers=headers)
    ids = [p["id"] for p in r.json()]
    assert plan_id in ids


@pytest.mark.asyncio
async def test_archive_plan(client, merchant_and_key, plan):
    """Archiving a plan sets is_active to False."""
    _, _, headers = merchant_and_key
    r = await client.patch(f"/v1/plans/{plan['id']}/archive", headers=headers)
    assert r.status_code == 200
    assert r.json()["is_active"] is False


@pytest.mark.asyncio
async def test_archive_plan_not_found(client, merchant_and_key):
    """Archiving a non-existent plan returns 404."""
    _, _, headers = merchant_and_key
    r = await client.patch(
        "/v1/plans/00000000-0000-0000-0000-000000000000/archive", headers=headers
    )
    assert r.status_code == 404
