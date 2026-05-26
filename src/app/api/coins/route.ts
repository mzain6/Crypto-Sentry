import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const coins = await prisma.coin.findMany({
    orderBy: { name: "asc" },
    include: {
      priceSnapshots: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    coins: coins.map((coin) => {
      const latestPrice = coin.priceSnapshots[0];

      return {
        id: coin.id,
        providerId: coin.providerId,
        symbol: coin.symbol,
        name: coin.name,
        latestPrice: latestPrice
          ? {
              priceUsd: latestPrice.priceUsd.toString(),
              marketCapUsd: latestPrice.marketCapUsd?.toString() ?? null,
              volumeUsd: latestPrice.volumeUsd?.toString() ?? null,
              priceChangePercentage24h:
                latestPrice.priceChangePercentage24h?.toString() ?? null,
              recordedAt: latestPrice.recordedAt,
            }
          : null,
      };
    }),
  });
}

