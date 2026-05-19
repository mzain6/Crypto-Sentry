-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coins" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_price_snapshots" (
    "id" TEXT NOT NULL,
    "coin_id" TEXT NOT NULL,
    "price_usd" DECIMAL(24,8) NOT NULL,
    "market_cap_usd" DECIMAL(32,2),
    "volume_usd" DECIMAL(32,2),
    "price_change_percentage_24h" DECIMAL(12,6),
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "coins_provider_id_key" ON "coins"("provider_id");

-- CreateIndex
CREATE INDEX "coin_price_snapshots_coin_id_recorded_at_idx" ON "coin_price_snapshots"("coin_id", "recorded_at");

-- AddForeignKey
ALTER TABLE "coin_price_snapshots" ADD CONSTRAINT "coin_price_snapshots_coin_id_fkey" FOREIGN KEY ("coin_id") REFERENCES "coins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
