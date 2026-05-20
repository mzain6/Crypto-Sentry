import Link from "next/link";

import { CoinLogo } from "./coin-logo";
import { formatCurrency, formatDateTime } from "./format";
import type { RecentAlert } from "@/lib/dashboard";

type AlertsPanelProps = {
  alerts: RecentAlert[];
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <section className="terminal-panel alerts-card" id="recent-alerts">
      <div className="terminal-panel-heading inline">
        <span className="panel-icon alert" aria-hidden="true" />
        <div>
          <h2>System Alerts</h2>
          <p>Live feed</p>
        </div>
        <Link href="/alerts">View all</Link>
      </div>
      <div className="alert-list">
        {alerts.length === 0 ? (
          <p className="terminal-empty-copy centered">No alerts triggered</p>
        ) : (
          alerts.map((alert) => (
            <div className="alert-row" key={alert.id}>
              <CoinLogo imageUrl={alert.coin.imageUrl} symbol={alert.coin.symbol} />
              <div>
                <strong>
                  {alert.coin.symbol} {alert.condition.replace("_", " ")}
                </strong>
                <span>
                  {formatCurrency(alert.triggeredPriceUsd)} /{" "}
                  {formatDateTime(alert.triggeredAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
