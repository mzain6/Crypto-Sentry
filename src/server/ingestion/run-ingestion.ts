import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { evaluateWatchlistFlashCrashes } from "@/server/alerts/evaluate-alerts";

import { ingestCoins } from "./ingest-coins";

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function formatDuration(startedAt: Date, finishedAt: Date) {
  return `${finishedAt.getTime() - startedAt.getTime()}ms`;
}

function logResult(result: Awaited<ReturnType<typeof ingestCoins>>) {
  console.log(
    `[${timestamp()}] [ingestion] complete coins=${result.coinsProcessed} snapshots=${result.snapshotsCreated} duration=${formatDuration(result.startedAt, result.finishedAt)}`,
  );
}

async function runOnce() {
  console.log(`[${timestamp()}] [ingestion] syncing CoinGecko prices...`);
  const result = await ingestCoins();
  logResult(result);

  try {
    const alertResult = await evaluateWatchlistFlashCrashes();

    console.log(
      `[${timestamp()}] [alerts] watchlist-crash checked=${alertResult.watchedCoinsChecked} triggered=${alertResult.alertsTriggered}`,
    );
  } catch (error) {
    console.error(`[${timestamp()}] [alerts] evaluation failed`, error);
  }
}

async function runWatch() {
  console.log(
    `[${timestamp()}] [ingestion] watcher started interval=${env.coinIngestIntervalSeconds}s`,
  );

  while (true) {
    try {
      await runOnce();
    } catch (error) {
      console.error(`[${timestamp()}] [ingestion] failed`, error);
    }

    await new Promise((resolve) =>
      setTimeout(resolve, env.coinIngestIntervalSeconds * 1000),
    );
  }
}

async function main() {
  const mode = process.argv[2];

  if (mode === "--watch") {
    await runWatch();
    return;
  }

  if (mode === "--once" || !mode) {
    await runOnce();
    return;
  }

  throw new Error(`Unknown ingestion mode: ${mode}`);
}

main()
  .catch((error) => {
    console.error(`[${timestamp()}] [ingestion] failed`, error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (process.argv[2] !== "--watch") {
      await prisma.$disconnect();
    }
  });
