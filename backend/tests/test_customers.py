# tests/test_customers.py
# Tests for customer endpoints (POST /v1/customers, GET /v1/customers/{id})

import pytest


@pytest.mark.asyncio
async def test_create_customer_success(client, merchant_and_key):
    """Create a customer with valid data."""
    _, _, headers = merchant_and_key
    r = await client.post("/v1/customers", json={
        "name": "Chidi Okeke",
        "email": "chidi@example.com",
        "phone": "08012345678",
    }, headers=headers)

    assert r.status_code == 201
    data = r.json()
    assert data["email"] == "chidi@example.com"
    assert data["phone"] == "+2348012345678"   # Normalised to international format
    assert data["claimed"] is False


@pytest.mark.asyncio
async def test_create_customer_phone_normalisation(client, merchant_and_key):
    """Both 080... and +23480... phone formats are accepted."""
    _, _, headers = merchant_and_key

    r1 = await client.post("/v1/customers", json={
        "name": "A", "email": "a@test.com", "phone": "08099887766"
    }, headers=headers)
    assert r1.status_code == 201
    assert r1.json()["phone"] == "+2348099887766"

    r2 = await client.post("/v1/customers", json={
        "name": "B", "email": "b@test.com", "phone": "+2348099887766"
    }, headers=headers)
    assert r2.status_code == 201
    assert r2.json()["phone"] == "+2348099887766"


@pytest.mark.asyncio
async def test_create_customer_invalid_phone(client, merchant_and_key):
    """Invalid phone number is rejected with 422."""
    _, _, headers = merchant_and_key
    r = await client.post("/v1/customers", json={
        "name": "X", "email": "x@test.com", "phone": "12345"
    }, headers=headers)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_create_customer_idempotent(client, merchant_and_key):
    """Same email for same merchant returns the existing customer, not a duplicate."""
    _, _, headers = merchant_and_key
    payload = {"name": "Tolu A", "email": "tolu@example.com", "phone": "08011112222"}

    r1 = await client.post("/v1/customers", json=payload, headers=headers)
    r2 = await client.post("/v1/customers", json=payload, headers=headers)

    assert r1.status_code == 201
    assert r2.status_code == 201           # Still 201 for simplicity
    assert r1.json()["id"] == r2.json()["id"]  # Same record


@pytest.mark.asyncio
async def test_get_customer_success(client, merchant_and_key, customer):
    """Fetch a customer by ID."""
    _, _, headers = merchant_and_key
    r = await client.get(f"/v1/customers/{customer['id']}", headers=headers)
    assert r.status_code == 200
    assert r.json()["id"] == customer["id"]


@pytest.mark.asyncio
async def test_get_customer_not_found(client, merchant_and_key):
    """Non-existent customer ID returns 404."""
    _, _, headers = merchant_and_key
    r = await client.get(
        "/v1/customers/00000000-0000-0000-0000-000000000000", headers=headers
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_customer_isolation_between_merchants(client):
    """Merchant A cannot see Merchant B's customers."""
    # Create Merchant A
    r_a = await client.post("/v1/auth/signup", json={
        "name": "A", "email": "a_merchant@test.com", "password": "pass"
    })
    headers_a = {"Authorization": f"Bearer {r_a.json()['api_key']}"}

    # Create Merchant B
    r_b = await client.post("/v1/auth/signup", json={
        "name": "B", "email": "b_merchant@test.com", "password": "pass"
    })
    headers_b = {"Authorization": f"Bearer {r_b.json()['api_key']}"}

    # Merchant A creates a customer
    r_cust = await client.post("/v1/customers", json={
        "name": "Private", "email": "private@test.com", "phone": "08012340000"
    }, headers=headers_a)
    customer_id = r_cust.json()["id"]

    # Merchant B tries to fetch Merchant A's customer — must get 404
    r_steal = await client.get(f"/v1/customers/{customer_id}", headers=headers_b)
    assert r_steal.status_code == 404
