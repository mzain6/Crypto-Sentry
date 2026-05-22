"use client";

import { type FormEvent, useState } from "react";

import type { UserSettingsView } from "@/lib/settings";

type SettingsClientProps = {
  initialSettings: UserSettingsView;
};

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [threshold, setThreshold] = useState(
    initialSettings.defaultAlertThresholdPercent.toString(),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const thresholdValue = Number(threshold || 0);
  const thresholdType =
    thresholdValue < 0 ? "Negative Threshold" : "Positive Threshold";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/settings", {
        body: JSON.stringify({
          defaultAlertThresholdPercent: Number(threshold),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const data = (await response.json()) as {
        message?: string;
        settings?: UserSettingsView;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Could not update settings.");
      }

      if (data.settings) {
        setThreshold(data.settings.defaultAlertThresholdPercent.toString());
      }

      setMessage("Alert threshold saved.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not update settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-module-panel">
      {message ? <div className="profile-toast success">{message}</div> : null}
      {error ? <div className="profile-toast error">{error}</div> : null}

      <form className="settings-card settings-form" onSubmit={handleSubmit}>
        <div className="terminal-panel-heading">
          <h2>Alert Threshold</h2>
          <p>Global watchlist movement sensitivity</p>
        </div>

        <label>
          <span>Default Movement Threshold</span>
          <div className="settings-input-row">
            <input
              max="50"
              min="-50"
              onChange={(event) => setThreshold(event.target.value)}
              required
              step="0.01"
              type="number"
              value={threshold}
            />
            <strong>%</strong>
          </div>
          <div
            className={
              thresholdValue < 0
                ? "settings-threshold-meter negative"
                : "settings-threshold-meter positive"
            }
          >
            {thresholdType}
          </div>
          <small>
            Positive values detect price raises. Negative values detect price
            drops. Detection runs on watchlisted coins over about 30 seconds.
          </small>
        </label>

        <div className="settings-threshold-example">
          <span>Example</span>
          <strong>
            {thresholdValue >= 0
              ? `+${Math.abs(thresholdValue).toFixed(
                  2,
                )}% raise in 30 seconds = alert`
              : `-${Math.abs(thresholdValue).toFixed(
                  2,
                )}% drop in 30 seconds = alert`}
          </strong>
        </div>

        <button disabled={saving} type="submit">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </section>
  );
}
