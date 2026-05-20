import { prisma } from "@/lib/prisma";
import { fetchCoinGeckoMarkets } from "@/server/crypto/coingecko-client";

type IngestionResult = {
  coinsProcessed: number;
  snapshotsCreated: number;
  startedAt: Date;
  finishedAt: Date;
};

function toDecimalValue(value: number | null) {
  return value === null ? null : value.toString();
}

export async function ingestCoins(): Promise<IngestionResult> {
  const startedAt = new Date();
  const coins = await fetchCoinGeckoMarkets();
  let snapshotsCreated = 0;

  for (const coinMarket of coins) {
    const coin = await prisma.coin.upsert({
      where: { providerId: coinMarket.providerId },
      update: {
        symbol: coinMarket.symbol,
        name: coinMarket.name,
        imageUrl: coinMarket.imageUrl,
      },
      create: {
        providerId: coinMarket.providerId,
        symbol: coinMarket.symbol,
        name: coinMarket.name,
        imageUrl: coinMarket.imageUrl,
      },
    });

    await prisma.coinPriceSnapshot.create({
      data: {
        coinId: coin.id,
        priceUsd: coinMarket.currentPriceUsd.toString(),
        marketCapUsd: toDecimalValue(coinMarket.marketCapUsd),
        volumeUsd: toDecimalValue(coinMarket.volumeUsd),
        priceChangePercentage24h: toDecimalValue(
          coinMarket.priceChangePercentage24h,
        ),
      },
    });

    snapshotsCreated += 1;
  }

  return {
    coinsProcessed: coins.length,
    snapshotsCreated,
    startedAt,
    finishedAt: new Date(),
  };
}
