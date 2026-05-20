import Link from "next/link";

import { formatCurrency } from "./format";
import { Sparkline } from "./sparkline";
import type { WatchlistSnapshotItem } from "@/lib/dashboard";

type FeaturedAssetsProps = {
  coins: WatchlistSnapshotItem[];
};

export function FeaturedAssets({ coins }: FeaturedAssetsProps) {
  const featured = coins.slice(0, 2);

  if (featured.length === 0) {
    return (
      <>
        <AssetPlaceholder index={1} />
        <AssetPlaceholder index={2} />
      </>
    );
  }

  return (
    <>
      {featured.map((coin, index) => (
        <Link
          className={`terminal-panel asset-card asset-${index + 1}`}
          href="/watchlist"
          key={coin.id}
        >
          <span className="asset-name">{coin.name}</span>
          <strong>{coin.symbol}/USD</strong>
          <div className="asset-price">{formatCurrency(coin.priceUsd)}</div>
          <Sparkline
            tone={(coin.priceChangePercentage24h ?? 0) >= 0 ? "green" : "red"}
            values={[
              (coin.priceUsd ?? 0) * 0.94,
              (coin.priceUsd ?? 0) * 0.95,
              (coin.priceUsd ?? 0) * 0.97,
              (coin.priceUsd ?? 0) * 1.01,
              (coin.priceUsd ?? 0) * 1.02,
              coin.priceUsd ?? 0,
            ]}
          />
          <div className="asset-footer">
            <span>Stable</span>
            <em>Real-time data feed</em>
          </div>
        </Link>
      ))}
      {featured.length === 1 ? <AssetPlaceholder index={2} /> : null}
    </>
  );
}

function AssetPlaceholder({ index = 1 }: { index?: 1 | 2 }) {
  return (
    <div className={`terminal-panel asset-card asset-${index} placeholder`}>
      <span className="asset-name">Awaiting Asset</span>
      <strong>--/USD</strong>
      <div className="asset-price">--</div>
      <Sparkline values={[]} />
      <div className="asset-footer">
        <span>Idle</span>
        <em>No feed attached</em>
      </div>
    </div>
  );
}
