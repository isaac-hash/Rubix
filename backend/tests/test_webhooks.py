# tests/test_webhooks.py
# Tests for the Paystack webhook handler — the most critical tests in the suite.

import json
import pytest
from unittest.mock import patch
from tests.conftest import make_paystack_webhook_body


MOCK_VA = {
    "account_number": "9920099999",
    "account_name": "SubPay / Test",
    "bank": {"name": "Wema Bank"},
    "id": "dva_wh_test",
}


async def _create_pending_subscription(client, headers, customer, plan):
    """Helper: create a subscription and return (sub_id, account_number)."""
    from unittest.mock import AsyncMock
    with patch(
        "app.api.subscriptions.paystack.assign_dedicated_virtual_account",
        new_callable=AsyncMock,
        return_value=MOCK_VA,
    ):
        r = await client.post("/v1/subscriptions", json={
            "customer_id": customer["id"],
            "plan_id": plan["id"],
        }, headers=headers)
    assert r.status_code == 201
    return r.json()["id"], MOCK_VA["account_number"]


@pytest.mark.asyncio
async def test_webhook_activates_subscription(client, merchant_and_key, customer, plan):
    """Full happy path: correct payment activates the subscription."""
    _, _, headers = merchant_and_key
    sub_id, account_number = await _create_pending_subscription(client, headers, customer, plan)

    body, sig = make_paystack_webhook_body(account_number, plan["amount"], "ref_001")

    with patch("app.api.webhooks.deliver_merchant_webhook"):
        r = await client.post(
            "/webhooks/paystack",
            content=body,
            headers={"content-type": "application/json", "x-paystack-signature": sig},
        )
    assert r.status_code == 200

    # Subscription must now be active
    sub_r = await client.get(f"/v1/subscriptions/{sub_id}", headers=headers)
    assert sub_r.json()["status"] == "active"
    assert sub_r.json()["renewal_date"] is not None


@pytest.mark.asyncio
async def test_webhook_invalid_signature_rejected(client):
    """Webhook with wrong signature returns 400."""
    payload = json.dumps({"event": "charge.success", "data": {}}).encode()
    r = await client.post(
        "/webhooks/paystack",
        content=payload,
        headers={"content-type": "application/json", "x-paystack-signature": "badsig"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_webhook_idempotency(client, merchant_and_key, customer, plan):
    """Same webhook reference fired twice creates only one payment."""
    _, _, headers = merchant_and_key
    _, account_number = await _create_pending_subscription(client, headers, customer, plan)

    body, sig = make_paystack_webhook_body(account_number, plan["amount"], "ref_idem_001")

    with patch("app.api.webhooks.deliver_merchant_webhook"):
        r1 = await client.post(
            "/webhooks/paystack", content=body,
            headers={"content-type": "application/json", "x-paystack-signature": sig},
        )
        r2 = await client.post(
            "/webhooks/paystack", content=body,
            headers={"content-type": "application/json", "x-paystack-signature": sig},
        )

    assert r1.status_code == 200
    assert r2.status_code == 200  # Not an error — idempotent


@pytest.mark.asyncio
async def test_webhook_wrong_amount_does_not_activate(client, merchant_and_key, customer, plan):
    """Transfer of wrong amount does not activate subscription."""
    _, _, headers = merchant_and_key
    sub_id, account_number = await _create_pending_subscription(client, headers, customer, plan)

    wrong_amount = plan["amount"] - 1  # 1 kobo short
    body, sig = make_paystack_webhook_body(account_number, wrong_amount, "ref_mismatch_001")

    with patch("app.api.webhooks.deliver_merchant_webhook"):
        r = await client.post(
            "/webhooks/paystack", content=body,
            headers={"content-type": "application/json", "x-paystack-signature": sig},
        )
    assert r.status_code == 200

    # Status must still be pending_payment
    sub_r = await client.get(f"/v1/subscriptions/{sub_id}", headers=headers)
    assert sub_r.json()["status"] == "pending_payment"


@pytest.mark.asyncio
async def test_webhook_unknown_account_number_ignored(client, merchant_and_key):
    """Payment to an unrecognised account number is silently ignored."""
    body, sig = make_paystack_webhook_body("0000000000", 100000, "ref_unknown_001")
    r = await client.post(
        "/webhooks/paystack", content=body,
        headers={"content-type": "application/json", "x-paystack-signature": sig},
    )
    assert r.status_code == 200  # No crash, no error
