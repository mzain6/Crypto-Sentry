import { formatPercent } from "./format";
import type { PortfolioSummary } from "@/lib/dashboard";

type MarketPulseProps = {
  portfolio: PortfolioSummary;
};

export function MarketPulse({ portfolio }: MarketPulseProps) {
  const positive = portfolio.change24hPercentage >= 0;

  return (
    <section className="terminal-panel market-pulse-card">
      <div className="terminal-panel-kicker">24h Market Change</div>
      <div className={positive ? "pulse-value positive" : "pulse-value negative"}>
        {formatPercent(portfolio.change24hPercentage)}
      </div>
      <div className="pulse-bars" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => (
          <span key={index} style={{ height: `${18 + ((index * 11) % 42)}px` }} />
        ))}
      </div>
    </section>
  );
}
