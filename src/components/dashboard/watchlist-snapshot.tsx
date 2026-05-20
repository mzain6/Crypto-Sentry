import Link from "next/link";

import { CoinLogo } from "./coin-logo";
import { formatCurrency, formatPercent } from "./format";
import type { WatchlistSnapshotItem } from "@/lib/dashboard";

type WatchlistSnapshotProps = {
  watchlist: WatchlistSnapshotItem[];
};

export function WatchlistSnapshot({ watchlist }: WatchlistSnapshotProps) {
  return (
    <section className="terminal-panel watchlist-card" id="watchlist-snapshot">
      <div className="terminal-panel-heading inline">
        <span className="panel-icon list" aria-hidden="true" />
        <div>
          <h2>Watchlist Snapshot</h2>
          <p>First 5 tracked assets</p>
        </div>
        <Link href="/watchlist">View all</Link>
      </div>
      <div className="coin-list">
        {watchlist.length === 0 ? (
          <p className="terminal-empty-copy">No watchlist assets yet</p>
        ) : (
          watchlist.map((coin) => (
            <Link className="coin-row" href="/watchlist" key={coin.watchlistId}>
              <CoinLogo imageUrl={coin.imageUrl} symbol={coin.symbol} />
              <span>
                <strong>{coin.symbol}</strong>
                <small>{coin.name}</small>
              </span>
              <span className="coin-row-price">
                {formatCurrency(coin.priceUsd)}
              </span>
              <span
                className={
                  (coin.priceChangePercentage24h ?? 0) >= 0
                    ? "change positive"
                    : "change negative"
                }
              >
                {formatPercent(coin.priceChangePercentage24h)}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
