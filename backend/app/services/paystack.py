# app/services/paystack.py
# ─────────────────────────────────────────────────────────────────────────────
# All Paystack API calls live in this single file.
#
# Why isolate external APIs into their own service file?
#   If Paystack changes their API, or you want to switch to Korapay, you
#   change ONE file. Nothing else needs to know how the provider works.
#
# How Paystack virtual accounts work:
#   1. Create (or fetch) a Paystack Customer object using the subscriber's email
#   2. Call /dedicated_account/assign to get a real Nigerian bank account number
#      assigned exclusively to that customer
#   3. The customer transfers money to that account number
#   4. Paystack fires a charge.success webhook to our /webhooks/paystack endpoint
#
# We use httpx (async HTTP client) so these calls don't block the event loop.
# ─────────────────────────────────────────────────────────────────────────────

import httpx
from app.config import settings

BASE = "https://api.paystack.co"


def _headers() -> dict:
    """Build Paystack auth headers from config."""
    return {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


async def get_or_create_paystack_customer(email: str, name: str, phone: str) -> str:
    """
    Ensure a Paystack Customer record exists and return their customer_code.
    Paystack uses customer_code (not email) in subsequent calls.

    This is idempotent — Paystack returns the existing customer if the email
    already exists in their system.
    """
    async with httpx.AsyncClient() as client:
        parts = name.strip().split(" ", 1)
        first = parts[0]
        last = parts[1] if len(parts) > 1 else parts[0]

        r = await client.post(
            f"{BASE}/customer",
            headers=_headers(),
            json={"email": email, "first_name": first, "last_name": last, "phone": phone},
        )
        r.raise_for_status()
        return r.json()["data"]["customer_code"]


async def assign_dedicated_virtual_account(
    email: str,
    name: str,
    phone: str,
    preferred_bank: str = "wema-bank",
) -> dict:
    """
    Provision a dedicated NUBAN (Nigerian bank account number) for a customer.

    Returns a dict with:
        account_number  — the 10-digit account number the customer pays into
        bank.name       — the bank name (e.g. "Wema Bank")
        account_name    — the name on the account

    preferred_bank options: "wema-bank" | "titan-paystack"
    Use "wema-bank" by default — broader support.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        parts = name.strip().split(" ", 1)
        first = parts[0]
        last = parts[1] if len(parts) > 1 else parts[0]

        r = await client.post(
            f"{BASE}/dedicated_account/assign",
            headers=_headers(),
            json={
                "email": email,
                "first_name": first,
                "last_name": last,
                "phone": phone,
                "preferred_bank": preferred_bank,
                "country": "NG",
            },
        )
        r.raise_for_status()
        return r.json()["data"]


async def deactivate_dedicated_virtual_account(account_number: str, provider_slug: str) -> None:
    """
    Deactivate a virtual account after payment is confirmed.
    Prevents the customer from accidentally paying twice into the same account.
    """
    async with httpx.AsyncClient() as client:
        r = await client.delete(
            f"{BASE}/dedicated_account",
            headers=_headers(),
            json={"account_number": account_number, "provider_slug": provider_slug},
        )
        # Don't raise on failure — log it, but don't crash the payment flow
        if r.status_code != 200:
            print(f"[WARNING] Failed to deactivate virtual account {account_number}: {r.text}")
