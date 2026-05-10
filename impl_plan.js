const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, Header, Footer, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

// ── THEME ────────────────────────────────────────────────────────────────────
const ACCENT   = "1A56DB";
const ACCENT_L = "EBF0FD";
const GREEN    = "065F46";
const GREEN_L  = "D1FAE5";
const AMBER    = "92400E";
const AMBER_L  = "FEF3C7";
const GRAY     = "6B7280";
const DARK     = "111827";
const BORDER   = "D1D5DB";
const WHITE    = "FFFFFF";

const bd  = { style: BorderStyle.SINGLE, size: 1, color: BORDER };
const bds = { top: bd, bottom: bd, left: bd, right: bd };
const nb  = { style: BorderStyle.NONE,   size: 0, color: WHITE };
const nbs = { top: nb, bottom: nb, left: nb, right: nb };

// ── HELPERS ──────────────────────────────────────────────────────────────────
const sp = (n = 1) => new Paragraph({ spacing: { after: n * 120 }, children: [new TextRun("")] });

const h1 = t => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 440, after: 200 },
  children: [new TextRun({ text: t, font: "Arial", size: 34, bold: true, color: DARK })]
});
const h2 = t => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 160 },
  children: [new TextRun({ text: t, font: "Arial", size: 26, bold: true, color: ACCENT })]
});
const h3 = t => new Paragraph({
  heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: t, font: "Arial", size: 22, bold: true, color: DARK })]
});
const body = (t, opts = {}) => new Paragraph({
  spacing: { before: 60, after: 120 },
  children: [new TextRun({ text: t, font: "Arial", size: 21, color: DARK, ...opts })]
});
const bul = (t, boldPfx = null) => {
  const ch = boldPfx
    ? [new TextRun({ text: boldPfx + " ", font: "Arial", size: 21, bold: true, color: DARK }),
       new TextRun({ text: t, font: "Arial", size: 21, color: DARK })]
    : [new TextRun({ text: t, font: "Arial", size: 21, color: DARK })];
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 50, after: 50 }, children: ch });
};
const num = (t, boldPfx = null) => {
  const ch = boldPfx
    ? [new TextRun({ text: boldPfx + " ", font: "Arial", size: 21, bold: true, color: DARK }),
       new TextRun({ text: t, font: "Arial", size: 21, color: DARK })]
    : [new TextRun({ text: t, font: "Arial", size: 21, color: DARK })];
  return new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { before: 50, after: 50 }, children: ch });
};

const code = lines => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  rows: [new TableRow({ children: [new TableCell({
    borders: bds, width: { size: 9360, type: WidthType.DXA },
    shading: { fill: "1F2937", type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 220, right: 220 },
    children: lines.map(l => new Paragraph({
      spacing: { before: 30, after: 30 },
      children: [new TextRun({ text: l, font: "Courier New", size: 18, color: "E5E7EB" })]
    }))
  })]})],
});

const infoBox = (title, text, bg = ACCENT_L, tc = ACCENT) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  rows: [new TableRow({ children: [new TableCell({
    borders: bds, width: { size: 9360, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 220, right: 220 },
    children: [
      new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: title, font: "Arial", size: 20, bold: true, color: tc })] }),
      new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text, font: "Arial", size: 20, color: DARK })] })
    ]
  })]})],
});

// Coloured phase badge + title row
const phaseBanner = (phase, title, dates, color) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [1600, 7760],
  rows: [new TableRow({ children: [
    new TableCell({
      borders: bds, width: { size: 1600, type: WidthType.DXA },
      shading: { fill: color, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      verticalAlign: "center",
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: phase, font: "Arial", size: 22, bold: true, color: WHITE }),
      ]})]
    }),
    new TableCell({
      borders: bds, width: { size: 7760, type: WidthType.DXA },
      shading: { fill: "F9FAFB", type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 160 },
      children: [
        new Paragraph({ children: [new TextRun({ text: title, font: "Arial", size: 24, bold: true, color: DARK })] }),
        new Paragraph({ children: [new TextRun({ text: dates, font: "Arial", size: 20, color: GRAY, italics: true })] }),
      ]
    }),
  ]})]
});

// Task table: col1=Task, col2=Detail, col3=Owner, col4=Est
const taskTable = rows => {
  const hdr = ["Task", "Detail / Acceptance Criteria", "Owner", "Est."].map((h, i) => {
    const ws = [2600, 4400, 1000, 1360];
    return new TableCell({
      borders: bds, width: { size: ws[i], type: WidthType.DXA },
      shading: { fill: ACCENT, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 19, bold: true, color: WHITE })] })]
    });
  });
  const dataRows = rows.map(([task, detail, owner, est], idx) => {
    const ws = [2600, 4400, 1000, 1360];
    const vals = [task, detail, owner, est];
    return new TableRow({ children: vals.map((v, i) => new TableCell({
      borders: bds, width: { size: ws[i], type: WidthType.DXA },
      shading: { fill: idx % 2 === 0 ? "F9FAFB" : WHITE, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 19, color: i === 0 ? DARK : GRAY, bold: i === 0 })] })]
    }))});
  });
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2600, 4400, 1000, 1360],
    rows: [new TableRow({ children: hdr }), ...dataRows]
  });
};

// Simple 2-col table
const twoCol = (rows, w1 = 2800, w2 = 6560) => {
  const total = w1 + w2;
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: [w1, w2],
    rows: rows.map(([a, b], idx) => new TableRow({ children: [
      new TableCell({ borders: bds, width: { size: w1, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? "F9FAFB" : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: a, font: "Arial", size: 19, bold: true, color: DARK })] })] }),
      new TableCell({ borders: bds, width: { size: w2, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? "F9FAFB" : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: b, font: "Arial", size: 19, color: DARK })] })] }),
    ]}))
  });
};

// ── COVER ────────────────────────────────────────────────────────────────────
const cover = [
  sp(5),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "SubPay", font: "Arial", size: 72, bold: true, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Full Implementation Plan", font: "Arial", size: 30, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 }, children: [new TextRun({ text: "Subscription Payments Infrastructure for Africa", font: "Arial", size: 24, color: GRAY, italics: true })] }),
  new Table({
    width: { size: 5000, type: WidthType.DXA }, columnWidths: [5000],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT }, bottom: nb, left: nb, right: nb },
      width: { size: 5000, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("")] })]
    })]})],
  }),
  sp(2),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "May 2026  ·  Version 1.0  ·  Confidential", font: "Arial", size: 20, color: GRAY })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── DOCUMENT ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 34, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 440, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: ACCENT }, paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 } } },
    headers: {
      default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 1 } },
        spacing: { after: 160 },
        children: [
          new TextRun({ text: "SubPay", font: "Arial", size: 19, bold: true, color: ACCENT }),
          new TextRun({ text: "  ·  Full Implementation Plan", font: "Arial", size: 19, color: GRAY }),
        ]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 1 } },
        spacing: { before: 160 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: "Confidential — SubPay 2026", font: "Arial", size: 17, color: GRAY }),
        ]
      })] })
    },
    children: [
      ...cover,

      // ════════════════════════════════════════════════════════════════════
      // 1. OVERVIEW
      // ════════════════════════════════════════════════════════════════════
      h1("1. Overview & Objectives"),
      body("This document is the full implementation plan for SubPay — a subscription payment infrastructure platform built for the African market. It covers every task required to go from a blank repository to a live, merchant-ready product, organised by phase, with acceptance criteria, time estimates, and dependencies clearly stated."),
      sp(),
      body("The plan follows the build order established in the technical specification:"),
      num("Core API — the foundation everything else depends on"),
      num("Hosted Payment Page — the first consumer-facing surface"),
      num("Renewal & Notification Engine — the engine that makes subscriptions self-sustaining"),
      num("Merchant Dashboard — visibility and control for businesses"),
      num("Consumer Dashboard — subscription management for end users"),
      sp(),
      infoBox("Guiding Principle", "Ship the smallest thing that completes a full payment cycle first. Every phase must leave the system in a working, testable state. No phase ends with half-built features."),
      sp(),

      h2("1.1  Summary Timeline"),
      twoCol([
        ["Phase 1", "Core API  ·  Weeks 1–3"],
        ["Phase 2", "Hosted Payment Page  ·  Weeks 4–5"],
        ["Phase 3", "Renewal & Notification Engine  ·  Week 6"],
        ["Phase 4", "Merchant Dashboard  ·  Weeks 7–8"],
        ["Phase 5", "Consumer Dashboard & Account Claiming  ·  Weeks 9–10"],
        ["Phase 6", "Hardening, Docs & Launch Prep  ·  Weeks 11–12"],
      ]),
      sp(),

      h2("1.2  Team Assumptions"),
      body("This plan assumes a solo developer or very small team (1–2 engineers). Time estimates are calibrated accordingly. A larger team could compress the timeline by running phases 2 and 3 in parallel once the API is stable."),
      sp(),

      h2("1.3  Prerequisites Before Writing Any Code"),
      bul("Register SubPay as a business entity in Nigeria"),
      bul("Open a Paystack or Korapay merchant account and request virtual account access"),
      bul("Provision a 360Dialog or Twilio account for WhatsApp Business API access"),
      bul("Provision a Termii account for SMS"),
      bul("Provision a Resend account for transactional email"),
      bul("Set up a GitHub repository with branch protection on main"),
      bul("Set up a Railway or Render project for deployment"),
      bul("Set up a PostgreSQL instance (Railway provides this out of the box)"),
      bul("Set up a Redis instance for job queues"),
      bul("Register a domain and configure DNS"),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 2. ENVIRONMENT & PROJECT SETUP
      // ════════════════════════════════════════════════════════════════════
      h1("2. Environment & Project Setup"),
      body("Before writing any application code, the development environment must be fully configured. This phase is not optional — skipping steps here creates compounding problems later."),
      sp(),

      h2("2.1  Repository Structure"),
      code([
        "subpay/",
        "├── alembic/                  # Database migration files",
        "│   └── versions/",
        "├── app/",
        "│   ├── main.py               # FastAPI app entry point",
        "│   ├── config.py             # Settings via pydantic-settings",
        "│   ├── database.py           # SQLAlchemy engine + session",
        "│   ├── dependencies.py       # Shared FastAPI dependencies",
        "│   ├── api/",
        "│   │   ├── __init__.py",
        "│   │   ├── customers.py",
        "│   │   ├── plans.py",
        "│   │   ├── subscriptions.py",
        "│   │   ├── auth.py",
        "│   │   └── webhooks.py       # Inbound webhook from Paystack/Korapay",
        "│   ├── models/",
        "│   │   ├── merchant.py",
        "│   │   ├── customer.py",
        "│   │   ├── plan.py",
        "│   │   ├── subscription.py",
        "│   │   ├── virtual_account.py",
        "│   │   ├── payment.py",
        "│   │   └── webhook_delivery.py",
        "│   ├── schemas/              # Pydantic request/response schemas",
        "│   ├── services/",
        "│   │   ├── paystack.py       # Paystack API client",
        "│   │   ├── korapay.py        # Korapay API client (future)",
        "│   │   ├── virtual_accounts.py",
        "│   │   ├── payment_matcher.py",
        "│   │   └── notifications.py",
        "│   └── workers/",
        "│       ├── celery_app.py",
        "│       └── renewal_jobs.py",
        "├── tests/",
        "│   ├── test_customers.py",
        "│   ├── test_subscriptions.py",
        "│   ├── test_webhooks.py",
        "│   └── test_payment_matcher.py",
        "├── .env.example",
        "├── requirements.txt",
        "├── Dockerfile",
        "├── docker-compose.yml        # Local dev: app + postgres + redis",
        "└── README.md",
      ]),
      sp(),

      h2("2.2  Core Dependencies"),
      code([
        "# requirements.txt",
        "fastapi==0.111.0",
        "uvicorn[standard]==0.29.0",
        "sqlalchemy==2.0.30",
        "alembic==1.13.1",
        "psycopg2-binary==2.9.9",
        "pydantic-settings==2.2.1",
        "httpx==0.27.0            # Async HTTP client for Paystack/Korapay calls",
        "celery[redis]==5.3.6     # Background job queue",
        "redis==5.0.4",
        "passlib[bcrypt]==1.7.4   # Password hashing",
        "python-jose[cryptography]==3.3.0  # JWT tokens",
        "pytest==8.2.0",
        "pytest-asyncio==0.23.6",
        "httpx                    # Also used for test client",
      ]),
      sp(),

      h2("2.3  Environment Variables"),
      code([
        "# .env.example — copy to .env and fill in values",
        "",
        "# App",
        "APP_ENV=development          # development | production",
        "SECRET_KEY=your-secret-key   # Used for JWT signing",
        "BASE_URL=https://api.subpay.africa",
        "",
        "# Database",
        "DATABASE_URL=postgresql://user:pass@localhost:5432/subpay",
        "",
        "# Redis",
        "REDIS_URL=redis://localhost:6379/0",
        "",
        "# Paystack",
        "PAYSTACK_SECRET_KEY=sk_live_xxx",
        "PAYSTACK_WEBHOOK_SECRET=xxx",
        "",
        "# Notifications",
        "TWILIO_ACCOUNT_SID=xxx",
        "TWILIO_AUTH_TOKEN=xxx",
        "WHATSAPP_FROM=whatsapp:+234xxxxxxxxxx",
        "TERMII_API_KEY=xxx",
        "RESEND_API_KEY=re_xxx",
        "",
        "# Merchant webhook signing",
        "WEBHOOK_SIGNING_SECRET=xxx",
      ]),
      sp(),

      h2("2.4  Local Dev with Docker Compose"),
      code([
        "# docker-compose.yml",
        "services:",
        "  app:",
        "    build: .",
        "    ports: [\"8000:8000\"]",
        "    env_file: .env",
        "    depends_on: [postgres, redis]",
        "    volumes:",
        "      - .:/app",
        "    command: uvicorn app.main:app --reload --host 0.0.0.0",
        "",
        "  postgres:",
        "    image: postgres:16",
        "    environment:",
        "      POSTGRES_DB: subpay",
        "      POSTGRES_USER: subpay",
        "      POSTGRES_PASSWORD: subpay",
        "    ports: [\"5432:5432\"]",
        "",
        "  redis:",
        "    image: redis:7-alpine",
        "    ports: [\"6379:6379\"]",
        "",
        "  celery:",
        "    build: .",
        "    env_file: .env",
        "    depends_on: [redis, postgres]",
        "    command: celery -A app.workers.celery_app worker --loglevel=info",
      ]),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 3. PHASE 1 — CORE API
      // ════════════════════════════════════════════════════════════════════
      h1("3. Phase 1 — Core API"),
      phaseBanner("Phase 1", "Core API — Complete Payment Cycle", "Weeks 1–3  ·  ~15 days", ACCENT),
      sp(),
      body("Goal: by the end of this phase, a developer should be able to call the SubPay API with Postman or curl and complete a full end-to-end subscription payment — from creating a customer through to receiving a webhook confirming the subscription is active. No UI whatsoever."),
      sp(),

      h2("3.1  Database Schema & Migrations"),
      body("All tables must be created via Alembic migrations — never by hand or by using SQLAlchemy's create_all(). This discipline ensures the schema is reproducible and auditable."),
      sp(),
      h3("merchants table"),
      code([
        "class Merchant(Base):",
        "    __tablename__ = 'merchants'",
        "    id              = Column(UUID, primary_key=True, default=uuid4)",
        "    name            = Column(String, nullable=False)",
        "    email           = Column(String, unique=True, nullable=False)",
        "    secret_key_hash = Column(String, nullable=False)  # bcrypt hash",
        "    webhook_url     = Column(String, nullable=True)",
        "    webhook_secret  = Column(String, nullable=True)   # for signing outbound webhooks",
        "    is_active       = Column(Boolean, default=True)",
        "    created_at      = Column(DateTime(timezone=True), server_default=func.now())",
        "    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())",
      ]),
      sp(),
      h3("customers table"),
      code([
        "class Customer(Base):",
        "    __tablename__ = 'customers'",
        "    id                 = Column(UUID, primary_key=True, default=uuid4)",
        "    merchant_id        = Column(UUID, ForeignKey('merchants.id'), nullable=False)",
        "    name               = Column(String, nullable=False)",
        "    email              = Column(String, nullable=False)",
        "    phone              = Column(String, nullable=False)",
        "    claimed            = Column(Boolean, default=False)",
        "    password_hash      = Column(String, nullable=True)",
        "    claim_token        = Column(String, nullable=True)",
        "    claim_token_expiry = Column(DateTime(timezone=True), nullable=True)",
        "    created_at         = Column(DateTime(timezone=True), server_default=func.now())",
        "    updated_at         = Column(DateTime(timezone=True), onupdate=func.now())",
        "    # Unique per merchant — same email can exist across merchants",
        "    __table_args__ = (UniqueConstraint('merchant_id', 'email'),)",
      ]),
      sp(),
      h3("plans table"),
      code([
        "class Plan(Base):",
        "    __tablename__ = 'plans'",
        "    id          = Column(UUID, primary_key=True, default=uuid4)",
        "    merchant_id = Column(UUID, ForeignKey('merchants.id'), nullable=False)",
        "    name        = Column(String, nullable=False)",
        "    amount      = Column(Integer, nullable=False)  # in kobo/lowest unit",
        "    currency    = Column(String, default='NGN')",
        "    interval    = Column(Enum('daily','weekly','monthly','quarterly','annually'), nullable=False)",
        "    is_active   = Column(Boolean, default=True)",
        "    created_at  = Column(DateTime(timezone=True), server_default=func.now())",
      ]),
      sp(),
      h3("subscriptions table"),
      code([
        "class Subscription(Base):",
        "    __tablename__ = 'subscriptions'",
        "    id           = Column(UUID, primary_key=True, default=uuid4)",
        "    merchant_id  = Column(UUID, ForeignKey('merchants.id'), nullable=False)",
        "    customer_id  = Column(UUID, ForeignKey('customers.id'), nullable=False)",
        "    plan_id      = Column(UUID, ForeignKey('plans.id'), nullable=False)",
        "    status       = Column(Enum(",
        "                     'pending_payment', 'active', 'pending_renewal',",
        "                     'lapsed', 'cancelled', 'expired'), default='pending_payment')",
        "    metadata     = Column(JSONB, nullable=True)  # merchant-supplied passthrough data",
        "    renewal_date = Column(Date, nullable=True)",
        "    created_at   = Column(DateTime(timezone=True), server_default=func.now())",
        "    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())",
      ]),
      sp(),
      h3("virtual_accounts table"),
      code([
        "class VirtualAccount(Base):",
        "    __tablename__ = 'virtual_accounts'",
        "    id               = Column(UUID, primary_key=True, default=uuid4)",
        "    subscription_id  = Column(UUID, ForeignKey('subscriptions.id'), nullable=False)",
        "    bank_name        = Column(String, nullable=False)",
        "    account_number   = Column(String, nullable=False)",
        "    account_name     = Column(String, nullable=False)",
        "    provider         = Column(String, default='paystack')  # paystack | korapay",
        "    provider_ref     = Column(String, nullable=True)       # provider's own reference",
        "    amount           = Column(Integer, nullable=False)",
        "    expires_at       = Column(DateTime(timezone=True), nullable=False)",
        "    is_active        = Column(Boolean, default=True)",
        "    created_at       = Column(DateTime(timezone=True), server_default=func.now())",
      ]),
      sp(),
      h3("payments table"),
      code([
        "class Payment(Base):",
        "    __tablename__ = 'payments'",
        "    id              = Column(UUID, primary_key=True, default=uuid4)",
        "    subscription_id = Column(UUID, ForeignKey('subscriptions.id'), nullable=False)",
        "    amount          = Column(Integer, nullable=False)",
        "    currency        = Column(String, default='NGN')",
        "    provider        = Column(String, nullable=False)   # paystack | korapay",
        "    provider_ref    = Column(String, unique=True)      # idempotency — prevents double-processing",
        "    type            = Column(Enum('initial', 'renewal'), nullable=False)",
        "    received_at     = Column(DateTime(timezone=True), server_default=func.now())",
      ]),
      sp(),
      h3("webhook_deliveries table"),
      code([
        "class WebhookDelivery(Base):",
        "    __tablename__ = 'webhook_deliveries'",
        "    id              = Column(UUID, primary_key=True, default=uuid4)",
        "    merchant_id     = Column(UUID, ForeignKey('merchants.id'), nullable=False)",
        "    event           = Column(String, nullable=False)   # e.g. subscription.activated",
        "    payload         = Column(JSONB, nullable=False)",
        "    status          = Column(Enum('pending','delivered','failed'), default='pending')",
        "    attempts        = Column(Integer, default=0)",
        "    last_attempted  = Column(DateTime(timezone=True), nullable=True)",
        "    delivered_at    = Column(DateTime(timezone=True), nullable=True)",
        "    created_at      = Column(DateTime(timezone=True), server_default=func.now())",
      ]),
      sp(),

      h2("3.2  API Endpoints — Phase 1 Tasks"),
      taskTable([
        ["POST /v1/customers", "Accept name, email, phone. Check for existing customer by email per merchant. Return customer object. Reject duplicates with 409.", "BE", "1 day"],
        ["GET /v1/customers/{id}", "Return customer profile. 404 if not found or not owned by calling merchant.", "BE", "0.5 day"],
        ["POST /v1/plans", "Create a pricing plan for the merchant. Validate interval enum. Return plan object.", "BE", "1 day"],
        ["GET /v1/plans", "List all active plans for the authenticated merchant. Support ?is_active=true/false filter.", "BE", "0.5 day"],
        ["POST /v1/subscriptions", "Create subscription record. Call Paystack to provision virtual account. Return subscription + virtual account details. Set expires_at to now + 30 minutes.", "BE", "2 days"],
        ["GET /v1/subscriptions/{id}", "Return full subscription object including current virtual account if pending, renewal date if active.", "BE", "0.5 day"],
        ["GET /v1/subscriptions", "List subscriptions with filters: ?status=active, ?customer_id=, ?plan_id=. Paginate with limit/offset.", "BE", "1 day"],
        ["POST /v1/subscriptions/{id}/cancel", "Set status to cancelled. Fire subscription.cancelled webhook to merchant. Deactivate virtual account.", "BE", "1 day"],
      ]),
      sp(),

      h2("3.3  Authentication Middleware"),
      body("Every API endpoint (except inbound webhooks) must be authenticated. The middleware extracts the Bearer token, looks up the merchant by hashed key, and injects the merchant into the request context."),
      sp(),
      code([
        "# app/dependencies.py",
        "async def get_current_merchant(",
        "    authorization: str = Header(...),",
        "    db: AsyncSession = Depends(get_db)",
        ") -> Merchant:",
        "    if not authorization.startswith('Bearer '):",
        "        raise HTTPException(status_code=401, detail='Invalid authorization header')",
        "    raw_key = authorization.split(' ')[1]",
        "    # Hash the incoming key and look it up",
        "    merchant = await db.execute(",
        "        select(Merchant).where(Merchant.secret_key_hash == hash_key(raw_key))",
        "    )",
        "    if not merchant:",
        "        raise HTTPException(status_code=401, detail='Invalid API key')",
        "    return merchant",
      ]),
      sp(),

      h2("3.4  Paystack Integration Service"),
      body("All Paystack API calls are isolated in a single service file. This means if you ever switch to Korapay, you only change one file."),
      sp(),
      code([
        "# app/services/paystack.py",
        "import httpx",
        "from app.config import settings",
        "",
        "BASE = 'https://api.paystack.co'",
        "HEADERS = {",
        "    'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',",
        "    'Content-Type': 'application/json',",
        "}",
        "",
        "async def create_dedicated_virtual_account(customer_email: str, customer_name: str) -> dict:",
        "    async with httpx.AsyncClient() as client:",
        "        # Step 1 — create or fetch Paystack customer",
        "        r = await client.post(f'{BASE}/customer', headers=HEADERS, json={",
        "            'email': customer_email, 'first_name': customer_name.split()[0],",
        "            'last_name': customer_name.split()[-1]",
        "        })",
        "        r.raise_for_status()",
        "        paystack_customer_code = r.json()['data']['customer_code']",
        "",
        "        # Step 2 — assign dedicated NUBAN (virtual account)",
        "        r2 = await client.post(f'{BASE}/dedicated_account/assign', headers=HEADERS, json={",
        "            'email': customer_email,",
        "            'first_name': customer_name.split()[0],",
        "            'last_name': customer_name.split()[-1],",
        "            'phone': '+2348000000000',  # passed from customer record",
        "            'preferred_bank': 'wema-bank',  # or titan-paystack",
        "            'country': 'NG'",
        "        })",
        "        r2.raise_for_status()",
        "        return r2.json()['data']  # contains account_number, bank.name, etc.",
      ]),
      sp(),

      h2("3.5  Inbound Webhook Handler (Paystack → SubPay)"),
      body("This is the most critical piece of Phase 1. When a transfer arrives, Paystack fires a webhook to SubPay. SubPay must verify the signature, find the matching subscription via virtual account number, record the payment, and activate the subscription."),
      sp(),
      code([
        "# app/api/webhooks.py",
        "import hmac, hashlib",
        "from fastapi import APIRouter, Request, HTTPException",
        "",
        "router = APIRouter()",
        "",
        "@router.post('/webhooks/paystack')",
        "async def paystack_webhook(request: Request, db: AsyncSession = Depends(get_db)):",
        "    # 1. Verify signature",
        "    body = await request.body()",
        "    sig  = request.headers.get('x-paystack-signature', '')",
        "    expected = hmac.new(settings.PAYSTACK_WEBHOOK_SECRET.encode(), body, hashlib.sha512).hexdigest()",
        "    if not hmac.compare_digest(sig, expected):",
        "        raise HTTPException(status_code=400, detail='Invalid signature')",
        "",
        "    payload = await request.json()",
        "    event   = payload.get('event')",
        "",
        "    if event == 'dedicatedaccount.assign.success':",
        "        await handle_virtual_account_assigned(payload['data'], db)",
        "",
        "    elif event == 'charge.success':",
        "        await handle_payment_received(payload['data'], db)",
        "",
        "    return {'status': 'ok'}",
        "",
        "async def handle_payment_received(data: dict, db: AsyncSession):",
        "    account_number = data['authorization']['receiver_bank_account_number']",
        "    amount_kobo    = data['amount']",
        "    provider_ref   = data['reference']",
        "",
        "    # Idempotency — skip if already processed",
        "    existing = await db.scalar(select(Payment).where(Payment.provider_ref == provider_ref))",
        "    if existing: return",
        "",
        "    # Find virtual account",
        "    va = await db.scalar(select(VirtualAccount).where(",
        "        VirtualAccount.account_number == account_number,",
        "        VirtualAccount.is_active == True",
        "    ))",
        "    if not va: return  # unknown account — log and ignore",
        "",
        "    # Match amount",
        "    subscription = await db.get(Subscription, va.subscription_id)",
        "    plan = await db.get(Plan, subscription.plan_id)",
        "    if amount_kobo != plan.amount:",
        "        # Log mismatch — flag for manual review, do not activate",
        "        await flag_payment_mismatch(va, amount_kobo, provider_ref, db)",
        "        return",
        "",
        "    # Record payment",
        "    payment_type = 'initial' if subscription.status == 'pending_payment' else 'renewal'",
        "    db.add(Payment(subscription_id=subscription.id, amount=amount_kobo,",
        "                   provider='paystack', provider_ref=provider_ref, type=payment_type))",
        "",
        "    # Activate subscription",
        "    subscription.status = 'active'",
        "    subscription.renewal_date = compute_renewal_date(plan.interval)",
        "    await db.commit()",
        "",
        "    # Fire outbound webhook to merchant + notify user",
        "    await dispatch_merchant_webhook(subscription, 'subscription.activated', db)",
        "    await send_activation_confirmation(subscription, db)",
      ]),
      sp(),
      infoBox("Idempotency is Non-Negotiable", "Paystack may deliver the same webhook more than once. The provider_ref unique constraint on the payments table, combined with the early-exit check, ensures a payment is never processed twice regardless of how many times the webhook fires."),
      sp(),

      h2("3.6  Outbound Merchant Webhook Dispatcher"),
      body("Every significant subscription event fires a signed webhook to the merchant's registered URL. Delivery is handled as a background task with automatic retries."),
      sp(),
      code([
        "# app/services/webhook_dispatcher.py",
        "import hmac, hashlib, json",
        "from celery import shared_task",
        "",
        "async def dispatch_merchant_webhook(subscription, event: str, db):",
        "    merchant = await db.get(Merchant, subscription.merchant_id)",
        "    if not merchant.webhook_url: return",
        "",
        "    payload = {",
        "        'event': event,",
        "        'data': serialize_subscription(subscription),",
        "        'created_at': datetime.utcnow().isoformat()",
        "    }",
        "    # Sign the payload",
        "    sig = hmac.new(merchant.webhook_secret.encode(),",
        "                   json.dumps(payload).encode(), hashlib.sha256).hexdigest()",
        "",
        "    # Persist delivery record first, then queue",
        "    delivery = WebhookDelivery(merchant_id=merchant.id, event=event, payload=payload)",
        "    db.add(delivery)",
        "    await db.commit()",
        "",
        "    deliver_webhook.delay(str(delivery.id))",
        "",
        "@shared_task(bind=True, max_retries=5)",
        "def deliver_webhook(self, delivery_id: str):",
        "    # Load delivery, POST to merchant URL",
        "    # On failure: exponential backoff — retry after 1m, 5m, 15m, 1h, 4h",
        "    # On 5th failure: mark delivery as failed, alert ops",
        "    ...",
      ]),
      sp(),

      h2("3.7  Phase 1 Acceptance Criteria"),
      infoBox("Definition of Done — Phase 1", "A developer with no UI can: (1) create a customer via API, (2) create a plan, (3) create a subscription and receive a valid virtual account number, (4) simulate a transfer in Paystack test mode, (5) receive the charge.success webhook, see the subscription status change to active, and see the merchant webhook fire successfully."),
      sp(),
      taskTable([
        ["All 8 endpoints", "Return correct responses and HTTP status codes in all happy-path and error cases", "BE", "—"],
        ["Auth middleware", "Requests with invalid or missing keys return 401", "BE", "—"],
        ["Webhook signature verification", "Requests with invalid Paystack signatures are rejected with 400", "BE", "—"],
        ["Idempotency", "Firing the same charge.success webhook twice does not create two payments", "BE", "—"],
        ["Amount mismatch", "A transfer of the wrong amount does not activate the subscription", "BE", "—"],
        ["Outbound webhooks", "subscription.activated fires to merchant URL within 5 seconds of payment", "BE", "—"],
        ["Test coverage", "All core paths covered by pytest tests with mocked Paystack responses", "BE", "—"],
      ]),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 4. PHASE 2 — PAYMENT PAGE
      // ════════════════════════════════════════════════════════════════════
      h1("4. Phase 2 — Hosted Payment Page"),
      phaseBanner("Phase 2", "Hosted Payment Page", "Weeks 4–5  ·  ~8 days", "0E7490"),
      sp(),
      body("Goal: a merchant can redirect their user to a SubPay-hosted URL, the user fills in their details, sees a virtual account, makes a bank transfer, and lands on a confirmation screen. The payment page is the first thing real users will ever see — it must be polished and trustworthy."),
      sp(),

      h2("4.1  How Merchants Initiate the Payment Page"),
      body("Merchants do not build their own payment UI. They generate a checkout URL from the SubPay API and redirect their user to it. The URL encodes everything SubPay needs to display the right plan and brand."),
      sp(),
      code([
        "POST /v1/checkout/init",
        "",
        "{",
        '  "plan_id": "plan_monthly_basic",',
        '  "redirect_url": "https://merchant.com/success",',
        '  "metadata": { "user_id": "123" }',
        "}",
        "",
        "// Response",
        "{",
        '  "checkout_url": "https://pay.subpay.africa/c/chk_abc123",',
        '  "checkout_id": "chk_abc123",',
        '  "expires_at": "2026-05-10T10:30:00Z"',
        "}",
      ]),
      sp(),
      body("The checkout session is stored in Redis with a 1-hour TTL. After the user pays, SubPay redirects to the merchant's redirect_url with ?subscription_id= and ?status=success appended."),
      sp(),

      h2("4.2  Screen-by-Screen Implementation"),
      h3("Screen 1 — Subscriber Details"),
      taskTable([
        ["Merchant branding", "Fetch merchant name and logo from checkout session. Display prominently at top. Fall back to text if no logo.", "FE", "0.5 day"],
        ["Plan summary card", "Show plan name, amount (formatted as ₦X,XXX), and billing interval clearly.", "FE", "0.5 day"],
        ["Details form", "Name, email, phone fields. All required. Phone validated as Nigerian format (08xxxxxxxxx or +234xxxxxxxxx). Email validated. No submit until all valid.", "FE", "1 day"],
        ["Form submission", "On submit: POST /v1/customers (or fetch existing), then POST /v1/subscriptions. Show loading state. Handle errors gracefully.", "FE", "1 day"],
      ]),
      sp(),
      h3("Screen 2 — Transfer Instructions"),
      taskTable([
        ["Account display", "Bank name, account number in large bold text with one-tap copy button. Account name. Amount in large text with warning: 'Transfer exactly this amount'.", "FE", "1 day"],
        ["Countdown timer", "30-minute countdown. On expiry: show 'Session expired — refresh to get new account details'. Timer stored in sessionStorage.", "FE", "0.5 day"],
        ["WhatsApp share button", "Pre-filled WhatsApp message with bank name, account number, and amount. Opens wa.me link.", "FE", "0.5 day"],
        ["Payment detection", "Poll GET /v1/subscriptions/{id} every 5 seconds for status change to active. On active: auto-advance to Screen 3 without user action.", "FE", "1 day"],
        ["'I have paid' button", "Triggers immediate poll. Shows 'Checking payment...' state. If not yet matched, show 'Still checking — bank transfers can take a few minutes.'", "FE", "0.5 day"],
      ]),
      sp(),
      h3("Screen 3 — Confirmation"),
      taskTable([
        ["Success state", "Animated checkmark. Merchant branding. 'Your [plan name] subscription is active.' Show renewal date.", "FE", "0.5 day"],
        ["Account claim prompt", "Soft CTA: 'Track this subscription on SubPay'. Password field. Pre-filled email. POST /v1/auth/claim on submit. Skippable.", "FE", "1 day"],
        ["Redirect", "After 5 seconds (or on claim/skip), redirect to merchant's redirect_url with subscription details in query params.", "FE", "0.5 day"],
      ]),
      sp(),

      h2("4.3  Technical Notes"),
      bul("The payment page is a Next.js app deployed separately from the API at pay.subpay.africa"),
      bul("All API calls from the payment page go through a lightweight Next.js API route to avoid exposing keys client-side"),
      bul("The page must be fully functional on a 3G connection — optimise aggressively"),
      bul("No external fonts — use system font stack or preloaded Arial for speed"),
      bul("The session token from checkout init is passed in the URL and validated server-side on every API call"),
      sp(),

      h2("4.4  Phase 2 Acceptance Criteria"),
      infoBox("Definition of Done — Phase 2", "A user can be redirected to the payment page, fill in their details, receive a virtual account, transfer the amount in Paystack test mode, and land on a confirmation screen — all without the merchant doing anything after the initial redirect."),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 5. PHASE 3 — RENEWAL ENGINE
      // ════════════════════════════════════════════════════════════════════
      h1("5. Phase 3 — Renewal & Notification Engine"),
      phaseBanner("Phase 3", "Renewal & Notification Engine", "Week 6  ·  ~5 days", "065F46"),
      sp(),
      body("Goal: active subscriptions automatically generate renewal reminders, re-activate virtual accounts at renewal time, detect renewal payments, and mark lapsed subscriptions when payment is not received. This phase runs entirely headlessly — no UI is involved."),
      sp(),

      h2("5.1  Celery Task Architecture"),
      code([
        "# app/workers/celery_app.py",
        "from celery import Celery",
        "from celery.schedules import crontab",
        "",
        "app = Celery('subpay', broker=settings.REDIS_URL, backend=settings.REDIS_URL)",
        "",
        "app.conf.beat_schedule = {",
        "    # Runs every day at 8am WAT — checks for upcoming renewals",
        "    'check-upcoming-renewals': {",
        "        'task': 'app.workers.renewal_jobs.check_upcoming_renewals',",
        "        'schedule': crontab(hour=8, minute=0),",
        "    },",
        "    # Runs every day at 9am — marks lapsed subscriptions",
        "    'mark-lapsed-subscriptions': {",
        "        'task': 'app.workers.renewal_jobs.mark_lapsed_subscriptions',",
        "        'schedule': crontab(hour=9, minute=0),",
        "    },",
        "}",
      ]),
      sp(),

      h2("5.2  Renewal Job Implementation"),
      code([
        "# app/workers/renewal_jobs.py",
        "",
        "@app.task",
        "def check_upcoming_renewals():",
        "    today = date.today()",
        "    # Find all active subscriptions renewing in 7, 3, or 1 days",
        "    for days_ahead in [7, 3, 1]:",
        "        target_date = today + timedelta(days=days_ahead)",
        "        subs = db.query(Subscription).filter(",
        "            Subscription.status == 'active',",
        "            Subscription.renewal_date == target_date",
        "        ).all()",
        "        for sub in subs:",
        "            send_renewal_reminder.delay(str(sub.id), days_ahead)",
        "",
        "@app.task",
        "def mark_lapsed_subscriptions():",
        "    today = date.today()",
        "    grace_period = today - timedelta(days=3)",
        "    # Subscriptions past renewal date with no payment",
        "    subs = db.query(Subscription).filter(",
        "        Subscription.status == 'pending_renewal',",
        "        Subscription.renewal_date <= grace_period",
        "    ).all()",
        "    for sub in subs:",
        "        sub.status = 'lapsed'",
        "        dispatch_merchant_webhook(sub, 'subscription.lapsed')",
        "        send_lapse_notification.delay(str(sub.id))",
        "",
        "@app.task",
        "def send_renewal_reminder(subscription_id: str, days_ahead: int):",
        "    sub = db.get(Subscription, subscription_id)",
        "    customer = db.get(Customer, sub.customer_id)",
        "    plan = db.get(Plan, sub.plan_id)",
        "",
        "    # Re-activate virtual account for this subscription",
        "    va = reactivate_virtual_account(sub)",
        "",
        "    # Generate magic link token (7-day expiry)",
        "    token = generate_claim_token(customer)",
        "",
        "    # Send notifications",
        "    if days_ahead in [3, 1]:  # WhatsApp for close-in reminders",
        "        send_whatsapp_reminder(customer, plan, va, token, days_ahead)",
        "    send_email_reminder(customer, plan, va, token, days_ahead)",
        "    if days_ahead == 1:  # SMS for final day only",
        "        send_sms_reminder(customer, plan, va, token)",
      ]),
      sp(),

      h2("5.3  Notification Templates"),
      h3("WhatsApp Message (3 days before)"),
      code([
        "Hi {name}, your {plan_name} subscription renews in 3 days.",
        "",
        "Amount: ₦{amount}",
        "Pay to: {account_number} ({bank_name})",
        "Account name: SubPay / {customer_name}",
        "",
        "Tap to manage: subpay.africa/s/{token}",
        "",
        "— SubPay",
      ]),
      sp(),
      h3("WhatsApp Message (1 day before)"),
      code([
        "⏰ Reminder: {plan_name} renews tomorrow.",
        "",
        "Amount: ₦{amount}",
        "Pay to: {account_number} ({bank_name})",
        "",
        "Pay now: subpay.africa/s/{token}",
      ]),
      sp(),
      h3("Lapse Notification"),
      code([
        "Hi {name}, your {plan_name} subscription has lapsed.",
        "",
        "To reactivate, transfer ₦{amount} to:",
        "Account: {account_number} ({bank_name})",
        "",
        "Or visit: subpay.africa/s/{token}",
      ]),
      sp(),

      h2("5.4  Notification Service Implementation"),
      taskTable([
        ["WhatsApp via 360Dialog", "POST to 360Dialog's /messages endpoint. Template messages for reminders. Log every send in notifications table. Handle 429 rate limits with backoff.", "BE", "1 day"],
        ["SMS via Termii", "POST to Termii's /sms endpoint. Plain text messages. Nigerian DND compliance — use transactional sender ID, not promotional.", "BE", "0.5 day"],
        ["Email via Resend", "HTML email template. Subject: 'Your {plan} subscription renews in {N} days'. Include full transfer instructions. Unsubscribe link.", "BE", "0.5 day"],
        ["notifications table", "Log every outbound notification: customer_id, channel, type, status, sent_at, error_message. Used for debugging and deduplication.", "BE", "0.5 day"],
        ["Deduplication", "Before sending, check notifications table — do not send the same (subscription_id, channel, days_ahead) combination more than once.", "BE", "0.5 day"],
      ]),
      sp(),

      h2("5.5  Phase 3 Acceptance Criteria"),
      infoBox("Definition of Done — Phase 3", "Set a test subscription's renewal_date to tomorrow. Run check_upcoming_renewals manually. Confirm: (1) WhatsApp message received, (2) Email received, (3) Virtual account re-activated. Advance date past grace period. Confirm: (4) status changes to lapsed, (5) merchant webhook fires."),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 6. PHASE 4 — MERCHANT DASHBOARD
      // ════════════════════════════════════════════════════════════════════
      h1("6. Phase 4 — Merchant Dashboard"),
      phaseBanner("Phase 4", "Merchant Dashboard", "Weeks 7–8  ·  ~8 days", "7C3AED"),
      sp(),
      body("Goal: merchants can log in, see all their subscriptions, view payment history, manage plans, configure their webhook URL, and retrieve their API keys. This is a web app at dashboard.subpay.africa."),
      sp(),

      h2("6.1  Merchant Auth"),
      taskTable([
        ["Merchant signup", "Name, email, business name, password. Create merchant record. Generate API key pair (test + live). Send email verification.", "BE + FE", "1 day"],
        ["Merchant login", "Email + password. Return JWT. Refresh token logic.", "BE + FE", "0.5 day"],
        ["API key display", "Show test and live keys on a dedicated page. Live key hidden by default — reveal on button click. Copy button.", "FE", "0.5 day"],
        ["Webhook config", "Form to set webhook URL and secret. Test webhook button — fires a test event to their URL and shows the response.", "BE + FE", "1 day"],
      ]),
      sp(),

      h2("6.2  Dashboard Pages"),
      taskTable([
        ["Overview / Home", "Summary cards: total active subscriptions, MRR (monthly recurring revenue), payments today, lapsed this month. Simple line chart of payment volume over last 30 days.", "FE", "1.5 days"],
        ["Subscriptions list", "Table: customer name, plan, status, renewal date, last payment. Filterable by status. Searchable by name/email. Paginated.", "FE", "1 day"],
        ["Subscription detail", "Full subscription timeline. Status history. Payment records. Customer details. Cancel button.", "FE", "1 day"],
        ["Plans page", "List plans. Create new plan (name, amount, interval). Archive a plan (cannot delete if subscriptions exist).", "BE + FE", "1 day"],
        ["Customers page", "List all customers. Click through to see all their subscriptions.", "FE", "0.5 day"],
        ["Payments page", "Full payment log across all subscriptions. Exportable as CSV.", "FE", "0.5 day"],
      ]),
      sp(),

      h2("6.3  Phase 4 Acceptance Criteria"),
      infoBox("Definition of Done — Phase 4", "A merchant can sign up, get API keys, process a test payment via the payment page, and see that subscription appear in their dashboard with correct status, customer details, and payment record."),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 7. PHASE 5 — CONSUMER DASHBOARD
      // ════════════════════════════════════════════════════════════════════
      h1("7. Phase 5 — Consumer Dashboard & Account Claiming"),
      phaseBanner("Phase 5", "Consumer Dashboard & Account Claiming", "Weeks 9–10  ·  ~7 days", "B45309"),
      sp(),
      body("Goal: end users can claim their SubPay account, view all their active subscriptions across all merchants in one place, see renewal dates, access payment history, and cancel subscriptions. Access is at app.subpay.africa."),
      sp(),

      h2("7.1  Auth — Magic Link + Password"),
      taskTable([
        ["POST /v1/auth/claim", "Accept email + password + optional claim_token. Verify email exists as customer. Hash password. Set claimed = true. Return JWT. If claim_token provided, verify it is valid and not expired.", "BE", "1 day"],
        ["POST /v1/auth/login", "Email + password login for already-claimed accounts. Return JWT + refresh token.", "BE", "0.5 day"],
        ["Magic link generation", "On every renewal nudge, generate a claim_token (UUID), store with 7-day expiry. Include in all notification messages as subpay.africa/s/{token}.", "BE", "0.5 day"],
        ["Magic link landing page", "Token validated server-side. If valid and not yet claimed: show claim prompt. If valid and claimed: auto-log in and redirect to dashboard. If expired: show 'link expired' with login option.", "FE", "1 day"],
      ]),
      sp(),

      h2("7.2  Consumer Dashboard Pages"),
      taskTable([
        ["My Subscriptions", "Cards for each active subscription. Merchant name, plan, amount, next renewal date. Status badge. Quick action: pay now (if pending_renewal) or cancel.", "FE", "1.5 days"],
        ["Subscription detail", "Full history for one subscription. Payment records. Virtual account details for pending renewals. Cancel button with confirmation.", "FE", "1 day"],
        ["Account settings", "Update phone number (important for WhatsApp nudges). Update email (re-verification required). Change password.", "BE + FE", "1 day"],
        ["Cross-merchant deduplication", "On claim, query all customer records across merchants with the same email. Link them to one consumer identity. Show all subscriptions regardless of which merchant they came from.", "BE", "0.5 day"],
      ]),
      sp(),

      h2("7.3  Phase 5 Acceptance Criteria"),
      infoBox("Definition of Done — Phase 5", "A user who subscribed via two different merchants (same email) can click the magic link in a renewal nudge, set a password, and see both subscriptions in their dashboard immediately."),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 8. PHASE 6 — HARDENING, DOCS & LAUNCH
      // ════════════════════════════════════════════════════════════════════
      h1("8. Phase 6 — Hardening, Documentation & Launch Prep"),
      phaseBanner("Phase 6", "Hardening, Docs & Launch", "Weeks 11–12  ·  ~8 days", "9F1239"),
      sp(),
      body("Goal: the product is production-hardened, fully documented, and ready for the first real merchant to go live. This phase is not glamorous but it is what separates a demo from a product."),
      sp(),

      h2("8.1  Security Hardening"),
      taskTable([
        ["Rate limiting", "Apply per-IP and per-merchant rate limits on all API endpoints via slowapi (FastAPI rate limiter). POST /subscriptions: 60/min. POST /customers: 100/min. Webhook endpoints: exempt.", "BE", "0.5 day"],
        ["Input sanitisation", "Ensure all string inputs are stripped and validated via Pydantic. No raw SQL strings anywhere.", "BE", "0.5 day"],
        ["CORS configuration", "Restrict CORS to known SubPay frontend domains only. Tighten in production.", "BE", "0.5 day"],
        ["Secret key rotation", "Implement POST /v1/keys/rotate endpoint. Old key works for 24h after rotation. Send email alert to merchant on rotation.", "BE", "1 day"],
        ["Security headers", "Add X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Content-Security-Policy via middleware.", "BE", "0.5 day"],
      ]),
      sp(),

      h2("8.2  Observability"),
      taskTable([
        ["Structured logging", "Use Python logging with JSON formatter. Log every API request (method, path, merchant_id, duration, status). Never log raw card or key data.", "BE", "0.5 day"],
        ["Error tracking", "Integrate Sentry. Capture unhandled exceptions with context (merchant_id, endpoint). Set up Slack alert for critical errors.", "BE", "0.5 day"],
        ["Health check endpoint", "GET /health returns {status: ok, db: ok, redis: ok}. Used by Railway for uptime monitoring.", "BE", "0.5 day"],
        ["Celery monitoring", "Set up Flower (Celery dashboard) at an internal URL. Monitor failed tasks and queue depth.", "BE", "0.5 day"],
      ]),
      sp(),

      h2("8.3  Test Coverage"),
      taskTable([
        ["Unit tests", "All service functions tested in isolation with mocked external calls. Payment matcher, webhook dispatcher, renewal job logic.", "BE", "1 day"],
        ["Integration tests", "Full API endpoint tests using TestClient. Happy paths + all documented error cases. Minimum 80% coverage.", "BE", "1 day"],
        ["Webhook replay test", "Script that replays all Paystack webhook event types against the local server. Validates handling of each.", "BE", "0.5 day"],
      ]),
      sp(),

      h2("8.4  Developer Documentation"),
      body("Documentation lives at docs.subpay.africa, built with Mintlify or Docusaurus. It must be complete enough for a developer to integrate without asking a single question."),
      sp(),
      taskTable([
        ["Quickstart guide", "From zero to first payment in under 15 minutes. Create customer → create plan → create subscription → simulate payment → receive webhook.", "Docs", "1 day"],
        ["API reference", "Every endpoint documented with request schema, response schema, error codes, and a working curl example. Auto-generated from FastAPI OpenAPI spec where possible.", "Docs", "1 day"],
        ["Webhook guide", "How to verify signatures. List of all events with example payloads. Retry policy explanation.", "Docs", "0.5 day"],
        ["Error code reference", "Every SubPay error code listed with plain-English explanation and suggested resolution.", "Docs", "0.5 day"],
      ]),
      sp(),

      h2("8.5  Production Deployment Checklist"),
      bul("Set APP_ENV=production in all production environment variables"),
      bul("Confirm DATABASE_URL points to production PostgreSQL, not dev"),
      bul("Confirm PAYSTACK_SECRET_KEY is the live key, not test"),
      bul("Run all Alembic migrations against production database before launch"),
      bul("Verify Paystack webhook URL is registered as https://api.subpay.africa/webhooks/paystack in Paystack dashboard"),
      bul("Verify 360Dialog WhatsApp template messages are approved"),
      bul("Verify Termii sender ID is approved for transactional messages"),
      bul("Set up Cloudflare in front of api.subpay.africa and pay.subpay.africa"),
      bul("Configure Railway auto-deploy from main branch only"),
      bul("Confirm Sentry is receiving events from production environment"),
      bul("Run full end-to-end test with a live Paystack transaction before flipping the switch"),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 9. TESTING STRATEGY
      // ════════════════════════════════════════════════════════════════════
      h1("9. Testing Strategy"),
      body("Testing is not a phase — it runs alongside every phase. Every feature is written with its test. This section defines the testing approach for the full system."),
      sp(),

      h2("9.1  Test Environment"),
      bul("Paystack test mode — all Paystack calls in development and CI use test API keys"),
      bul("Separate test database — CI spins up a fresh PostgreSQL instance per run"),
      bul("Mocked notification services — WhatsApp, SMS, and email calls are mocked in tests to avoid sending real messages"),
      bul("Celery tasks run eagerly (CELERY_TASK_ALWAYS_EAGER=True) in tests"),
      sp(),

      h2("9.2  Key Test Scenarios"),
      taskTable([
        ["Full payment cycle", "Create customer → plan → subscription → simulate charge.success webhook → assert subscription.status == active → assert merchant webhook fired", "Phase 1", "Critical"],
        ["Duplicate webhook", "Fire charge.success twice with same reference → assert only one Payment record created", "Phase 1", "Critical"],
        ["Wrong amount transfer", "charge.success with amount != plan.amount → assert subscription not activated → assert mismatch flagged", "Phase 1", "Critical"],
        ["Account claim flow", "Create subscription → simulate payment → POST /auth/claim → assert claimed=true → assert dashboard shows subscription", "Phase 5", "High"],
        ["Magic link expiry", "Generate claim token → advance time past expiry → attempt claim → assert 401", "Phase 5", "High"],
        ["Renewal reminder timing", "Set renewal_date = today + 3 → run check_upcoming_renewals → assert WhatsApp and email send tasks queued", "Phase 3", "High"],
        ["Lapse detection", "Set renewal_date = 4 days ago, status = pending_renewal → run mark_lapsed → assert status == lapsed → assert merchant webhook fired", "Phase 3", "Critical"],
        ["Cross-merchant linking", "Create same email as customer for merchant A and merchant B → claim account → assert both subscriptions visible", "Phase 5", "High"],
      ]),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 10. RISK REGISTER
      // ════════════════════════════════════════════════════════════════════
      h1("10. Risk Register"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2600, 3400, 1560, 1800],
        rows: [
          new TableRow({ children: ["Risk", "Mitigation", "Likelihood", "Impact"].map((h, i) => {
            const ws = [2600, 3400, 1560, 1800];
            return new TableCell({ borders: bds, width: { size: ws[i], type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 19, bold: true, color: WHITE })] })] });
          })}),
          ...([
            ["Paystack virtual account API changes or downtime", "Abstract all Paystack calls into a single service. Design schema to support Korapay as a drop-in alternative.", "Medium", "High"],
            ["WhatsApp template message rejection by Meta", "Pre-submit all templates for approval before Phase 3. Have SMS-only fallback fully ready on day one.", "Medium", "Medium"],
            ["CBN regulatory challenge on virtual account issuance", "Position SubPay as a technology layer, not a payment processor. Work through licensed partners (Paystack/Korapay). Seek legal opinion before merchant launch.", "Low", "Very High"],
            ["Amount mismatch causing unactivated subscriptions", "Make exact amount requirement very explicit on payment page. Build a manual review queue in merchant dashboard for mismatched payments.", "Medium", "Medium"],
            ["Double payment for same renewal", "Idempotency on provider_ref. Virtual account deactivated immediately after renewal payment confirmed.", "Low", "High"],
            ["Webhook delivery failures to merchant", "Retry logic with exponential backoff. Failed delivery alert to merchant via email. Manual retry button in merchant dashboard.", "Medium", "Medium"],
          ]).map(([risk, mit, likelihood, impact], idx) => {
            const ws = [2600, 3400, 1560, 1800];
            const vals = [risk, mit, likelihood, impact];
            return new TableRow({ children: vals.map((v, i) => new TableCell({ borders: bds, width: { size: ws[i], type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? "F9FAFB" : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 18, color: DARK })] })] })) });
          })
        ]
      }),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // 11. DEFINITION OF MVP
      // ════════════════════════════════════════════════════════════════════
      h1("11. Definition of MVP"),
      body("The MVP is the minimum feature set that allows SubPay to be used by a real merchant with real users and earn real revenue. Everything after this is an improvement, not a requirement."),
      sp(),
      infoBox("MVP = Phases 1 + 2 + 3", "A merchant can integrate the API, their users can subscribe via the hosted payment page, and those subscriptions auto-remind for renewal. That is the complete core loop. The dashboards (Phases 4 and 5) improve the experience but are not required to process live payments."),
      sp(),
      body("MVP is complete when:"),
      num("One real merchant has integrated the API in production"),
      num("At least one real user has subscribed and had their payment matched"),
      num("That user has received at least one renewal reminder"),
      num("The merchant has received at least one outbound webhook successfully"),
      sp(),
      body("Everything else — merchant dashboard, consumer dashboard, multi-currency, SDK libraries, documentation — improves retention and acquisition, but the core value is proven by the four criteria above."),
      sp(),


      // ════════════════════════════════════════════════════════════════════
      // FOOTER
      // ════════════════════════════════════════════════════════════════════
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 1 } },
        children: [new TextRun({ text: "SubPay Implementation Plan  ·  Confidential  ·  May 2026", font: "Arial", size: 18, color: GRAY, italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/mnt/user-data/outputs/SubPay_Implementation_Plan.docx", buf);
  console.log("Done");
});
