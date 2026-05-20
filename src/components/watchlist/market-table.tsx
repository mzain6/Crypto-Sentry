"use client";

import { useEffect, useMemo, useState } from "react";

import { CoinLogo } from "@/components/dashboard/coin-logo";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from "@/components/dashboard/format";
import type { MarketCoin, MarketCoinsResult, MarketSort } from "@/lib/watchlist";

type SortDirection = "asc" | "desc";

const SORT_LABELS: Record<MarketSort, string> = {
  change: "24h Change",
  marketCap: "Market Cap",
  price: "Price",
};

export function MarketTable({
  initialData,
}: {
  initialData: MarketCoinsResult;
}) {
  const [data, setData] = useState(initialData);
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialData.page);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<MarketSort>("marketCap");
  const [toast, setToast] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      direction,
      page: String(page),
      pageSize: String(initialData.pageSize),
      search,
      sort,
    });

    return params.toString();
  }, [direction, initialData.pageSize, page, search, sort]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      const response = await fetch(`/api/market?${query}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const nextData = (await response.json()) as MarketCoinsResult;

      if (active) {
        setData(nextData);
        setLoading(false);
      }
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  function updateSort(nextSort: MarketSort) {
    if (nextSort === sort) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSort(nextSort);
      setDirection("desc");
    }

    setPage(1);
  }

  async function toggleWatchlist(coin: MarketCoin) {
    const response = await fetch(`/api/watchlist/${coin.id}`, {
      method: coin.isWatchlisted ? "DELETE" : "POST",
    });

    if (!response.ok) {
      setToast("Could not update watchlist");
      return;
    }

    setData((current) => ({
      ...current,
      coins: current.coins.map((item) =>
        item.id === coin.id
          ? { ...item, isWatchlisted: !coin.isWatchlisted }
          : item,
      ),
    }));
    setToast(
      `${coin.name} ${coin.isWatchlisted ? "removed from" : "added to"} watchlist`,
    );
    window.setTimeout(() => setToast(null), 2400);
  }

  return (
    <section className="terminal-panel watchlist-module-panel">
      <div className="watchlist-module-header">
        <div>
          <div className="terminal-panel-kicker">Market Data Channel</div>
          <h2>Market Coin List</h2>
          <p>Search, sort, and bookmark assets from the ingested market feed.</p>
        </div>
        <label className="watchlist-search">
          <span>Search</span>
          <input
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name or symbol..."
            value={search}
          />
        </label>
      </div>

      <div className="watchlist-sortbar">
        {(Object.keys(SORT_LABELS) as MarketSort[]).map((sortKey) => (
          <button
            className={sort === sortKey ? "active" : undefined}
            key={sortKey}
            onClick={() => updateSort(sortKey)}
            type="button"
          >
            {SORT_LABELS[sortKey]} {sort === sortKey ? direction.toUpperCase() : ""}
          </button>
        ))}
      </div>

      <div className={loading ? "watchlist-table loading" : "watchlist-table"}>
        <div className="watchlist-row watchlist-row-head">
          <span>Coin</span>
          <span>Price</span>
          <span>24h</span>
          <span>Market Cap</span>
          <span>Track</span>
        </div>
        {data.coins.map((coin) => (
          <div className="watchlist-row" key={coin.id}>
            <span className="watchlist-coin">
              <CoinLogo imageUrl={coin.imageUrl} symbol={coin.symbol} />
              <span>
                <strong>{coin.name}</strong>
                <small>{coin.symbol}</small>
              </span>
            </span>
            <span>{formatCurrency(coin.priceUsd)}</span>
            <span
              className={
                (coin.priceChangePercentage24h ?? 0) >= 0
                  ? "change positive"
                  : "change negative"
              }
            >
              {formatPercent(coin.priceChangePercentage24h)}
            </span>
            <span>{formatCompactCurrency(coin.marketCapUsd)}</span>
            <button
              className={coin.isWatchlisted ? "watch-toggle active" : "watch-toggle"}
              onClick={() => void toggleWatchlist(coin)}
              type="button"
            >
              {coin.isWatchlisted ? "Saved" : "Save"}
            </button>
          </div>
        ))}
      </div>

      <div className="watchlist-pagination">
        <span>
          Page {data.page} / {data.totalPages} - {data.totalCount} coins
        </span>
        <div>
          <button
            disabled={data.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            Previous
          </button>
          <button
            disabled={data.page >= data.totalPages}
            onClick={() =>
              setPage((current) => Math.min(data.totalPages, current + 1))
            }
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      {toast ? <div className="watchlist-toast">{toast}</div> : null}
    </section>
  );
}
