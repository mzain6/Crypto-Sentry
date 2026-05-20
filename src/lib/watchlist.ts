import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type MarketSort = "change" | "marketCap" | "price";
export type SortDirection = "asc" | "desc";

export type MarketCoin = {
  id: string;
  providerId: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  priceUsd: number | null;
  priceChangePercentage24h: number | null;
  marketCapUsd: number | null;
  volumeUsd: number | null;
  recordedAt: string | null;
  isWatchlisted: boolean;
};

export type MarketCoinsResult = {
  coins: MarketCoin[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type UserWatchlistCoin = MarketCoin & {
  watchlistId: string;
  addedAt: string;
  sparkline: number[];
};

type CoinWithLatestSnapshot = {
  id: string;
  providerId: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  priceSnapshots: Array<{
    priceUsd: Prisma.Decimal;
    marketCapUsd: Prisma.Decimal | null;
    volumeUsd: Prisma.Decimal | null;
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

function normalizePage(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function normalizeDirection(value: string | null): SortDirection {
  return value === "asc" ? "asc" : "desc";
}

function normalizeSort(value: string | null): MarketSort {
  if (value === "marketCap" || value === "change" || value === "price") {
    return value;
  }

  return "marketCap";
}

function toMarketCoin(
  coin: CoinWithLatestSnapshot,
  watchlistedCoinIds: Set<string>,
): MarketCoin {
  const latest = coin.priceSnapshots[0];

  return {
    id: coin.id,
    providerId: coin.providerId,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    imageUrl: coin.imageUrl,
    priceUsd: latest ? toNumber(latest.priceUsd) : null,
    priceChangePercentage24h: latest
      ? toNumber(latest.priceChangePercentage24h)
      : null,
    marketCapUsd: latest ? toNumber(latest.marketCapUsd) : null,
    volumeUsd: latest ? toNumber(latest.volumeUsd) : null,
    recordedAt: latest?.recordedAt.toISOString() ?? null,
    isWatchlisted: watchlistedCoinIds.has(coin.id),
  };
}

function sortMarketCoins(
  coins: MarketCoin[],
  sort: MarketSort,
  direction: SortDirection,
) {
  const getValue = (coin: MarketCoin) => {
    if (sort === "price") {
      return coin.priceUsd ?? 0;
    }

    if (sort === "change") {
      return coin.priceChangePercentage24h ?? 0;
    }

    return coin.marketCapUsd ?? 0;
  };

  return [...coins].sort((left, right) => {
    const result = getValue(left) - getValue(right);

    return direction === "asc" ? result : -result;
  });
}

export function parseMarketSearchParams(searchParams: URLSearchParams) {
  return {
    direction: normalizeDirection(searchParams.get("direction")),
    page: normalizePage(Number(searchParams.get("page") ?? 1)),
    pageSize: normalizePage(
      Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE),
    ),
    search: searchParams.get("search")?.trim() ?? "",
    sort: normalizeSort(searchParams.get("sort")),
  };
}

export async function getMarketCoins({
  direction,
  page,
  pageSize,
  search,
  sort,
  userId,
}: {
  direction: SortDirection;
  page: number;
  pageSize: number;
  search: string;
  sort: MarketSort;
  userId: string;
}): Promise<MarketCoinsResult> {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { symbol: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const [coins, watchlistRows] = await Promise.all([
    prisma.coin.findMany({
      where,
      include: {
        priceSnapshots: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.watchlist.findMany({
      where: { userId },
      select: { coinId: true },
    }),
  ]);
  const watchlistedCoinIds = new Set(watchlistRows.map((row) => row.coinId));
  const sortedCoins = sortMarketCoins(
    coins.map((coin) => toMarketCoin(coin, watchlistedCoinIds)),
    sort,
    direction,
  );
  const totalCount = sortedCoins.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    coins: sortedCoins.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalCount,
    totalPages,
  };
}

export async function addCoinToWatchlist(userId: string, coinId: string) {
  const coin = await prisma.coin.findUnique({
    where: { id: coinId },
    select: { id: true },
  });

  if (!coin) {
    return null;
  }

  return prisma.watchlist.upsert({
    where: {
      userId_coinId: {
        userId,
        coinId,
      },
    },
    update: {},
    create: {
      userId,
      coinId,
    },
  });
}

export async function removeCoinFromWatchlist(userId: string, coinId: string) {
  await prisma.watchlist.deleteMany({
    where: {
      userId,
      coinId,
    },
  });
}

export async function getUserWatchlist(
  userId: string,
): Promise<UserWatchlistCoin[]> {
  const rows = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      coin: {
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
      },
    },
  });

  return rows.map((row) => {
    const snapshots = row.coin.priceSnapshots;
    const latest = snapshots[snapshots.length - 1];

    return {
      id: row.coin.id,
      providerId: row.coin.providerId,
      symbol: row.coin.symbol.toUpperCase(),
      name: row.coin.name,
      imageUrl: row.coin.imageUrl,
      priceUsd: latest ? toNumber(latest.priceUsd) : null,
      priceChangePercentage24h: latest
        ? toNumber(latest.priceChangePercentage24h)
        : null,
      marketCapUsd: latest ? toNumber(latest.marketCapUsd) : null,
      volumeUsd: latest ? toNumber(latest.volumeUsd) : null,
      recordedAt: latest?.recordedAt.toISOString() ?? null,
      isWatchlisted: true,
      watchlistId: row.id,
      addedAt: row.createdAt.toISOString(),
      sparkline: snapshots
        .map((snapshot) => toNumber(snapshot.priceUsd) ?? 0)
        .slice(-24),
    };
  });
}
