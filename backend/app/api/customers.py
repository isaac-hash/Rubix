# app/api/customers.py
# ─────────────────────────────────────────────────────────────────────────────
# Customer endpoints — all require a valid merchant API key.
#
# Why does the merchant create customers (not the customer themselves)?
#   SubPay is a B2B infrastructure product. Merchants integrate SubPay into
#   their own product. When a user checks out on the merchant's site, the
#   merchant's backend calls SubPay to register that user as a customer.
#   The customer never directly talks to SubPay until the payment page.
#
# Idempotency on POST /customers:
#   If the same merchant calls POST /customers with the same email twice,
#   we return the EXISTING customer with 200 (not create a duplicate with 201).
#   This makes the endpoint safe to call multiple times without side effects.
# ─────────────────────────────────────────────────────────────────────────────

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_merchant
from app.models.customer import Customer
from app.models.merchant import Merchant
from app.schemas.customer import CustomerCreate, CustomerResponse

router = APIRouter()


@router.post(
    "/customers",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_customer(
    body: CustomerCreate,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new subscriber for this merchant.
    If the email already exists for this merchant, returns the existing record.
    """
    # Check if customer already exists for this merchant
    existing = await db.scalar(
        select(Customer).where(
            Customer.merchant_id == merchant.id,
            Customer.email == body.email,
        )
    )
    if existing:
        # Idempotent — return existing rather than raising an error
        # Caller can check status_code: 200 = existing, 201 = newly created
        return CustomerResponse.model_validate(existing)

    customer = Customer(
        merchant_id=merchant.id,
        name=body.name,
        email=body.email,
        phone=body.phone,
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)

    return CustomerResponse.model_validate(customer)


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch a customer by ID.
    Returns 404 if not found OR if the customer belongs to a different merchant.
    The second check is important — merchants must not be able to read each
    other's customer data.
    """
    customer = await db.scalar(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.merchant_id == merchant.id,  # ownership check
        )
    )
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return CustomerResponse.model_validate(customer)
