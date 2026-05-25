import { AlertCondition, AlertStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const LIMIT = 5;

export type DashboardCoin = {
  id: string;
  providerId: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  priceUsd: number | null;
  priceChangePercentage24h: number | null;
  recordedAt: string | null;
};

export type PortfolioSummary = {
  totalValueUsd: number;
  change24hUsd: number;
  change24hPercentage: number;
  sparkline: number[];
};

export type TopMovers = {
  gainers: DashboardCoin[];
  losers: DashboardCoin[];
};

export type SentryAnalytics = {
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  volatilityIndex: number;
  volatilityLabel: "LOW" | "ELEVATED" | "HIGH";
  buyPressure: number;
  buyPressureLabel: "LOW" | "BALANCED" | "HIGH";
  hasLiquidityPressure: boolean;
};

export type RecentAlert = {
  id: string;
  coin: Pick<DashboardCoin, "id" | "symbol" | "name" | "imageUrl">;
  condition: AlertCondition;
  thresholdPriceUsd: number;
  triggeredAt: string | null;
  triggeredPriceUsd: number | null;
};

export type WatchlistSnapshotItem = DashboardCoin & {
  watchlistId: string;
  addedAt: string;
};

export type DashboardData = {
  portfolio: PortfolioSummary;
  topMovers: TopMovers;
  sentryAnalytics: SentryAnalytics;
  recentAlerts: RecentAlert[];
  watchlist: WatchlistSnapshotItem[];
  hasSeenDashboardTutorial: boolean;
};

type CoinWithLatestPrice = {
  id: string;
  providerId: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  priceSnapshots: Array<{
    priceUsd: Prisma.Decimal;
    priceChangePercentage24h: Prisma.Decimal | null;
    recordedAt: Date;
  }>;
};

function toNumber(value: Prisma.Decimal | number | string | null) {
  if (value === null) {
    return null;
  }

  const parsed = Number(value.toString());

  return Number.isFinite(parsed) ? parsed : null;
}

function toDashboardCoin(coin: CoinWithLatestPrice): DashboardCoin {
  const latestPrice = coin.priceSnapshots[0];

  return {
    id: coin.id,
    providerId: coin.providerId,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    imageUrl: coin.imageUrl,
    priceUsd: latestPrice ? toNumber(latestPrice.priceUsd) : null,
    priceChangePercentage24h: latestPrice
      ? toNumber(latestPrice.priceChangePercentage24h)
      : null,
    recordedAt: latestPrice?.recordedAt.toISOString() ?? null,
  };
}

function emptyPortfolio(): PortfolioSummary {
  return {
    totalValueUsd: 0,
    change24hUsd: 0,
    change24hPercentage: 0,
    sparkline: [],
  };
}

export async function getPortfolioSummary(
  userId: string,
): Promise<PortfolioSummary> {
  const watchlistRows = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      coin: {
        include: {
          priceSnapshots: {
            orderBy: { recordedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (watchlistRows.length === 0) {
    return emptyPortfolio();
  }

  const watchlistCoins = watchlistRows.map((row) => row.coin);

  const totalValueUsd = watchlistCoins.reduce((total, coin) => {
    const dashboardCoin = toDashboardCoin(coin);
    const price = dashboardCoin.priceUsd ?? 0;

    return total + price;
  }, 0);

  const previousValueUsd = watchlistCoins.reduce((total, coin) => {
    const dashboardCoin = toDashboardCoin(coin);
    const currentValue = dashboardCoin.priceUsd ?? 0;
    const change = dashboardCoin.priceChangePercentage24h ?? 0;

    if (change <= -100) {
      return total;
    }

    return total + currentValue / (1 + change / 100);
  }, 0);

  const change24hUsd = totalValueUsd - previousValueUsd;
  const watchlistChanges = watchlistCoins
    .map((coin) => toDashboardCoin(coin).priceChangePercentage24h)
    .filter((change): change is number => change !== null);
  const change24hPercentage =
    watchlistChanges.length > 0
      ? watchlistChanges.reduce((total, change) => total + change, 0) /
        watchlistChanges.length
      : 0;

  return {
    totalValueUsd,
    change24hUsd,
    change24hPercentage,
    sparkline: [],
  };
}

export async function getTopMovers(): Promise<TopMovers> {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const coins = await prisma.coin.findMany({
    include: {
      priceSnapshots: {
        where: {
          recordedAt: {
            gte: last24Hours,
          },
        },
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
  });
  const coinsWithChange = coins
    .map(toDashboardCoin)
    .filter((coin) => coin.priceChangePercentage24h !== null);

  return {
    gainers: [...coinsWithChange]
      .sort(
        (left, right) =>
          (right.priceChangePercentage24h ?? 0) -
          (left.priceChangePercentage24h ?? 0),
      )
      .slice(0, LIMIT),
    losers: [...coinsWithChange]
      .sort(
        (left, right) =>
          (left.priceChangePercentage24h ?? 0) -
          (right.priceChangePercentage24h ?? 0),
      )
      .slice(0, LIMIT),
  };
}

function emptySentryAnalytics(): SentryAnalytics {
  return {
    trend: "NEUTRAL",
    volatilityIndex: 0,
    volatilityLabel: "LOW",
    buyPressure: 0,
    buyPressureLabel: "LOW",
    hasLiquidityPressure: false,
  };
}

function getUniqueCoinsById(coins: DashboardCoin[]) {
  const coinById = new Map<string, DashboardCoin>();

  for (const coin of coins) {
    coinById.set(coin.id, coin);
  }

  return [...coinById.values()];
}

export function getSentryAnalytics(
  topMovers: TopMovers,
  watchlist: WatchlistSnapshotItem[],
): SentryAnalytics {
  const sourceCoins =
    watchlist.length > 0
      ? watchlist
      : getUniqueCoinsById([...topMovers.gainers, ...topMovers.losers]);
  const changes = sourceCoins
    .map((coin) => coin.priceChangePercentage24h)
    .filter((change): change is number => change !== null);

  if (changes.length === 0) {
    return emptySentryAnalytics();
  }

  const averageChange =
    changes.reduce((total, change) => total + change, 0) / changes.length;
  const averageAbsoluteChange =
    changes.reduce((total, change) => total + Math.abs(change), 0) /
    changes.length;
  const positiveCount = changes.filter((change) => change > 0).length;
  const buyPressure = Math.round((positiveCount / changes.length) * 100);
  const volatilityIndex = Number(averageAbsoluteChange.toFixed(1));

  return {
    trend:
      averageChange > 0.1
        ? "BULLISH"
        : averageChange < -0.1
          ? "BEARISH"
          : "NEUTRAL",
    volatilityIndex,
    volatilityLabel:
      volatilityIndex >= 5
        ? "HIGH"
        : volatilityIndex >= 2
          ? "ELEVATED"
          : "LOW",
    buyPressure,
    buyPressureLabel:
      buyPressure >= 60 ? "HIGH" : buyPressure >= 40 ? "BALANCED" : "LOW",
    hasLiquidityPressure: changes.some((change) => change <= -2),
  };
}

export async function getRecentAlerts(userId: string): Promise<RecentAlert[]> {
  const alerts = await prisma.alert.findMany({
    where: {
      userId,
      status: AlertStatus.TRIGGERED,
    },
    orderBy: [{ triggeredAt: "desc" }, { createdAt: "desc" }],
    take: LIMIT,
    include: { coin: true },
  });

  return alerts.map((alert) => ({
    id: alert.id,
    coin: {
      id: alert.coin.id,
      symbol: alert.coin.symbol.toUpperCase(),
      name: alert.coin.name,
      imageUrl: alert.coin.imageUrl,
    },
    condition: alert.condition,
    thresholdPriceUsd: toNumber(alert.thresholdPriceUsd) ?? 0,
    triggeredAt: alert.triggeredAt?.toISOString() ?? null,
    triggeredPriceUsd: toNumber(alert.triggeredPriceUsd),
  }));
}

export async function getWatchlistSnapshot(
  userId: string,
): Promise<WatchlistSnapshotItem[]> {
  const watchlistRows = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: LIMIT,
    include: {
      coin: {
        include: {
          priceSnapshots: {
            orderBy: { recordedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  return watchlistRows.map((row) => ({
    ...toDashboardCoin(row.coin),
    watchlistId: row.id,
    addedAt: row.createdAt.toISOString(),
  }));
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [
    portfolio,
    topMovers,
    recentAlerts,
    watchlist,
    hasSeenDashboardTutorial,
  ] = await Promise.all([
    getPortfolioSummary(userId),
    getTopMovers(),
    getRecentAlerts(userId),
    getWatchlistSnapshot(userId),
    getDashboardTutorialState(userId),
  ]);

  return {
    portfolio,
    topMovers,
    sentryAnalytics: getSentryAnalytics(topMovers, watchlist),
    recentAlerts,
    watchlist,
    hasSeenDashboardTutorial,
  };
}

async function getDashboardTutorialState(userId: string) {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return settings.hasSeenDashboardTutorial;
}
