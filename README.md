# BitBash Crypto Sentry

BitBash Crypto Sentry is a full-stack cryptocurrency monitoring app built with Next.js, PostgreSQL, Prisma, Auth.js/NextAuth, and live CoinGecko market data ingestion.

The project currently includes Module 1 infrastructure and Module 2 authentication.

## Tech Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- bcrypt
- Zod
- Framer Motion
- Resend
- CoinGecko API

## Implemented Features

### Module 1: Project Setup and Infrastructure

- Next.js + TypeScript project setup
- App Router structure
- PostgreSQL database support
- Prisma schema, migrations, and seed script
- Reusable Prisma client
- CoinGecko API client
- Live coin ingestion job
- Health check API route
- Stored coins API route
- Watchlist and alert database tables

### Module 2: Authentication

- Email/password signup
- Email/password login
- Password hashing with bcrypt
- Google OAuth login
- JWT session handling
- Protected route middleware
- Logout support
- Google profile image support
- Google OAuth token storage in the Prisma `accounts` table
- Google access-token refresh helper
- Email verification for new email/password users
- Forgot password flow
- Unified password reset/setup flow
- Resend email provider integration
- Dark terminal-style auth UI

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crypto_sentry"

COINGECKO_API_KEY=""
COIN_INGEST_LIMIT=50
COIN_INGEST_INTERVAL_SECONDS=60

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

RESEND_API_KEY=""
AUTH_FROM_EMAIL="BitBash Crypto Sentry <onboarding@resend.dev>"
```

## Local Setup

Install dependencies:

```powershell
npm install
```

Generate Prisma client:

```powershell
npm run prisma:generate
```

Run database migrations:

```powershell
npm run prisma:migrate
```

Seed the database:

```powershell
npm run prisma:seed
```

Run one crypto ingestion cycle:

```powershell
npm run ingest:once
```

Start the development server:

```powershell
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Database Setup

PostgreSQL is required.

Supported options:

- Local PostgreSQL installation on Windows

Default local database:

```txt
crypto_sentry
```

Example local connection string:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crypto_sentry"
```

## Database Tables

Current Prisma schema includes:

- `users`
- `accounts`
- `coins`
- `coin_price_snapshots`
- `watchlists`
- `alerts`
- `password_reset_tokens`

Important behavior:

- `users.password_hash` is nullable so Google-only users can exist.
- `users.email_verified` is `null` until an email/password user verifies their email.
- `accounts` stores Google OAuth tokens.
- `coins` stores coin identity data.
- `coin_price_snapshots` stores live market price history.
- `watchlists` stores user-selected coins.
- `alerts` stores user price alert rules.

## Crypto Ingestion

Run one ingestion cycle:

```powershell
npm run ingest:once
```

Run continuous ingestion:

```powershell
npm run ingest:watch
```

With:

```env
COIN_INGEST_LIMIT=50
```

one ingestion run stores about 50 coins and 50 price snapshots. Later ingestion runs update coin identity data and add new price snapshot rows.

## Authentication Flow

### Email/Password Signup

1. User submits name, email, and password.
2. Password is hashed with bcrypt.
3. User is saved with `email_verified = null`.
4. A secure email verification token is generated.
5. Only the hashed token is saved in the database.
6. A verification link is sent using Resend or logged in development fallback.
7. User must verify email before login.

### Email Verification

Verification link format:

```txt
http://localhost:3000/verify-email?token=<token>
```

When the user opens the link:

- token is hashed
- database token hash is checked
- expiry is checked
- `email_verified` is set to the current date/time
- verification token fields are cleared

### Login

Email/password login only works after:

```txt
email_verified is not null
```

Google OAuth users are treated as verified because Google verifies the email address during OAuth.

### Forgot Password

Forgot password uses a generic success message for security:

```txt
If this account exists and is verified, a password link has been created.
```

A password link is only created when:

- the user exists
- the email is verified
- the account has a password, or it is a linked Google account that needs first-time password setup

If `email_verified` is `null`, no recovery email is sent.

### Unified Password Update

The `/update-password` page supports:

- password reset for normal email/password users
- first local password setup for Google users

Token types:

- `reset`
- `set`

Only hashed password tokens are stored.

## Google OAuth

Google OAuth is configured through Auth.js/NextAuth.

Authorized JavaScript origin:

```txt
http://localhost:3000
```

Authorized redirect URI:

```txt
http://localhost:3000/api/auth/callback/google
```

Required env values:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

Google provider requests offline access so refresh tokens can be stored:

- `prompt: "consent"`
- `access_type: "offline"`
- `response_type: "code"`

Google token refresh helper:

```txt
src/lib/google-token.ts
```

Example protected Google profile API:

```txt
GET /api/google/profile
```

## Resend Email

Email sending is handled through Resend.

Required env values:

```env
RESEND_API_KEY="your-resend-api-key"
AUTH_FROM_EMAIL="BitBash Crypto Sentry <onboarding@resend.dev>"
```

Notes:

- Restart `npm run dev` after changing `.env`.
- Without a verified custom domain, `onboarding@resend.dev` is usually limited to Resend test/verified recipients.
- Check the Resend dashboard **Logs** tab when debugging delivery.
- If Resend env values are missing in development, links are printed in the terminal.

## Routes

Frontend routes:

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/update-password`
- `/verify-email`
- `/dashboard`

Protected routes:

- `/dashboard`
- `/watchlist`
- `/alerts`
- `/profile`
- `/settings`

API routes:

- `GET /api/health`
- `GET /api/coins`
- `GET /api/google/profile`
- `POST /api/auth/signup`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `/api/auth/[...nextauth]`

## Test User

After running:

```powershell
npm run prisma:seed
```

use:

```txt
Email: test@example.com
Password: Password123
```

If strict email verification is enabled, make sure the test user has `email_verified` set before testing login.

## Useful Commands

```powershell
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run ingest:once
npm run ingest:watch
```

## Current Status

Completed:

- Module 1 infrastructure
- CoinGecko ingestion
- Coins API
- PostgreSQL + Prisma setup
- Watchlist and alert tables
- Module 2 authentication
- Google OAuth
- Google token refresh helper
- Protected route middleware
- Email verification
- Forgot password and password setup flow
- Resend integration
- Auth UI update

Planned:

- Production-ready email domain setup
- Improved email delivery error display
- Module 3 dashboard
- Watchlist UI
- Alerts UI
- Profile and settings pages
