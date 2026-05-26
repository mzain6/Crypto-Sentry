# BitBash Crypto Sentry

BitBash Crypto Sentry is a full-stack cryptocurrency monitoring app built with Next.js, PostgreSQL, Prisma, Auth.js/NextAuth, and live CoinGecko market data ingestion.

The app includes authentication, a dark terminal-style dashboard, watchlist management, flash-movement alerts, profile management, and user settings.

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
- PostgreSQL database support
- Prisma schema and seed script
- Reusable Prisma client
- CoinGecko API client
- Live ingestion job for coin prices
- `/api/health` and `/api/coins`

### Module 2: Authentication

- Email/password signup and login
- Password hashing with bcrypt
- Google OAuth login through Auth.js
- JWT session handling
- Protected route middleware
- Logout support
- Google OAuth token storage and refresh helper
- Forgot password and password setup flow
- Resend email provider integration

### Module 3: Dashboard

- Protected dashboard layout
- Dark BitBash terminal UI
- Live dashboard data from PostgreSQL
- Portfolio-style market overview
- Featured asset cards
- Sentry analytics formulas
- System alerts panel
- Guided dashboard tutorial

### Module 4: Watchlist

- Market Data screen
- Searchable/sortable coin list
- Star toggle for saving/removing watchlist coins
- Watchlist page with saved coin cards
- Protected watchlist API routes
- 5-second frontend polling for watchlist/dashboard data

### Module 5: Alerts

- Watchlist-only alert evaluation
- Positive threshold detects price raises
- Negative threshold detects price drops
- Default threshold is `-2%`
- Alerts evaluated after ingestion cycles
- Triggered alerts stored in PostgreSQL
- Alerts page with delete support

### Module 6: Profile

- Profile view
- Display name update
- Profile image upload
- Password change / password setup
- Session invalidation after password change

### Module 7: Settings

- Per-user alert threshold setting
- Positive/negative threshold indicator
- Settings saved in PostgreSQL
- Alert evaluator reads user threshold settings

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crypto_sentry"

COINGECKO_API_KEY=""
COIN_INGEST_LIMIT=100
COIN_INGEST_INTERVAL_SECONDS=30

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

RESEND_API_KEY=""
AUTH_FROM_EMAIL="BitBash Crypto Sentry <onboarding@resend.dev>"
```

## Local Setup

```powershell
npm install
npm run prisma:generate
npm run prisma:seed
npm run dev
```

Open:

```txt
http://localhost:3000
```

`npm run dev` starts the Next.js dev server and the ingestion watcher.

## Database Setup

PostgreSQL is required. Docker is optional; local Windows PostgreSQL is supported.

Default local database:

```txt
crypto_sentry
```

Example connection string:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/crypto_sentry"
```

## Database Tables

Current Prisma schema includes:

- `users`
- `user_settings`
- `accounts`
- `coins`
- `coin_price_snapshots`
- `watchlists`
- `alerts`

Important behavior:

- `users.password_hash` is nullable so Google-only users can exist.
- `accounts` stores Google OAuth provider data and tokens.
- `coin_price_snapshots` stores live price history.
- `watchlists` stores user-selected coins.
- `alerts` stores triggered watchlist movement alerts.
- `user_settings` stores dashboard tutorial state and alert threshold settings.

## Ingestion Flow

The ingestion watcher fetches CoinGecko market data every configured interval and stores:

- coin identity data in `coins`
- latest price snapshots in `coin_price_snapshots`

After each ingestion cycle, the alert evaluator checks watched coins against user thresholds.

Useful commands:

```powershell
npm run ingest:once
npm run ingest:watch
```

## Authentication Flow

Email/password login:

1. User submits credentials on `/login`.
2. Auth.js calls the Credentials provider in `src/auth.ts`.
3. Prisma looks up the user by email.
4. bcrypt compares the entered password with `users.password_hash`.
5. Auth.js creates the JWT session cookie.

Google login:

1. User signs in with Google.
2. Auth.js handles the OAuth callback.
3. PrismaAdapter stores the user/account records.
4. Google tokens are stored in the `accounts` table.

Forgot password:

1. User submits email.
2. A secure random token is generated.
3. Only the hashed token is stored in the user row.
4. The raw token is sent by email in the reset/setup link.
5. The password is updated after token validation.

## Main Routes

Frontend:

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/update-password`
- `/dashboard`
- `/watchlist`
- `/alerts`
- `/market-data`
- `/profile`
- `/settings`

API:

- `GET /api/health`
- `GET /api/coins`
- `GET /api/dashboard`
- `GET /api/market`
- `GET /api/watchlist`
- `POST /api/watchlist/[coinId]`
- `DELETE /api/watchlist/[coinId]`
- `GET /api/alerts`
- `DELETE /api/alerts/[alertId]`
- `GET /api/profile`
- `PATCH /api/profile`
- `POST /api/profile/avatar`
- `POST /api/profile/password`
- `GET /api/settings`
- `PATCH /api/settings`
- `/api/auth/[...nextauth]`

## Test User

After running the seed script:

```txt
Email: test@example.com
Password: Password123
```

## Useful Commands

```powershell
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:seed
npm run ingest:once
npm run ingest:watch
```

## Current Status

Completed:

- Infrastructure
- Authentication
- Dashboard
- Watchlist
- Alerts
- Profile
- Settings
- CoinGecko ingestion
- Google OAuth token refresh
- Resend integration

Planned:

- Real wallet integration
- Production email domain setup
- Expanded alert notification channels
- More detailed coin analysis views
