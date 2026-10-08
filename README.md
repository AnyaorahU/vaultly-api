Vaultly API
A production-style payment integration API built with TypeScript, Node.js, Express, and PostgreSQL. Integrates three major payment providers Stripe, Paystack, and Flutterwave with webhook handling, idempotency, and secure signature verification.

Built as a portfolio project to production standards.

Tech Stack
Runtime: Node.js 24 + TypeScript (strict mode)
Framework: Express 5
Database: PostgreSQL (raw pg — no ORM)
Authentication: JWT + bcrypt
Validation: Zod
Payment Providers: Stripe, Paystack, Flutterwave
HTTP Client: Axios (for Paystack and Flutterwave)
Architecture
Request → Route → Middleware → Controller → Service → Repository → PostgreSQL
Controllers — parse req/res, delegate to service, send response
Services — business logic, provider API calls, error handling
Repositories — all SQL queries isolated from business logic
Middleware — auth, validation, error handling
Payment Providers
Stripe
Uses Payment Intents — server creates an intent, client confirms with a client_secret. Webhook verified via HMAC signature using stripe.webhooks.constructEvent().

Paystack
Hosted payment page flow — server initializes a transaction, client is redirected to authorization_url. Webhook verified via HMAC-SHA512 using x-paystack-signature header.

Flutterwave
Hosted payment page flow — server generates a UUID tx_ref, client is redirected to a checkout link. Webhook verified via a static verif-hash header checked against FLW_SECRET_HASH.

Database Schema
users
id (UUID), name, email, password_hash, role, created_at, updated_at

payments
id (UUID), user_id (FK), amount (NUMERIC 12,2), currency, status,
provider, provider_intent_id (UNIQUE), description, paid_at, created_at, updated_at

webhook_events
id (UUID), stripe_event_id (UNIQUE), payment_id (FK nullable),
type, payload (JSONB), processed (BOOLEAN), created_at
Key constraints:

payments.status — CHECK IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')
payments.provider — CHECK IN ('stripe', 'paystack', 'flutterwave')
payments.amount — CHECK > 0, NUMERIC(12,2) — never float
webhook_events.stripe_event_id — UNIQUE — idempotency key across all providers
Getting Started
Prerequisites
Node.js 18+
PostgreSQL 15+
Setup
git clone <your-repo-url>
cd vaultly-api

npm install

sudo -u postgres createdb vaultly_db
sudo -u postgres psql -c "GRANT ALL ON DATABASE vaultly_db TO your_user;"
sudo -u postgres psql -d vaultly_db -c "GRANT ALL ON SCHEMA public TO your_user;"

cp .env.example .env

# Fill in your credentials and API keys

npx tsx src/db/migrate.ts

npm run dev
Environment Variables
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=vaultly_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1d

STRIPE*SECRET_KEY=sk_test*...
STRIPE*WEBHOOK_SECRET=whsec*...

PAYSTACK*SECRET_KEY=sk_test*...

FLW_PUBLIC_KEY=FLWPUBK_TEST-...
FLW_SECRET_KEY=FLWSECK_TEST-...
FLW_SECRET_HASH=your_custom_hash
API Endpoints
Auth
Method Endpoint Access Description
POST /api/v1/auth/register Public Register a new user
POST /api/v1/auth/login Public Login and receive JWT
GET /api/v1/auth/me Authenticated Get current user profile
Payments
Method Endpoint Access Description
GET /api/v1/payments Authenticated List all payments for current user
GET /api/v1/payments/:id Authenticated Get a specific payment (ownership enforced)
POST /api/v1/payments/create-intent Authenticated Create a Stripe Payment Intent
POST /api/v1/payments/paystack/initialize Authenticated Initialize a Paystack transaction
GET /api/v1/payments/paystack/verify/:reference Authenticated Verify a Paystack transaction
POST /api/v1/payments/flutterwave/initialize Authenticated Initialize a Flutterwave payment
Webhooks
Method Endpoint Description
POST /api/v1/webhook/stripe Stripe webhook handler
POST /api/v1/webhook/paystack Paystack webhook handler
POST /api/v1/webhook/flutterwave Flutterwave webhook handler
Webhook routes use provider-specific signature verification. Stripe requires raw body (express.raw()); Paystack and Flutterwave use parsed JSON body.

Security Features
Passwords hashed with bcrypt
JWT verified and user re-fetched from DB on every request
Generic error messages on auth failures (prevents user enumeration)
Parameterized SQL throughout (no SQL injection surface)
Webhook signature verification on all three providers
Idempotent webhook processing via stripe_event_id UNIQUE constraint
password_hash never returned in any response
TypeScript strict mode enforces null safety at compile time
Project Structure
vaultly-api/
├── src/
│ ├── config/ # env, database, stripe, paystack, flutterwave
│ ├── db/ # migration scripts
│ ├── middleware/ # auth, validate, errorMiddleware
│ ├── modules/
│ │ ├── auth/ # register, login, me
│ │ ├── payment/ # stripe, paystack, flutterwave services
│ │ └── webhook/ # stripe, paystack, flutterwave webhook handlers
│ ├── types/ # TypeScript interfaces and types
│ ├── utils/ # AppError, asyncHandler, jwt
│ ├── app.ts
│ └── server.ts
├── .env.example
├── tsconfig.json
└── README.md
Webhook Testing
Use the Stripe CLI for Stripe webhooks:

stripe listen --forward-to localhost:5000/api/v1/webhook/stripe
stripe trigger payment_intent.succeeded
For Paystack and Flutterwave, generate a signature and use curl:

# Paystack

echo -n '<payload>' | openssl dgst -sha512 -hmac "your_paystack_secret" | awk '{print $2}'

# Flutterwave

curl -X POST http://localhost:5000/api/v1/webhook/flutterwave \
 -H "verif-hash: your_flw_secret_hash" \
 -H "Content-Type: application/json" \
 -d '<payload>'
