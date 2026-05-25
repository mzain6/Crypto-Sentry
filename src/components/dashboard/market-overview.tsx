import { formatCompactCurrency, formatCurrency, formatPercent } from "./format";
import type { PortfolioSummary } from "@/lib/dashboard";

type MarketOverviewProps = {
  portfolio: PortfolioSummary;
};

export function MarketOverview({ portfolio }: MarketOverviewProps) {
  const positive = portfolio.change24hPercentage >= 0;

  return (
    <section className="terminal-panel market-overview-card" id="portfolio-summary">
      <div className="terminal-panel-heading">
        <span className="panel-icon globe" aria-hidden="true" />
        <div>
          <h2>Market Overview</h2>
          <p>Watchlist-linked feed</p>
        </div>
      </div>

      <div className="overview-stack">
        <OverviewMetric
          iconClass="watchlist-value"
          label="Watchlist Value"
          value={formatCompactCurrency(portfolio.totalValueUsd)}
        />
        <OverviewMetric
          iconClass="movement"
          label="Watchlist 24h Move"
          value={formatCurrency(portfolio.change24hUsd)}
        />
        <OverviewMetric
          iconClass="market-change"
          label="Watchlist Change"
          tone={positive ? "positive" : "negative"}
          value={formatPercent(portfolio.change24hPercentage)}
        />
      </div>
    </section>
  );
}

function OverviewMetric({
  iconClass,
  label,
  tone,
  value,
}: {
  iconClass: string;
  label: string;
  tone?: "positive" | "negative";
  value: string;
}) {
  return (
    <div className="overview-metric">
      <span
        className={`overview-icon ${iconClass} ${tone ?? ""}`}
        aria-hidden="true"
      />
      <div>
        <small>{label}</small>
        <strong className={tone ? `change ${tone}` : undefined}>{value}</strong>
      </div>
    </div>
  );
}
