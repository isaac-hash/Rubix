# app/schemas/customer.py
# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas for the Customer resource.
#
# Phone validation note:
#   Nigerian numbers come in two formats:
#     - Local:        08012345678  (11 digits, starts with 0)
#     - International: +2348012345678
#   We validate both and normalise to the international format in the service.
# ─────────────────────────────────────────────────────────────────────────────

import re
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator


# ── Request schemas ───────────────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_nigerian_phone(cls, v: str) -> str:
        """Accept 08xxxxxxxxx or +2348xxxxxxxxx, normalise to +234 format."""
        v = v.strip().replace(" ", "")
        if re.match(r"^0[7-9][0-1]\d{8}$", v):
            return "+234" + v[1:]  # 0801... → +234801...
        if re.match(r"^\+234[7-9][0-1]\d{8}$", v):
            return v
        raise ValueError(
            "Phone must be a valid Nigerian number: 08012345678 or +2348012345678"
        )


# ── Response schemas ──────────────────────────────────────────────────────────

class CustomerResponse(BaseModel):
    id: UUID
    merchant_id: UUID
    name: str
    email: str
    phone: str
    claimed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
