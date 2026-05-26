import type {
  SentryAnalytics,
  TopMovers as TopMoversData,
} from "@/lib/dashboard";

type TopMoversProps = {
  analytics: SentryAnalytics;
  topMovers: TopMoversData;
};

export function TopMovers({ analytics }: TopMoversProps) {
  const trendTone =
    analytics.trend === "BEARISH"
      ? "negative"
      : analytics.trend === "BULLISH"
        ? "positive"
        : "";
  const liquidityMessage = analytics.hasLiquidityPressure
    ? "Liquidity pressure detected in current cycle."
    : "No liquidity drains detected in current cycle.";

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
        <strong className={trendTone}>{analytics.trend}</strong> trend.{" "}
        {liquidityMessage}
      </p>
      <div className="analytics-metrics">
        <div className="analytics-metric">
          <span>Volatility Index</span>
          <strong>
            {analytics.volatilityIndex.toFixed(1)}%{" "}
            {analytics.volatilityLabel}
          </strong>
        </div>
        <div className="analytics-metric">
          <span>Buy Pressure</span>
          <strong className={analytics.buyPressure >= 50 ? "positive" : ""}>
            {analytics.buyPressure}% {analytics.buyPressureLabel}
          </strong>
        </div>
      </div>
    </section>
  );
}
