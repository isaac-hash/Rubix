# backend/Dockerfile
# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage build:
#   Stage 1 (builder): installs dependencies into a virtualenv
#   Stage 2 (runtime): copies only the installed packages — no pip, no gcc
#
# This keeps the final image small (~200MB vs ~800MB).
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /install

COPY requirements.txt .

RUN pip install --upgrade pip \
 && pip install --prefix=/install/deps --no-cache-dir -r requirements.txt


# ── Stage 2: Runtime image ───────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install/deps /usr/local

# Copy application source code
COPY . .

# Expose the port uvicorn runs on
EXPOSE 8000

# Start the FastAPI app
# --host 0.0.0.0 makes it accessible outside the container
# --reload is for development only — remove in production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
