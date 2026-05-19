import { env } from "@/lib/env";

import type { NormalizedCoinMarket } from "./types";

type CoinGeckoMarketCoin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
};

const COINGECKO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets";

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizeCoin(coin: CoinGeckoMarketCoin): NormalizedCoinMarket | null {
  if (!coin.id || !coin.symbol || !coin.name || coin.current_price === null) {
    return null;
  }

  return {
    providerId: coin.id,
    symbol: coin.symbol.toLowerCase(),
    name: coin.name,
    currentPriceUsd: coin.current_price,
    marketCapUsd: coin.market_cap,
    volumeUsd: coin.total_volume,
    priceChangePercentage24h: coin.price_change_percentage_24h,
  };
}

export async function fetchCoinGeckoMarkets(
  limit = env.coinIngestLimit,
): Promise<NormalizedCoinMarket[]> {
  const url = new URL(COINGECKO_MARKETS_URL);
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(limit));
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");
  url.searchParams.set("price_change_percentage", "24h");
console.log(`Fetching CoinGecko markets with URL: ${url.toString()}`);
  const headers: HeadersInit = {
    accept: "application/json",
  };

  if (env.coingeckoApiKey) {
    headers["x-cg-demo-api-key"] = env.coingeckoApiKey;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers });

      if (response.ok) {
        const rawCoins = (await response.json()) as CoinGeckoMarketCoin[];
        return rawCoins
          .map(normalizeCoin)
          .filter((coin): coin is NormalizedCoinMarket => coin !== null);
      }

      const body = await response.text();
      lastError = new Error(
        `CoinGecko request failed with ${response.status}: ${body}`,
      );

      if (response.status !== 429 && response.status < 500) {
        throw lastError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    await wait(750 * attempt);
  }

  throw lastError ?? new Error("CoinGecko request failed.");
}

