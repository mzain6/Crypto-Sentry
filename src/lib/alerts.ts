import { AlertStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type UserAlert = {
  id: string;
  coin: {
    id: string;
    name: string;
    symbol: string;
    imageUrl: string | null;
  };
  condition: string;
  thresholdPriceUsd: number | null;
  triggeredPriceUsd: number | null;
  status: string;
  triggeredAt: string | null;
  createdAt: string;
};

function toNumber(value: Prisma.Decimal | number | string | null) {
  if (value === null) {
    return null;
  }

  const parsed = Number(value.toString());

  return Number.isFinite(parsed) ? parsed : null;
}

export async function getUserAlerts(userId: string): Promise<UserAlert[]> {
  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: [{ triggeredAt: "desc" }, { createdAt: "desc" }],
    include: { coin: true },
  });

  return alerts.map((alert) => ({
    id: alert.id,
    coin: {
      id: alert.coin.id,
      name: alert.coin.name,
      symbol: alert.coin.symbol.toUpperCase(),
      imageUrl: alert.coin.imageUrl,
    },
    condition: alert.condition,
    thresholdPriceUsd: toNumber(alert.thresholdPriceUsd),
    triggeredPriceUsd: toNumber(alert.triggeredPriceUsd),
    status: alert.status,
    triggeredAt: alert.triggeredAt?.toISOString() ?? null,
    createdAt: alert.createdAt.toISOString(),
  }));
}

export async function pauseAlert(userId: string, alertId: string) {
  await prisma.alert.updateMany({
    where: {
      id: alertId,
      userId,
    },
    data: {
      status: AlertStatus.PAUSED,
    },
  });
}

export async function resumeAlert(userId: string, alertId: string) {
  await prisma.alert.updateMany({
    where: {
      id: alertId,
      userId,
    },
    data: {
      status: AlertStatus.ACTIVE,
      triggeredAt: null,
      triggeredPriceUsd: null,
    },
  });
}

export async function deleteAlert(userId: string, alertId: string) {
  await prisma.alert.deleteMany({
    where: {
      id: alertId,
      userId,
    },
  });
}
