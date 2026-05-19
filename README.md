# BitBash Crypto Sentry

BitBash Crypto Sentry is a full-stack cryptocurrency monitoring application built with Next.js, PostgreSQL, Prisma, NextAuth, and live CoinGecko market data ingestion.

The project currently includes:

- Module 1: Project setup and infrastructure
- Module 2: Authentication

## Tech Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- NextAuth
- bcrypt
- Zod
- CoinGecko API

## Implemented Features

### Module 1: Project Setup and Infrastructure

- Next.js TypeScript project scaffold
- App Router structure
- ESLint, Prettier, `.editorconfig`, and `.gitignore`
- PostgreSQL database setup support
- Prisma schema, migrations, and seed script
- Reusable Prisma client
- Centralized environment variable helper
- CoinGecko API client
- Live crypto ingestion job
- `/api/health` route for database health check
- `/api/coins` route for stored coin data
- Basic landing page

### Module 2: Authentication

- Email/password signup
- Email/password login
- Server-side password hashing with bcrypt
- Google OAuth support through NextAuth
- JWT session handling
- Logout support
- Forgot password flow
- Reset password flow
- Secure password reset token storage
- Protected route middleware
- Protected dashboard placeholder
- Google profile image support

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crypto_sentry"

COINGECKO_API_KEY=""
COIN_INGEST_LIMIT=50
COIN_INGEST_INTERVAL_SECONDS=60

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Environment Notes

- `DATABASE_URL` connects Prisma to PostgreSQL.
- `COINGECKO_API_KEY` is optional for development.
- `COIN_INGEST_LIMIT` controls how many top coins are fetched per ingestion run.
- `COIN_INGEST_INTERVAL_SECONDS` controls the interval for continuous ingestion.
- `NEXTAUTH_SECRET` is required for secure JWT/session handling.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are required for Google login.

## Local Setup

Install dependencies:

```powershell
npm install
```

Generate Prisma client:

```powershell
npm run prisma:generate
```

Apply database migrations:

```powershell
npm run prisma:migrate
```

Seed the test user:

```powershell
npm run prisma:seed
```

Run one CoinGecko ingestion cycle:

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

You can use either:

- Docker Compose
- Local PostgreSQL installation on Windows

Default local database name:

```txt
crypto_sentry
```

If using local PostgreSQL on Windows, update `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crypto_sentry"
```

## Database Tables

Current Prisma schema includes:

- `users`
- `coins`
- `coin_price_snapshots`
- `watchlists`
- `alerts`
- `password_reset_tokens`

### Important Table Behavior

- `coins` stores coin identity data.
- `coin_price_snapshots` stores changing live market data.
- `users.password_hash` is nullable so Google-only users can exist.
- `password_reset_tokens` stores hashed reset tokens, not raw tokens.

## Crypto Ingestion

Run one ingestion cycle:

```powershell
npm run ingest:once
```

Run continuous ingestion:

```powershell
npm run ingest:watch
```

With the default config:

```env
COIN_INGEST_LIMIT=50
```

Expected result after one ingestion run:

```txt
coins: about 50 rows
coin_price_snapshots: 50 rows
```

Each later ingestion run keeps `coins` around the same count and adds new rows to `coin_price_snapshots`.

## Authentication

Implemented routes:

- `/signup`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/dashboard`

Protected routes:

- `/dashboard`
- `/watchlist`
- `/alerts`
- `/profile`
- `/settings`

Unauthenticated users are redirected to:

```txt
/login
```

The original return URL is preserved.

## Google OAuth Setup

Create Google OAuth credentials in Google Cloud Console.

Authorized JavaScript origin:

```txt
http://localhost:3000
```

Authorized redirect URI:

```txt
http://localhost:3000/api/auth/callback/google
```

Then update `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

Restart the dev server after updating `.env`.

## Forgot Password

Current behavior:

- User enters email on `/forgot-password`.
- Backend creates a secure reset token.
- Only the token hash is stored in `password_reset_tokens`.
- Reset link is printed in the terminal running `npm run dev`.
- User opens `/reset-password?token=...`.
- New password is hashed and saved in `users.password_hash`.
- Token is marked as used.

Planned behavior:

- Add email verification after signup.
- Send verification links by email.
- Send password reset links by email using a provider like Resend.

## Test User

After running:

```powershell
npm run prisma:seed
```

Use:

```txt
Email: test@example.com
Password: Password123
```

## Available API Routes

- `GET /api/health`
- `GET /api/coins`
- `POST /api/auth/signup`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `/api/auth/[...nextauth]`

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
- Module 2 authentication
- Google OAuth support in code
- Protected route middleware
- CoinGecko ingestion

Planned:

- Email verification after signup
- Real email delivery for password reset
- Module 3 dashboard
- Watchlist UI
- Alerts UI
- Profile and settings pages
