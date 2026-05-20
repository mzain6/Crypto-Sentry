-- Module 3 dashboard data support.
ALTER TABLE "coins" ADD COLUMN IF NOT EXISTS "image_url" TEXT;

CREATE TABLE IF NOT EXISTS "portfolio_holdings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coin_id" TEXT NOT NULL,
    "quantity" DECIMAL(32,12) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_holdings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "portfolio_holdings_user_id_coin_id_key"
ON "portfolio_holdings"("user_id", "coin_id");

CREATE INDEX IF NOT EXISTS "portfolio_holdings_coin_id_idx"
ON "portfolio_holdings"("coin_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_holdings_user_id_fkey'
    ) THEN
        ALTER TABLE "portfolio_holdings"
        ADD CONSTRAINT "portfolio_holdings_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_holdings_coin_id_fkey'
    ) THEN
        ALTER TABLE "portfolio_holdings"
        ADD CONSTRAINT "portfolio_holdings_coin_id_fkey"
        FOREIGN KEY ("coin_id") REFERENCES "coins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
