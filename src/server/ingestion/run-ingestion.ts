import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

import { ingestCoins } from "./ingest-coins";

function logResult(result: Awaited<ReturnType<typeof ingestCoins>>) {
  console.log(
    JSON.stringify(
      {
        coinsProcessed: result.coinsProcessed,
        snapshotsCreated: result.snapshotsCreated,
        startedAt: result.startedAt.toISOString(),
        finishedAt: result.finishedAt.toISOString(),
      },
      null,
      2,
    ),
  );
}

async function runOnce() {
  const result = await ingestCoins();
  logResult(result);
}

async function runWatch() {
  console.log(
    `Starting coin ingestion every ${env.coinIngestIntervalSeconds} seconds.`,
  );

  while (true) {
    try {
      await runOnce();
    } catch (error) {
      console.error(error);
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
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (process.argv[2] !== "--watch") {
      await prisma.$disconnect();
    }
  });

