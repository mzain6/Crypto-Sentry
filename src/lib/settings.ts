import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";

const DEFAULT_ALERT_THRESHOLD_PERCENT = -2;
const MIN_ALERT_THRESHOLD_PERCENT = 0.01;
const MAX_ALERT_THRESHOLD_PERCENT = 50;

export type UserSettingsView = {
  defaultAlertThresholdPercent: number;
};

type ThresholdRow = {
  default_alert_threshold_percent: Prisma.Decimal | number | string;
};

function toNumber(value: Prisma.Decimal | number | string | null) {
  if (value === null) {
    return null;
  }

  const parsed = Number(value.toString());

  return Number.isFinite(parsed) ? parsed : null;
}

export function validateAlertThreshold(value: number) {
  if (!Number.isFinite(value)) {
    throw new Error("Alert threshold must be a valid number.");
  }

  const absoluteValue = Math.abs(value);

  if (
    absoluteValue < MIN_ALERT_THRESHOLD_PERCENT ||
    absoluteValue > MAX_ALERT_THRESHOLD_PERCENT
  ) {
    throw new Error(
      `Alert threshold must be between +/-${MIN_ALERT_THRESHOLD_PERCENT}% and +/-${MAX_ALERT_THRESHOLD_PERCENT}%.`,
    );
  }

  return Number(value.toFixed(3));
}

export async function getUserSettings(
  userId: string,
): Promise<UserSettingsView> {
  const rows = await prisma.$queryRaw<ThresholdRow[]>`
    INSERT INTO "user_settings" (
      "id",
      "user_id",
      "default_alert_threshold_percent",
      "created_at",
      "updated_at"
    )
    VALUES (
      ${randomUUID()},
      ${userId},
      ${DEFAULT_ALERT_THRESHOLD_PERCENT},
      NOW(),
      NOW()
    )
    ON CONFLICT ("user_id") DO UPDATE
    SET "updated_at" = "user_settings"."updated_at"
    RETURNING "default_alert_threshold_percent"
  `;
  const threshold =
    toNumber(rows[0]?.default_alert_threshold_percent ?? null) ??
    DEFAULT_ALERT_THRESHOLD_PERCENT;

  return {
    defaultAlertThresholdPercent: threshold,
  };
}

export async function updateUserSettings({
  defaultAlertThresholdPercent,
  userId,
}: {
  defaultAlertThresholdPercent: number;
  userId: string;
}): Promise<UserSettingsView> {
  const threshold = validateAlertThreshold(defaultAlertThresholdPercent);
  const rows = await prisma.$queryRaw<ThresholdRow[]>`
    INSERT INTO "user_settings" (
      "id",
      "user_id",
      "default_alert_threshold_percent",
      "created_at",
      "updated_at"
    )
    VALUES (
      ${randomUUID()},
      ${userId},
      ${threshold},
      NOW(),
      NOW()
    )
    ON CONFLICT ("user_id") DO UPDATE
    SET
      "default_alert_threshold_percent" = EXCLUDED."default_alert_threshold_percent",
      "updated_at" = NOW()
    RETURNING "default_alert_threshold_percent"
  `;

  return {
    defaultAlertThresholdPercent:
      toNumber(rows[0]?.default_alert_threshold_percent ?? null) ?? threshold,
  };
}

export async function getAlertThresholdsForUsers(userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds)];

  if (uniqueUserIds.length === 0) {
    return new Map<string, number>();
  }

  const rows = await prisma.$queryRaw<
    Array<{
      default_alert_threshold_percent: Prisma.Decimal | number | string | null;
      user_id: string;
    }>
  >(Prisma.sql`
    SELECT
      "user_id",
      "default_alert_threshold_percent"
    FROM "user_settings"
    WHERE "user_id" IN (${Prisma.join(uniqueUserIds)})
  `);
  const thresholds = new Map<string, number>();

  for (const userId of uniqueUserIds) {
    thresholds.set(userId, DEFAULT_ALERT_THRESHOLD_PERCENT);
  }

  for (const row of rows) {
    thresholds.set(
      row.user_id,
      toNumber(row.default_alert_threshold_percent) ??
        DEFAULT_ALERT_THRESHOLD_PERCENT,
    );
  }

  return thresholds;
}
