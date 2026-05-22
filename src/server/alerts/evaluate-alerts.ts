import { AlertCondition, AlertStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAlertThresholdsForUsers } from "@/lib/settings";

const BASELINE_WINDOW_SECONDS = 30;
const DUPLICATE_COOLDOWN_MS = 5 * 60 * 1000;

type EvaluationResult = {
  watchedCoinsChecked: number;
  alertsTriggered: number;
};

function toNumber(value: Prisma.Decimal | number | string | null) {
  if (value === null) {
    return null;
  }

  const parsed = Number(value.toString());

  return Number.isFinite(parsed) ? parsed : null;
}

function calculateChangePercent(currentPrice: number, baselinePrice: number) {
  return ((currentPrice - baselinePrice) / baselinePrice) * 100;
}

export async function evaluateWatchlistFlashCrashes(): Promise<EvaluationResult> {
  const watchlistRows = await prisma.watchlist.findMany({
    include: {
      coin: true,
    },
  });
  const watchedCoinIds = [...new Set(watchlistRows.map((row) => row.coinId))];
  const alertThresholds = await getAlertThresholdsForUsers(
    watchlistRows.map((row) => row.userId),
  );

  if (watchedCoinIds.length === 0) {
    return {
      watchedCoinsChecked: 0,
      alertsTriggered: 0,
    };
  }

  let alertsTriggered = 0;
  const duplicateCooldownStart = new Date(Date.now() - DUPLICATE_COOLDOWN_MS);

  for (const coinId of watchedCoinIds) {
    const latestSnapshot = await prisma.coinPriceSnapshot.findFirst({
      where: { coinId },
      orderBy: { recordedAt: "desc" },
    });

    if (!latestSnapshot) {
      continue;
    }

    const baselineTargetTime = new Date(
      latestSnapshot.recordedAt.getTime() - BASELINE_WINDOW_SECONDS * 1000,
    );
    const baselineSnapshot = await prisma.coinPriceSnapshot.findFirst({
      where: {
        coinId,
        recordedAt: {
          lte: baselineTargetTime,
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    if (!baselineSnapshot) {
      continue;
    }

    const currentPrice = toNumber(latestSnapshot.priceUsd);
    const baselinePrice = toNumber(baselineSnapshot.priceUsd);

    if (!currentPrice || !baselinePrice || baselinePrice <= 0) {
      continue;
    }

    const changePercent = calculateChangePercent(currentPrice, baselinePrice);

    const usersWatchingCoin = watchlistRows.filter((row) => row.coinId === coinId);

    for (const watchlistRow of usersWatchingCoin) {
      const alertThreshold = alertThresholds.get(watchlistRow.userId) ?? -2;
      const condition =
        alertThreshold >= 0
          ? AlertCondition.PRICE_ABOVE
          : AlertCondition.PRICE_BELOW;
      const triggerThreshold =
        condition === AlertCondition.PRICE_ABOVE
          ? Math.abs(alertThreshold)
          : -Math.abs(alertThreshold);

      if (
        condition === AlertCondition.PRICE_ABOVE
          ? changePercent < triggerThreshold
          : changePercent > triggerThreshold
      ) {
        continue;
      }

      const recentDuplicate = await prisma.alert.findFirst({
        where: {
          userId: watchlistRow.userId,
          coinId,
          condition,
          status: AlertStatus.TRIGGERED,
          triggeredAt: {
            gte: duplicateCooldownStart,
          },
        },
      });

      if (recentDuplicate) {
        continue;
      }

      await prisma.alert.create({
        data: {
          userId: watchlistRow.userId,
          coinId,
          condition,
          thresholdPriceUsd: baselinePrice.toString(),
          status: AlertStatus.TRIGGERED,
          triggeredAt: latestSnapshot.recordedAt,
          triggeredPriceUsd: currentPrice.toString(),
        },
      });

      alertsTriggered += 1;
    }
  }

  return {
    watchedCoinsChecked: watchedCoinIds.length,
    alertsTriggered,
  };
}
