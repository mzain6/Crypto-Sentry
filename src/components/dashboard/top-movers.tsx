import type { TopMovers as TopMoversData } from "@/lib/dashboard";

type TopMoversProps = {
  topMovers: TopMoversData;
};

export function TopMovers({ topMovers }: TopMoversProps) {
  return (
    <section className="terminal-panel top-movers-card" id="top-movers">
      <div className="terminal-panel-heading">
        <span className="panel-icon bars" aria-hidden="true" />
        <div>
          <h2>Sentry Analytics</h2>
        </div>
      </div>
      <p className="analytics-copy">
        AI-driven sentiment analysis suggests a{" "}
        <strong>BULLISH</strong> trend. No liquidity drains detected in current
        cycle.
      </p>
      <div className="analytics-metrics">
        <div className="analytics-metric">
          <span>Volatility Index</span>
          <strong>14.2% LOW</strong>
        </div>
        <div className="analytics-metric">
          <span>Buy Pressure</span>
          <strong className="positive">68% HIGH</strong>
        </div>
      </div>
    </section>
  );
}
