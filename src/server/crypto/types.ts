export type NormalizedCoinMarket = {
  providerId: string;
  symbol: string;
  name: string;
  currentPriceUsd: number;
  marketCapUsd: number | null;
  volumeUsd: number | null;
  priceChangePercentage24h: number | null;
};

