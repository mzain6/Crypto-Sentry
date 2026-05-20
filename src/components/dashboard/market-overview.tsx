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
          <p>Portfolio-linked feed</p>
        </div>
      </div>

      <div className="overview-stack">
        <OverviewMetric
          icon="◎"
          label="Portfolio Value"
          value={formatCompactCurrency(portfolio.totalValueUsd)}
        />
        <OverviewMetric
          icon="▣"
          label="24h Movement"
          value={formatCurrency(portfolio.change24hUsd)}
        />
        <OverviewMetric
          icon="▥"
          label="Market Change"
          tone={positive ? "positive" : "negative"}
          value={formatPercent(portfolio.change24hPercentage)}
        />
      </div>
    </section>
  );
}

function OverviewMetric({
  icon,
  label,
  tone,
  value,
}: {
  icon: string;
  label: string;
  tone?: "positive" | "negative";
  value: string;
}) {
  return (
    <div className="overview-metric">
      <span className={`overview-icon ${tone ?? ""}`}>{icon}</span>
      <div>
        <small>{label}</small>
        <strong className={tone ? `change ${tone}` : undefined}>{value}</strong>
      </div>
    </div>
  );
}
