"use client";

import Link from "next/link";
import { useState } from "react";

import { CoinLogo } from "@/components/dashboard/coin-logo";
import { formatCurrency, formatPercent } from "@/components/dashboard/format";
import type { UserWatchlistCoin } from "@/lib/watchlist";

export function WatchlistTable({
  initialWatchlist,
}: {
  initialWatchlist: UserWatchlistCoin[];
}) {
  const [toast, setToast] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState(initialWatchlist);

  async function removeCoin(coin: UserWatchlistCoin) {
    const response = await fetch(`/api/watchlist/${coin.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setToast("Could not remove coin");
      return;
    }

    setWatchlist((current) => current.filter((item) => item.id !== coin.id));
    setToast(`${coin.name} removed from watchlist`);
    window.setTimeout(() => setToast(null), 2400);
  }

  return (
    <section className="watchlist-board">
      <div className="watchlist-page-header">
        <span aria-hidden="true" className="watchlist-page-icon">
          &#9734;
        </span>
        <div>
          <h2>My Watchlist</h2>
          <p>Priority operational targets</p>
        </div>
        <Link className="watchlist-link-button" href="/market-data">
          Add Coins
        </Link>
      </div>

      {watchlist.length === 0 ? (
        <div className="watchlist-empty-state">
          <h3>No watchlist assets yet</h3>
          <p>Add coins from Market Data to begin tracking them here.</p>
          <Link href="/market-data">Open Market Data</Link>
        </div>
      ) : (
        <div className="watchlist-card-grid">
          {watchlist.map((coin) => (
            <article className="watchlist-target-card" key={coin.watchlistId}>
              <div className="watchlist-target-head">
                <CoinLogo imageUrl={coin.imageUrl} symbol={coin.symbol} />
                <div>
                  <strong>{coin.name}</strong>
                  <small>{coin.symbol}</small>
                </div>
                <button
                  aria-label={`Remove ${coin.name} from watchlist`}
                  className="watchlist-remove-button"
                  onClick={() => void removeCoin(coin)}
                  type="button"
                >
                  DEL
                </button>
              </div>

              <div className="watchlist-target-price">
                {formatCurrency(coin.priceUsd)}
              </div>
              <div
                className={
                  (coin.priceChangePercentage24h ?? 0) >= 0
                    ? "change positive"
                    : "change negative"
                }
              >
                {formatPercent(coin.priceChangePercentage24h)}
              </div>

              <Link className="watchlist-analysis-link" href="/market-data">
                Full Analysis
              </Link>
            </article>
          ))}
        </div>
      )}

      {toast ? <div className="watchlist-toast">{toast}</div> : null}
    </section>
  );
}
