export type NormalizedCoinMarket = {
  providerId: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  currentPriceUsd: number;
  marketCapUsd: number | null;
  volumeUsd: number | null;
  priceChangePercentage24h: number | null;
};
