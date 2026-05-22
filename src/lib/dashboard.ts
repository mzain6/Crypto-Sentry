import { AlertCondition, AlertStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const LIMIT = 5;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const DEMO_HOLDINGS = [
  { providerId: "bitcoin", quantity: "0.28" },
  { providerId: "ethereum", quantity: "3.4" },
  { providerId: "solana", quantity: "42" },
  { providerId: "ripple", quantity: "1800" },
  { providerId: "chainlink", quantity: "95" },
];

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
  _userId: string,
): Promise<PortfolioSummary> {
  const coins = await getDemoCoinsWithLatestPrices();

  if (coins.length === 0) {
    return emptyPortfolio();
  }

  const quantityByProviderId = new Map(
    DEMO_HOLDINGS.map((holding) => [
      holding.providerId,
      Number(holding.quantity),
    ]),
  );

  const totalValueUsd = coins.reduce((total, coin) => {
    const dashboardCoin = toDashboardCoin(coin);
    const quantity = quantityByProviderId.get(coin.providerId) ?? 0;
    const price = dashboardCoin.priceUsd ?? 0;

    return total + quantity * price;
  }, 0);

  const previousValueUsd = coins.reduce((total, coin) => {
    const dashboardCoin = toDashboardCoin(coin);
    const quantity = quantityByProviderId.get(coin.providerId) ?? 0;
    const currentValue = quantity * (dashboardCoin.priceUsd ?? 0);
    const change = dashboardCoin.priceChangePercentage24h ?? 0;

    if (change <= -100) {
      return total;
    }

    return total + currentValue / (1 + change / 100);
  }, 0);

  const change24hUsd = totalValueUsd - previousValueUsd;
  const change24hPercentage =
    previousValueUsd > 0 ? (change24hUsd / previousValueUsd) * 100 : 0;
  const sparkline = await getPortfolioSparkline();

  return {
    totalValueUsd,
    change24hUsd,
    change24hPercentage,
    sparkline,
  };
}

async function getDemoCoinsWithLatestPrices() {
  return prisma.coin.findMany({
    where: {
      providerId: {
        in: DEMO_HOLDINGS.map((holding) => holding.providerId),
      },
    },
    include: {
      priceSnapshots: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { providerId: "asc" },
  });
}

async function getPortfolioSparkline() {
  const coins = await prisma.coin.findMany({
    where: {
      providerId: {
        in: DEMO_HOLDINGS.map((holding) => holding.providerId),
      },
    },
    include: {
      priceSnapshots: {
        where: {
          recordedAt: {
            gte: new Date(Date.now() - SEVEN_DAYS_MS),
          },
        },
        orderBy: { recordedAt: "asc" },
      },
    },
  });

  if (coins.length === 0) {
    return [];
  }

  const quantityByProviderId = new Map(
    DEMO_HOLDINGS.map((holding) => [
      holding.providerId,
      Number(holding.quantity),
    ]),
  );
  const valuesByDay = new Map<string, number>();

  for (const coin of coins) {
    const quantity = quantityByProviderId.get(coin.providerId) ?? 0;

    for (const snapshot of coin.priceSnapshots) {
      const dayKey = snapshot.recordedAt.toISOString().slice(0, 10);
      const value = quantity * (toNumber(snapshot.priceUsd) ?? 0);

      valuesByDay.set(dayKey, (valuesByDay.get(dayKey) ?? 0) + value);
    }
  }

  return [...valuesByDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-7)
    .map(([, value]) => value);
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
