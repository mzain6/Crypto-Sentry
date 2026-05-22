"use client";

import { useState } from "react";

import { CoinLogo } from "@/components/dashboard/coin-logo";
import { formatCurrency, formatDateTime } from "@/components/dashboard/format";
import type { UserAlert } from "@/lib/alerts";

type AlertsClientProps = {
  initialAlerts: UserAlert[];
};

export function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  async function deleteAlert(alertId: string) {
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      showToast("Could not delete alert");
      return;
    }

    setAlerts((current) => current.filter((alert) => alert.id !== alertId));
    showToast("Alert deleted");
  }

  function getAlertTitle(alert: UserAlert) {
    return alert.condition === "PRICE_ABOVE"
      ? `${alert.coin.symbol} Price Movement`
      : `${alert.coin.symbol} Price Movement`;
  }

  function getAlertConditionLabel(alert: UserAlert) {
    return alert.condition === "PRICE_ABOVE" ? "Price Raise" : "Price Drop";
  }

  return (
    <section className="alerts-module-panel">
      {alerts.length === 0 ? (
        <div className="watchlist-empty-state">
          <h3>No movement alerts yet</h3>
          <p>
            Add coins to your Watchlist. Alerts appear here when a watched asset
            crosses your configured positive or negative threshold in about 30
            seconds.
          </p>
        </div>
      ) : (
        <div className="alerts-management-list">
          {alerts.map((alert) => (
            <article className="alerts-management-card" key={alert.id}>
              <div className="alerts-management-main">
                <CoinLogo
                  imageUrl={alert.coin.imageUrl}
                  symbol={alert.coin.symbol}
                />
                <div>
                  <strong>{getAlertTitle(alert)}</strong>
                  <span>{alert.coin.name}</span>
                </div>
              </div>

              <div className="alerts-management-metric">
                <span>Condition</span>
                <strong>{getAlertConditionLabel(alert)}</strong>
              </div>

              <div className="alerts-management-metric">
                <span>Baseline</span>
                <strong>{formatCurrency(alert.thresholdPriceUsd)}</strong>
              </div>

              <div className="alerts-management-metric">
                <span>Triggered Price</span>
                <strong>{formatCurrency(alert.triggeredPriceUsd)}</strong>
              </div>

              <div className="alerts-management-metric">
                <span>Status</span>
                <strong className={`alert-status ${alert.status.toLowerCase()}`}>
                  {alert.status}
                </strong>
              </div>

              <div className="alerts-management-metric">
                <span>Triggered</span>
                <strong>{formatDateTime(alert.triggeredAt)}</strong>
              </div>

              <div className="alerts-management-actions">
                <button onClick={() => deleteAlert(alert.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {toast ? <div className="watchlist-toast">{toast}</div> : null}
    </section>
  );
}
