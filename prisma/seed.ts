import { AlertCondition, AlertStatus, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoCoins = [
  {
    providerId: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    imageUrl:
      "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    priceUsd: 89275,
    marketCapUsd: 1750000000000,
    volumeUsd: 42000000000,
    change24h: 1.82,
    quantity: 0.28,
  },
  {
    providerId: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    imageUrl:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    priceUsd: 2935.31,
    marketCapUsd: 352000000000,
    volumeUsd: 21000000000,
    change24h: -0.39,
    quantity: 3.4,
  },
  {
    providerId: "solana",
    symbol: "sol",
    name: "Solana",
    imageUrl:
      "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    priceUsd: 178.45,
    marketCapUsd: 82000000000,
    volumeUsd: 5500000000,
    change24h: 6.45,
    quantity: 42,
  },
  {
    providerId: "ripple",
    symbol: "xrp",
    name: "XRP",
    imageUrl:
      "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    priceUsd: 0.62,
    marketCapUsd: 35000000000,
    volumeUsd: 2100000000,
    change24h: -3.14,
    quantity: 1800,
  },
  {
    providerId: "chainlink",
    symbol: "link",
    name: "Chainlink",
    imageUrl:
      "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    priceUsd: 16.2,
    marketCapUsd: 9900000000,
    volumeUsd: 780000000,
    change24h: 4.21,
    quantity: 95,
  },
  {
    providerId: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    imageUrl:
      "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    priceUsd: 0.15,
    marketCapUsd: 22000000000,
    volumeUsd: 1600000000,
    change24h: -5.72,
    quantity: 2400,
  },
];

function snapshotPrice(basePrice: number, change24h: number, dayOffset: number) {
  const wave = 1 + (dayOffset - 3) * 0.012 + Math.sin(dayOffset + 1) * 0.01;
  const finalDayAdjustment = dayOffset === 6 ? 1 : 1 - change24h / 100;

  return Math.max(basePrice * wave * finalDayAdjustment, 0.000001);
}

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {
      name: "Test User",
      passwordHash,
    },
    create: {
      name: "Test User",
      email: "test@example.com",
      passwordHash,
    },
  });

  for (const demoCoin of demoCoins) {
    const coin = await prisma.coin.upsert({
      where: { providerId: demoCoin.providerId },
      update: {
        symbol: demoCoin.symbol,
        name: demoCoin.name,
        imageUrl: demoCoin.imageUrl,
      },
      create: {
        providerId: demoCoin.providerId,
        symbol: demoCoin.symbol,
        name: demoCoin.name,
        imageUrl: demoCoin.imageUrl,
      },
    });

    await prisma.watchlist.upsert({
      where: {
        userId_coinId: {
          userId: user.id,
          coinId: coin.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        coinId: coin.id,
      },
    });

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const recordedAt = new Date(
        Date.now() - (6 - dayOffset) * 24 * 60 * 60 * 1000,
      );

      await prisma.coinPriceSnapshot.create({
        data: {
          coinId: coin.id,
          priceUsd: snapshotPrice(
            demoCoin.priceUsd,
            demoCoin.change24h,
            dayOffset,
          ).toString(),
          marketCapUsd: demoCoin.marketCapUsd.toString(),
          volumeUsd: demoCoin.volumeUsd.toString(),
          priceChangePercentage24h: demoCoin.change24h.toString(),
          recordedAt,
        },
      });
    }
  }

  await prisma.alert.deleteMany({
    where: {
      userId: user.id,
      status: AlertStatus.TRIGGERED,
    },
  });

  const alertCoins = await prisma.coin.findMany({
    where: {
      providerId: {
        in: ["bitcoin", "ethereum", "solana"],
      },
    },
  });

  for (const [index, coin] of alertCoins.entries()) {
    await prisma.alert.create({
      data: {
        userId: user.id,
        coinId: coin.id,
        condition:
          index % 2 === 0
            ? AlertCondition.PRICE_ABOVE
            : AlertCondition.PRICE_BELOW,
        thresholdPriceUsd: index % 2 === 0 ? "50000" : "3000",
        status: AlertStatus.TRIGGERED,
        triggeredAt: new Date(Date.now() - (index + 1) * 45 * 60 * 1000),
        triggeredPriceUsd: index % 2 === 0 ? "89275" : "2935.31",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
