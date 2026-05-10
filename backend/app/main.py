# app/main.py
# ─────────────────────────────────────────────────────────────────────────────
# The FastAPI application entry point.
#
# This file:
#   1. Creates the FastAPI app instance
#   2. Registers all API routers (grouped by resource)
#   3. Adds middleware (CORS for frontend apps)
#   4. Defines a health check endpoint (used by Railway/Render for uptime)
#
# WHAT COMES NEXT:
#   - As you build each router (customers, plans, subscriptions, webhooks),
#     import and register it here with app.include_router(...)
#   - In Phase 6, tighten CORS to only allow your production frontend domains
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(
    title="SubPay API",
    description="Subscription payment infrastructure for Africa",
    version="1.0.0",
    # Disable OpenAPI docs in production (optional)
    docs_url="/docs" if settings.APP_ENV == "development" else None,
    redoc_url="/redoc" if settings.APP_ENV == "development" else None,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow the payment page and dashboards to call this API from the browser.
# In development: allow everything. In production: lock down to your domains.

ALLOWED_ORIGINS = (
    ["*"]
    if settings.APP_ENV == "development"
    else [
        "https://pay.subpay.africa",
        "https://dashboard.subpay.africa",
        "https://app.subpay.africa",
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ─────────────────────────────────────────────────────────────
# Railway and Render ping this to confirm the app is alive.
# Phase 6 will extend this to also check DB and Redis connectivity.

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok"}


# ── Routers ───────────────────────────────────────────────────────────────────
from app.api import auth, customers, plans, subscriptions, webhooks

app.include_router(auth.router,          prefix="/v1", tags=["Auth"])
app.include_router(customers.router,     prefix="/v1", tags=["Customers"])
app.include_router(plans.router,         prefix="/v1", tags=["Plans"])
app.include_router(subscriptions.router, prefix="/v1", tags=["Subscriptions"])

# No /v1 prefix — Paystack calls this URL directly and we don't want to
# expose the webhook path structure in the prefix
app.include_router(webhooks.router, tags=["Webhooks"])
