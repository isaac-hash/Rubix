**SubPay**

Subscription Payments Infrastructure for Africa

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

*Technical Product Specification*

Version 1.0 · May 2026

**1. Executive Summary**

SubPay is a developer-first subscription payment infrastructure platform
purpose-built for the African market. It enables digital merchants to
accept recurring payments via bank transfer --- the dominant payment
method across the continent --- without requiring customers to have or
use a debit or credit card.

The platform abstracts the complexity of virtual account provisioning,
payment matching, renewal tracking, and customer notifications into a
clean API that any developer can integrate in a day. Merchants get a
Stripe-like experience; their customers get a payment flow that works
with how they already bank.

+-----------------------------------------------------------------------+
| **The Core Problem**                                                  |
|                                                                       |
| Less than 20% of banked Nigerians can reliably complete an online     |
| card payment. Yet the same users transact daily via bank transfers.   |
| SubPay bridges this gap for subscription-based businesses.            |
+-----------------------------------------------------------------------+

**2. Product Overview**

**2.1 What SubPay Does**

SubPay provides three integrated surfaces:

-   A merchant-facing REST API and webhook system for subscription
    lifecycle management

-   A hosted, mobile-first payment page that guides end users through
    the bank transfer flow

-   A consumer dashboard where users can track and manage all their
    active subscriptions

**2.2 How It Works --- High Level**

When a user subscribes through a merchant that has integrated SubPay:

1.  The merchant calls the SubPay API to create a customer and
    subscription.

2.  SubPay provisions a unique virtual bank account for that customer
    and subscription.

3.  The user transfers the exact subscription amount to that account via
    any banking app.

4.  SubPay receives a webhook from the underlying payment processor,
    matches the transfer, and activates the subscription.

5.  SubPay fires a webhook to the merchant confirming activation.

6.  Before renewal, SubPay sends the user a WhatsApp and/or SMS nudge
    with payment details.

**3. API Design**

**3.1 Authentication**

All API requests are authenticated using a secret key passed in the
Authorization header. Merchants receive a test key and a live key on
signup.

+-----------------------------------------------------------------------+
| Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx                    |
|                                                                       |
| Test key prefix: sk_test\_                                            |
|                                                                       |
| Live key prefix: sk_live\_                                            |
+-----------------------------------------------------------------------+

**3.2 Base URL**

  -----------------------------------------------------------------------
  https://api.subpay.africa/v1

  -----------------------------------------------------------------------

**3.3 Core Endpoints**

  ---------------------------- ------------------------------- ----------------
  **Method + Endpoint**        **Description**                 **Auth
                                                               Required**

  POST /customers              Create a new subscriber         Yes

  GET /customers/{id}          Retrieve subscriber details     Yes

  POST /plans                  Create a subscription plan      Yes

  GET /plans                   List all plans for a merchant   Yes

  POST /subscriptions          Create a subscription +         Yes
                               provision virtual account       

  GET /subscriptions/{id}      Get subscription status and     Yes
                               details                         

  POST                         Cancel a subscription           Yes
  /subscriptions/{id}/cancel                                   

  GET /subscriptions           List all subscriptions with     Yes
                               filters                         

  POST /webhooks               Register a webhook endpoint URL Yes

  GET /webhooks                List registered webhook         Yes
                               endpoints                       
  ---------------------------- ------------------------------- ----------------

**3.4 Request & Response Examples**

**Create a Customer**

+-----------------------------------------------------------------------+
| POST /v1/customers                                                    |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"name\": \"Amaka Osei\",                                             |
|                                                                       |
| \"email\": \"amaka@example.com\",                                     |
|                                                                       |
| \"phone\": \"08012345678\"                                            |
|                                                                       |
| }                                                                     |
|                                                                       |
| // Response                                                           |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"id\": \"cus_01HXYZ\",                                               |
|                                                                       |
| \"name\": \"Amaka Osei\",                                             |
|                                                                       |
| \"email\": \"amaka@example.com\",                                     |
|                                                                       |
| \"phone\": \"08012345678\",                                           |
|                                                                       |
| \"created_at\": \"2026-05-10T09:00:00Z\"                              |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**Create a Subscription**

+-----------------------------------------------------------------------+
| POST /v1/subscriptions                                                |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"customer_id\": \"cus_01HXYZ\",                                      |
|                                                                       |
| \"plan_id\": \"plan_monthly_basic\",                                  |
|                                                                       |
| \"metadata\": { \"user_id\": \"merchant_internal_id_123\" }           |
|                                                                       |
| }                                                                     |
|                                                                       |
| // Response                                                           |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"id\": \"sub_01HABC\",                                               |
|                                                                       |
| \"status\": \"pending_payment\",                                      |
|                                                                       |
| \"virtual_account\": {                                                |
|                                                                       |
| \"bank_name\": \"Wema Bank\",                                         |
|                                                                       |
| \"account_number\": \"0123456789\",                                   |
|                                                                       |
| \"account_name\": \"SubPay / Amaka Osei\",                            |
|                                                                       |
| \"amount\": 2500,                                                     |
|                                                                       |
| \"expires_at\": \"2026-05-10T09:30:00Z\"                              |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"renewal_date\": null                                                |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**3.5 Outbound Webhooks**

SubPay sends signed POST requests to the merchant\'s registered webhook
URL when key subscription events occur. All payloads include a
SubPay-Signature header for verification.

Webhook events:

-   subscription.activated --- first payment confirmed, subscription is
    live

-   subscription.renewed --- renewal payment confirmed

-   subscription.lapsed --- user did not pay by renewal date

-   subscription.cancelled --- subscription cancelled by user or
    merchant

-   payment.received --- any inbound payment matched to a subscription

**Example Webhook Payload**

+-----------------------------------------------------------------------+
| POST https://merchant.com/webhooks/subpay                             |
|                                                                       |
| SubPay-Signature: sha256=abc123\...                                   |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"event\": \"subscription.activated\",                                |
|                                                                       |
| \"data\": {                                                           |
|                                                                       |
| \"subscription_id\": \"sub_01HABC\",                                  |
|                                                                       |
| \"customer_id\": \"cus_01HXYZ\",                                      |
|                                                                       |
| \"plan_id\": \"plan_monthly_basic\",                                  |
|                                                                       |
| \"amount_paid\": 2500,                                                |
|                                                                       |
| \"currency\": \"NGN\",                                                |
|                                                                       |
| \"renewal_date\": \"2026-06-10T00:00:00Z\",                           |
|                                                                       |
| \"metadata\": { \"user_id\": \"merchant_internal_id_123\" }           |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"created_at\": \"2026-05-10T09:14:22Z\"                              |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**4. Payment Page UX**

**4.1 Design Principles**

-   Mobile-first --- the majority of users will pay from a smartphone

-   Trust-first --- merchant branding is prominent to reduce drop-off

-   Zero friction --- all the information needed to pay is on one screen

-   Designed for the transfer behaviour --- not trying to mimic a card
    form

**4.2 Screen Flow**

**Screen 1 --- Subscriber Details**

The user lands on a branded page showing the merchant\'s logo, the plan
name, and the price. They fill in:

-   Full name

-   Email address

-   Phone number (used for WhatsApp and SMS renewal nudges)

A single CTA button --- Generate Payment Details --- submits the form
and creates the subscription in SubPay.

**Screen 2 --- Transfer Instructions**

This is the most critical screen. It displays:

-   Bank name, account number (large, one-tap copy), and account name

-   The exact amount to transfer --- with a warning to send the precise
    figure

-   A countdown timer (e.g. 30 minutes) --- creates urgency and protects
    against stale accounts

-   A WhatsApp share button --- allows the user to send themselves the
    details

-   An I have sent the payment button --- triggers polling on the
    backend

**Screen 3 --- Confirmation**

Once the transfer is matched:

-   A success state with the merchant\'s branding is shown

-   The user is informed when their subscription renews and how they
    will be reminded

-   A prompt to create a SubPay account to manage all subscriptions in
    one place

+-----------------------------------------------------------------------+
| **Key UX Decision --- Exact Amount Transfers**                        |
|                                                                       |
| Requiring the exact amount enables instant automated reconciliation   |
| without manual review. The payment page should make this extremely    |
| clear, and the virtual account should be unique per subscription to   |
| eliminate ambiguity.                                                  |
+-----------------------------------------------------------------------+

**5. Renewal & Notification Engine**

**5.1 Renewal Lifecycle**

SubPay tracks the renewal date for every active subscription. As the
date approaches, the following automated sequence runs:

  ------------------ ----------------------------------------------------
  **Timing**         **Action**

  **7 days before**  Email reminder sent to subscriber with renewal
                     amount and account details

  **3 days before**  WhatsApp message sent with one-tap transfer
                     instructions

  **1 day before**   SMS reminder sent as final nudge

  **Renewal date**   Subscription status moves to pending_renewal;
                     virtual account is re-activated

  **3 days after**   If no payment received, status moves to lapsed;
                     merchant is notified via webhook

  **7 days after**   Final lapse notification to subscriber; merchant
                     webhook fires subscription.expired
  ------------------ ----------------------------------------------------

**5.2 Notification Channels**

-   WhatsApp --- primary channel via 360Dialog or Twilio WhatsApp API

-   SMS --- fallback and redundancy via Termii (Nigeria-optimised)

-   Email --- supplementary channel via Resend or Sendgrid

**6. Consumer Dashboard**

Beyond the payment flow, SubPay provides a lightweight consumer-facing
web app where users can:

-   View all active subscriptions across any SubPay-integrated merchant
    in one place

-   See upcoming renewal dates and amounts

-   Access payment history per subscription

-   Cancel subscriptions without contacting the merchant

-   Update their contact details for renewal notifications

Users access the dashboard after subscribing via a magic link sent to
their email --- no password required on signup. The dashboard becomes a
retention layer for SubPay itself: the more subscriptions a user manages
here, the higher the switching cost.

**7. Account Creation & Subscription Linking**

A first-time user arrives at SubPay only through a merchant\'s payment
page. They have no SubPay account yet. This section defines how their
identity is captured, how their subscription is linked, and how they are
guided into account ownership without creating friction at the point of
payment.

**7.1 Core Philosophy**

+-----------------------------------------------------------------------+
| **Principle**                                                         |
|                                                                       |
| Never block payment on account creation. Create the account silently  |
| at payment time, then invite the user to claim it on their own terms. |
+-----------------------------------------------------------------------+

**7.2 What Happens at Payment Time**

When a user completes a subscription payment, SubPay automatically
performs the following on the backend with no action required from the
user:

-   Checks whether a customer record already exists for that email
    address

-   If no record exists, a new customer profile is created using the
    name, email, and phone entered on the payment page

-   If a record already exists --- same email, different merchant ---
    the new subscription is linked to the existing profile

-   The subscription is attached to the customer record immediately upon
    payment confirmation

-   The customer\'s claimed flag is set to false --- the account exists
    but has no login credentials yet

**7.3 The Post-Payment Claim Prompt**

Immediately after the payment success screen, the user sees a soft
optional prompt:

+-----------------------------------------------------------------------+
| \"Want to track this and all future subscriptions in one place?\"     |
|                                                                       |
| \"Create your SubPay account --- your details are already saved.\"    |
|                                                                       |
| \[ Set a password \] → \[ Go to my dashboard \]                       |
|                                                                       |
| \[ Skip for now \]                                                    |
+-----------------------------------------------------------------------+

This prompt is entirely optional. If the user skips it, the product
continues to work --- they still receive WhatsApp, SMS, and email
renewal nudges. Account creation is never a condition for the
subscription to remain active.

If they proceed, they enter only a password --- email is pre-filled from
the payment. The customer record is updated to claimed = true, and they
are redirected to their dashboard where the subscription they just paid
for is already visible.

**7.4 Magic Link Access for Unclaimed Accounts**

For users who skip account creation, SubPay embeds a tokenised magic
link in all renewal nudge messages. This gives temporary authenticated
access to subscription details without requiring a password.

+-----------------------------------------------------------------------+
| Example WhatsApp nudge:                                               |
|                                                                       |
| \"Hi Amaka, your Musicbox subscription renews in 3 days.\"            |
|                                                                       |
| \"Amount: N2,500 \| Account: 0123456789 (Wema Bank)\"                 |
|                                                                       |
| \"View or manage: subpay.africa/s/tok_abc123\"                        |
|                                                                       |
| Token rules:                                                          |
|                                                                       |
| \- Unique per customer per nudge event                                |
|                                                                       |
| \- Expires after 7 days                                               |
|                                                                       |
| \- Single-use for sensitive actions (cancel, claim account)           |
|                                                                       |
| \- Claim prompt shown inside the magic link view                      |
+-----------------------------------------------------------------------+

**7.5 Handling Duplicate Emails Across Merchants**

Email address is the unique identifier for a SubPay customer. When the
same user subscribes via multiple merchants, their subscriptions should
consolidate into one dashboard. The matching logic:

  ----------------------------------- -----------------------------------
  **Scenario**                        **Behaviour**

  New email --- first-ever payment    New customer record created,
                                      claimed = false

  Same email --- payment via second   Existing record found; new
  merchant                            subscription linked to same profile

  User claims account after first     claimed = true; all linked
  payment                             subscriptions appear in dashboard

  User pays with a different email by Two separate records created;
  mistake                             manual merge support ticket
                                      required
  ----------------------------------- -----------------------------------

**7.6 Updated customers Table Schema**

The customers table is extended to support the claimed/unclaimed
lifecycle:

+-----------------------------------------------------------------------+
| customers                                                             |
|                                                                       |
| ├── id UUID, primary key                                              |
|                                                                       |
| ├── name string                                                       |
|                                                                       |
| ├── email string, unique index                                        |
|                                                                       |
| ├── phone string                                                      |
|                                                                       |
| ├── claimed boolean, default false                                    |
|                                                                       |
| ├── password_hash string, nullable                                    |
|                                                                       |
| ├── claim_token string, nullable                                      |
|                                                                       |
| ├── claim_token_expiry timestamp, nullable                            |
|                                                                       |
| ├── created_at timestamp                                              |
|                                                                       |
| └── updated_at timestamp                                              |
+-----------------------------------------------------------------------+

**7.7 Claim API Endpoint**

A dedicated endpoint handles the transition from unclaimed to claimed
account:

+-----------------------------------------------------------------------+
| POST /v1/auth/claim                                                   |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"email\": \"amaka@example.com\",                                     |
|                                                                       |
| \"password\": \"securepassword123\",                                  |
|                                                                       |
| \"claim_token\": \"tok_abc123\" // optional, from magic link          |
|                                                                       |
| }                                                                     |
|                                                                       |
| // Response                                                           |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"customer_id\": \"cus_01HXYZ\",                                      |
|                                                                       |
| \"claimed\": true,                                                    |
|                                                                       |
| \"access_token\": \"eyJhbGci\...\",                                   |
|                                                                       |
| \"subscriptions_count\": 2                                            |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**8. Technology Stack**

  -------------------- ---------------------- -------------------------------
  **Layer**            **Technology**         **Purpose**

  **API Framework**    FastAPI (Python)       Core REST API, async request
                                              handling, auto-generated
                                              Swagger docs

  **Database**         PostgreSQL             Subscriptions, customers,
                                              transactions, plans, merchants

  **ORM**              SQLAlchemy + Alembic   Database access layer and
                                              schema migrations

  **Cache / Queue**    Redis + Celery         Background job queue for
                                              renewal reminders and webhook
                                              retries

  **HTTP Client**      httpx                  Async calls to Paystack and
                                              Korapay APIs

  **Payment Layer**    Paystack / Korapay     Virtual account provisioning
                                              and inbound transfer webhooks

  **WhatsApp**         360Dialog              Renewal nudges via WhatsApp
                                              Business API

  **SMS**              Termii                 SMS notifications --- optimised
                                              for Nigerian delivery rates

  **Email**            Resend                 Transactional email for
                                              confirmations and reminders

  **Frontend**         Next.js + Tailwind     Hosted payment page, merchant
                                              dashboard, consumer dashboard

  **Infrastructure**   Railway / Render       Initial deployment; migrate to
                                              AWS at scale

  **Security**         Cloudflare             DDoS protection, WAF, edge
                                              caching
  -------------------- ---------------------- -------------------------------

**9. System Architecture**

**9.1 Data Flow**

+-----------------------------------------------------------------------+
| Merchant site                                                         |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼ POST /subscriptions                                                 |
|                                                                       |
| SubPay API (FastAPI)                                                  |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼ Provision virtual account                                           |
|                                                                       |
| Paystack / Korapay API                                                |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼ User transfers funds via banking app                                |
|                                                                       |
| Paystack / Korapay (inbound transfer detected)                        |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼ Webhook: charge.success                                             |
|                                                                       |
| SubPay API --- match payment → activate subscription                  |
|                                                                       |
| │                                                                     |
|                                                                       |
| ├──▶ Webhook to merchant: subscription.activated                      |
|                                                                       |
| │                                                                     |
|                                                                       |
| ├──▶ Confirmation to user (email + WhatsApp)                          |
|                                                                       |
| │                                                                     |
|                                                                       |
| └──▶ Queue renewal reminder jobs (Celery)                             |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼ At T-7, T-3, T-1 days                                               |
|                                                                       |
| Notification Engine → WhatsApp / SMS / Email                          |
+-----------------------------------------------------------------------+

**9.2 Database Schema --- Core Tables**

The following tables form the core data model:

-   merchants --- API keys, webhook URLs, business details

-   plans --- pricing tiers defined by merchants (amount, interval,
    currency)

-   customers --- subscriber profiles (name, email, phone)

-   subscriptions --- subscription state machine (pending, active,
    lapsed, cancelled)

-   virtual_accounts --- account numbers tied to subscriptions

-   payments --- record of every matched inbound transfer

-   notifications --- log of every outbound nudge sent

-   webhook_deliveries --- log of outbound merchant webhooks with retry
    state

**10. Security Considerations**

-   All API endpoints served over HTTPS only

-   Webhook payloads signed with HMAC-SHA256 so merchants can verify
    authenticity

-   Secret keys hashed at rest --- never stored in plain text

-   Virtual accounts are single-purpose and time-limited --- reduces
    fraud surface

-   Payment matching requires exact amount + correct virtual account ---
    no ambiguity

-   Rate limiting on all public endpoints via Cloudflare and FastAPI
    middleware

-   All sensitive environment variables managed via secrets manager ---
    never in code

**11. Business Model**

SubPay operates on a transaction fee model, consistent with payment
infrastructure norms in the Nigerian market:

  ----------------------- ----------------------- -----------------------
  **Tier**                **Transaction Fee**     **Monthly Platform
                                                  Fee**

  **Starter**             1.5% per transaction    Free

  **Growth**              1.2% per transaction    ₦25,000 / month

  **Scale**               0.8% per transaction    ₦75,000 / month
  ----------------------- ----------------------- -----------------------

Additional revenue opportunities include: float income on funds in
transit, premium dashboard features, and direct bank partnerships at
volume.

**12. Phased Delivery Roadmap**

**Phase 1 --- Foundation (Months 1--2)**

-   Core API: customers, plans, subscriptions

-   Virtual account provisioning via Paystack

-   Inbound webhook processing and payment matching

-   Hosted payment page (mobile-first)

-   Basic merchant dashboard

**Phase 2 --- Renewals & Notifications (Month 3)**

-   Renewal tracking and job scheduling via Celery

-   WhatsApp, SMS, and email nudge pipeline

-   Outbound merchant webhooks with retry logic

-   Consumer subscription dashboard (magic link access)

**Phase 3 --- Scale & DX (Months 4--6)**

-   JavaScript and Python SDK libraries

-   Full developer documentation (Mintlify)

-   Multi-currency support (GHS, KES, ZAR)

-   Direct bank partnership negotiations at volume

-   Analytics and churn insights for merchants

**13. Open Questions & Decisions**

-   Which payment processor to onboard first --- Paystack or Korapay ---
    given differences in virtual account bank partners and webhook
    reliability

-   CBN regulatory positioning --- operating as a payment aggregator or
    technology layer; legal advice required

-   Exact grace period for lapsed subscriptions before merchant access
    is revoked

-   Whether to build a native mobile app for the consumer dashboard or
    remain web-only initially

-   Pricing validation --- the fee structure above is a starting
    hypothesis and should be tested with early merchant partners

*SubPay --- Confidential · May 2026*
